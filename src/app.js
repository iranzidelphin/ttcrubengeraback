import express from 'express';
import path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { protect } from './middleware/authMiddleware.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  })
);
app.use(helmet());
app.use(express.json());
app.use('/uploads', express.static(path.resolve('uploads')));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running.',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.get('/api/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found.',
  });
});

export default app;
