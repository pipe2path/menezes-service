var log4js = require('log4js');
var logger = log4js.getLogger();
var con = require('../common/database.js');

logger.level = 'debug';

exports.get_sensor_readings = function(req, res){
    res.send('readings ...');
}

exports.post_sensor_reading = function(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');
    const deviceId = req.query.device_id;
    const reading = req.query.reading;
    
    var dateLocal = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() -
        ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
    
    var sql = "insert water_reading (device_id, reading, reading_dt) values (" + deviceId + ", " + reading + ", '" + dateLocal + "')";
    con.query(sql, function(err, result){    
        if(err) throw err;      
        res.send('reading successfully posted');
    })    
}