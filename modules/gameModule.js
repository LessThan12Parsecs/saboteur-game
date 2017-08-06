var config = require("../config");
var mysql = require('mysql');
var moment = require('moment');

module.exports = {
    getGamesByUser: getGamesByUser,
    changeGameStatus:changeGameStatus
}

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
            var sql = "SELECT DISTINCT g.idGAMES, g.Status,g.Name,g.MaxUsers,g.CurrentUser,g.Host,g.date FROM GAMES g" +
                " JOIN PLAYING p ON g.idGAMES = p.GameID " +
                " JOIN USERS u ON u.idUSERS = p.UserID WHERE idUSERS = ?;";
            con.query(sql, [userP],
                function(err, result) {
                    for (var i in result){
                        result[i].date = moment(result[i].date).format('DD/MM/YY, h:mm:ss a');
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

function changeGameStatus(game,callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "UPDATE GAMES SET Status= ? WHERE idGAMES= ? ;";
            con.query(sql, [game.newStatus,game.id],
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



