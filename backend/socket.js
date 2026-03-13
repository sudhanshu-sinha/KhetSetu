const { verifyAccessToken } = require('./utils/jwt');

/**
 * Initialize Socket.io with authentication and event handling
 */
function initializeSocket(io) {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return next(new Error('Invalid token'));
    }

    socket.userId = decoded.userId;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room for notifications
    socket.join(socket.userId);

    // Handle typing events
    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(chatId).emit('user-typing', {
        userId: socket.userId,
        isTyping
      });
    });

    // Join chat room
    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
    });

    // Leave chat room
    socket.on('leave-chat', (chatId) => {
      socket.leave(chatId);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
}

module.exports = initializeSocket;
