import mongoose from 'mongoose';

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing. Add it to backend/.env');
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    if (mongoUri.startsWith('mongodb+srv://')) {
      error.message = `${error.message}. SRV DNS lookup failed. Try using the standard mongodb:// URI from Atlas instead of mongodb+srv://`;
    }

    throw error;
  }
}
