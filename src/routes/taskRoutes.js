import { Router } from 'express';
import {
  addTaskComment,
  createTask,
  listAdminCommentFeed,
  listTaskComments,
  listTasks,
} from '../controllers/taskController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { uploadTaskFile } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(protect);
router.get('/comments/feed', authorizeRoles('admin'), listAdminCommentFeed);
router.get('/', authorizeRoles('teacher', 'student'), listTasks);
router.post('/', authorizeRoles('teacher'), uploadTaskFile.single('file'), createTask);
router.get('/:taskId/comments', authorizeRoles('teacher', 'student'), listTaskComments);
router.post('/:taskId/comments', authorizeRoles('teacher', 'student'), addTaskComment);

export default router;
