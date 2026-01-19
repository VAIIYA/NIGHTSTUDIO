"use server";

import { Unlock, Post, Profile, Follow, Like, Comment, Repost, SubscriptionTier, Subscription, Notification, Report } from "@/types";
import { getDatabase } from "./mongodb";
import { validateData, sanitizeString, CreatePostSchema, CreateCommentSchema, CreateLikeSchema, CreateFollowSchema, CreateSubscriptionSchema, CreateReportSchema, CreateUnlockSchema, CreateNotificationSchema, UpdateProfileSchema, CreateProfileSchema, CreateSubscriptionTierSchema } from "./validation";
import { broadcastToUser, broadcastToRoom } from "./websocket";

const POSTS_COLLECTION = "posts";
const UNLOCKS_COLLECTION = "unlocks";
const PROFILES_COLLECTION = "profiles";
const FOLLOWS_COLLECTION = "follows";
const LIKES_COLLECTION = "likes";
const COMMENTS_COLLECTION = "comments";
const REPOSTS_COLLECTION = "reposts";
const SUBSCRIPTION_TIERS_COLLECTION = "subscription_tiers";
const SUBSCRIPTIONS_COLLECTION = "subscriptions";
const NOTIFICATIONS_COLLECTION = "notifications";
const REPORTS_COLLECTION = "reports";

/**
 * Create a new post
 */
export async function createPost(data: {
  author: string;
  content: string;
  imagePrice?: number;
}): Promise<Post> {
  // Validate and sanitize input
  const validatedData = validateData(CreatePostSchema, {
    ...data,
    content: sanitizeString(data.content),
  });

  const db = await getDatabase();
  const postsCollection = db.collection<Post>(POSTS_COLLECTION);

  const post: Post = {
    id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    author: validatedData.author,
    content: validatedData.content,
    imagePrice: validatedData.imagePrice,
    createdAt: Date.now(),
    likes: 0,
    comments: 0,
    reposts: 0,
  };

  await postsCollection.insertOne(post);

  // Update profile post count
  await updateProfileStats(validatedData.author, { posts: 1 });

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
    .sort({ pinned: -1, createdAt: -1 }) // Pinned posts first, then by creation date
    .skip(offset)
    .limit(limit)
    .toArray();

  return posts;
}

/**
 * Create an unlock record when a user purchases access to content
 */
