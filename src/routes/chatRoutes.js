import { Router } from 'express';
import {
  listAdminConversations,
  listMessagesWithAdmin,
  sendMessage,
} from '../controllers/chatController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.get('/admin/:audience', authorizeRoles('admin'), listAdminConversations);
router.get('/with-admin', authorizeRoles('teacher', 'parent'), listMessagesWithAdmin);
router.post('/messages', authorizeRoles('admin', 'teacher', 'parent'), sendMessage);

export default router;
