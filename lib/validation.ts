import { z } from 'zod';

// Post validation schemas
export const CreatePostSchema = z.object({
  author: z.string().min(32).max(44), // Solana wallet address length
  content: z.string().min(1).max(500).trim(),
  imageBlurred: z.string().url().optional(),
  imageOriginal: z.string().url().optional(),
  imagePrice: z.number().min(0).optional(),
});

export const UpdatePostSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1).max(500).trim().optional(),
  imagePrice: z.number().min(0).optional(),
});

// Profile validation schemas
export const CreateProfileSchema = z.object({
  wallet: z.string().min(32).max(44),
  displayName: z.string().min(1).max(50).trim().optional(),
  username: z.string().regex(/^[a-zA-Z0-9_]+$/).min(3).max(20).optional(),
  bio: z.string().max(160).trim().optional(),
  avatar: z.string().url().optional(),
  banner: z.string().url().optional(),
});

export const UpdateProfileSchema = z.object({
  wallet: z.string().min(32).max(44),
  displayName: z.string().min(1).max(50).trim().optional(),
  username: z.string().regex(/^[a-zA-Z0-9_]+$/).min(3).max(20).optional(),
  bio: z.string().max(160).trim().optional(),
  avatar: z.string().url().optional(),
  banner: z.string().url().optional(),
});

// Comment validation schemas
export const CreateCommentSchema = z.object({
  postId: z.string().min(1),
  author: z.string().min(32).max(44),
  content: z.string().min(1).max(280).trim(),
});

// Like validation schemas
export const CreateLikeSchema = z.object({
  postId: z.string().min(1),
  wallet: z.string().min(32).max(44),
});

// Follow validation schemas
export const CreateFollowSchema = z.object({
  follower: z.string().min(32).max(44),
  following: z.string().min(32).max(44),
});

// Subscription validation schemas
export const CreateSubscriptionSchema = z.object({
  subscriber: z.string().min(32).max(44),
  creator: z.string().min(32).max(44),
  tierId: z.string().min(1),
});

// Report validation schemas
export const CreateReportSchema = z.object({
  reporter: z.string().min(32).max(44),
  reportedUser: z.string().min(32).max(44),
  postId: z.string().optional(),
  commentId: z.string().optional(),
  reason: z.string().min(1).max(500).trim(),
  type: z.enum(['harassment', 'spam', 'inappropriate', 'copyright', 'other']),
});

// Unlock validation schemas
export const CreateUnlockSchema = z.object({
  postId: z.string().min(1),
  wallet: z.string().min(32).max(44),
  txSignature: z.string().min(64).max(88), // Solana signature length
  amount: z.number().positive(),
});

// Notification validation schemas
export const CreateNotificationSchema = z.object({
  recipient: z.string().min(32).max(44),
  sender: z.string().min(32).max(44),
  type: z.enum(['like', 'comment', 'follow', 'unlock', 'subscription', 'repost']),
  postId: z.string().optional(),
  commentId: z.string().optional(),
  amount: z.number().positive().optional(),
  message: z.string().min(1).max(200).trim(),
});

// Search validation schemas
export const SearchProfilesSchema = z.object({
  query: z.string().min(1).max(100).trim(),
  limit: z.number().min(1).max(50).default(20),
});

export const SearchPostsSchema = z.object({
  query: z.string().min(1).max(100).trim(),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
});

// Subscription tier validation schemas
export const CreateSubscriptionTierSchema = z.object({
  creator: z.string().min(32).max(44),
  name: z.string().min(1).max(50).trim(),
  description: z.string().max(500).trim(),
  price: z.number().positive(),
  benefits: z.array(z.string().max(100)).max(10),
});

// Utility function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    throw new Error('Validation failed: Unknown error');
  }
}

// Sanitize string inputs
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 1000); // Limit length
}