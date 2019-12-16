var express = require('express');
// mockup of backend data source. Can be changed later !
var voyagesList = require('../../data/voyages.json');
// voyages is a consumer of orders topic for OrderCreated event
// and a producer when a voyage is assigned to an order
var kafka = require('../utils/kafka.js');
var config = require('../utils/config.js');

var myMap = new Map();

module.exports = function(app) {
  var router = express.Router();

  // List all existing voyages
  router.get('/', function (req, res, next) {
    res.send(voyagesList);
  });

  // Assign an order to a voyage according to the number of containers expected
  // Post data: {'orderID': 'a-orderid-as-key-in-orders-topic', 'containers': 2'}
  // this method is not really called, as voyage is  a consumer on orders topic and will process order from event
  // it is used as an alternate path.
  router.post('/:voyageID/assign/', function(req, res, next) {
    var voyageID = req.params.voyageID;
    var orderID = req.body.orderID;
    var containers = req.body.containers;
    console.log('assigning order ' + orderID + ' to voyage ' + voyageID);

    var event = {
      'timestamp':  Date.now(),
      'type': 'VoyageAssigned',
      'version': '1',
      'payload': {
        'voyageID': voyageID,
        'orderID': orderID
      }
    }

    kafka.emit(orderID, event).then ( function(fulfilled) {
      console.log('Emitted ' + JSON.stringify(event));
      res.json(event);
    }).catch( function(err){
      console.log('Rejected' + err);
      res.status(500).send('Error occured');
    });

  });

  router.post('/addVoyage/', function(req, res, next) {
    try {
      // Get the data element in the request which is the new voyage
      var new_voyage = req.body;
      console.log('Received new Voyage: ' + new_voyage);
      // Check the JSON comes with all the parameters we expect and these are not empty
      if (new_voyage.voyageID.trim() && new_voyage.shipID.trim() && new_voyage.srcPort.trim() && new_voyage.plannedDeparture.trim() && new_voyage.destPort.trim() && new_voyage.plannedArrival.trim() && new_voyage.freeCapacity != 0) {
        voyagesList.push(new_voyage)
        console.log('new Voyage added');
      }
    } catch (e) {
      // An error parsing the JSON occurredß
      console.error(e);
    }
    // Return list of voyages
    res.send(voyagesList);
  });

  app.use('/voyage', router);
} // export


const cb = (message, reloading) => {
  var event = JSON.parse(message.value.toString());
  console.log('Event received ' + JSON.stringify(event,null,2));
  if (event.type === 'OrderCreated') {

    console.log('OrderCreated event received and stored. Waiting for its ContainerAllocated event.');
    myMap.set(event.payload.orderID, event);
    // Uncomment for debugging
    console.log(myMap);

  }
  
  if (event.type === 'ContainerAllocated') {
    console.log('ContainerAllocated event for order: ' + event.payload.orderID + ' received. Searching for a voyage.');
    if (myMap.get(event.payload.orderID) !== undefined){
      var order = myMap.get(event.orderID)

      // For UI demo purpose, wait 30 secs before assigning this order to a voyage
      var timeoutMs = reloading ? 0 : 10000;

      setTimeout(function() {
        var matchedVoyage = findSuitableVoyage(order.payload);
        var assignOrRejectEvent;
        if (matchedVoyage.voyageID) {
          assignOrRejectEvent = {
            'timestamp':  Date.now(),
            'type': 'VoyageAssigned',
            'version': '1',
            'payload': {
              'voyageID': matchedVoyage.voyageID,
              'orderID': order.payload.orderID
            }
          }
          if (!myMap.delete(order.payload.orderID)){
            console.log('[ERROR] -  An error occurred while deleting the orderID ' + order.payload.orderID + ' from the order in memory map');
            console.log(myMap);
          }
        } else {
          assignOrRejectEvent = {
            'timestamp':  Date.now(),
            'type': 'VoyageNotFound',
            'version': '1',
            'payload': {
              'reason': matchedVoyage.reason,
              'orderID': order.payload.orderID
            }
          }
        }

        if(!reloading) {
          console.log('Emitting ' + assignOrRejectEvent.type);
          kafka.emit(order.payload.orderID, assignOrRejectEvent).then (function(fulfilled) {
            console.log('Emitted ' + JSON.stringify(assignOrRejectEvent));
          }).catch(function(err){
            console.log('Rejected' + err);
          });
        }
      }, timeoutMs)

    } else {
      console.log('[ERROR] - We could not find the order for orderID: ' + event.orderID);
    }
  }
}

/**
 * This is the real entry point. Start a Kafka consumer and once an order event is received process it with
 * the given callback
 */
kafka.reload({
  //'topic':'orders', //#### TOPIC NAME ####
  'topic': config.getOrderTopicName(),
  'callback': cb
});



/**
 * Verify if port and capacity match
 * @param  order
 */
const findSuitableVoyage = (order) => {
  for (v of voyagesList) {
    if (v.destPort === order.destinationAddress.city) {
      if (v.freeCapacity >= order.quantity) {
        v.freeCapacity -= order.quantity;
        return { 'voyageID': v.voyageID};
      }
      return { 'reason': 'Insufficient free capacity'};
    }
  }
  return { 'reason': 'No matching destination'};
}
