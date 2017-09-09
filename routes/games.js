var express = require('express');
var body = require('body-parser');
var router = express.Router();
var users = require('../modules/userModule');
var games = require('../modules/gameModule');
var _ = require('underscore');

router.post('/dashboard', function(request, response) {

    if (request.session.user) {
        var userLogged = {};
        userLogged = request.session.user;
        games.getGamesByUser(userLogged.id, function (err, games) {
            userLogged.games = games;
            response.render('dashboard', {user: userLogged});
            request.session.user = userLogged;
        });
    }
    else {
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
                     userLogged = {
                        id:result.idUSERS,
                        nickname:result.Nickname,
                        fullName:result.FullName,
                        password:result.Password,
                        games: null
                    }
                    games.getGamesByUser(userLogged.id, function (err, games) {
                        userLogged.games = games;
                        request.session.user = userLogged;
                        response.render('dashboard', {user: userLogged});

                    });
                }
            });
        }
    }
});

router.get('/dashboard',function(request,response){
    if (request.session.user) {
        var userLogged = request.session.user;
        games.getGamesByUser(userLogged.id, function (err, games) {
            userLogged.games = games;
            response.render('dashboard', {user: userLogged});
            //request.session.user = userLogged;
        });
    }
    else{
        response.redirect('/users/Login');
    }
});

router.get('/create/',function(request,response){
    var userLogged = request.session.user;
    response.render('createGame',{user:userLogged})
});

router.get('/openGames/',function(request,response){
    var userLogged = request.session.user;
    games.getOpenGames(userLogged,function (err,result) {
        userLogged.openGames = result;
        if(result) {
            for (let i = 0; i < userLogged.openGames.length; i++) {
                games.getNamesOfPlayers(userLogged.openGames[i].idGAMES, function (err, result2) {
                    userLogged.openGames[i].players = result2;
                    if (i === userLogged.openGames.length - 1)
                        response.render('openGames', {user: userLogged});
                });
            }
        }
        else{
            response.render('openGames', {user: userLogged});
        }
    });
});

router.post('/createGame/',function (request,response) {
    var userLogged = request.session.user;
    let goldP = _.shuffle(['y','x','y']);

    let board = '0'+'0'+'0'+'0'+'0'+'0'+'0'+
        +'0'+'0'+'0'+'0'+'0'+'0'+goldP.pop()
        +'0'+'0'+'0'+'0'+'0'+'0'+'0'
        +'s'+'0'+'0'+'0'+'0'+'0'+goldP.pop()
        +'0'+'0'+'0'+'0'+'0'+'0'+'0'
        +'0'+'0'+'0'+'0'+'0'+'0'+goldP.pop()
        +'0'+'0'+'0'+'0'+'0'+'0'+'0';

    var gameToCreate = {
        gameName:request.body.gameName,
        numPlayers:request.body.numPlayers,
        currentNumPlayers:1,
        userId:userLogged.id,
        userNickname:userLogged.nickname,
        board:board
    };
    games.createGameByUser(gameToCreate,function (err,games) {
        response.redirect('/games/dashboard');
    });

});
router.get('/exit',function (request,response) {
    request.session.user = null;
    response.redirect('/users/Login');
});

module.exports = router;
