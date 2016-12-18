var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var fs = require('fs');
var multer = require('multer');


var index = require('./routes/index');
var users = require('./routes/users');

var upload = multer({storage:multer.memoryStorage()});
var pool = mysql.createPool({
    host:"localhost",
    database:"saboteur",
    user:"root",
    password:"Epsilon14"
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.post("/createUserFromForm", upload.single("photo"), function(request, response) {
    var user = {
        name: request.body.Nickname,
        fullName: request.body.FullName,
        password: request.body.password,
        date: request.body.date,
        sex: request.body.sex,
        photo: null
    };

    if (request.file) {
        user.photo = request.file.buffer;
    }

    insertUser(user, function(err, newId) {
        user.id = newId;
        response.render("loggedUser", user);
    });
});

function insertUser(user, callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "INSERT INTO USERS(NICKNAME, FULLNAME, PASSWORD,DATE,SEX,PHOTO) VALUES (?, ?, ?, ?, ?, ?)";
            con.query(sql, [user.name, user.fullName, user.password,user.date,user.sex, user.photo],
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