export async function createUnlock(data: {
  postId: string;
  wallet: string;
  txSignature: string;
  amount: number;
}): Promise<Unlock> {
  // Validate input
  const validatedData = validateData(CreateUnlockSchema, data);

  const db = await getDatabase();
  const unlocksCollection = db.collection<Unlock>(UNLOCKS_COLLECTION);

  const unlock: Unlock = {
    id: `unlock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    postId: validatedData.postId,
    wallet: validatedData.wallet,
    txSignature: validatedData.txSignature,
    amount: validatedData.amount,
    createdAt: Date.now(),
  };

  await unlocksCollection.insertOne(unlock);

  // Get post author to create notification
  const post = await getPost(validatedData.postId);
  if (post && post.author !== validatedData.wallet) {
    await createNotification({
      recipient: post.author,
      sender: validatedData.wallet,
      type: 'unlock',
      postId: validatedData.postId,
      amount: validatedData.amount,
      message: `Someone unlocked your content for ${validatedData.amount} USDC`,
    });
  }

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

/**
 * Get or create a user profile
 */
export async function getOrCreateProfile(wallet: string): Promise<Profile> {
  const db = await getDatabase();
  const profilesCollection = db.collection<Profile>(PROFILES_COLLECTION);

  let profile = await profilesCollection.findOne({ wallet });

  if (!profile) {
    // Create default profile
    const newProfile = {
      wallet,
      followers: 0,
      following: 0,
      posts: 0,
      earnings: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await profilesCollection.insertOne(newProfile);
    profile = await profilesCollection.findOne({ wallet });
  }

  return profile!;
}

/**
 * Get a user profile by wallet
 */
export async function getProfile(wallet: string): Promise<Profile | null> {
  const db = await getDatabase();
  const profilesCollection = db.collection<Profile>(PROFILES_COLLECTION);

  const profile = await profilesCollection.findOne({ wallet });
  return profile || null;
}

/**
 * Update user profile
 */
export async function updateProfile(
  wallet: string,
  updates: Partial<Omit<Profile, 'wallet' | 'followers' | 'following' | 'posts' | 'earnings' | 'createdAt'>>
): Promise<Profile> {
  // Validate and sanitize input
  const sanitizedUpdates = {
    ...updates,
    displayName: updates.displayName ? sanitizeString(updates.displayName) : updates.displayName,
    bio: updates.bio ? sanitizeString(updates.bio) : updates.bio,
    username: updates.username, // Already validated in schema if provided
  };

  const db = await getDatabase();
  const profilesCollection = db.collection<Profile>(PROFILES_COLLECTION);

  const updateFields = {
    ...sanitizedUpdates,
    updatedAt: Date.now(),
  };

  await profilesCollection.updateOne(
    { wallet },
    { $set: updateFields },
    { upsert: true }
  );

  // Return updated profile
  const updatedProfile = await profilesCollection.findOne({ wallet });
  return updatedProfile!;
}

/**
 * Get profiles by usernames (for search)
 */
export async function searchProfiles(query: string, limit: number = 20, offset: number = 0): Promise<Profile[]> {
  const db = await getDatabase();
  const profilesCollection = db.collection<Profile>(PROFILES_COLLECTION);

  const profiles = await profilesCollection
    .find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { displayName: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
      ]
    })
    .skip(offset)
    .limit(limit)
    .toArray();

  return profiles;
}

/**
 * Get random profiles (for creators page)
 */
export async function getRandomProfiles(limit: number = 20): Promise<Profile[]> {
  const db = await getDatabase();
  const profilesCollection = db.collection<Profile>(PROFILES_COLLECTION);

  const profiles = await profilesCollection
    .aggregate([{ $sample: { size: limit } }])
    .toArray();

  return profiles as Profile[];
}

/**
 * Search posts by content
 */
export async function searchPosts(query: string, limit: number = 20, offset: number = 0): Promise<Post[]> {
  const db = await getDatabase();
  const postsCollection = db.collection<Post>(POSTS_COLLECTION);

  const posts = await postsCollection
    .find({
      $text: { $search: query }
    })
    .sort({ score: { $meta: 'textScore' } })
    .skip(offset)
    .limit(limit)
    .toArray();

  return posts;
}



/**
 * Search comments by content
 */
export async function searchComments(query: string, limit: number = 20, offset: number = 0): Promise<Comment[]> {
  const db = await getDatabase();
  const commentsCollection = db.collection<Comment>(COMMENTS_COLLECTION);

  const comments = await commentsCollection
    .find({
      $text: { $search: query }
    })
    .sort({ score: { $meta: 'textScore' } })
    .skip(offset)
    .limit(limit)
    .toArray();

  return comments;
}

/**
 * Update profile stats (followers, following, posts, earnings)
 */
export async function updateProfileStats(
  wallet: string,
  updates: {
    followers?: number;
    following?: number;
    posts?: number;
    earnings?: number;
  }
): Promise<void> {
  const db = await getDatabase();
  const profilesCollection = db.collection<Profile>(PROFILES_COLLECTION);

  const updateFields: any = {};
  if (updates.followers !== undefined) updateFields.followers = updates.followers;
  if (updates.following !== undefined) updateFields.following = updates.following;
  if (updates.posts !== undefined) updateFields.posts = updates.posts;
  if (updates.earnings !== undefined) updateFields.earnings = updates.earnings;

  await profilesCollection.updateOne(
    { wallet },
    { $inc: updateFields }
  );
}

/**
 * Follow a user
 */
export async function followUser(follower: string, following: string): Promise<Follow> {
  if (follower === following) {
    throw new Error("Cannot follow yourself");
  }

  const db = await getDatabase();
  const followsCollection = db.collection<Follow>(FOLLOWS_COLLECTION);

  // Check if already following
  const existingFollow = await followsCollection.findOne({
    follower,
    following,
  });

  if (existingFollow) {
    throw new Error("Already following this user");
  }

  const follow: Follow = {
    id: `follow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    follower,
    following,
    createdAt: Date.now(),
  };

  await followsCollection.insertOne(follow);

  // Update follower counts
  await updateProfileStats(follower, { following: 1 });
  await updateProfileStats(following, { followers: 1 });

  // Create notification for the followed user
  await createNotification({
    recipient: following,
    sender: follower,
    type: 'follow',
    message: 'Someone started following you',
  });

  return follow;
}

