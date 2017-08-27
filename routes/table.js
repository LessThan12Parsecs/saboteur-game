var express = require('express');
var body = require('body-parser');
var router = express.Router();
var table = require('../modules/TableModule');
var games = require('../modules/gameModule');
var users = require('../modules/userModule');
var _ = require('underscore');

/* In the game board the code for each piece is as follows:
 *T1 = 1  Start = s
  T2 = 2  Gold = x   DNK = y
  T3 = 3  Empty = 0
  T4 = 4
  T5 = 5
  T6 = 6
  T7 = 7
  T8 = 8
  T9 = 9
  T10 = a
  T11 = b
  T12 = c
  T13 = d
  T14 = e
  T15 = f
     */
//possible cards in a hand
var cards = ['1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];

//objects that hold card groups depending on their road side
//Then logic of [i][j]:
// if [i-1][j] = leftSide then not possible, rightSide is possible if [i][j] = leftSide

var leftSide = [];
var rightSide = [];
var topSide = [];
var bottomSide = [];


var currentGame = {
    userId:null,
    gameId:null,
    userNick:null,
    name:null,
    status:null,
    host:null,
    maxPlayers:null,
    numPlayers:null,
    currentTurn:null,
    turnsLeft:null,
    players:null,
    board:null,
    role:null,
    hand:null
};

router.get('/join/:idUser/:idGame',function (request,response) {
    //currentGame.userNick = request.params.nick;
    currentGame.userId = request.params.idUser;
    currentGame.gameId = request.params.idGame;
    games.addPlayerToGame(currentGame.userId,currentGame.gameId,function (err,result) {
            if(!err){
                if(currentGame.numPlayers+1 >= currentGame.maxPlayers){
                    games.changeGameStatus('c',currentGame.gameId,function (err,result2) {
                        //Game starts
                    });
                }
                response.redirect('/games/dashboard'); //Player joined game and it's redirected to dashboard
            }
    });
});

router.get('/playCard/:c',function (request,response) {
    var card = request.params.c;
    response.render('insertCard',{game:currentGame,card:card,title:undefined});
});

router.get('/view/:userNick/:userId/:gameId',function (request,response) {
    currentGame.userNick = request.params.userNick;
    currentGame.gameId = request.params.gameId;
    currentGame.userId = request.params.userId;
    games.getGameInfo(currentGame.gameId,function (err,result) {
        if(result){
            currentGame.name = result[0].Name;
            currentGame.status = result[0].Status;
            currentGame.currentTurn = result[0].CurrentUser;
            currentGame.host = result[0].Host;
            currentGame.maxPlayers = result[0].MaxUsers;
            currentGame.turnsLeft = result[0].turnsLeft;
            currentGame.board = result[0].Board.split('');
            currentGame.board = toMatrix(currentGame.board,7);
            table.getHandByUserInGame(currentGame.userNick,currentGame.gameId,function (err,result2) {
                if(result2[0].Hand){
                    currentGame.hand = result2[0].Hand;
                    currentGame.role = result2[0].Role;
                }
                else{
                    if(currentGame.maxPlayers<=5){
                        currentGame.hand = _.sample(cards,6).join("");
                    }
                    else if(currentGame.maxPlayers>5){
                        currentGame.hand = _.sample(cards,5).join("");
                    }
                    table.storeHand(currentGame.hand,currentGame.gameId,currentGame.userId,function (err,result3) {
                        //do nothing
                    })
                }
                response.render('Table',{game:currentGame});
            })

        }
    });
});

router.get('/placeAt/:i/:j/:card',function (request,response) {
    var i = request.params.i;
    var j = request.params.j;
    var card = request.params.card;
    if(currentGame.board[i][j]!=='0'){
        response.render('insertCard',{game:currentGame,card:card,title:"There's a card already there!!"});
    }
});

router.get('/exit',function (request,response) {
    response.redirect('/');
});

//function to convert from string to 2dimensional array.
function toMatrix(arr, width) {
    return arr.reduce(function (rows, key, index) {
        return (index % width == 0 ? rows.push([key])
            : rows[rows.length-1].push(key)) && rows;
    }, []);
}
module.exports = router;

