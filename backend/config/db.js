const mongoose = require('mongoose');
const dns = require('dns');

// Configure Node's DNS resolver to use Cloudflare and Google DNS servers for MongoDB Atlas SRV records
dns.setServers(['1.1.1.1', '8.8.8.8']);

// Register connection lifecycle event listeners without logging sensitive details
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB connection lost. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB connection re-established.');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB runtime connection error: ${err.message}`);
});

/**
 * Connects to the MongoDB database using Mongoose.
 * Connection string is read from process.env.MONGO_URI.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
