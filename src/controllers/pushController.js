import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'lG4VoumcFCaqxgXYkNRmdL1qpzJMu1n5YpxfrjQ2wfY';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BPq8swMerApXkBIkCaiugqctrT4zoP5KhxWyca5k9WuYMs49k75obEcSsPUdKqjdygcjIyWTKPjQdv6dBoXMAds';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@ttcrubengera.edu.rw';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export async function subscribeToPush(req, res) {
  try {
    const { subscription, userId } = req.body;
    
    if (!subscription || !userId) {
      return res.status(400).json({ error: 'Missing subscription or userId' });
    }
    
    let sub = await PushSubscription.findOne({ userId });
    
    if (sub) {
      sub.subscription = subscription;
      sub.updatedAt = new Date();
      await sub.save();
    } else {
      sub = new PushSubscription({ userId, subscription });
      await sub.save();
    }
    
    res.json({ success: true, message: 'Subscription saved' });
  } catch (error) {
    console.error('Push subscription error:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
}

export async function unsubscribeFromPush(req, res) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    
    await PushSubscription.findOneAndDelete({ userId });
    
    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Push unsubscription error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
}

export async function sendNotificationToUser(userId, title, body, data = {}) {
  try {
    const sub = await PushSubscription.findOne({ userId });
    
    if (!sub) {
      console.log(`No push subscription for user: ${userId}`);
      return false;
    }
    
    const payload = JSON.stringify({
      title,
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data,
      tag: `ttc-${userId}`,
    });
    
    await webpush.sendNotification(sub.subscription, payload);
    
    console.log(`Notification sent to user: ${userId}`);
    return true;
  } catch (error) {
    if (error.statusCode === 410) {
      console.log(`Push subscription expired for user: ${userId}`);
      await PushSubscription.findOneAndDelete({ userId });
    } else {
      console.error(`Push notification error for ${userId}:`, error.message);
    }
    return false;
  }
}

export async function sendNotificationToRole(role, title, body, data = {}) {
  try {
    const User = (await import('../models/User.js')).default;
    const users = await User.find({ role });
    
    const results = await Promise.all(
      users.map((user) => sendNotificationToUser(user.id, title, body, data))
    );
    
    return results.filter(Boolean).length;
  } catch (error) {
    console.error('Send to role error:', error);
    return 0;
  }
}

export async function sendNotificationToAll(title, body, data = {}) {
  try {
    const User = (await import('../models/User.js')).default;
    const users = await User.find({});
    
    const results = await Promise.all(
      users.map((user) => sendNotificationToUser(user.id, title, body, data))
    );
    
    return results.filter(Boolean).length;
  } catch (error) {
    console.error('Send to all error:', error);
    return 0;
  }
}

export function getVapidPublicKey(req, res) {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
}