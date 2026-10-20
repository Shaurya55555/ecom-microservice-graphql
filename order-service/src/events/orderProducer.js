const kafka = require('kafka-node');

const kafkaClient = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BROKER });
const producer = new kafka.Producer(kafkaClient);

function send(topic, event) {
  return new Promise((resolve, reject) => {
    producer.send([{ topic, messages: JSON.stringify(event) }], (error, result) => {
      if (error) {
        console.error(`Failed to produce ${topic} event:`, error);
        return reject(error);
      }
      console.log(`Order event produced on ${topic}:`, event.type);
      resolve(result);
    });
  });
}

// Topic matches kafka/topics/topicConfig.json ("order-events") -- the
// previous version sent to "order_created", a topic nothing was ever
// subscribed to, so this event was silently dropped.
const produceOrderEvent = (order) => send('order-events', { type: 'order_created', order });

const produceOrderStatusEvent = (orderId, status, userId) =>
  send('order-events', { type: 'order_status_changed', orderId: String(orderId), status, userId: userId ? String(userId) : undefined });

module.exports = { produceOrderEvent, produceOrderStatusEvent };
