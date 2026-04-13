import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

export const SYSTEM_ADMIN_USERNAME = 'ttcradmin';
export const SYSTEM_ADMIN_PASSWORD = 'ttcr123admin';
export const SYSTEM_ADMIN_EMAIL = 'ttcradmin@ttcrubengera.local';

export async function ensureSystemAdmin() {
  const hashedPassword = await bcrypt.hash(SYSTEM_ADMIN_PASSWORD, 10);

  const existingAdmin = await User.findOne({
    $or: [{ username: SYSTEM_ADMIN_USERNAME }, { email: SYSTEM_ADMIN_EMAIL }],
  });

  if (!existingAdmin) {
    await User.create({
      username: SYSTEM_ADMIN_USERNAME,
      firstName: 'TTC',
      lastName: 'Admin',
      email: SYSTEM_ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    });
    return;
  }

  existingAdmin.username = SYSTEM_ADMIN_USERNAME;
  existingAdmin.firstName = 'TTC';
  existingAdmin.lastName = 'Admin';
  existingAdmin.email = SYSTEM_ADMIN_EMAIL;
  existingAdmin.password = hashedPassword;
  existingAdmin.role = 'admin';
  await existingAdmin.save();
}

export async function ensureUsernames() {
  const users = await User.find().select('_id username email');

  for (const user of users) {
    if (user.username?.trim()) {
      continue;
    }

    const baseUsername = (user.email?.split('@')[0] || `user${user._id.toString().slice(-6)}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');

    let candidate = baseUsername || `user${user._id.toString().slice(-6)}`;
    let suffix = 1;

    while (await User.exists({ _id: { $ne: user._id }, username: candidate })) {
      candidate = `${baseUsername}${suffix}`;
      suffix += 1;
    }

    user.username = candidate;
    await user.save();
  }
}

export function isSystemAdminAccount(user) {
  if (!user) {
    return false;
  }

  return (
    user.username === SYSTEM_ADMIN_USERNAME ||
    user.email === SYSTEM_ADMIN_EMAIL
  );
}
