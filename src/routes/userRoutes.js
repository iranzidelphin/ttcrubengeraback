import { Router } from 'express';
import { listUsers } from '../controllers/userController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect, authorizeRoles('admin'));
router.get('/', listUsers);

export default router;
