import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    sdmsCode: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    lastLevelMark: { type: Number, required: true },
    tradeOrSection: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    gender: { type: String, required: true, trim: true },
    level: { type: String, required: true, trim: true },
    fatherName: { type: String, default: '', trim: true },
    motherName: { type: String, default: '', trim: true },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    studentEmail: { type: String, required: true, lowercase: true, trim: true },
    reasonToApply: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['submitted', 'additional-info-requested', 'additional-info-received', 'accepted', 'rejected'],
      default: 'submitted',
    },
    adminNotes: { type: String, default: '', trim: true },
    additionalFormToken: { type: String, default: '', index: true },
    additionalFormRequestedAt: { type: Date, default: null },
    additionalFormSubmittedAt: { type: Date, default: null },
    schoolFeesDetails: { type: String, default: '', trim: true },
    additionalInformation: { type: String, default: '', trim: true },
    schoolFeesApprovalFileName: { type: String, default: '' },
    schoolFeesApprovalFileUrl: { type: String, default: '' },
    emailLogs: [
      {
        subject: String,
        text: String,
        kind: String,
        sentAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Application = mongoose.model('Application', applicationSchema);
