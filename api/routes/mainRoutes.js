module.exports = function(app){
    var main = require('../controllers/mainController.js');

    app.route('/sensor')
        .get(main.get_sensor_reading)
        .post(main.post_sensor_reading)

    app.route('/traffic')
        .post(main.post_traffic_reading);
}