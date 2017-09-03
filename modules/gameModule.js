var config = require("../config");
var mysql = require('mysql');
var moment = require('moment');
var _ = require('underscore');

module.exports = {
    getGamesByUser: getGamesByUser,
    changeGameStatus:changeGameStatus,
    createGameByUser:createGameByUser,
    getOpenGames:getOpenGames,
    getNumberOfPlayers:getNumberOfPlayers,
    getNamesOfPlayers:getNamesOfPlayers,
    addPlayerToGame:addPlayerToGame,
    setGameTurns:setGameTurns,
    decreaseTurns:decreaseTurns,
    getTurnsLeft:getTurnsLeft,
    getGameInfo:getGameInfo
};

var pool = mysql.createPool({
    host: config.dbHost,
    database:config.dbName,
    user: config.dbUser,
    password: config.dbPassword
});

function getGamesByUser(userP, callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "SELECT DISTINCT g.idGAMES, g.Status,g.Name,g.MaxUsers,g.playersNum,g.turnsLeft,g.CurrentUser,g.Host,g.date FROM GAMES g" +
                " JOIN PLAYING p ON g.idGAMES = p.GameID " +
                " JOIN USERS u ON u.idUSERS = p.UserID WHERE idUSERS = ?;";
            con.query(sql, [userP],
                function(err, result) {
                    for (var i in result){
                        result[i].date = moment(result[i].date).format('DD/MM/YY');
                    }
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

function changeGameStatus(newStatus,gameId,callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "UPDATE GAMES SET Status= ? WHERE idGAMES= ? ;";
            con.query(sql, [newStatus,gameId],
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
function createGameByUser(game,callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "INSERT INTO GAMES(CurrentUser,playersNum,Date,Host,MaxUsers,Name,Status,Board) VALUES (?,?,?,?,?,?,?,?);";
            con.query(sql, [game.userNickname,game.currentNumPlayers,moment().format('YYYY-MM-DD'),game.userNickname,game.numPlayers,game.gameName,'a',game.board],
                function(err, result) {
                    con.release();
                    if (err) {
                        callback(err);
                        return;
                    } else {
                        if(result.length === 0){
                            callback(null)
                            return;
                        }else{
                            var sql2 = "INSERT INTO PLAYING(UserID,GameID) VALUES (?,?);";
                            con.query(sql2,[game.userId,result.insertId],function (err,result2) {
                                if(err){
                                    callback(err);
                                    return;
                                }
                                callback(null,result2);
                            });
                        }
                    }
                });
        }
    });
}

function getOpenGames(userP, callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "SELECT DISTINCT g.Name AS nombrePartida,g.idGAMES,g.playersNum,g.turnsLeft,g.MaxUsers,g.CurrentUser,g.Status,g.Host,g.Date " +
            "FROM GAMES g " +
            "JOIN PLAYING p ON g.idGAMES = p.GameID "+
            "JOIN USERS u ON u.idUSERS = p.UserID "+
            "WHERE g.Status = 'a' AND p.GameID "+
            "NOT IN (SELECT g.idGAMES FROM GAMES g "+
            "JOIN PLAYING p ON g.idGAMES = p.GameID "+
            "JOIN USERS u ON u.idUSERS = p.UserID " +
            "WHERE u.idUSERS = ?) AND g.playersNum < g.MaxUsers";
            con.query(sql, [userP.id],
                function(err, result) {
                    for (var i in result){
                        result[i].date = moment(result[i].date).format('DD/MM/YY');
                    }
                    con.release();
                    if (err) {
                        callback(err);
                        return;
                    } else {
                        if (result.length === 0) {
                            callback(null)
                            return;
                        } else {
                            callback(null, result);
                        }
                    }
                });
        }
    });
}

function getNumberOfPlayers(id,callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "SELECT playersNum,MaxUsers FROM GAMES WHERE idGAMES = ?;";
            con.query(sql, [id],
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
function getNamesOfPlayers(id,callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "SELECT u.Nickname FROM PLAYING JOIN USERS u " +
                "ON UserID = u.idUSERS WHERE GameID = ?;";
            con.query(sql, [id],
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
function addPlayerToGame(userId,gameId,callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "INSERT INTO PLAYING(UserID,GameID) VALUES (?,?);";
            con.query(sql, [userId,gameId,gameId],
                function(err, result) {
                    con.release();
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0){
                            callback(null)
                        }else{
                            var sql2 =  "UPDATE GAMES " +
                                "SET playersNum = playersNum + 1 " +
                                "WHERE idGAMES = ?;";
                            con.query(sql2,[gameId],function (err,result2) {
                                if(err){
                                    callback(err);
                                    return;
                                }
                                callback(null,result);
                            });
                        }
                    }
                });
        }
    });
}

function setGameTurns(turns,gameId,callback){
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "UPDATE GAMES" +
                "SET turnsLeft = ?" +
                "WHERE idGAMES = ?;";
            con.query(sql, [turns,gameId],
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
function decreaseTurns(gameId,callback){
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "UPDATE GAMES" +
                "SET turnsLeft = turnsLeft - 1" +
                "WHERE idGAMES = ?;";
            con.query(sql, [gameId],
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
function getTurnsLeft(gameId,callback){
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "SELECT turnsLeft FROM GAMES" +
                "WHERE idGAMES = ?;";
            con.query(sql, [gameId],
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

function getGameInfo(id,callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "SELECT * from GAMES WHERE idGAMES = ?;";
            con.query(sql, [id],
                function(err, result) {
                    //console.log(result);
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
