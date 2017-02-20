var express = require('express');
var body = require('body-parser');
var router = express.Router();
var multer = require('multer');
var upload = multer({storage:multer.memoryStorage()});
var users = require('../modules/userModule');


router.get('/signUp',function (request,response,next) {
    var user = request.session.user;
    response.render('signUp', {title:'SignUp',user:user});
});

router.get('/Login',function (request,response,next) {
    var user = request.session.user;
    if(user) {
        response.render('loggedUser',{user:user})
    }
    else{
        response.render('Login', {title:'',user:user});
    }

});

router.post("/createUser", upload.single("photo"), function(request, response) {
    console.log(request.body.date);
    var user = {
        nickname: request.body.Nickname,
        password: request.body.password,
        fullName: request.body.fullName,
        sex: request.body.sex,
        date: request.body.date,
        photo: request.body.photo
    };

    users.insertUser(user, function(err,resultID) {
        if(err){
            console.log("que ha pasao");
            return;
        }
        console.log(resultID);
        var model = { user : user};

        console.log("woot woot");
        response.render('insertSuccess',model);
    });
});

router.post("/loginUser", function(request, response) {
    var user = request.session.user;
    var userP = {
        nickname: request.body.Nickname,
        password: request.body.password,
    };

    if(!userP.nickname || !userP.password){
        response.render('Login', {title: 'Wrong Login', user: user});
    }
    else {
        console.log("OJHHHH");
        users.loginUser(userP, function (err, result) {
            if (typeof result[0] === "undefined") {
                response.render('Login', {title: 'Wrong Login', user: user});
            }
            else {
                request.session.user = userP;
                response.render('loggedUser', {user: result})
                console.log("loggedSuccess");
            }
        });
    }
});

router.get("/imagen/:id", function(request, response, next) {
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


module.exports = router;
