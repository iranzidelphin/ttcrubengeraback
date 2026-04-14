import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  subscribeToPush,
  unsubscribeFromPush,
  getVapidPublicKey,
} from '../controllers/pushController.js';

const router = express.Router();

router.post('/subscribe', verifyToken, async (req, res) => {
  try {
    await subscribeToPush(req, res);
  } catch (err) {
    res.status(500).json({ error: 'Push not available' });
  }
});

router.post('/unsubscribe', verifyToken, async (req, res) => {
  try {
    await unsubscribeFromPush(req, res);
  } catch (err) {
    res.status(500).json({ error: 'Push not available' });
  }
});

router.get('/vapid-public-key', getVapidPublicKey);

export default router;