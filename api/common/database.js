var mysql = require('mysql');

// var db_config = {
//     host: "un0jueuv2mam78uv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
//     database: "pl9mj0om513j938e",
//     user: "z9ky31glckau4xg7",
//     password: "zskcskxs22ywobxj"
// }

var db_config = {
    host: process.env.DBHOST,
    database: process.env.DATABASE,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD
}

handleDisconnect();

function handleDisconnect() {
    con = mysql.createConnection(db_config); // Recreate the connection, since
                                                    // the old one cannot be reused.

    con.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); 		// We introduce a delay before attempting to reconnect,
        }                                     			// to avoid a hot loop, and to allow our node script to
    });                                     			// process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    con.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

// var con = mysql.createConnection({
//     host: "us-cdbr-iron-east-01.cleardb.net",
//     database: "heroku_71f713810407a9d",
//     user: "b224eaf607f6be",
//     password: "216ff2c6"
// });

// con.connect(function(err){
//         if (err) throw err;
//         console.log("Connected!");
// })

module.exports = con;
