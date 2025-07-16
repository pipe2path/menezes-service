var log4js = require('log4js');
var logger = log4js.getLogger();
var con = require('../common/database.js');
var aws = require('aws-sdk');
var path = require("path");

logger.level = 'debug';

exports.get_items_needed = function(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');
    sql = "select i.itemId, i.name, i.brand, " +
        " (select count(*) from request r left join transmission t on r.requestId = t.requestId where r.itemId = i.itemId and t.transmissionId is null) as openItems" +
        " from item i left join request r on i.itemId = r.itemId" +
        " group by i.itemId, i.name, i.brand";
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

    var updatedPhone = "1" + phone;
    var dateLocal = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() -
        ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');

    for(let i=0; i<items.length; i++) {
        const itemId = items[i].itemId;
        sql = 'select ItemId from item where itemId = ' + itemId ;
        con.query(sql, function(err, result){
            if (itemId == undefined){
                // insert item and request row
                var sql2 = "insert item (name) values ('" + items[i].name + "')";
                con.query(sql2, function(err, result){
                    if(err) throw err;
                    var insertedId = result.insertId;
                    var sql3 = "insert request (customerName, phoneNumber, itemId, dateRequested) values ('"
                        + name + "', '" + updatedPhone + "', " + insertedId + ", '" + dateLocal + "')";
                    con.query(sql3, function(err, result){
                        if (err) throw err;
                        sendSMS(insertedId);
                    })
                })
            }
            else if(result[0].ItemId == itemId){
                // just insert request row
                var sql2 = "insert request (customerName, phoneNumber, itemId, dateRequested) values ('"
                    + name + "', '" + updatedPhone + "', " + itemId + ", '" + dateLocal + "')";
                con.query(sql2, function(err, result){
                    if(err) throw err;
                    sendSMS(itemId);
                })
            }
        })
    }
}

exports.get_lora_data = function(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');
    sql = "SELECT * FROM pl9mj0om513j938e.lora_data ORDER BY DATE_CREATED DESC LIMIT 500";
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(result);
    });
} 

exports.post_lora_data = function(req, res){
    let message = req.query.message;
    
    res.setHeader('Access-Control-Allow-Origin','*');
    var sql = "insert lora_data (data) values ('"+ message + "')";
    con.query(sql, function(err, result){
        if (err) throw err;
        res.send(result);
    });
}

exports.post_lora_data_json = function(req, res){
    console.log(req.body);
    let requestBody = req.body;
    //let requestData = requestBody.data.split(',');
    
    res.setHeader('Access-Control-Allow-Origin','*');
    var sql = "insert lora_data (data) values ('"+ requestBody.data + "')";
    //var sql = "insert lora_messages (nodeId, messageId, message) values ('" + requestData[0] + "', '" + requestData[1] + "', '" + requestData[2] + "')";
    con.query(sql, function(err, result){
        if (err) throw err;
        res.send(result);
    });
}

exports.post_img_submit = function(req, res){
    const itemId = req.body.itemId;
    const submittedBy = req.body.name;
    const notes = req.body.notes;
    const store = req.body.store;
    const imageData = req.body.image;
    const lat = req.body.lat;
    const long = req.body.long;

    //aws.config.loadFromPath('./config.json');
    res.setHeader('Access-Control-Allow-Origin','*');

    var dateLocal = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() -
        ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
    var dateForFile = dateLocal.replace(/:/g, '').replace(/ /g, '').replace(/-/g, '');
    var filename = path.join("corona-" + itemId + "-" + dateForFile + ".jpg");

    let buf = new Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ""),'base64')
    var s3Bucket = new aws.S3( { accessKeyId: process.env.S3_KEY, secretAccessKey: process.env.S3_SECRET, params: {Bucket: 'mzsgarage-images'} } );
    var data = {
        Key: filename,
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg'
    };
    s3Bucket.putObject(data, function(err, data){
        if (err) {
            console.log(err);
            console.log('Error uploading data: ', data);
            throw err;
        } else {
            console.log('successfully uploaded to S3.');
            updateDB();
            sendSMS(itemId);
        }
    });

    function updateDB() {
        imagePath = 'https://s3-us-west-1.amazonaws.com/mzsgarage-images/' + filename;
        var a_submittedBy = submittedBy.replace(/'/g,"''");
        var a_store = store.replace(/'/g,"''");
        var a_notes = notes.replace(/'/g,"''");

        // update database
        var sql = "insert image (itemId, submittedBy, store, submitDate, notes, image, latitude, longitude) values(" +
            itemId + ", '" + a_submittedBy + "', '" + a_store + "', '" + dateLocal + "', '" + a_notes + "', '" + imagePath +
            "', '" + lat + "', '" + long + "')";
        con.query(sql);
    }

    res.send('image processed');
}

function sendSMS(itemId){
    // send mms message
    const smsAccountId = process.env.SMSACCOUNTID;
    const smsAccountToken = process.env.SMSACCOUNTTOKEN;
    var client = require('twilio')(smsAccountId, smsAccountToken);

    var dateLocal = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() -
        ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');

    sql = "select it.name, it.brand, i.submittedBy, i.store, i.notes, i.submitDate, i.image, i.latitude, i.longitude, " +
        "r.customerName, r.phoneNumber, r.requestId, i.orderId from image i " +
        "inner join item it on i.itemId = it.itemId inner join request r on i.itemid = r.itemid " +
        "where r.itemId = " + itemId + " and DATE(i.submitDate) =  CURDATE() and r.requestid not in (select requestid from transmission)" ;
    console.log(sql);
    con.query(sql, function(err, result){
        if (err) throw err;
        result.forEach(function(result) {
            const mapLink = (result.latitude != undefined ? 'http://google.com/maps/place/' + result.latitude + ',' + result.longitude : '');
            var textMsg = 'Hello ' + result.customerName + '!\nThe item you requested has been found!\n';
            textMsg = (result.submittedBy != '' ? textMsg + result.submittedBy + ' found it at ' + result.store + '.' : textMsg );
            textMsg = (result.notes != '' ? textMsg + '\nNotes: ' + result.notes : textMsg);
            textMsg = (result.latitude != '' ? textMsg + '\nMap it here: ' + mapLink : '')
            client.messages.create({
                body: textMsg ,
                from: '+19092459877',
                mediaUrl: [result.image],
                to: result.phoneNumber
            }).then(message => console.log(message.status)).done();

            // insert into transmission table
            sql = "insert into transmission (requestId, dateSent, orderId) values (" + result.requestId + ", '" +
                dateLocal + "', " + result.orderId + ")";
            con.query(sql);
        })
    })
}