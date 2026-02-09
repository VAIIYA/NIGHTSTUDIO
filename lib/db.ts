import mongoose from 'mongoose'

let isConnected = false

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Vercel-Admin-nightstudio-mongodb:kdm7hT26Erk2GTMt@nightstudio-mongodb.en7bw71.mongodb.net/?retryWrites=true&w=majority'

export async function connectDb() {
  if (isConnected) return

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set')
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any)
    isConnected = true
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}
