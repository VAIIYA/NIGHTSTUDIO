import { Schema, model, Document } from 'mongoose'

export interface IPost extends Document {
  creatorId: string
  content: string
  storachaCID: string
  blurCID: string
  priceUSDC: number
  createdAt: Date
  unlockedUsers: string[]
  hashtags: string[]
  engagementScore: number
}

const PostSchema = new Schema<IPost>({
  creatorId: { type: String, required: true, ref: 'Creator' },
  content: { type: String, default: '' },
  storachaCID: { type: String, default: '' },
  blurCID: { type: String, default: '' },
  priceUSDC: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  unlockedUsers: { type: [String], default: [] },
  hashtags: { type: [String], default: [] },
  engagementScore: { type: Number, default: 0 },
})

PostSchema.index({ creatorId: 1 })
PostSchema.index({ createdAt: -1 })
PostSchema.index({ hashtags: 1 })
PostSchema.index({ engagementScore: -1 })

export default model<IPost>('Post', PostSchema)