/**
 * Unfollow a user
 */
export async function unfollowUser(follower: string, following: string): Promise<void> {
  const db = await getDatabase();
  const followsCollection = db.collection<Follow>(FOLLOWS_COLLECTION);

  const result = await followsCollection.deleteOne({
    follower,
    following,
  });

  if (result.deletedCount === 0) {
    throw new Error("Not following this user");
  }

  // Update follower counts
  await updateProfileStats(follower, { following: -1 });
  await updateProfileStats(following, { followers: -1 });
}

/**
 * Check if a user is following another user
 */
export async function isFollowing(follower: string, following: string): Promise<boolean> {
  const db = await getDatabase();
  const followsCollection = db.collection<Follow>(FOLLOWS_COLLECTION);

  const follow = await followsCollection.findOne({
    follower,
    following,
  });

  return !!follow;
}

/**
 * Get followers of a user
 */
export async function getFollowers(wallet: string, limit: number = 50, offset: number = 0): Promise<Profile[]> {
  const db = await getDatabase();
  const followsCollection = db.collection<Follow>(FOLLOWS_COLLECTION);
  const profilesCollection = db.collection<Profile>(PROFILES_COLLECTION);

  const followers = await followsCollection
    .find({ following: wallet })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  const followerWallets = followers.map(f => f.follower);

  if (followerWallets.length === 0) {
    return [];
  }

  const followerProfiles = await profilesCollection
    .find({ wallet: { $in: followerWallets } })
    .toArray();

  return followerProfiles;
}

/**
 * Get users that a wallet is following
 */
export async function getFollowing(wallet: string, limit: number = 50, offset: number = 0): Promise<Profile[]> {
  const db = await getDatabase();
  const followsCollection = db.collection<Follow>(FOLLOWS_COLLECTION);
  const profilesCollection = db.collection<Profile>(PROFILES_COLLECTION);

  const following = await followsCollection
    .find({ follower: wallet })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  const followingWallets = following.map(f => f.following);

  if (followingWallets.length === 0) {
    return [];
  }

  const followingProfiles = await profilesCollection
    .find({ wallet: { $in: followingWallets } })
    .toArray();

  return followingProfiles;
}

/**
 * Like a post
 */
