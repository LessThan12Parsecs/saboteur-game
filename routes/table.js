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

var leftSide = ['y','x','s','8','9','a','b','c','d','e','f'];
var rightSide = ['y','x','s','2','3','6','7','a','b','e','f'];
var topSide = ['y','x','s','4','5','6','7','c','d','e','f'];
var bottomSide = ['y','x','s','1','3','5','7','9','b','d','f'];
var validRoads = ['s','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];

var roles = ['s','b','b','b','s','b','b']; //TODO Implement roles for part 3 roles[0-->2] is for 3 players and so on...


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
    var userId = request.params.idUser;
    var gameId = request.params.idGame;
    games.addPlayerToGame(userId,gameId,function (err,result) {
            if(!err) {
                games.getNumberOfPlayers(gameId, function (err, result2) {
                    var numPlayers = result2[0].playersNum;
                    var maxPlayers = result2[0].MaxUsers;
                    if (numPlayers + 1 > maxPlayers) {
                        games.changeGameStatus('c', gameId, function (err, result3) {
                            response.redirect('/games/dashboard');
                        });
                    } else {
                        response.redirect('/games/dashboard');
                    }
                });
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
    var i = parseInt(request.params.i);
    var j = parseInt(request.params.j);
    var card = request.params.card;
    if(currentGame.board[i][j]!=='0'){
        response.render('insertCard',{game:currentGame,card:card,title:"There's a card already there!!"});
    }
    else if ((i<7&&_.contains(validRoads,currentGame.board[i+1][j]))
        ||(i>0&&_.contains(validRoads,currentGame.board[i-1][j]))
        ||(j<7&&_.contains(validRoads,currentGame.board[i][j+1]))
        ||(j>0&&_.contains(validRoads,currentGame.board[i][j-1]))){
        if(i<7&& _.contains(topSide,currentGame.board[i+1][j]) && _.contains(bottomSide,card)){
            playCard(i,j,response,card);
        }
        else if (i>0&&_.contains(bottomSide,currentGame.board[i-1][j]) && _.contains(topSide,card)){
            playCard(i,j,response,card);
        }
        else if (j<7&&_.contains(leftSide,currentGame.board[i][j+1]) && _.contains(rightSide,card)){
            playCard(i,j,response,card);
        }
        else if (j>0&&_.contains(rightSide,currentGame.board[i][j-1]) && _.contains(leftSide,card)){
            playCard(i,j,response,card);
        }
        else{
            response.render('insertCard',{game:currentGame,card:card,title:"Invalid place"});
        }
    }
    else{
        response.render('insertCard',{game:currentGame,card:card,title:"Invalid place"})
    }
});

router.get('/exit',function (request,response) {
    response.redirect('/');
});

router.get('/dropCard/:c',function (request,response) {
    var card = request.params.c;
    currentGame.hand = _.without(currentGame.hand,card);
    currentGame.hand.push(_.sample(cards,1)[0]);
    table.storeHand(currentGame.hand,currentGame.gameId,currentGame.userId,function (err,result) {
        table.nextTurn(currentGame.gameId,currentGame.userId,function (err,result2){
            currentGame.currentTurn = result2[0].Nickname;
            if(err){
                response.error();
            }
            else{
                table.updateGame(currentGame,function (err,result3)  {
                    response.render('Table',{game:currentGame});
                });
            }
        });
    });
});

//function to convert from string to 2dimensional array.
function toMatrix(arr, width) {
    return arr.reduce(function (rows, key, index) {
        return (index % width == 0 ? rows.push([key])
            : rows[rows.length-1].push(key)) && rows;
    }, []);
}

function playCard(i,j,response,card){
    currentGame.board[i][j] = card;
    if((i>0 && currentGame.board[i+1][j]==='x')||(i < 7 &&currentGame.board[i-1][j]==='x' ) ||(j < 7 && currentGame.board[i][j+1]==='x')){
        games.changeGameStatus('t',currentGame.gameId,function (err,result) {
            response.render('Win',{game:currentGame});
        });
    }
    else{

        currentGame.hand = _.without(currentGame.hand,card);
        currentGame.hand.push(_.sample(cards,1)[0]);

        table.nextTurn(currentGame.gameId,currentGame.userId,function (err,result){
            currentGame.currentTurn = result[0].Nickname;
            if(err){
                response.error();
            }
            else{
                table.updateGame(currentGame,function (err,result2)  {
                    response.render('Table',{game:currentGame});
                });
            }
        });
    }
}
module.exports = router;


