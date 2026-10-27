require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const contactRoutes = require('./routes/contactRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and standard middleware
app.use(helmet());

const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  }
}));

app.use(express.json({ limit: '10kb' }));

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BY Solutions API is running'
  });
});

// API Routes
app.use('/api/contact', contactRoutes);

// Catch-all 404 handler for undefined routes (registered before global error handler)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

// Global Error Handler (must be registered after all routes)
app.use(errorHandler);

let server;

// Start Express server after connecting to MongoDB
const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Server initialization error: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown handling for SIGINT and SIGTERM
let isShuttingDown = false;
const handleGracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  const forceTimeout = setTimeout(() => {
    console.error('Graceful shutdown timed out after 10s. Forcing exit.');
    process.exit(1);
  }, 10000);
  forceTimeout.unref();

  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log('HTTP server closed.');
    }
    await mongoose.connection.close(false);
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error(`Error during graceful shutdown: ${err.message}`);
    process.exit(1);
  }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

startServer();
