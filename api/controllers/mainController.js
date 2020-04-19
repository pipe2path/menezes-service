var log4js = require('log4js');
var logger = log4js.getLogger();
var con = require('../common/database.js');
logger.level = 'debug';

// gets the latest Sensor reading. When a person activates the sensor, this request is called
exports.get_sensor_reading = function(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');

    sql = 'select * from Sensor order by sensorId desc limit 1';
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(result[0]);
    });
}

// updates Sensor table to set the flag for the sensor that was just activated
exports.post_sensor_reading = function(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');

    sensorId = req.query.id;
    datelocal = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() -
        ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');

    if (sensorId.toUpperCase() == 'A') {
        sql = "insert into Sensor (sensorAFlag, sensorATimestamp, sensorBFlag) values (1, '" + datelocal + "', -1)" ;
    }
    if (sensorId.toUpperCase() == 'B') {
        sql = "insert into Sensor (sensorBFlag, sensorBTimestamp, sensorAFlag) values (1, '" + datelocal + "', -1)";
    }

    con.query(sql, function  (err, result) {
        if (err) throw err;
        res.send('Sensor: ' + sensorId.toUpperCase() + ' Updated');
    });
}

// updates Traffic table to signify an In or Out activity
exports.post_traffic_reading = function(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');

    directionFlag = req.query.id;
    datelocal = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() -
        ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');

    if (directionFlag == 'in')
        sql = "insert into Traffic (inCount, inTimestamp) values (1, '" + datelocal + "')";

    if (directionFlag == 'out')
        sql = "insert into Traffic (outCount, outTimestamp) values (1, '" + datelocal + "')";

    con.query(sql, function  (err, result) {
        if (err) throw err;
        res.send('Activity: ' + directionFlag.toUpperCase() + ' Updated');
    });
}

exports.get_items_needed = function(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');
    sql = "select i.Name, i.Brand, i.Description, r.CustomerName, r.PhoneNumber from Item i inner join Request r on i.itemId = r.ItemId";

    con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(result);
    });
}
