const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userRoutes = require('./routes/userRoutes');
const User = require('./models/userModel');
require('dotenv').config();  // Load environment variables from .env file

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// MongoDB connection string (use environment variable or default to local MongoDB)
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';

// Seed the single admin account from env vars if it doesn't exist yet.
// ADMIN_EMAIL / ADMIN_PASSWORD must be set in the deployment environment --
// never hardcode real credentials in source.
async function ensureAdminSeeded() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set — no admin account seeded.');
    return;
  }
  const existing = await User.findOne({ email });
  if (existing) return;
  const hashed = await bcrypt.hash(password, 10);
  await User.create({
    username: process.env.ADMIN_USERNAME || 'admin',
    email,
    password: hashed,
    role: 'admin',
  });
  console.log(`Seeded admin account for ${email}`);
}

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  return ensureAdminSeeded();
})
.catch((err) => {
  console.error('Could not connect to MongoDB:', err);
  process.exit(1);  // Exit process with failure if DB connection fails
});

// Routes (prefix the routes with '/users')
app.use('/users', userRoutes);

// Start server on the specified port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});

// Graceful shutdown on process termination
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Closing the server...');
  await mongoose.connection.close();  // Close the MongoDB connection gracefully
  process.exit(0);  // Exit the process
});
