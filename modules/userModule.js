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
            console.log(user);
            var sql = "INSERT INTO USERS(Nickname, FullName, Password, Date, Sex, Photo) VALUES (?, ?, ?, ?, ?, ?)";
            con.query(sql, [user.nickname, user.fullName, user.password, user.date,user.sex,user.photo],
                function(err, result) {
                    con.release();
                    if (err) {
                        console.log("oshtia");
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
            var sql = "SELECT PHOTO FROM USERS WHERE Id = ?";
            con.query(sql, [id], function(err, result) {
                con.release();
                if (err) {
                    callback(err);
                } else {
                    if (result.length === 0) {
                        callback(null);
                    } else {
                        callback(null, result[0].photo);
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
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, result);
                    }
                });
        }
    });
}

function validateUserForm()
{

    if(document.signUpForm.Nickname.value == "" )
    {
        alert( "Por favor introduce tu nombre" );
        document.signUpForm.Nickname.focus() ;
        return false;
    }

    if( document.signUpForm.password.value == "" )
    {
        alert( "Por favor introduce una contraseña" );
        document.signUpForm.password.focus() ;
        return false;
    }

    if( document.signUpForm.fullName.value == "" )
    {
        alert( "Por favor introduce tu nombre completo" );
        document.signUpForm.password.focus() ;
        return false;
    }

    if( document.signUpForm.date.value == "" ||
        ( document.myForm.Zip.value ) ||
        document.myForm.Zip.value.length != 5 )
    {
        alert( "Please provide a zip in the format #####." );
        document.myForm.Zip.focus() ;
        return false;
    }

    if( document.myForm.Country.value == "-1" )
    {
        alert( "Please provide your country!" );
        return false;
    }
    return( true );
}

