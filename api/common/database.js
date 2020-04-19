var mysql = require('mysql');

// var con = mysql.createConnection({
//     host: "remotemysql.com",
//     database: "kkgVQi6DBL",
//     user: "kkgVQi6DBL",
//     password: "BCIlEjUXuB"
// });

var con = mysql.createConnection({
    host: "us-cdbr-iron-east-01.cleardb.net",
    database: "heroku_71f713810407a9d",
    user: "b224eaf607f6be",
    password: "216ff2c6"
});

con.connect(function(err){
        if (err) throw err;
        console.log("Connected!");
})

module.exports = con;
