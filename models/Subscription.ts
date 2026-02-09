import { Schema, model, Document } from 'mongoose'

export interface ISubscription extends Document {
  subscriber: string // wallet address of the subscriber
  creator: string // wallet address of the creator
  tierId: string // reference to SubscriptionTier
  startDate: Date
  endDate: Date
  isActive: boolean
  autoRenew: boolean
  lastPaymentDate: Date
  totalPaid: number // total amount paid in USDC
  createdAt: Date
}

const SubscriptionSchema = new Schema<ISubscription>({
  subscriber: { type: String, required: true },
  creator: { type: String, required: true },
  tierId: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  autoRenew: { type: Boolean, default: true },
  lastPaymentDate: { type: Date, default: Date.now },
  totalPaid: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
})

// Indexes for efficient queries
SubscriptionSchema.index({ subscriber: 1, creator: 1, isActive: 1 })
SubscriptionSchema.index({ subscriber: 1, isActive: 1 })
SubscriptionSchema.index({ creator: 1, isActive: 1 })
SubscriptionSchema.index({ endDate: 1 })

export default model<ISubscription>('Subscription', SubscriptionSchema)