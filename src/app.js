import express from 'express';
import path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import userRoutes from './routes/userRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import { protect } from './middleware/authMiddleware.js';
import { createCorsOriginHandler } from './utils/allowedOrigins.js';

const app = express();

app.use(
  cors({
    origin: createCorsOriginHandler(),
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use('/uploads', express.static(path.resolve('uploads')));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TTC Rubengera backend is live.',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running.',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gallery', galleryRoutes);

app.get('/api/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

export default app;
