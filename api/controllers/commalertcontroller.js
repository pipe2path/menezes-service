var log4js = require('log4js');
var logger = log4js.getLogger();
var con = require('../common/database.js');

logger.level = 'debug';

exports.get_alert_reading = function(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');
    var sql = "select comm_alert_id, alert, DATE_FORMAT(timestamp, GET_FORMAT(DATETIME, 'USA')) as alert_dt from comm_alert order by timestamp desc limit 1";
    con.query(sql, function(err, result){    
        if(err) throw err;      
        res.send(result[0]);
    })   
}