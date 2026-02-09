// Core types for NIGHTSTUDIO
export interface Post {
    id: string;
    author: string;
    content?: string;
    imageUrl?: string;
    blurImageUrl?: string;
    imagePrice?: number;
    hashtags?: string[];
    createdAt: number;
    likes: number;
    comments: number;
    reposts: number;
    engagementScore?: number;
    pinned?: boolean;
}

export interface Comment {
    id: string;
    postId: string;
    author: string;
    content: string;
    createdAt: number;
    likes: number;
    parentCommentId?: string;
    replyCount?: number;
}

export interface Like {
    id: string;
    postId: string;
    wallet: string;
    createdAt: number;
}

export interface Follow {
    id: string;
    follower: string;
    following: string;
    createdAt: number;
}

export interface Unlock {
    id: string;
    postId: string;
    wallet: string;
    txSignature: string;
    amount: number;
    createdAt: number;
}

export interface Notification {
    id: string;
    recipient: string;
    sender: string;
    type: 'like' | 'comment' | 'follow' | 'unlock' | 'subscription' | 'repost';
    postId?: string;
    commentId?: string;
    amount?: number;
    message: string;
    isRead: boolean;
    createdAt: number;
}

export interface SubscriptionTier {
    id: string;
    creator: string;
    name: string;
    description?: string;
    price: number;
    benefits?: string[];
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface Subscription {
    id: string;
    subscriber: string;
    creator: string;
    tierId: string;
    startDate: number;
    endDate: number;
    isActive: boolean;
    autoRenew: boolean;
    lastPaymentDate: number;
    totalPaid: number;
    createdAt: number;
}

export interface Report {
    id: string;
    reporter: string;
    reportedUser: string;
    postId?: string;
    commentId?: string;
    reason: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other';
    description?: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    createdAt: number;
    reviewedAt?: number;
    reviewedBy?: string;
}

export interface Profile {
    wallet: string;
    username?: string;
    displayName?: string;
    bio?: string;
    avatar?: string;
    banner?: string;
    followers: number;
    following: number;
    posts: number;
    earnings: number;
    createdAt: number;
    updatedAt: number;
}

export interface Repost {
    id: string;
    originalPostId: string;
    author: string;
    content?: string;
    createdAt: number;
}

export type FeedSort = 'newest' | 'trending' | 'engagement' | 'following';
export type FeedFilter = 'all' | 'following' | 'premium' | string; // string for hashtag