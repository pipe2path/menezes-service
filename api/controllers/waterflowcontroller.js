var log4js = require('log4js');
var logger = log4js.getLogger();
var con = require('../common/database.js');

logger.level = 'debug';

exports.get_sensor_readings = function(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');
    var sql = "select reading_id, device_id, reading, DATE_FORMAT(reading_dt, GET_FORMAT(DATETIME, 'USA')) as reading_dt from water_reading order by reading_dt desc";
    con.query(sql, function(err, result){    
        if(err) throw err;      
        res.send(result);
    })   
}

exports.post_sensor_reading = function(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');
    const deviceId = req.body.device_id;
    const reading = req.body.reading;
    
    var dateLocal = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() -
        ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
    
    var sql = "insert water_reading (device_id, reading, reading_dt) values (" + deviceId + ", " + reading + ", '" + dateLocal + "')";
    con.query(sql, function(err, result){    
        if(err) throw err;      
        res.send('reading successfully posted');
    })    
}