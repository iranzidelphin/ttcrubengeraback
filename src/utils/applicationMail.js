import crypto from 'node:crypto';
import { MailtrapClient } from 'mailtrap';

const MAILTRAP_TOKEN = process.env.MAILTRAP_TOKEN || '';
const MAILTRAP_SENDER_EMAIL = process.env.MAILTRAP_SENDER_EMAIL || 'hello@demomailtrap.co';
const MAILTRAP_SENDER_NAME = process.env.MAILTRAP_SENDER_NAME || 'TTC Rubengera';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const client = MAILTRAP_TOKEN ? new MailtrapClient({ token: MAILTRAP_TOKEN }) : null;

export function createAdditionalFormToken() {
  return crypto.randomBytes(24).toString('hex');
}

export function buildAdditionalFormLink(token) {
  return `${FRONTEND_URL.replace(/\/$/, '')}/apply/additional/${token}`;
}

export async function sendApplicationEmail({ to, subject, text }) {
  if (!client) {
    throw new Error('MAILTRAP_TOKEN is not configured.');
  }

  await client.send({
    from: {
      email: MAILTRAP_SENDER_EMAIL,
      name: MAILTRAP_SENDER_NAME,
    },
    to: [{ email: to }],
    subject,
    text,
    category: 'Student Application',
  });
}
