var config = require("../config");
var mysql = require('mysql');

module.exports = {
    insertUser:insertUser,
    obtenerImagen:obtenerImagen,
    loginUser:loginUser

}

var pool = mysql.createPool({
    host: config.dbHost,
    database:config.dbName,
    user: config.dbUser,
    password: config.dbPassword
});

function insertUser(user, callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
           // console.log(user);
            var sql = "INSERT INTO USERS(Nickname, FullName, Password, Date, Sex, Photo) VALUES (?, ?, ?, ?, ?, ?)";
            con.query(sql, [user.nickname, user.fullName, user.password, user.date,user.sex,user.photo],
                function(err, result) {
                    con.release();
                    if (err) {
                        console.log("User creation failed");
                        callback(err);
                    } else {
                        callback(null, result.insertId);
                    }
                });
        }
    });
}

function obtenerImagen(id, callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "SELECT PHOTO FROM USERS WHERE idUSERS = ?";
           // console.log("got conn");
            con.query(sql, [id], function(err, result) {
                con.release();
                if (err) {
                    callback(err);
                } else {
                    if (result.length === 0) {
                        callback(null);
                    } else {
                        //console.log(result[0]);
                        callback(null, result[0].PHOTO);
                    }
                }
            });
        }
    });
}

function loginUser(userP, callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "SELECT * FROM USERS WHERE NICKNAME = ? AND PASSWORD = ?";
            con.query(sql, [userP.nickname, userP.password],
                function(err, result) {
                    con.release();
                    //console.log(result[0].Nickname);
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0){
                            callback(null)
                        }else{
                            callback(null, result[0]);
                        }

                    }
                });
        }
    });
}

function dealHand(userP, callback) {
    pool.getConnection(function(err, con) {
        if (err) {
            callback(err);
        } else {
            var sql = "UPDATE * FROM USERS WHERE NICKNAME = ? AND PASSWORD = ?";
            con.query(sql, [userP.nickname, userP.password],
                function(err, result) {
                    con.release();
                    //console.log(result[0].Nickname);
                    if (err) {
                        callback(err);
                    } else {
                        if(result.length === 0){
                            callback(null)
                        }else{
                            callback(null, result[0]);
                        }

                    }
                });
        }
    });
}


