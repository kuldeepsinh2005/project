const { Server } = require('socket.io');
const Meeting = require('./models/Meeting');

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*', // Change to your frontend origin in production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join meeting room
    socket.on('join-meeting', async ({ meetingId, userId, username }) => {
      try {
        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting) {
          socket.emit('error-message', 'Meeting not found');
          return;
        }

        socket.join(meetingId);
        socket.meetingId = meetingId;
        socket.userId = userId;
        socket.username = username;

        // Notify others
        socket.to(meetingId).emit('user-joined', {
          userId,
          username
        });

        console.log(`📢 ${username} joined meeting ${meetingId}`);
      } catch (err) {
        console.error(err);
        socket.emit('error-message', 'Could not join meeting');
      }
    });

    // Handle WebRTC signaling
    socket.on('signal', ({ to, data }) => {
      io.to(to).emit('signal', {
        from: socket.id,
        data
      });
    });

    // Leave meeting
    socket.on('leave-meeting', () => {
      if (socket.meetingId) {
        socket.leave(socket.meetingId);
        socket.to(socket.meetingId).emit('user-left', {
          userId: socket.userId,
          username: socket.username
        });
        console.log(`🚪 ${socket.username} left meeting ${socket.meetingId}`);
      }
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      if (socket.meetingId) {
        socket.to(socket.meetingId).emit('user-left', {
          userId: socket.userId,
          username: socket.username
        });
        console.log(`❌ ${socket.username || 'Unknown'} disconnected`);
      }
    });
  });

  return io;
}

module.exports = initSocket;
