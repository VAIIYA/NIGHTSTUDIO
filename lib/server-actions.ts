"use server";

import { Unlock, Post } from "@/types";

// In production, replace these with actual database calls
// For MVP, you can use Upstash Redis, Vercel Postgres, or similar

let mockPosts: Post[] = [];
let mockUnlocks: Unlock[] = [];

export async function createPost(data: {
  author: string;
  content: string;
  imageBlurred?: string;
  imageOriginal?: string;
  imagePrice?: number;
}): Promise<Post> {
  const post: Post = {
    id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    author: data.author,
    content: data.content,
    imageBlurred: data.imageBlurred,
    imageOriginal: data.imageOriginal,
    imagePrice: data.imagePrice,
    createdAt: Date.now(),
    likes: 0,
    comments: 0,
    reposts: 0,
  };

  mockPosts.unshift(post);
  return post;
}

export async function getPosts(limit: number = 20, offset: number = 0): Promise<Post[]> {
  // In production, fetch from database
  return mockPosts.slice(offset, offset + limit);
}

export async function getPost(id: string): Promise<Post | null> {
  return mockPosts.find((p) => p.id === id) || null;
}

export async function recordUnlock(data: {
  postId: string;
  wallet: string;
  txSignature: string;
  amount: number;
}): Promise<Unlock> {
  const unlock: Unlock = {
    id: `unlock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    postId: data.postId,
    wallet: data.wallet,
    txSignature: data.txSignature,
    amount: data.amount,
    createdAt: Date.now(),
  };

  mockUnlocks.push(unlock);
  return unlock;
}

export async function hasUnlocked(postId: string, wallet: string): Promise<boolean> {
  return mockUnlocks.some(
    (u) => u.postId === postId && u.wallet === wallet
  );
}

export async function getUnlocksForPost(postId: string): Promise<Unlock[]> {
  return mockUnlocks.filter((u) => u.postId === postId);
}

