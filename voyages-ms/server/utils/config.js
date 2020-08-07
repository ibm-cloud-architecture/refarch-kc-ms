const config = require('../config/local.json');

module.exports = {

    getKafkaBrokers: function() {
        return process.env.KAFKA_BROKERS || config.kafkaBrokers;
    },

    getOrderTopicName: function() {
        return process.env.KCSOLUTION_ORDERS_TOPIC || config.orderTopicName;
    },

    getKafkaPassword: function() {
        return process.env.KAFKA_PASSWORD || config.kafkaPassword;
    },

    getKafkaUser: function() {
        return process.env.KAFKA_USER || config.kafkaUser;
    },

    getCertsPath: function() {
        return process.env.CERTS_PATH || config.certsPath;
    },

    getPort: function() {
        return process.env.PORT || config.port;
    },

    isEventStreams: function() {
       return ('KAFKA_PASSWORD' in process.env && process.env.KAFKA_PASSWORD.trim());
    },

    areEventStreamsCertificatesRequired: function() {
        return ('CERTS_ENABLED' in process.env);
    }
}
