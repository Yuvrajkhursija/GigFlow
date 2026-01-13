import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const initializeSocket = (io) => {
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth.token;
      
      // If no token in auth, try to get from cookies
      if (!token && socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie.split(';');
        const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
        if (tokenCookie) {
          token = tokenCookie.split('=')[1];
        }
      }

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room for notifications
    socket.join(socket.userId);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  // Make io available to routes
  io.toRoute = (userId) => {
    return io.to(userId.toString());
  };
};
