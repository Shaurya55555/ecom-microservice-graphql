const kafka = require('kafka-node');
const { kafkaOptions } = require('./kafkaOptions');
const client = new kafka.KafkaClient(kafkaOptions());
const producer = new kafka.Producer(client);

// Emit 'Product Created' event
exports.emitProductCreatedEvent = (product) => {
  const event = { type: 'ProductCreated', data: product };
  const payloads = [{ topic: 'product-events', messages: JSON.stringify(event) }];
  producer.send(payloads, (err, data) => {
    if (err) console.error('Failed to emit ProductCreated event:', err);
    else console.log('ProductCreated event emitted:', data);
  });
};
