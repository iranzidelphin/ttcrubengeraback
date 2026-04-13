import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    targetRoles: {
      type: [String],
      enum: ['student', 'teacher', 'parent', 'admin'],
      default: [],
    },
    visibleToGuests: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdByRole: {
      type: String,
      enum: ['teacher', 'admin'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Announcement = mongoose.model('Announcement', announcementSchema);
