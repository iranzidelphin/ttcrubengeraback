import { Announcement } from '../models/Announcement.js';
import { serializeAnnouncement } from '../utils/serializers.js';
import { getAnnouncementQueryForUser } from '../utils/announcementAccess.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';

const allRoles = ['student', 'teacher', 'parent', 'admin'];

function normalizeTargetRoles(targetRoles = []) {
  const cleaned = targetRoles.filter((role) => allRoles.includes(role));
  return [...new Set(cleaned)];
}

export async function listAnnouncements(req, res) {
  const user = req.user || null;
  const announcements = await Announcement.find(getAnnouncementQueryForUser(user))
    .populate('createdBy', 'firstName lastName email role')
    .sort({ date: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    announcements: announcements.map(serializeAnnouncement),
  });
}

export async function createAnnouncement(req, res) {
  try {
    const { title, message, date, targetRoles = [], visibleToGuests = false } = req.body;

    if (!title || !message || !date) {
      return res.status(400).json({
        success: false,
        error: 'Title, message, and date are required.',
      });
    }

    const normalizedRoles = normalizeTargetRoles(targetRoles);

    if (req.user.role !== 'admin' && visibleToGuests) {
      return res.status(403).json({
        success: false,
        error: 'Only admin can publish announcements for unlogged users.',
      });
    }

    if (req.user.role !== 'admin' && normalizedRoles.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Only admin can send announcements to admin users.',
      });
    }

    if (req.user.role !== 'admin' && normalizedRoles.length === allRoles.length) {
      return res.status(403).json({
        success: false,
        error: 'Only admin can send announcements to all roles.',
      });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      date,
      targetRoles: normalizedRoles.length ? normalizedRoles : [req.user.role],
      visibleToGuests: Boolean(visibleToGuests),
      createdBy: req.user._id,
      createdByRole: req.user.role,
    });

    const populated = await Announcement.findById(announcement._id).populate(
      'createdBy',
      'firstName lastName email role'
    );

    const payload = serializeAnnouncement(populated);
    req.app.get('io').emit(SOCKET_EVENTS.ANNOUNCEMENT_CREATED, payload);

    res.status(201).json({
      success: true,
      announcement: payload,
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      error: 'Could not create announcement.',
    });
  }
}
