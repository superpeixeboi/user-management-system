import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/user-management';

  await mongoose.connect(uri);
  isConnected = true;

  return mongoose;
}

export default mongoose;
