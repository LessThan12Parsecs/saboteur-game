var express = require('express');
var body = require('body-parser');
var router = express.Router();
var multer = require('multer');
var upload = multer({storage:multer.memoryStorage()});
//var upload = multer({ dest: 'uploads/' });
var users = require('../modules/userModule');


router.get('/signUp',function (request,response,next) {
    //var user = request.session.user;
    response.render('signUp', {title:'SignUp',user:undefined});
});

router.get('/Login',function (request,response,next) {
    response.render('Login',{title:' ',user:undefined});
});

router.post("/createUser", upload.single("photo"), function(request, response) {
    var user = {
        nickname: request.body.nickname,
        password: request.body.password,
        fullName: request.body.fullName,
        sex: request.body.sex,
        date: request.body.date,
        photo: null
    };


    if (request.file) {
       // console.log(request.file.buffer);
        user.photo = request.file.buffer;
    }

    users.insertUser(user, function(err,resultID) {
       if(err){
             console.log(err);
            console.log("Error al insertar usuario");
            return;
        }

        var model = { user : user};
        console.log("Se ha insertado usario con exito");
        response.render('insertSuccess',model);
    });
});

router.get("/imagen/:id", function(request, response, next) {
    var n = Number(request.params.id);
    if (isNaN(n)) {
        next(new Error("Id no numérico"));
    } else {
        users.obtenerImagen(n, function(err, imagen) {
            if (imagen) {
                response.end(imagen);
            } else {
                response.status(404);
                response.end("Not found for " + n);
            }
        });
    }

});


module.exports = router;