export async function likePost(postId: string, wallet: string): Promise<Like> {
  // Validate input
  const validatedData = validateData(CreateLikeSchema, { postId, wallet });

  const db = await getDatabase();
  const likesCollection = db.collection<Like>(LIKES_COLLECTION);

  // Check if already liked
  const existingLike = await likesCollection.findOne({
    postId: validatedData.postId,
    wallet: validatedData.wallet,
  });

  if (existingLike) {
    throw new Error("Already liked this post");
  }

  const like: Like = {
    id: `like_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    postId: validatedData.postId,
    wallet: validatedData.wallet,
    createdAt: Date.now(),
  };

  await likesCollection.insertOne(like);

  // Update post like count
  await updatePostEngagement(validatedData.postId, { likes: 1 });

  // Get post author to create notification
  const post = await getPost(validatedData.postId);
  if (post && post.author !== validatedData.wallet) {
    await createNotification({
      recipient: post.author,
      sender: validatedData.wallet,
      type: 'like',
      postId: validatedData.postId,
      message: 'Someone liked your post',
    });

    // Broadcast real-time like notification to post author
    broadcastToUser(post.author, {
      type: 'notification',
      userId: post.author,
      data: {
        type: 'like',
        postId: validatedData.postId,
        sender: validatedData.wallet,
        message: 'Someone liked your post',
        timestamp: Date.now(),
      },
    });

    // Broadcast to post room for live updates
    broadcastToRoom(`post_${validatedData.postId}`, {
      type: 'like',
      roomId: `post_${validatedData.postId}`,
      data: {
        postId: validatedData.postId,
        liker: validatedData.wallet,
        action: 'like',
      },
    });
  }

  return like;
}

/**
 * Unlike a post
 */
export async function unlikePost(postId: string, wallet: string): Promise<void> {
  const db = await getDatabase();
  const likesCollection = db.collection<Like>(LIKES_COLLECTION);

  const result = await likesCollection.deleteOne({
    postId,
    wallet,
  });

  if (result.deletedCount === 0) {
    throw new Error("Not liked this post");
  }

  // Update post like count
  await updatePostEngagement(postId, { likes: -1 });
}

/**
 * Check if a wallet has liked a post
 */
export async function hasLikedPost(postId: string, wallet: string): Promise<boolean> {
  const db = await getDatabase();
  const likesCollection = db.collection<Like>(LIKES_COLLECTION);

  const like = await likesCollection.findOne({
    postId,
    wallet,
  });

  return !!like;
}

/**
 * Get likes for a post
 */
export async function getPostLikes(postId: string): Promise<Like[]> {
  const db = await getDatabase();
  const likesCollection = db.collection<Like>(LIKES_COLLECTION);

  const likes = await likesCollection
    .find({ postId })
    .sort({ createdAt: -1 })
    .toArray();

  return likes;
}

/**
 * Add a comment to a post
 */
export async function addComment(postId: string, author: string, content: string, parentCommentId?: string): Promise<Comment> {
  // Validate input
  const validatedData = validateData(CreateCommentSchema, {
    postId,
    author,
    content: sanitizeString(content),
  });

  const db = await getDatabase();
  const commentsCollection = db.collection<Comment>(COMMENTS_COLLECTION);

  const comment: Comment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    postId: validatedData.postId,
    author: validatedData.author,
    content: validatedData.content,
    createdAt: Date.now(),
    likes: 0,
    ...(parentCommentId && { parentCommentId }),
  };

  await commentsCollection.insertOne(comment);

  // Update post comment count or parent comment reply count
  if (parentCommentId) {
    // Update parent comment reply count
    await commentsCollection.updateOne(
      { id: parentCommentId },
      { $inc: { replyCount: 1 } }
    );
  } else {
    // Update post comment count
    await updatePostEngagement(validatedData.postId, { comments: 1 });
  }

  // Create notification and broadcast real-time updates
  if (parentCommentId) {
    // Notify the parent comment author
    const parentComment = await commentsCollection.findOne({ id: parentCommentId });
    if (parentComment && parentComment.author !== validatedData.author) {
      await createNotification({
        recipient: parentComment.author,
        sender: validatedData.author,
        type: 'comment',
        postId: validatedData.postId,
        commentId: parentCommentId,
        message: 'Someone replied to your comment',
      });

      // Broadcast real-time reply notification
      broadcastToUser(parentComment.author, {
        type: 'notification',
        userId: parentComment.author,
        data: {
          type: 'comment',
          postId: validatedData.postId,
          commentId: parentCommentId,
          sender: validatedData.author,
          message: 'Someone replied to your comment',
          timestamp: Date.now(),
        },
      });
    }
  } else {
    // Notify the post author
    const post = await getPost(validatedData.postId);
    if (post && post.author !== validatedData.author) {
      await createNotification({
        recipient: post.author,
        sender: validatedData.author,
        type: 'comment',
        postId: validatedData.postId,
        message: 'Someone commented on your post',
      });

      // Broadcast real-time comment notification
      broadcastToUser(post.author, {
        type: 'notification',
        userId: post.author,
        data: {
          type: 'comment',
          postId: validatedData.postId,
          sender: validatedData.author,
          message: 'Someone commented on your post',
          timestamp: Date.now(),
        },
      });
    }
  }

  // Broadcast to post room for live comment updates
  broadcastToRoom(`post_${validatedData.postId}`, {
    type: 'comment',
    roomId: `post_${validatedData.postId}`,
    data: {
      postId: validatedData.postId,
      comment: comment,
      action: 'new_comment',
    },
  });

  return comment;
}

/**
 * Get comments for a post
 */
export async function getPostComments(postId: string, limit: number = 50, offset: number = 0): Promise<Comment[]> {
  const db = await getDatabase();
  const commentsCollection = db.collection<Comment>(COMMENTS_COLLECTION);

  const comments = await commentsCollection
    .find({ postId, parentCommentId: { $exists: false } }) // Only top-level comments
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  return comments;
}

/**
 * Get replies for a specific comment
 */
export async function getCommentReplies(commentId: string, limit: number = 20, offset: number = 0): Promise<Comment[]> {
  const db = await getDatabase();
  const commentsCollection = db.collection<Comment>(COMMENTS_COLLECTION);

  const replies = await commentsCollection
    .find({ parentCommentId: commentId })
    .sort({ createdAt: 1 }) // Oldest first for replies
    .skip(offset)
    .limit(limit)
    .toArray();

  return replies;
}

/**
 * Repost a post
 */
export async function repostPost(originalPostId: string, author: string, content?: string): Promise<Repost> {
  const db = await getDatabase();
  const repostsCollection = db.collection<Repost>(REPOSTS_COLLECTION);

  // Check if already reposted
  const existingRepost = await repostsCollection.findOne({
    originalPostId,
    author,
  });

  if (existingRepost) {
    throw new Error("Already reposted this post");
  }

  const repost: Repost = {
    id: `repost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    originalPostId,
    author,
    content: content?.trim(),
    createdAt: Date.now(),
  };

  await repostsCollection.insertOne(repost);

  // Update original post repost count
  await updatePostEngagement(originalPostId, { reposts: 1 });

  // Get post author to create notification
  const post = await getPost(originalPostId);
  if (post && post.author !== author) {
    await createNotification({
      recipient: post.author,
      sender: author,
      type: 'repost',
      postId: originalPostId,
      message: 'Someone reposted your post',
    });
  }

  return repost;
}

