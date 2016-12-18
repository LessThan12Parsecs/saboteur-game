var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var fs = require('fs');
var multer = require('multer');
var ejs = require('ejs');
var config = require("./config");

var index = require('./routes/index');


var upload = multer({storage:multer.memoryStorage()});
var pool = mysql.createPool({
    host: config.dbHost,
    database:config.dbName,
    user: config.dbUser,
    password: config.dbPassword
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);


function insertUser(user, callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            console.log(user);
            var sql = "INSERT INTO USERS(NICKNAME, FULLNAME, PASSWORD, DATE, SEX, PHOTO) VALUES (?, ?, ?, ?, ?, ?)";
            con.query(sql, [user.nickname, user.fullName, user.password, user.date,user.sex,user.photo],
                function(err, result) {
                    con.release();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, result.insertId);
                    }
                });
        }
    });
}

function obtenerImagen(id, callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "SELECT PHOTO FROM USERS WHERE Id = ?";
            con.query(sql, [id], function(err, result) {
                con.release();
                if (err) {
                    callback(err);
                } else {
                    if (result.length === 0) {
                        callback(null);
                    } else {
                        callback(null, result[0].photo);
                    }
                }
            });
        }
    });
}

app.post("/createUserFromForm", upload.single("photo"), function(request, response) {

    var user = {
        nickname: request.body.Nickname,
        fullName: request.body.fullName,
        password: request.body.password,
        date: request.body.date,
        sex: request.body.sex,
        photo: request.body.photo
    };


    insertUser(user, function(err) {
        var model = { user : user};
        response.render('insertSuccess',model);
    });
});

app.post("/loginUser", function(request, response) {

    var userP = {
        nickname: request.body.Nickname,
        password: request.body.password,
    };

    loginUser(userP, function(err,result) {
        if (typeof result[0] === "undefined") {
            response.render('Login', {title:'Wrong Login'});
        }
        else{
            response.render('loggedUser',result[0]);
        }
    });
});

function loginUser(userP, callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            console.log(userP);
            var sql = "SELECT * FROM USERS WHERE NICKNAME = ? AND PASSWORD = ?";
            con.query(sql, [userP.nickname, userP.password],
                function(err, result) {
                    con.release();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, result);
                    }
                });
        }
    });
}

app.get("/imagen/:id", function(request, response, next) {
    var n = Number(request.params.id);
    if (isNaN(n)) {
        next(new Error("Id no numérico"));
    } else {
        obtenerImagen(n, function(err, imagen) {
            if (imagen) {
                response.end(imagen);
            } else {
                response.status(404);
                response.end("Not found");
            }
        });
    }

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
