import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from './models/User.js';
import { extractBearerToken } from './middleware/authMiddleware.js';

export function createSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    },
  });

  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token
        ? `Bearer ${socket.handshake.auth.token}`
        : socket.handshake.headers.authorization || '';

      const token = extractBearerToken(authHeader);

      if (!token) {
        return next(new Error('Authentication token is required.'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return next(new Error('User not found.'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid socket token.'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`);
    socket.join(`role:${socket.user.role}`);
  });

  return io;
}
