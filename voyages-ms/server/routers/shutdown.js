var express = require('express');
var kafka = require('../utils/kafka.js');
var log4js = require('log4js');

const appName = require('./../../package').name;
const logger = log4js.getLogger(appName);

// This is a horrible hack to get the nodejs-express stack tests to complete,
// by disconnecting the Kafka clients when the final test (/blah) is executed.
module.exports = function(app) {
    var router = express.Router();
  
    router.get('/', function (req, res, next) {
        logger.info('Shutting down Kafka clients');
        kafka.disconnect();
        res.status(404).send('Bye!');   // Test expects a 404 response
    });
  
    app.use("/blah", router);
}