/**
 * Get reposts for a post
 */
export async function getPostReposts(postId: string): Promise<Repost[]> {
  const db = await getDatabase();
  const repostsCollection = db.collection<Repost>(REPOSTS_COLLECTION);

  const reposts = await repostsCollection
    .find({ originalPostId: postId })
    .sort({ createdAt: -1 })
    .toArray();

  return reposts;
}

/**
 * Delete a repost (un-repost)
 */
export async function deleteRepost(originalPostId: string, author: string): Promise<void> {
  const db = await getDatabase();
  const repostsCollection = db.collection<Repost>(REPOSTS_COLLECTION);

  const result = await repostsCollection.deleteOne({
    originalPostId,
    author,
  });

  if (result.deletedCount === 0) {
    throw new Error("Repost not found");
  }

  // Update original post repost count
  await updatePostEngagement(originalPostId, { reposts: -1 });
}

/**
 * Check if a wallet has reposted a post
 */
export async function hasRepostedPost(originalPostId: string, wallet: string): Promise<boolean> {
  const db = await getDatabase();
  const repostsCollection = db.collection<Repost>(REPOSTS_COLLECTION);

  const repost = await repostsCollection.findOne({
    originalPostId,
    wallet,
  });

  return !!repost;
}

/**
 * Create a subscription tier
 */
