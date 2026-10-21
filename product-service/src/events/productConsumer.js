const kafka = require('kafka-node');
const { kafkaOptions } = require('./kafkaOptions');
const client = new kafka.KafkaClient(kafkaOptions());
const consumer = new kafka.Consumer(client, [{ topic: 'product-events' }], { autoCommit: true });

// Listen for product-related events
consumer.on('message', (message) => {
  const event = JSON.parse(message.value);
  if (event.type === 'ProductCreated') {
    console.log('Handling ProductCreated event:', event.data);
    // Implement any logic needed for this event
  }
});

consumer.on('error', (err) => {
  console.error('Error in Kafka consumer:', err);
});
