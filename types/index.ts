export interface Post {
  id: string;
  author: string; // Wallet public key
  content: string;
  imagePrice?: number; // Price in USDC (e.g., 1.5)
  createdAt: number; // Unix timestamp
  likes: number;
  comments: number;
  reposts: number;
  pinned?: boolean; // Whether this post is pinned by the author
}

export interface Unlock {
  id: string;
  postId: string;
  wallet: string; // Wallet that unlocked
  txSignature: string; // Solana transaction signature
  amount: number; // Amount paid in USDC
  createdAt: number;
}

export interface Profile {
  wallet: string; // Wallet public key = user ID
  username?: string;
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  verified?: boolean;
  followers: number;
  following: number;
  posts: number;
  earnings: number; // Total USDC earned
  createdAt: number;
  updatedAt: number;
}

export interface Follow {
  id: string;
  follower: string; // Wallet that is following
  following: string; // Wallet being followed
  createdAt: number;
}

export interface Like {
  id: string;
  postId: string;
  wallet: string; // Wallet that liked
  createdAt: number;
}

export interface Comment {
  id: string;
  postId: string;
  author: string; // Wallet that commented
  content: string;
  createdAt: number;
  likes: number;
  parentCommentId?: string; // For nested replies
  replyCount?: number; // Number of replies to this comment
}

export interface Repost {
  id: string;
  originalPostId: string;
  author: string; // Wallet that reposted
  content?: string; // Optional quote text
  createdAt: number;
}

export interface SubscriptionTier {
  id: string;
  creator: string; // Creator wallet
  name: string;
  description?: string;
  price: number; // USDC per month
  benefits?: string[]; // Array of benefit descriptions
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Subscription {
  id: string;
  subscriber: string; // Subscriber wallet
  creator: string; // Creator wallet
  tierId: string;
  startDate: number;
  endDate: number; // When subscription expires
  isActive: boolean;
  autoRenew: boolean;
  lastPaymentDate: number;
  totalPaid: number; // Total USDC paid
  createdAt: number;
}

export interface Notification {
  id: string;
  recipient: string; // Wallet that receives the notification
  sender: string; // Wallet that triggered the notification
  type: 'like' | 'comment' | 'follow' | 'unlock' | 'subscription' | 'repost';
  postId?: string; // Related post ID (for likes, comments, reposts)
  commentId?: string; // Related comment ID (for comment replies)
  amount?: number; // Amount involved (for unlocks, subscriptions)
  message: string; // Human-readable message
  isRead: boolean;
  createdAt: number;
}

export interface Report {
  id: string;
  reporter: string; // Wallet that reported
  reportedUser: string; // Wallet being reported
  postId?: string; // Post being reported
  commentId?: string; // Comment being reported
  reason: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other';
  description?: string; // Additional details
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
}

