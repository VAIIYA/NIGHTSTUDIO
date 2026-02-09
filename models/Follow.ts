import { Schema, model, Document } from 'mongoose'

export interface IFollow extends Document {
  follower: string // wallet address of the follower
  following: string // wallet address of the person being followed
  createdAt: Date
}

const FollowSchema = new Schema<IFollow>({
  follower: { type: String, required: true },
  following: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

// Ensure a user can't follow the same person twice
FollowSchema.index({ follower: 1, following: 1 }, { unique: true })

// Indexes for efficient queries
FollowSchema.index({ follower: 1 })
FollowSchema.index({ following: 1 })

export default model<IFollow>('Follow', FollowSchema)