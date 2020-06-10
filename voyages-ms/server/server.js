// Uncomment following to enable zipkin tracing, tailor to fit your network configuration:
// var appzip = require('appmetrics-zipkin')({
//     host: 'localhost',
//     port: 9411,
//     serviceName:'frontend'
// });

//require('appmetrics-dash').attach();
//require('appmetrics-prometheus').attach();
const appName = require('./../package').name;
const express = require('express');
const log4js = require('log4js');
const localConfig = require('./utils/config.js');
const path = require('path');

const logger = log4js.getLogger(appName);
logger.level = process.env.LOG_LEVEL || 'info'

const kafka = require('./utils/kafka.js');

module.exports = (options) => {
  const app = express();
    
  app.use(express.json());
  app.use(log4js.connectLogger(logger, { level: logger.level }));
  
  require('./services/index')(app);
  require('./routers/index')(app);
  
  const kbroker = localConfig.getKafkaBrokers();
  logger.info(`voyagesms should be connected to kafka at: ${kbroker}`);
  
  // Disconnect Kafka clients when the HTTP server is closed.
  options.server.on('close', function () {
    kafka.disconnect();
  });

  app.use(function (req, res, next) {
    res.status(404).sendFile(path.join(__dirname, '../public', '404.html'));
  });
  
  app.use(function (err, req, res, next) {
    res.status(500).sendFile(path.join(__dirname, '../public', '500.html'));
  });
  
  return app;
};
