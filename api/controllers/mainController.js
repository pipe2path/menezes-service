var log4js = require('log4js');
var logger = log4js.getLogger();
var con = require('../common/database.js');
var aws = require('aws-sdk');
var path = require("path");

logger.level = 'debug';

exports.get_items_needed = function(req, res){
    res.setHeader('Access-Control-Allow-Origin','*');
    sql = "select i.itemId, i.name, i.brand from item i left join request r on i.itemId = r.itemId " +
        "group by i.itemId, i.name, i.brand";

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
                    })
                })
            }
            else if(result[0].ItemId == itemId){
                // just insert request row
                var sql2 = "insert request (customerName, phoneNumber, itemId, dateRequested) values ('"
                    + name + "', '" + updatedPhone + "', " + itemId + ", '" + dateLocal + "')";
                con.query(sql2, function(err, result){
                    if(err) throw err;
                })
            }
        })
    }
}

exports.post_img_submit = function(req, res){
    const itemId = req.body.itemId;
    const submittedBy = req.body.name;
    const imageData = req.body.image;

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
            sendSMS();
        }
    });

    function updateDB() {
        imagePath = 'https://s3-us-west-1.amazonaws.com/mzsgarage-images/' + filename;

        // update database
        var sql = "insert image (itemId, submittedBy, submitDate, image) values(" +
            itemId + ", '" + submittedBy + "', '" + dateLocal + "', '" + imagePath + "')";
        con.query(sql);
    }

    function sendSMS(){
        // send mms message
        const smsAccountId = process.env.SMSACCOUNTID;
        const smsAccountToken = process.env.SMSACCOUNTTOKEN;
        var client = require('twilio')(smsAccountId, smsAccountToken);
        sql = "select it.name, it.brand, i.submittedBy, i.submitDate, i.image, r.customerName, r.phoneNumber from image i " +
            "inner join item it on i.itemId = it.itemId inner join request r on i.itemid = r.itemid " +
            "where r.itemId = " + itemId + " and r.requestid not in (select requestid from transmission)" ;
        con.query(sql, function(err, result){
            if (err) throw err;
            result.forEach(function(result) {
                client.messages.create({
                    body: 'The item you requested has been found.' + result.submittedBy + ' found it.',
                    from: '+19092459877',
                    mediaUrl: [result.image],
                    to: result.phoneNumber
                }).then(message => console.log(message.status)).done();
            })

        })
    }

    res.send('image processed');
}

