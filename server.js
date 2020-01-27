/**
 * Created by kevin on 2020-01-23
 */
var express = require('express'),
    app = express(),
    port = process.env.PORT || 3050,
    bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var mainRoutes = require('./api/routes/mainRoutes.js');
mainRoutes(app);

app.listen(port);

console.log('menezes-service API Server started on: ', port);