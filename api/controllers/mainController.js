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
    sql = "select i.ItemId, i.Name, i.Brand from item i left join request r on i.itemId = r.ItemId " +
        "group by i.ItemId, i.Name, i.Brand";

    con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(result);
    });
}

exports.post_items_needed = function (req, res){
    res.setHeader('Access-Control-Allow-Origin','*');
    const name = req.body.name;
    const phone = req.body.phone;
    const items = req.body.items;
    var sql = '';

    for(let i=0; i<items.length; i++) {
        const itemId = items[i].ItemId;
        sql = 'select ItemId from item where itemId = ' + itemId ;
        con.query(sql, function(err, result){
            if (itemId == undefined){
                // insert item and request row
                var sql2 = "insert item (Name) values ('" + items[i].Name + "')";
                con.query(sql2, function(err, result){
                    if(err) throw err;
                    var insertedId = result.insertId;
                    var sql3 = "insert request (customerName, phoneNumber, itemId) values ('" + name + "', '" + phone + "', " + insertedId + ")";
                    con.query(sql3, function(err, result){
                        if (err) throw err;
                    })
                })
            }
            else if(result[0].ItemId == itemId){
                // just insert request row
                var sql2 = "insert request (customerName, phoneNumber, itemId) values ('" + name + "', '" + phone + "', " + itemId + ")";
                con.query(sql2, function(err, result){
                    if(err) throw err;
                })
            }
        })
    }
}

