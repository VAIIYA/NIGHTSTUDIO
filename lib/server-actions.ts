"use server";

import { Unlock, Post } from "@/types";
import { getDatabase } from "./mongodb";

const POSTS_COLLECTION = "posts";
const UNLOCKS_COLLECTION = "unlocks";

/**
 * Create a new post
 */
export async function createPost(data: {
  author: string;
  content: string;
  imageBlurred?: string;
  imageOriginal?: string;
  imagePrice?: number;
}): Promise<Post> {
  const db = await getDatabase();
  const postsCollection = db.collection<Post>(POSTS_COLLECTION);

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

  await postsCollection.insertOne(post);
  return post;
}

/**
 * Get posts with pagination
 */
export async function getPosts(limit: number = 20, offset: number = 0): Promise<Post[]> {
  const db = await getDatabase();
  const postsCollection = db.collection<Post>(POSTS_COLLECTION);

  const posts = await postsCollection
    .find({})
    .sort({ createdAt: -1 }) // Newest first
    .skip(offset)
    .limit(limit)
    .toArray();

  return posts;
}

/**
 * Get a single post by ID
 */
export async function getPost(id: string): Promise<Post | null> {
  const db = await getDatabase();
  const postsCollection = db.collection<Post>(POSTS_COLLECTION);

  const post = await postsCollection.findOne({ id });
  return post || null;
}

/**
 * Get posts by author (wallet address)
 */
export async function getPostsByAuthor(author: string, limit: number = 100, offset: number = 0): Promise<Post[]> {
  const db = await getDatabase();
  const postsCollection = db.collection<Post>(POSTS_COLLECTION);

  const posts = await postsCollection
    .find({ author })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  return posts;
}

/**
 * Record an unlock transaction
 */
export async function recordUnlock(data: {
  postId: string;
  wallet: string;
  txSignature: string;
  amount: number;
}): Promise<Unlock> {
  const db = await getDatabase();
  const unlocksCollection = db.collection<Unlock>(UNLOCKS_COLLECTION);

  const unlock: Unlock = {
    id: `unlock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    postId: data.postId,
    wallet: data.wallet,
    txSignature: data.txSignature,
    amount: data.amount,
    createdAt: Date.now(),
  };

  await unlocksCollection.insertOne(unlock);
  return unlock;
}

/**
 * Check if a wallet has unlocked a specific post
 */
export async function hasUnlocked(postId: string, wallet: string): Promise<boolean> {
  const db = await getDatabase();
  const unlocksCollection = db.collection<Unlock>(UNLOCKS_COLLECTION);

  const unlock = await unlocksCollection.findOne({
    postId,
    wallet,
  });

  return !!unlock;
}

/**
 * Get all unlocks for a specific post
 */
export async function getUnlocksForPost(postId: string): Promise<Unlock[]> {
  const db = await getDatabase();
  const unlocksCollection = db.collection<Unlock>(UNLOCKS_COLLECTION);

  const unlocks = await unlocksCollection
    .find({ postId })
    .sort({ createdAt: -1 })
    .toArray();

  return unlocks;
}

/**
 * Update post engagement metrics (likes, comments, reposts)
 */
export async function updatePostEngagement(
  postId: string,
  updates: {
    likes?: number;
    comments?: number;
    reposts?: number;
  }
): Promise<void> {
  const db = await getDatabase();
  const postsCollection = db.collection<Post>(POSTS_COLLECTION);

  const updateFields: any = {};
  if (updates.likes !== undefined) updateFields.likes = updates.likes;
  if (updates.comments !== undefined) updateFields.comments = updates.comments;
  if (updates.reposts !== undefined) updateFields.reposts = updates.reposts;

  await postsCollection.updateOne(
    { id: postId },
    { $set: updateFields }
  );
}
