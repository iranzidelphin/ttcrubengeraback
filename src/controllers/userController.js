import { User } from '../models/User.js';
import { Announcement } from '../models/Announcement.js';
import { ChatMessage } from '../models/ChatMessage.js';
import PushSubscription from '../models/PushSubscription.js';
import { TaskComment } from '../models/TaskComment.js';
import { buildUserResponse } from '../utils/userResponse.js';
import { isSystemAdminAccount } from '../utils/adminAccount.js';
import { deleteTasksByTeacher } from '../utils/taskCleanup.js';

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

  if (isSystemAdminAccount(user)) {
    return res.status(403).json({
      success: false,
      error: 'The system admin account cannot be changed.',
    });
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    user: buildUserResponse(user),
  });
}

export async function deleteUser(req, res) {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found.',
    });
  }

  if (isSystemAdminAccount(user)) {
    return res.status(403).json({
      success: false,
      error: 'The system admin account cannot be deleted.',
    });
  }

  if (user._id.toString() === req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'You cannot delete your own account.',
    });
  }

  if (user.role === 'teacher') {
    await deleteTasksByTeacher(user._id);
  }

  await Promise.all([
    TaskComment.deleteMany({ author: user._id }),
    Announcement.deleteMany({ createdBy: user._id }),
    ChatMessage.deleteMany({
      $or: [{ sender: user._id }, { recipient: user._id }],
    }),
    PushSubscription.deleteOne({ userId: user._id.toString() }),
  ]);

  await user.deleteOne();

  res.status(200).json({
    success: true,
    userId: req.params.userId,
  });
}
