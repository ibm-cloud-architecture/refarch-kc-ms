var kafka = require('node-rdkafka');
var config = require('../utils/config.js')

const getProducerConfig = () => {
    console.log('in getProducerConfig');
    var producerConfig = {
        'debug': 'all',
        'metadata.broker.list': config.getKafkaBrokers(),
        'broker.version.fallback': '0.10.2.1',
        'log.connection.close' : false,
        'client.id': 'voyage-producer',
        'dr_msg_cb': true // Enable delivery reports with message payload
    };
    if (config.getKafkaEnvironment() == "IBMCLOUD") {
        eventStreamsConfig = {
            'security.protocol': 'sasl_ssl',
            'ssl.ca.location': config.getCertsPath(),
            'sasl.mechanisms': 'plain',
            'sasl.username': 'token',
            'sasl.password': config.getKafkaApiKey()
        }
        for (var key in eventStreamsConfig) { 
            producerConfig[key] = eventStreamsConfig[key];
        }
    }
    console.log('producer configs' + JSON.stringify(producerConfig));
    return producerConfig;
}

console.log('before creating producer');
var producer = new kafka.Producer(getProducerConfig(), {
    'request.required.acks': -1,
    'produce.offset.report': true
});

producer.setPollInterval(100);
producer.connect();

producer.on('delivery-report', function(err, dr) {
    if (err) {
        console.error('Delivery report: Failed sending message ' + dr.value);
        console.error(err);
        // We could retry sending the message
    } else {
        console.log('Message produced, offset: ' + dr.offset);
    }
});

const emit = (event, callback) => {
    console.log('in emit ' + JSON.stringify(event));
    console.log('producer is ' + producer);
    console.log('topic is ' + config.getOrderTopicName());
    try {
        producer.produce(config.getOrderTopicName(), null, new Buffer(JSON.stringify(event)));
    } catch (err) {
        console.error('Failed sending event ' + event);
        console.error(err);
    }
    //TODO sync
}

module.exports = {
    emit, 
};
