// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server: SocketIO } = require('socket.io');
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

// --- 5. Socket.IO Setup ---

// const io = new SocketIO(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//     methods: ['GET', 'POST'],
//     credentials: true
//   },
//   pingTimeout: 60000
// });

// // initialize mediasoup worker(s) at startup
// const mediasoupService = require('./services/mediasoupService');
// (async () => {
//   await mediasoupService.createWorker();
// })();

// // attach the mediasoup socket handlers
// const initSocketMediasoup = require('./socketMediasoup');
// initSocketMediasoup(io);

// io.on('connection', (socket) => {
//   socket.on('join-room', ({ meetingId, username }) => {
//     socket.join(meetingId);
//     socket.to(meetingId).emit('user-joined', { socketId: socket.id, username });
//   });

//   socket.on('offer', ({ to, sdp }) => {
//     io.to(to).emit('offer', { from: socket.id, sdp });
//   });

//   socket.on('answer', ({ to, sdp }) => {
//     io.to(to).emit('answer', { from: socket.id, sdp });
//   });

//   socket.on('ice-candidate', ({ to, candidate }) => {
//     io.to(to).emit('ice-candidate', { from: socket.id, candidate });
//   });

//   socket.on('disconnect', () => {
//     io.emit('user-disconnected', socket.id);
//   });
// });


// const io = new SocketIO(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//     methods: ['GET', 'POST'],
//     credentials: true
//   },
//   pingTimeout: 60000
// });

// io.on('connection', (socket) => {
//   logger.info(`Socket connected: ${socket.id}`);

//   socket.on('join-room', ({ meetingId, user }) => {
//     if (!meetingId) return;
//     socket.join(meetingId);
//     socket.to(meetingId).emit('user-joined', { socketId: socket.id, user });
//     logger.info(`User joined meeting ${meetingId}`);
//   });

//   socket.on('leave-room', ({ meetingId, user }) => {
//     socket.leave(meetingId);
//     socket.to(meetingId).emit('user-left', { socketId: socket.id, user });
//     logger.info(`User left meeting ${meetingId}`);
//   });

//   socket.on('signal', ({ meetingId, payload }) => {
//     socket.to(meetingId).emit('signal', { from: socket.id, payload });
//   });

//   socket.on('disconnect', (reason) => {
//     logger.info(`Socket disconnected: ${socket.id} (${reason})`);
//   });
// });

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
    process.exit(1);
  }
};

// --- 7. Graceful Shutdown ---
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

startServer();


// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const http = require('http');
// const { Server: SocketIO } = require('socket.io');
// // const errorHandler = require('../middleware/errorHandler.js');
// const logger = require('./utils/logger');
//   const cookieParser = require('cookie-parser')
// // Initialize Express app
// const app = express();

// const server = http.createServer(app);

// // After server creation in server.js — add socket.io setup
// // const io = new SocketIO(server, {
// //   cors: {
// //     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
// //     methods: ['GET','POST'],
// //     credentials: true
// //   },
// //   pingTimeout: 60000
// // });

// // io.on('connection', (socket) => {
// //   console.log('Socket connected', socket.id);

// //   socket.on('join-room', ({ meetingId, user }) => {
// //     if (!meetingId) return;
// //     socket.join(meetingId);
// //     // notify others in room
// //     socket.to(meetingId).emit('user-joined', { socketId: socket.id, user });

// //     // optionally send current participants list with a DB lookup if needed
// //     console.log(`Socket ${socket.id} joined meeting ${meetingId}`);
// //   });

// //   socket.on('leave-room', ({ meetingId, user }) => {
// //     socket.leave(meetingId);
// //     socket.to(meetingId).emit('user-left', { socketId: socket.id, user });
// //   });

// //   // Forward signaling messages to room (for simple mesh)
// //   socket.on('signal', ({ meetingId, payload }) => {
// //     // payload should include target socketId or be broadcast
// //     socket.to(meetingId).emit('signal', { from: socket.id, payload });
// //   });

