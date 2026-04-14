import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  subscription: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

pushSubscriptionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('PushSubscription', pushSubscriptionSchema);