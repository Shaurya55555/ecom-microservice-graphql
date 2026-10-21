const kafka = require('kafka-node');
const Order = require('../models/orderModel');
const { kafkaOptions } = require('./kafkaOptions');

// Consumes order-events and applies the side effects that are safe to do
// asynchronously. Auth/ownership checks stay synchronous in the controller
// (respondToOrder) -- only the actual status write happens here, so an
// accept/reject decision is genuinely event-driven end to end.
function startOrderEventConsumer() {
  // A ConsumerGroup is required here: a plain kafka.Consumer on { topic } only
  // reads partition 0, and order-events has 3 partitions, so status events
  // landing on partitions 1 and 2 would be silently ignored.
  const consumer = new kafka.ConsumerGroup(
    kafkaOptions({
      groupId: 'order-service',
      fromOffset: 'earliest',
      autoCommit: true,
    }),
    ['order-events']
  );

  consumer.on('message', async (message) => {
    let event;
    try {
      event = JSON.parse(message.value);
    } catch (err) {
      console.error('Could not parse order event:', message.value);
      return;
    }

    if (event.type === 'order_status_changed') {
      try {
        const updated = await Order.findByIdAndUpdate(
          event.orderId,
          { status: event.status },
          { new: true }
        );
        if (!updated) {
          console.error(`order_status_changed: order ${event.orderId} not found`);
          return;
        }
        console.log(`Order ${event.orderId} status set to ${event.status} via Kafka consumer`);
      } catch (err) {
        console.error(`Failed to apply status update for order ${event.orderId}:`, err.message);
      }
    }
    // event.type === 'order_created' is left for other services to consume
    // (e.g. notifications) -- order-service doesn't need to act on its own
    // creation event.
  });

  consumer.on('error', (err) => {
    console.error('Error in order-service Kafka consumer:', err);
  });

  return consumer;
}

module.exports = { startOrderEventConsumer };