// //   socket.on('disconnect', (reason) => {
// //     console.log('Socket disconnected', socket.id, reason);
// //     // (optional) broadcast disconnect to rooms
// //   });
// // });


// // Database Connection
// // const connectDB = async () => {
// //   try {
// //     await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cosmomeet', {
// //       useNewUrlParser: true,
// //       useUnifiedTopology: true,
// //       useCreateIndex: true,
// //       useFindAndModify: false
// //     });
// //     logger.info('MongoDB connected successfully');
// //   } catch (err) {
// //     logger.error('MongoDB connection error:', err);
// //     process.exit(1);
// //   }
// // };

// // Replace your current Mongoose connection with this:
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log('MongoDB Connected...');
//   } catch (err) {
//     console.error('MongoDB connection error:', err);
//     process.exit(1);
//   }
// };

// // Database event listeners
// mongoose.connection.on('connected', () => logger.info('Mongoose connected to DB'));
// mongoose.connection.on('error', (err) => logger.error('Mongoose connection error:', err));
// mongoose.connection.on('disconnected', () => logger.warn('Mongoose disconnected'));

// // // Initialize Socket.IO
// // const io = new SocketIO(server, {
// //   cors: {
// //     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
// //     methods: ['GET', 'POST']
// //   }
// // });

// // // Socket.IO connection handler
// // io.on('connection', (socket) => {
// //   logger.info(`New client connected: ${socket.id}`);

// //   // Join a meeting room
// //   socket.on('join-room', (roomId, userId) => {
// //     socket.join(roomId);
// //     socket.to(roomId).emit('user-connected', userId);
    
// //     socket.on('disconnect', () => {
// //       socket.to(roomId).emit('user-disconnected', userId);
// //     });
// //   });

// //   // WebRTC signaling
// //   socket.on('offer', (offer, targetUserId, roomId) => {
// //     socket.to(roomId).to(targetUserId).emit('offer', offer, socket.id);
// //   });

// //   socket.on('answer', (answer, targetUserId) => {
// //     socket.to(targetUserId).emit('answer', answer, socket.id);
// //   });

// //   socket.on('ice-candidate', (candidate, targetUserId, roomId) => {
// //     socket.to(roomId).to(targetUserId).emit('ice-candidate', candidate, socket.id);
// //   });

// //   // Chat messages
// //   socket.on('send-message', (message, roomId) => {
// //     io.to(roomId).emit('receive-message', message);
// //   });

// //   // Error handling
// //   socket.on('error', (err) => {
// //     logger.error('Socket error:', err);
// //   });
// // });




// // Middleware
// app.use(cookieParser());
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Request logging
// app.use((req, res, next) => {
//   logger.info(`${req.method} ${req.path}`);
//   next();
// });

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/meetings', require('./routes/meetings'));
// app.use('/api/users', require('./routes/users'));

// // Error handling middleware (should be last)
// // app.use(errorHandler);

// // Start server
// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await connectDB();
//     server.listen(PORT, () => {
//       logger.info(`Server running on port ${PORT}`);
//       logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
//     });
//   } catch (err) {
//     logger.error('Server startup error:', err);
//     process.exit(1);
//   }
// };

// // Handle unhandled rejections
// process.on('unhandledRejection', (err) => {
//   logger.error('Unhandled Rejection:', err);
//   server.close(() => process.exit(1));
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (err) => {
//   logger.error('Uncaught Exception:', err);
//   server.close(() => process.exit(1));
// });

// // Graceful shutdown
// process.on('SIGTERM', () => {
//   logger.info('SIGTERM received. Shutting down gracefully...');
//   server.close(() => {
//     mongoose.connection.close(false, () => {
//       logger.info('MongoDB connection closed');
//       process.exit(0);
//     });
//   });
// });

// startServer();