// Connection options shared by every kafka-node client in this service.
// Local Docker uses plain TCP; a managed Kafka (e.g. Confluent Cloud) needs
// TLS plus SASL/PLAIN, enabled by setting KAFKA_SASL_USERNAME/PASSWORD.
function kafkaOptions(extra = {}) {
  const options = { kafkaHost: process.env.KAFKA_BROKER, ...extra };
  if (process.env.KAFKA_SASL_USERNAME) {
    options.sslOptions = { rejectUnauthorized: true };
    options.sasl = {
      mechanism: 'plain',
      username: process.env.KAFKA_SASL_USERNAME,
      password: process.env.KAFKA_SASL_PASSWORD,
    };
  } else if (process.env.KAFKA_TLS === 'true') {
    options.sslOptions = { rejectUnauthorized: true };
  }
  return options;
}

module.exports = { kafkaOptions };
