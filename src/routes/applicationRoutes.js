import { Router } from 'express';
import {
  createApplication,
  getAdditionalApplication,
  getApplication,
  listApplications,
  sendApplicationResponse,
  submitAdditionalApplication,
} from '../controllers/applicationController.js';
import { uploadApplicationFile } from '../middleware/applicationUploadMiddleware.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', createApplication);
router.get('/additional/:token', getAdditionalApplication);
router.post('/additional/:token', uploadApplicationFile.single('schoolFeesApprovalFile'), submitAdditionalApplication);

router.use(protect, authorizeRoles('admin'));
router.get('/', listApplications);
router.get('/:applicationId', getApplication);
router.post('/:applicationId/email', sendApplicationResponse);

export default router;
