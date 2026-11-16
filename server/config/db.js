import mongoose from 'mongoose';

// Cache the connection across serverless invocations (Vercel reuses warm instances).
const cached = globalThis._greencartMongo || (globalThis._greencartMongo = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || 'greencart',
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
