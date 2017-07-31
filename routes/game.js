var express = require('express');
var body = require('body-parser');
var users = require('../modules/userModule');
var router = express.Router();

/* GET pages. */
router.post('/dashboard', function(request, response) {

    var userP = {
        nickname: request.body.nickname,
        password: request.body.password,
    };
    //console.log(userP);
    if (!userP.nickname || !userP.password) {
        response.render('Login', {title: 'Wrong Login', user: undefined});
    }
    else {
        //console.log("OJHHHH");
        users.loginUser(userP, function (err, result) {
            if (typeof result === "undefined") {
                response.render('Login', {title: 'Wrong Login', user: undefined});
            }
            else {
                request.session.user = userP;
                var userLogged = {
                    nickname: result.Nickname,
                    fullName: result.FullName,
                    password: result.Password,
                    photo: users.obtenerImagen(result.idUSERS),
                    //TODO add list of games and pass it to the ejs render
                };
                console.log(result);
                //console.log(userLogged);
                response.render('dashboard', {user: userLogged})
                //console.log("loggedSuccess");
            }
        });
    }
});

module.exports = router;


