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
producer.on('ready', async () => {
    console.log('ready');
});

producer.on('delivery-report', (err, report) => {
    if (typeof report.opaque === 'function') {
        report.opaque.call(null, err, report);
    } else {
        console.error('Assertion failed: opaque not a function!');
        console.error(err);
        console.error(report);
    }
});

const emit = (event) => {
    console.log('in emit ' + JSON.stringify(event));
    console.log('producer is ' + producer);
    console.log('topic is ' + config.getOrderTopicName());

    //ensureConnected();

    return new Promise((resolve, reject) => {
        try {
            producer.produce(config.getOrderTopicName(), 
                null /* partition */, 
                new Buffer(JSON.stringify(event)),
                null, /* key */
                Date.now(),
                (err, report) => {
                    if (err) return reject(err);
                    return resolve(report);
                }
            );
        } catch (e) {
            console.error('Failed sending event ' + event);
            console.error(e);
            return reject(e);
        }
    });

}

module.exports = {
    emit, 
};
