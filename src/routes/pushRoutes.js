import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  subscribeToPush,
  unsubscribeFromPush,
  getVapidPublicKey,
} from '../controllers/pushController.js';

const router = express.Router();

router.post('/subscribe', verifyToken, subscribeToPush);
router.post('/unsubscribe', verifyToken, unsubscribeFromPush);
router.get('/vapid-public-key', getVapidPublicKey);

export default router;