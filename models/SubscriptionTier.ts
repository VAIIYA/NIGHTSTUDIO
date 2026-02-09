import { Schema, model, Document } from 'mongoose'

export interface ISubscriptionTier extends Document {
  creator: string // wallet address of the creator
  name: string
  description?: string
  price: number // price in USDC
  benefits?: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const SubscriptionTierSchema = new Schema<ISubscriptionTier>({
  creator: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  benefits: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Indexes for efficient queries
SubscriptionTierSchema.index({ creator: 1, isActive: 1 })
SubscriptionTierSchema.index({ creator: 1 })

export default model<ISubscriptionTier>('SubscriptionTier', SubscriptionTierSchema)