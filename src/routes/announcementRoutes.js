import { Router } from 'express';
import { createAnnouncement, listAnnouncements } from '../controllers/announcementController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', listAnnouncements);
router.post('/', protect, authorizeRoles('admin', 'teacher'), createAnnouncement);

export default router;
