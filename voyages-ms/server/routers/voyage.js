var express = require('express');

var voyagesList = require('../../data/voyages.json');
var emitter = require('../utils/kafka.js');

module.exports = function(app) {
  var router = express.Router();

  // List all existing voyages
  router.get('/', function (req, res, next) {
    res.send(voyagesList);
  });

  // Assign an order to a voyage
  // Post data: {'orderID': 'qwerty', 'containers': 2'}
  router.post('/:voyageID/assign/', function(req, res, next) {
    console.log('assigning an order to voyage ' + voyageID);
    var voyageID = req.params.voyageID;
    console.log('body ' + JSON.stringify(req.body));
    var orderID = req.body.orderID;
    var containers = req.body.containers;
    console.log('OrderID ' + orderID);
    console.log('Containers ' + containers);
    
    var event = {
      'timestamp':  Date.now(),
      'type': 'OrderUpdated',
      'version': '1',
      'payload': {
        'voyageID': voyageID,
        'orderID': orderID
      }
    }
    console.log('built' + JSON.stringify(event));
    emitter.emit(event).then (function(fulfilled) {
      console.log('fulfilled' + event);  
      res.json(event);
    }).catch(function(err){
      console.log('rejected' + err);  
      res.status(500).send('Error occured');
    });

  });

  app.use('/voyage', router);
}



