const express = require('express');
const mongoose = require('mongoose');
const orderRoutes = require('./routes/orderRoutes');
const { startOrderEventConsumer } = require('./events/orderConsumer');
require('dotenv').config();

const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// MongoDB connection
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('Error: MONGO_URI is not defined. Please check your .env file.');
  process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

if (process.env.KAFKA_BROKER) {
  startOrderEventConsumer();
} else {
  console.warn('KAFKA_BROKER not set -- order-events consumer not started; order status changes will not be applied.');
}

// Order routes
app.use('/orders', orderRoutes);

// Start the server
const port = process.env.PORT || 3003;
const server = app.listen(port, () => {
  console.log(`Order service running on port ${port}`);
});

// Graceful shutdown on process termination
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Closing the server...');
  await mongoose.connection.close();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

module.exports = server; // Export the server instance
