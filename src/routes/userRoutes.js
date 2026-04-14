import { Router } from 'express';
import { listUsers, deleteUser } from '../controllers/userController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect, authorizeRoles('admin'));
router.get('/', listUsers);
router.delete('/:userId', deleteUser);

export default router;
