var express = require('express');
var body = require('body-parser');
var users = require('../modules/userModule');
var games = require('../modules/gameModule');
var _ = require('underscore');
var router = express.Router();
//TODO check emitters and reciever of "events" library for  in-game Managment

router.post('/dashboard', function(request, response) {

    var userP = {
            nickname: request.body.nickname,
            password: request.body.password,
        };

    if (!userP.nickname || !userP.password) {
        response.render('Login', {title: 'Wrong Login', user: undefined});
    }
    else {
        users.loginUser(userP, function (err, result) {
            if (typeof result === "undefined") {
                response.render('Login', {title: 'Wrong Login', user: undefined});
            }
            else {
                var userLogged = {
                    id: result.idUSERS,
                    nickname: result.Nickname,
                    fullName: result.FullName,
                    password: result.Password,
                    photo: null,
                    gameList: null
                };

                users.obtenerImagen(userLogged.id, function (err, imagen) {
                    if (err)
                        return //TODO try to put default image.
                    userLogged.photo = imagen;
                });
                games.getGamesByUser(userLogged.id, function (err, games) {
                    userLogged.gameList = games;
                    //request.session.user = userLogged;
                    response.render('dashboard', {
                        nickname: userLogged.nickname,
                        photo: userLogged.photo,
                        games: userLogged.gameList,
                        id: userLogged.id
                    })
                });
            }
        });
    }
});
router.get('/start/:id',function (request,response) {
    var game ={
        id:request.params.id,
        newStatus:'c'
    }
    games.changeGameStatus(game,function () {
        response.end("AQUI EL JUEGO"); //TODO Implement game functionality
    });
});

router.get('/create/:idUser',function(request,response){
    response.render('createGame',{})//TODO code this and the one below
});
router.get('/join/:idUser',function(request,response){
    response.render('openGames',{})
});
module.exports = router;