export async function createSubscriptionTier(data: {
  creator: string;
  name: string;
  description?: string;
  price: number;
  benefits?: string[];
}): Promise<SubscriptionTier> {
  const db = await getDatabase();
  const tiersCollection = db.collection<SubscriptionTier>(SUBSCRIPTION_TIERS_COLLECTION);

  const tier: SubscriptionTier = {
    id: `tier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    creator: data.creator,
    name: data.name,
    description: data.description,
    price: data.price,
    benefits: data.benefits || [],
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await tiersCollection.insertOne(tier);
  return tier;
}

/**
 * Get subscription tiers for a creator
 */
export async function getCreatorTiers(creator: string): Promise<SubscriptionTier[]> {
  const db = await getDatabase();
  const tiersCollection = db.collection<SubscriptionTier>(SUBSCRIPTION_TIERS_COLLECTION);

  const tiers = await tiersCollection
    .find({ creator, isActive: true })
    .sort({ price: 1 })
    .toArray();

  return tiers;
}

/**
 * Update a subscription tier
 */
export async function updateSubscriptionTier(
  tierId: string,
  creator: string,
  updates: Partial<Pick<SubscriptionTier, 'name' | 'description' | 'price' | 'benefits' | 'isActive'>>
): Promise<SubscriptionTier> {
  const db = await getDatabase();
  const tiersCollection = db.collection<SubscriptionTier>(SUBSCRIPTION_TIERS_COLLECTION);

  const updateFields = {
    ...updates,
    updatedAt: Date.now(),
  };

  await tiersCollection.updateOne(
    { id: tierId, creator },
    { $set: updateFields }
  );

  const updatedTier = await tiersCollection.findOne({ id: tierId });
  return updatedTier!;
}

/**
 * Subscribe to a creator's tier
 */
export async function subscribeToTier(data: {
  subscriber: string;
  creator: string;
  tierId: string;
}): Promise<Subscription> {
  const db = await getDatabase();
  const subscriptionsCollection = db.collection<Subscription>(SUBSCRIPTIONS_COLLECTION);
  const tiersCollection = db.collection<SubscriptionTier>(SUBSCRIPTION_TIERS_COLLECTION);

  // Check if tier exists and is active
  const tier = await tiersCollection.findOne({ id: data.tierId, creator: data.creator, isActive: true });
  if (!tier) {
    throw new Error("Subscription tier not found");
  }

  // Check if already subscribed to this tier
  const existingSubscription = await subscriptionsCollection.findOne({
    subscriber: data.subscriber,
    tierId: data.tierId,
    isActive: true,
  });

  if (existingSubscription) {
    throw new Error("Already subscribed to this tier");
  }

  // Deactivate any existing subscriptions to other tiers of this creator
  await subscriptionsCollection.updateMany(
    { subscriber: data.subscriber, creator: data.creator, isActive: true },
    { $set: { isActive: false } }
  );

  const now = Date.now();
  const subscription: Subscription = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    subscriber: data.subscriber,
    creator: data.creator,
    tierId: data.tierId,
    startDate: now,
    endDate: now + (30 * 24 * 60 * 60 * 1000), // 30 days from now
    isActive: true,
    autoRenew: true,
    lastPaymentDate: now,
    totalPaid: tier.price,
    createdAt: now,
  };

  await subscriptionsCollection.insertOne(subscription);

  // Update creator earnings
  await updateProfileStats(data.creator, { earnings: tier.price });

  // Create notification for creator
  await createNotification({
    recipient: data.creator,
    sender: data.subscriber,
    type: 'subscription',
    amount: tier.price,
    message: `New subscriber! Someone subscribed to your content for ${tier.price} USDC/month`,
  });

  return subscription;
}

/**
 * Create a notification
 */
export async function createNotification(data: {
  recipient: string;
  sender: string;
  type: Notification['type'];
  postId?: string;
  commentId?: string;
  amount?: number;
  message: string;
}): Promise<Notification> {
  const db = await getDatabase();
  const notificationsCollection = db.collection<Notification>(NOTIFICATIONS_COLLECTION);

  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    recipient: data.recipient,
    sender: data.sender,
    type: data.type,
    postId: data.postId,
    commentId: data.commentId,
    amount: data.amount,
    message: data.message,
    isRead: false,
    createdAt: Date.now(),
  };

  await notificationsCollection.insertOne(notification);
  return notification;
}

/**
 * Get notifications for a user
 */
export async function getNotifications(wallet: string, limit: number = 50, offset: number = 0): Promise<Notification[]> {
  const db = await getDatabase();
  const notificationsCollection = db.collection<Notification>(NOTIFICATIONS_COLLECTION);

  const notifications = await notificationsCollection
    .find({ recipient: wallet })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  return notifications;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, recipient: string): Promise<void> {
  const db = await getDatabase();
  const notificationsCollection = db.collection<Notification>(NOTIFICATIONS_COLLECTION);

  await notificationsCollection.updateOne(
    { id: notificationId, recipient },
    { $set: { isRead: true } }
  );
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(recipient: string): Promise<void> {
  const db = await getDatabase();
  const notificationsCollection = db.collection<Notification>(NOTIFICATIONS_COLLECTION);

  await notificationsCollection.updateMany(
    { recipient, isRead: false },
    { $set: { isRead: true } }
  );
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(recipient: string): Promise<number> {
  const db = await getDatabase();
  const notificationsCollection = db.collection<Notification>(NOTIFICATIONS_COLLECTION);

  const count = await notificationsCollection.countDocuments({
    recipient,
    isRead: false,
  });

  return count;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string, recipient: string): Promise<void> {
  const db = await getDatabase();
  const notificationsCollection = db.collection<Notification>(NOTIFICATIONS_COLLECTION);

  await notificationsCollection.deleteOne({
    id: notificationId,
    recipient,
  });
}

/**
 * Report content or user
 */
export async function reportContent(data: {
  reporter: string;
  reportedUser: string;
  postId?: string;
  commentId?: string;
  reason: Report['reason'];
  description?: string;
}): Promise<Report> {
  const db = await getDatabase();
  const reportsCollection = db.collection<Report>(REPORTS_COLLECTION);

  // Check if user already reported this content
  const existingReport = await reportsCollection.findOne({
    reporter: data.reporter,
    postId: data.postId,
    commentId: data.commentId,
  });

  if (existingReport) {
    throw new Error("You have already reported this content");
  }

  const report: Report = {
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    reporter: data.reporter,
    reportedUser: data.reportedUser,
    postId: data.postId,
    commentId: data.commentId,
    reason: data.reason,
    description: data.description,
    status: 'pending',
    createdAt: Date.now(),
  };

  await reportsCollection.insertOne(report);
  return report;
}

/**
 * Get reports (for moderation - would typically be admin only)
 */
export async function getReports(status?: Report['status'], limit: number = 50, offset: number = 0): Promise<Report[]> {
  const db = await getDatabase();
  const reportsCollection = db.collection<Report>(REPORTS_COLLECTION);

  const filter = status ? { status } : {};
  const reports = await reportsCollection
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  return reports;
}

/**
 * Update report status (for moderation)
 */
export async function updateReportStatus(
  reportId: string,
  status: Report['status'],
  reviewedBy: string
): Promise<void> {
  const db = await getDatabase();
  const reportsCollection = db.collection<Report>(REPORTS_COLLECTION);

  await reportsCollection.updateOne(
    { id: reportId },
    {
      $set: {
        status,
        reviewedAt: Date.now(),
        reviewedBy,
      }
    }
  );
}

/**
 * Get active subscription for a subscriber to a creator
 */
export async function getActiveSubscription(subscriber: string, creator: string): Promise<Subscription | null> {
  const db = await getDatabase();
  const subscriptionsCollection = db.collection<Subscription>(SUBSCRIPTIONS_COLLECTION);

  const subscription = await subscriptionsCollection.findOne({
    subscriber,
    creator,
    isActive: true,
  });

  return subscription || null;
}

/**
 * Get all subscribers for a creator
 */
export async function getCreatorSubscribers(creator: string): Promise<Subscription[]> {
  const db = await getDatabase();
  const subscriptionsCollection = db.collection<Subscription>(SUBSCRIPTIONS_COLLECTION);

  const subscriptions = await subscriptionsCollection
    .find({ creator, isActive: true })
    .sort({ createdAt: -1 })
    .toArray();

  return subscriptions;
}

/**
 * Get subscriptions for a subscriber
 */
export async function getSubscriberSubscriptions(subscriber: string): Promise<Subscription[]> {
  const db = await getDatabase();
  const subscriptionsCollection = db.collection<Subscription>(SUBSCRIPTIONS_COLLECTION);

  const subscriptions = await subscriptionsCollection
    .find({ subscriber, isActive: true })
    .sort({ createdAt: -1 })
    .toArray();

  return subscriptions;
}

/**
 * Get billing history for a subscriber
 */
export async function getBillingHistory(subscriber: string): Promise<Array<{
  id: string;
  type: 'subscription' | 'unlock';
  amount: number;
  description: string;
  date: number;
  creator?: string;
  postId?: string;
}>> {
  const db = await getDatabase();

  const billingHistory: Array<{
    id: string;
    type: 'subscription' | 'unlock';
    amount: number;
    description: string;
    date: number;
    creator?: string;
    postId?: string;
  }> = [];

  // Get subscription payments
  const subscriptionsCollection = db.collection<Subscription>(SUBSCRIPTIONS_COLLECTION);
  const subscriptions = await subscriptionsCollection
    .find({ subscriber, isActive: true })
    .sort({ createdAt: -1 })
    .toArray();

  subscriptions.forEach(sub => {
    billingHistory.push({
      id: sub.id,
      type: 'subscription',
      amount: sub.totalPaid,
      description: `Subscription to ${sub.creator.slice(0, 8)}...`,
      date: sub.createdAt,
      creator: sub.creator,
    });
  });

  // Get unlock payments
  const unlocksCollection = db.collection(UNLOCKS_COLLECTION);
  const unlocks = await unlocksCollection
    .find({ wallet: subscriber })
    .sort({ timestamp: -1 })
    .toArray();

  unlocks.forEach(unlock => {
    billingHistory.push({
      id: unlock.txSignature,
      type: 'unlock',
      amount: unlock.amount,
      description: `Image unlock`,
      date: unlock.timestamp,
      postId: unlock.postId,
    });
  });

  // Sort by date (most recent first)
  return billingHistory.sort((a, b) => b.date - a.date);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string, subscriber: string): Promise<void> {
  const db = await getDatabase();
  const subscriptionsCollection = db.collection<Subscription>(SUBSCRIPTIONS_COLLECTION);

  const result = await subscriptionsCollection.updateOne(
    { id: subscriptionId, subscriber, isActive: true },
    { $set: { isActive: false, autoRenew: false } }
  );

  if (result.matchedCount === 0) {
    throw new Error("Subscription not found");
  }
}

/**
 * Manually renew a subscription (user-initiated)
 */
export async function manualRenewSubscription(subscriptionId: string, subscriber: string): Promise<{ tierId: string; price: number; creator: string }> {
  const db = await getDatabase();
  const subscriptionsCollection = db.collection<Subscription>(SUBSCRIPTIONS_COLLECTION);

  const subscription = await subscriptionsCollection.findOne({
    id: subscriptionId,
    subscriber,
    isActive: true,
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  // Get the tier information
  const tiersCollection = db.collection<SubscriptionTier>(SUBSCRIPTION_TIERS_COLLECTION);
  const tier = await tiersCollection.findOne({ id: subscription.tierId });

  if (!tier) {
    throw new Error("Subscription tier not found");
  }

  return {
    tierId: tier.id,
    price: tier.price,
    creator: subscription.creator,
  };
}

/**
 * Renew a subscription (called by payment system)
 */
export async function renewSubscription(subscriptionId: string, amount: number): Promise<void> {
  const db = await getDatabase();
  const subscriptionsCollection = db.collection<Subscription>(SUBSCRIPTIONS_COLLECTION);

  const now = Date.now();
  await subscriptionsCollection.updateOne(
    { id: subscriptionId, isActive: true, autoRenew: true },
    {
      $set: {
        endDate: now + (30 * 24 * 60 * 60 * 1000), // Extend by 30 days
        lastPaymentDate: now,
      },
      $inc: { totalPaid: amount }
    }
  );
}

/**
 * Check if a subscriber has access to creator content
 */
export async function hasSubscriptionAccess(subscriber: string, creator: string): Promise<boolean> {
  const subscription = await getActiveSubscription(subscriber, creator);
  return !!subscription && subscription.endDate > Date.now();
}

/**
 * Pin or unpin a post (creator only)
 */
export async function togglePostPin(postId: string, author: string): Promise<void> {
  const db = await getDatabase();
  const postsCollection = db.collection<Post>(POSTS_COLLECTION);

  const post = await postsCollection.findOne({ id: postId, author });
  if (!post) {
    throw new Error("Post not found or access denied");
  }

  const newPinnedStatus = !post.pinned;
  await postsCollection.updateOne(
    { id: postId, author },
    { $set: { pinned: newPinnedStatus } }
  );
}

/**
 * Get posts from users that a wallet is following (for feed)
 */
export async function getFollowingPosts(wallet: string, limit: number = 20, offset: number = 0): Promise<Post[]> {
  const db = await getDatabase();
  const followsCollection = db.collection<Follow>(FOLLOWS_COLLECTION);
  const postsCollection = db.collection<Post>(POSTS_COLLECTION);

  // Get users that this wallet is following
  const following = await followsCollection
    .find({ follower: wallet })
    .toArray();

  const followingWallets = following.map(f => f.following);

  if (followingWallets.length === 0) {
    return [];
  }

  // Get posts from followed users
  const posts = await postsCollection
    .find({ author: { $in: followingWallets } })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  return posts;
}
