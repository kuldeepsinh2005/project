// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
// const { Server: SocketIO } = require('socket.io');
const logger = require('./utils/logger');
const recordingRoutes = require('./routes/recordings'); 
// --- 1. Initialize Express & HTTP Server ---
const app = express();
const server = http.createServer(app);

// --- 2. Middleware ---
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});


// --- 3. Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => logger.info('Mongoose connected'));
mongoose.connection.on('error', (err) => logger.error('Mongoose error:', err));
mongoose.connection.on('disconnected', () => logger.warn('Mongoose disconnected'));

// --- 4. Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/users', require('./routes/users'));
app.use('/api/recordings', recordingRoutes);

// --- 6. Server Startup ---
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    logger.error('Server startup error:', err);
    // process.exit(1);
  }
};

// --- 7. Graceful Shutdown ---
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // server.close(() => process.exit(1));
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // server.close(() => process.exit(1));
});
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      // process.exit(0);
    });
  });
});

startServer();
