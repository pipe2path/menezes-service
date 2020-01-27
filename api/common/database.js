var mysql = require('mysql');

var con = mysql.createConnection({
    host: "remotemysql.com",
    database: "kkgVQi6DBL",
    user: "kkgVQi6DBL",
    password: "BCIlEjUXuB"
});

con.connect(function(err){
        if (err) throw err;
        console.log("Connected!");
})

module.exports = con;