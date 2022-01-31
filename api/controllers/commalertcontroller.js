var log4js = require('log4js');
var logger = log4js.getLogger();
var con = require('../common/database.js');

logger.level = 'debug';

exports.get_alert_reading = function(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');
    let sql = "select comm_alert_id, alert, DATE_FORMAT(timestamp, GET_FORMAT(DATETIME, 'USA')) as alert_dt from comm_alert order by timestamp desc limit 1";
    con.query(sql, function(err, result){    
        if(err) throw err;      
        res.send(result[0]);
    })   
}

exports.post_alert_reading = function(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');
    const alert = req.query.reading;

    let dateLocal = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() -
        ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');

    let sql =  "insert into comm_alert (alert, timestamp) values (" + alert + ",'" + dateLocal + "')" ;   
    con.query(sql, function(err, result){    
        if(err) throw err;
        res.send({'msg': 'reading successfully posted'});
    })       

} 