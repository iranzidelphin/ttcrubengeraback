import { Router } from 'express';
import {
  createGalleryPhoto,
  deleteGalleryPhoto,
  listGalleryPhotos,
} from '../controllers/galleryController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { uploadGalleryPhoto } from '../middleware/galleryUploadMiddleware.js';

const router = Router();

router.get('/', listGalleryPhotos);
router.post(
  '/',
  protect,
  authorizeRoles('admin'),
  uploadGalleryPhoto.single('image'),
  createGalleryPhoto
);
router.delete('/:photoId', protect, authorizeRoles('admin'), deleteGalleryPhoto);

export default router;
