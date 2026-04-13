import { User } from '../models/User.js';
import { buildUserResponse } from '../utils/userResponse.js';

const allowedRoles = ['student', 'teacher', 'parent', 'admin'];

export async function listUsers(req, res) {
  const users = await User.find().select('-password').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    users: users.map(buildUserResponse),
  });
}

export async function updateUserRole(req, res) {
  const { role } = req.body;

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid role selected.',
    });
  }

  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found.',
    });
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    user: buildUserResponse(user),
  });
}
