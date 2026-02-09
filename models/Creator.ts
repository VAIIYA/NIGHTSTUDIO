import mongoose, { Schema, model, Document } from 'mongoose'

export interface ICreator extends Document {
  userId: string
  walletAddress: string
  username?: string
  bio?: string
  avatar?: string
  socialLinks?: {
    twitter?: string
    youtube?: string
    reddit?: string
    telegram?: string
    website?: string
  }
  location?: string
  hashtags?: string[]
  referredBy?: string // wallet address
  referralCode?: string
  createdAt: Date
}

const CreatorSchema = new Schema<ICreator>({
  userId: { type: String, required: true },
  walletAddress: { type: String, required: true },
  username: { type: String, sparse: true, unique: true },
  bio: { type: String },
  avatar: { type: String },
  socialLinks: {
    twitter: { type: String },
    youtube: { type: String },
    reddit: { type: String },
    telegram: { type: String },
    website: { type: String },
  },
  location: { type: String },
  hashtags: { type: [String], default: [] },
  referredBy: { type: String },
  referralCode: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
})

CreatorSchema.index({ walletAddress: 1 }, { unique: true })

// Prevent OverwriteModelError in dev mode
const CreatorModel = mongoose.models.Creator || model<ICreator>('Creator', CreatorSchema)
export default CreatorModel
