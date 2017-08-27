var config = require("../config");
var mysql = require('mysql');
var moment = require('moment');
var _ = require('underscore');

module.exports = {
    getHandByUserInGame:getHandByUserInGame,
    storeHand:storeHand,
    storeBoard:storeBoard
};

var pool = mysql.createPool({
    host: config.dbHost,
    database:config.dbName,
    user: config.dbUser,
    password: config.dbPassword
});


function getHandByUserInGame(userNick,gameId,callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "SELECT Hand, Role FROM PLAYING p" +
                " JOIN USERS u ON p.UserID = u.idUSERS " +
                "JOIN GAMES g ON p.GameID = g.idGAMES" +
                " WHERE u.Nickname = ? AND p.GameID = ?;";
            con.query(sql, [userNick,gameId],
                function(err, result) {
                    con.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0){
                            callback(null)
                        }else{
                            callback(null, result);
                        }
                    }
                });
        }
    });
}

function storeHand(hand,gameId,userId,callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "UPDATE PLAYING" +
                " SET Hand = ?  " +
                " WHERE UserID = ? AND GameID = ?;";
            con.query(sql, [hand,userId,gameId],
                function(err, result) {
                    con.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0){
                            callback(null)
                        }else{
                            callback(null, result);
                        }
                    }
                });
        }
    });
}
function storeBoard(board,gameId,callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "UPDATE GAMES" +
                " SET Board = ?  " +
                " WHERE idGAMES = ?";
            con.query(sql, [board,gameId],
                function(err, result) {
                    con.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0){
                            callback(null)
                        }else{
                            callback(null, result);
                        }
                    }
                });
        }
    });
}
