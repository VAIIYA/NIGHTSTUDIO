import mongoose from 'mongoose'

let isConnected = false

export async function connectDb() {
  console.warn('MongoDB is deprecated. Please use Turso (lib/turso.ts) instead.')
  // Preventing actual connection to allow phased migration if needed, 
  // or you can leave it if some parts still strictly depend on it during dev.
  // For now, checking if we can completely disable it.
  if (true) return;

  if (isConnected) return

  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) return

  try {
    await mongoose.connect(MONGODB_URI)
    isConnected = true
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
  }
}
