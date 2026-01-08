export interface Post {
  id: string;
  author: string; // Wallet public key
  content: string;
  imageBlurred?: string; // IPFS CID for blurred image
  imageOriginal?: string; // IPFS CID for original image
  imagePrice?: number; // Price in USDC (e.g., 1.5)
  createdAt: number; // Unix timestamp
  likes: number;
  comments: number;
  reposts: number;
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
  avatar?: string; // IPFS CID
  banner?: string; // IPFS CID
  followers: number;
  following: number;
  posts: number;
  createdAt: number;
}

