var log4js = require('log4js');
var logger = log4js.getLogger();
var con = require('../common/database.js');
logger.level = 'debug';

exports.get_sensor_reading = function(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');

    sql = 'select * from Sensor order by sensorId desc limit 1';
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(result);
    });
}

exports.post_sensor_reading = function(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');

    sensorId = req.query.id;
    datelocal = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() -
        ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');

    if (sensorId.toUpperCase() == 'A')
        sql = "insert into Sensor (sensorBFlag, sensorBTimestamp) values (1, '" + datelocal + "')";
    else
        sql = "insert into Sensor (sensorAFlag, sensorATimestamp) values (1, '" + datelocal + "')";

    con.query(sql, function  (err, result) {
        if (err) throw err;
        res.send('Sensor ' + sensorId.toUpperCase() + ' Updated');
    });

}