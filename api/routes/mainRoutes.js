module.exports = function(app){
    var main = require('../controllers/mainController.js');
    var waterflow = require('../controllers/waterflowcontroller');
    var comm_alert = require('../controllers/commalertcontroller');
    
    // app.route('/sensor')
    //     .get(main.get_sensor_reading)
    //     .post(main.post_sensor_reading);
    
    // app.route('/traffic')
    //     .post(main.post_traffic_reading);

    // //twilio-hack-coronavirus project Apr, 2020
    // app.route('/items')
    //     .get(main.get_items_needed)
    //     .post(main.post_items_needed);

    // app.route('/upload')
    //     .post(main.post_img_submit);

    // water flow sensor readings project with Lu.    
    app.route('/waterflow')
        .get(waterflow.get_sensor_readings)
        .post(waterflow.post_sensor_reading);    
    
    // comm_alert readings
    app.route('/alert')
        .get(comm_alert.get_alert_reading);
}
