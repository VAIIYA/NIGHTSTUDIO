import { z } from 'zod';

// Zod schemas for validation
export const CreatePostSchema = z.object({
    author: z.string().min(1, "Author is required"),
    content: z.string().min(1, "Content is required").max(5000, "Content too long"),
    imagePrice: z.number().min(0).optional(),
});

export const CreateCommentSchema = z.object({
    postId: z.string().min(1, "Post ID is required"),
    author: z.string().min(1, "Author is required"),
    content: z.string().min(1, "Content is required").max(1000, "Comment too long"),
});

export const CreateLikeSchema = z.object({
    postId: z.string().min(1, "Post ID is required"),
    wallet: z.string().min(1, "Wallet is required"),
});

export const CreateFollowSchema = z.object({
    follower: z.string().min(1, "Follower is required"),
    following: z.string().min(1, "Following is required"),
});

export const CreateSubscriptionSchema = z.object({
    subscriber: z.string().min(1, "Subscriber is required"),
    creator: z.string().min(1, "Creator is required"),
    tierId: z.string().min(1, "Tier ID is required"),
});

export const CreateReportSchema = z.object({
    reporter: z.string().min(1, "Reporter is required"),
    reportedUser: z.string().min(1, "Reported user is required"),
    reason: z.enum(['spam', 'harassment', 'inappropriate', 'copyright', 'other']),
    postId: z.string().optional(),
    commentId: z.string().optional(),
    description: z.string().optional(),
});

export const CreateUnlockSchema = z.object({
    postId: z.string().min(1, "Post ID is required"),
    wallet: z.string().min(1, "Wallet is required"),
    txSignature: z.string().min(1, "Transaction signature is required"),
    amount: z.number().min(0, "Amount must be positive"),
});

export const CreateNotificationSchema = z.object({
    recipient: z.string().min(1, "Recipient is required"),
    sender: z.string().min(1, "Sender is required"),
    type: z.enum(['like', 'comment', 'follow', 'unlock', 'subscription', 'repost']),
    message: z.string().min(1, "Message is required"),
    postId: z.string().optional(),
    commentId: z.string().optional(),
    amount: z.number().optional(),
});

export const UpdateProfileSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username too long").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores").optional(),
    displayName: z.string().min(1, "Display name is required").max(50, "Display name too long").optional(),
    bio: z.string().max(160, "Bio too long").optional(),
    avatar: z.string().url().optional(),
    banner: z.string().url().optional(),
});

export const CreateProfileSchema = z.object({
    wallet: z.string().min(1, "Wallet is required"),
});

export const CreateSubscriptionTierSchema = z.object({
    creator: z.string().min(1, "Creator is required"),
    name: z.string().min(1, "Name is required").max(50, "Name too long"),
    description: z.string().max(500, "Description too long").optional(),
    price: z.number().min(0, "Price must be positive"),
    benefits: z.array(z.string()).optional(),
});

// Validation function
export function validateData<T>(schema: z.ZodSchema<T>, data: any): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
        }
        throw error;
    }
}

// Sanitization function
export function sanitizeString(str: string): string {
    if (!str) return '';
    // Basic HTML sanitization - remove script tags, etc.
    return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
}
