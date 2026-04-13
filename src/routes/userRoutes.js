import { Router } from 'express';
import { listUsers, updateUserRole } from '../controllers/userController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect, authorizeRoles('admin'));
router.get('/', listUsers);
router.patch('/:userId/role', updateUserRole);

export default router;
