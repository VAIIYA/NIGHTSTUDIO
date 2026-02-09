"use server";

import { connectDb } from './db'
import PostModel from '../models/Post'
import CreatorModel from '../models/Creator'
import InteractionModel from '../models/Interaction'
import FollowModel from '../models/Follow'
import SubscriptionModel from '../models/Subscription'
import SubscriptionTierModel from '../models/SubscriptionTier'
import PurchaseModel from '../models/Purchase'
import NotificationModel from '../models/Notification'
import ReportModel from '../models/Report'
import { validateData, sanitizeString, CreatePostSchema, CreateCommentSchema, CreateLikeSchema, CreateFollowSchema, CreateSubscriptionSchema, CreateReportSchema, CreateUnlockSchema, CreateNotificationSchema, UpdateProfileSchema, CreateProfileSchema, CreateSubscriptionTierSchema } from "./validation";
import { broadcastToUser, broadcastToRoom } from "./websocket";
import { extractHashtags } from "./engagementScorer";

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

export async function createPost(data: {
    author: string;
    content: string;
    imagePrice?: number;
}) {
    await connectDb()

    const validatedData = validateData(CreatePostSchema, {
        ...data,
        content: sanitizeString(data.content),
    });

    // Extract hashtags from content
    const hashtags = extractHashtags(validatedData.content);

    const post = new PostModel({
        creatorId: validatedData.author,
        bio: validatedData.content, // Using bio field for content as per existing model
        priceUSDC: validatedData.imagePrice || 0,
        hashtags,
    });

    await post.save();
    await updateProfileStats(validatedData.author, { posts: 1 });

    return post;
}

export async function getPosts(limit: number = 20, offset: number = 0) {
    await connectDb()
    const posts = await PostModel.find({})
        .populate('creatorId', 'username bio avatar walletAddress')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
    return posts;
}

export async function getPost(id: string) {
    await connectDb()
    const post = await PostModel.findById(id)
        .populate('creatorId', 'username bio avatar walletAddress')
        .lean();
    return post;
}

export async function getPostsByAuthor(author: string, limit: number = 100, offset: number = 0) {
    await connectDb()
    const posts = await PostModel.find({ creatorId: author })
        .populate('creatorId', 'username bio avatar walletAddress')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
    return posts;
}

export async function createUnlock(data: {
    postId: string;
    wallet: string;
    txSignature: string;
    amount: number;
}) {
    await connectDb()

    const validatedData = validateData(CreateUnlockSchema, data);

    const unlock = new PurchaseModel({
        postId: validatedData.postId,
        userId: validatedData.wallet,
        txSignature: validatedData.txSignature,
        amount: validatedData.amount,
        nonce: `unlock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    await unlock.save();

    const post = await PostModel.findById(validatedData.postId);
    if (post && post.creatorId.toString() !== validatedData.wallet) {
        const notification = new NotificationModel({
            recipient: post.creatorId,
            sender: validatedData.wallet,
            type: 'unlock',
            postId: validatedData.postId,
            amount: validatedData.amount,
            message: `Someone unlocked your content for ${validatedData.amount} USDC`,
        });
        await notification.save();
    }

    return unlock;
}

export async function hasUnlocked(postId: string, wallet: string) {
    await connectDb()
    const unlock = await PurchaseModel.findOne({
        postId,
        userId: wallet,
    });
    return !!unlock;
}

export async function getUnlocksForPost(postId: string) {
    await connectDb()
    const unlocks = await PurchaseModel.find({ postId })
        .populate('userId', 'username avatar')
        .sort({ createdAt: -1 })
        .lean();
    return unlocks;
}

// Note: Post engagement stats are calculated dynamically from interactions
// This function is kept for API compatibility but doesn't actually update stored values
export async function updatePostEngagement(
    postId: string,
    updates: {
        likes?: number;
        comments?: number;
        reposts?: number;
    }
): Promise<void> {
    // Engagement stats are calculated from interactions, so no direct update needed
    return;
}

export async function getOrCreateProfile(wallet: string) {
    await connectDb()
    let creator = await CreatorModel.findOne({ walletAddress: wallet });

    if (!creator) {
        creator = new CreatorModel({
            userId: wallet, // Assuming userId is same as wallet for now
            walletAddress: wallet,
        });
        await creator.save();
    }

    return creator;
}

export async function getProfile(wallet: string) {
    await connectDb()
    const creator = await CreatorModel.findOne({ walletAddress: wallet }).lean();
    return creator;
}

export async function updateProfile(wallet: string, updates: any) {
    await connectDb()

    const sanitizedUpdates = {
        ...updates,
        username: updates.username,
        bio: updates.bio ? sanitizeString(updates.bio) : updates.bio,
        avatar: updates.avatar,
    };

    if (sanitizedUpdates.username) {
        // Check if username is taken by another user
        const existing = await CreatorModel.findOne({
            username: sanitizedUpdates.username,
            walletAddress: { $ne: wallet }
        });
        if (existing) {
            throw new Error("Username already taken");
        }
    }

    const updatedProfile = await CreatorModel.findOneAndUpdate(
        { walletAddress: wallet },
        { $set: sanitizedUpdates },
        { new: true, upsert: true }
    );

    return updatedProfile;
}

export async function searchProfiles(query: string, limit: number = 20, offset: number = 0) {
    await connectDb()
    const creators = await CreatorModel.find({
        $or: [
            { username: { $regex: query, $options: 'i' } },
            { bio: { $regex: query, $options: 'i' } }
        ]
    })
    .limit(limit)
    .skip(offset)
    .lean();
    return creators;
}

export async function getRandomProfiles(limit: number = 20) {
    await connectDb()
    const creators = await CreatorModel.aggregate([
        { $sample: { size: limit } }
    ]);
    return creators;
}

export async function searchPosts(query: string, limit: number = 20, offset: number = 0) {
    await connectDb()
    const posts = await PostModel.find({
        $or: [
            { bio: { $regex: query, $options: 'i' } },
            { hashtags: { $in: [new RegExp(query, 'i')] } }
        ]
    })
    .populate('creatorId', 'username bio avatar walletAddress')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .lean();
    return posts;
}

export async function searchComments(query: string, limit: number = 20, offset: number = 0) {
    await connectDb()
    const interactions = await InteractionModel.find({
        type: 'comment',
        content: { $regex: query, $options: 'i' }
    })
    .populate('userId', 'username avatar')
    .populate({
        path: 'postId',
        populate: {
            path: 'creatorId',
            select: 'username avatar'
        }
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .lean();

    // Transform to comment format
    return interactions.map(interaction => ({
        id: (interaction._id as any).toString(),
        postId: (interaction.postId as any)._id?.toString() || (interaction.postId as any).toString(),
        author: (interaction.userId as any)._id?.toString() || (interaction.userId as any).toString(),
        content: interaction.content || '',
        createdAt: interaction.createdAt.getTime(),
        likes: 0, // Would need separate calculation
        authorUsername: (interaction.userId as any).username,
        authorAvatar: interaction.userId.avatar,
    }));
}

// Profile stats are calculated dynamically from database queries
export async function updateProfileStats(wallet: string, updates: any): Promise<void> {
    // Stats are calculated on-demand, no need to store them
    return;
}

export async function followUser(follower: string, following: string) {
    await connectDb()

    if (follower === following) {
        throw new Error("Cannot follow yourself");
    }

    // Check if already following
    const existingFollow = await FollowModel.findOne({
        follower,
        following
    });

    if (existingFollow) {
        throw new Error("Already following this user");
    }

    const follow = new FollowModel({
        follower,
        following
    });

    await follow.save();

    // Create notification
    const notification = new NotificationModel({
        recipient: following,
        sender: follower,
        type: 'follow',
        message: 'Someone started following you',
    });
    await notification.save();

    return follow;
}

export async function unfollowUser(follower: string, following: string): Promise<void> {
    await connectDb()
    await FollowModel.deleteOne({
        follower,
        following
    });
}

export async function isFollowing(follower: string, following: string): Promise<boolean> {
    await connectDb()
    const follow = await FollowModel.findOne({
        follower,
        following
    });
    return !!follow;
}

export async function getFollowers(wallet: string, limit: number = 50, offset: number = 0) {
    await connectDb()
    const follows = await FollowModel.find({ following: wallet })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();

    const followerWallets = follows.map(f => f.follower);

    if (followerWallets.length === 0) {
        return [];
    }

    // Get creator profiles for followers
    const creators = await CreatorModel.find({
        walletAddress: { $in: followerWallets }
    }).lean();

    return creators;
}

export async function getFollowing(wallet: string, limit: number = 50, offset: number = 0) {
    await connectDb()
    const follows = await FollowModel.find({ follower: wallet })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();

    const followingWallets = follows.map(f => f.following);

    if (followingWallets.length === 0) {
        return [];
    }

    // Get creator profiles for following
    const creators = await CreatorModel.find({
        walletAddress: { $in: followingWallets }
    }).lean();

    return creators;
}

export async function likePost(postId: string, wallet: string) {
    await connectDb()

    const validatedData = validateData(CreateLikeSchema, { postId, wallet });

    // Check if already liked
    const existing = await InteractionModel.findOne({
        userId: validatedData.wallet,
        postId: validatedData.postId,
        type: 'like'
    });

    if (existing) {
        throw new Error("Already liked this post");
    }

    const interaction = new InteractionModel({
        userId: validatedData.wallet,
        postId: validatedData.postId,
        type: 'like',
    });

    await interaction.save();

    // Create notification
    const post = await PostModel.findById(validatedData.postId);
    if (post && post.creatorId.toString() !== validatedData.wallet) {
        const notification = new NotificationModel({
            recipient: post.creatorId,
            sender: validatedData.wallet,
            type: 'like',
            postId: validatedData.postId,
            message: 'Someone liked your post',
        });
        await notification.save();
    }

    return interaction;
}

export async function unlikePost(postId: string, wallet: string): Promise<void> {
    await connectDb()
    await InteractionModel.deleteOne({
        userId: wallet,
        postId,
        type: 'like'
    });
}

export async function hasLikedPost(postId: string, wallet: string): Promise<boolean> {
    await connectDb()
    const like = await InteractionModel.findOne({
        userId: wallet,
        postId,
        type: 'like'
    });
    return !!like;
}

export async function getPostLikes(postId: string) {
    await connectDb()
    const likes = await InteractionModel.find({
        postId,
        type: 'like'
    })
    .populate('userId', 'username avatar')
    .sort({ createdAt: -1 })
    .lean();
    return likes;
}

export async function addComment(postId: string, author: string, content: string, parentCommentId?: string) {
    await connectDb()

    const validatedData = validateData(CreateCommentSchema, {
        postId,
        author,
        content: sanitizeString(content),
    });

    const interaction = new InteractionModel({
        userId: validatedData.author,
        postId: validatedData.postId,
        type: 'comment',
        content: validatedData.content,
    });

    await interaction.save();

    // Create notification
    const post = await PostModel.findById(validatedData.postId);
    if (post && post.creatorId.toString() !== validatedData.author) {
        const notification = new NotificationModel({
            recipient: post.creatorId,
            sender: validatedData.author,
            type: 'comment',
            postId: validatedData.postId,
            message: 'Someone commented on your post',
        });
        await notification.save();
    }

    return {
        id: (interaction._id as any).toString(),
        postId: validatedData.postId,
        author: validatedData.author,
        content: validatedData.content,
        createdAt: interaction.createdAt.getTime(),
        likes: 0,
    };
}

export async function getPostComments(postId: string, limit: number = 50, offset: number = 0) {
    await connectDb()
    const comments = await InteractionModel.find({
        postId,
        type: 'comment'
    })
    .populate('userId', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .lean();

    return comments.map(comment => ({
        id: (comment._id as any).toString(),
        postId: comment.postId.toString(),
        author: (comment.userId as any)._id?.toString() || (comment.userId as any).toString(),
        content: comment.content || '',
        createdAt: comment.createdAt.getTime(),
        likes: 0,
        authorUsername: (comment.userId as any).username,
        authorAvatar: (comment.userId as any).avatar,
    }));
}

export async function getCommentReplies(commentId: string, limit: number = 20, offset: number = 0) {
    // For now, replies not implemented - would need a parentCommentId field
    return [];
}

export async function repostPost(originalPostId: string, author: string, content?: string) {
    await connectDb()

    const interaction = new InteractionModel({
        userId: author,
        postId: originalPostId,
        type: 'repost',
        content: content?.trim(),
    });

    await interaction.save();

    // Create notification
    const post = await PostModel.findById(originalPostId);
    if (post && post.creatorId.toString() !== author) {
        const notification = new NotificationModel({
            recipient: post.creatorId,
            sender: author,
            type: 'repost',
            postId: originalPostId,
            message: 'Someone reposted your post',
        });
        await notification.save();
    }

    return interaction;
}

export async function getPostReposts(postId: string) {
    await connectDb()
    const reposts = await InteractionModel.find({
        postId,
        type: 'repost'
    })
    .populate('userId', 'username avatar')
    .sort({ createdAt: -1 })
    .lean();
    return reposts;
}

export async function deleteRepost(originalPostId: string, author: string): Promise<void> {
    await connectDb()
    await InteractionModel.deleteOne({
        userId: author,
        postId: originalPostId,
        type: 'repost'
    });
}

export async function hasRepostedPost(originalPostId: string, wallet: string): Promise<boolean> {
    await connectDb()
    const repost = await InteractionModel.findOne({
        userId: wallet,
        postId: originalPostId,
        type: 'repost'
    });
    return !!repost;
}

export async function createSubscriptionTier(data: any) {
    await connectDb()

    const validatedData = validateData(CreateSubscriptionTierSchema, data);

    const tier = new SubscriptionTierModel({
        creator: validatedData.creator,
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        benefits: validatedData.benefits || [],
    });

    await tier.save();
    return tier;
}

export async function getCreatorTiers(creator: string) {
    await connectDb()
    const tiers = await SubscriptionTierModel.find({
        creator,
        isActive: true
    })
    .sort({ price: 1 })
    .lean();
    return tiers;
}

export async function updateSubscriptionTier(tierId: string, creator: string, updates: any) {
    await connectDb()
    const updatedTier = await SubscriptionTierModel.findOneAndUpdate(
        { _id: tierId, creator },
        { $set: { ...updates, updatedAt: new Date() } },
        { new: true }
    );
    return updatedTier;
}

export async function subscribeToTier(data: any) {
    await connectDb()

    const validatedData = validateData(CreateSubscriptionSchema, data);

    // Check if tier exists and is active
    const tier = await SubscriptionTierModel.findOne({
        _id: validatedData.tierId,
        creator: validatedData.creator,
        isActive: true
    });

    if (!tier) {
        throw new Error("Subscription tier not found");
    }

    // Check if already subscribed to this tier
    const existingSubscription = await SubscriptionModel.findOne({
        subscriber: validatedData.subscriber,
        tierId: validatedData.tierId,
        isActive: true,
    });

    if (existingSubscription) {
        throw new Error("Already subscribed to this tier");
    }

    // Deactivate any existing subscriptions to other tiers of this creator
    await SubscriptionModel.updateMany(
        {
            subscriber: validatedData.subscriber,
            creator: validatedData.creator,
            isActive: true
        },
        { $set: { isActive: false } }
    );

    const now = new Date();
    const subscription = new SubscriptionModel({
        subscriber: validatedData.subscriber,
        creator: validatedData.creator,
        tierId: validatedData.tierId,
        startDate: now,
        endDate: new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)), // 30 days
        isActive: true,
        autoRenew: true,
        lastPaymentDate: now,
        totalPaid: tier.price,
    });

    await subscription.save();

    // Update creator earnings
    await updateProfileStats(validatedData.creator, { earnings: tier.price });

    // Create notification for creator
    const notification = new NotificationModel({
        recipient: validatedData.creator,
        sender: validatedData.subscriber,
        type: 'subscription',
        amount: tier.price,
        message: `New subscriber! Someone subscribed to your content for ${tier.price} USDC/month`,
    });
    await notification.save();

    return subscription;
}

export async function createNotification(data: any) {
    await connectDb()
    const notification = new NotificationModel(data);
    await notification.save();
    return notification;
}

export async function getNotifications(wallet: string, limit: number = 50, offset: number = 0) {
    await connectDb()
    const notifications = await NotificationModel.find({ recipient: wallet })
        .populate('sender', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();
    return notifications;
}

export async function markNotificationAsRead(notificationId: string, recipient: string): Promise<void> {
    await connectDb()
    await NotificationModel.updateOne(
        { _id: notificationId, recipient },
        { isRead: true }
    );
}

export async function markAllNotificationsAsRead(recipient: string): Promise<void> {
    await connectDb()
    await NotificationModel.updateMany(
        { recipient, isRead: false },
        { isRead: true }
    );
}

export async function getUnreadNotificationCount(recipient: string): Promise<number> {
    await connectDb()
    const count = await NotificationModel.countDocuments({
        recipient,
        isRead: false
    });
    return count;
}

export async function deleteNotification(notificationId: string, recipient: string): Promise<void> {
    await connectDb()
    await NotificationModel.deleteOne({
        _id: notificationId,
        recipient
    });
}

export async function reportContent(data: any) {
    await connectDb()
    const report = new ReportModel(data);
    await report.save();
    return report;
}

export async function getReports(status?: string, limit: number = 50, offset: number = 0) {
    await connectDb()
    const query = status ? { status } : {};
    const reports = await ReportModel.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();
    return reports;
}

export async function updateReportStatus(reportId: string, status: string, reviewedBy: string): Promise<void> {
    await connectDb()
    await ReportModel.updateOne(
        { _id: reportId },
        {
            status,
            reviewedAt: new Date(),
            reviewedBy
        }
    );
}

export async function getActiveSubscription(subscriber: string, creator: string) {
    await connectDb()
    const subscription = await SubscriptionModel.findOne({
        subscriber,
        creator,
        isActive: true
    }).lean();
    return subscription;
}

export async function getCreatorSubscribers(creator: string) {
    await connectDb()
    const subscribers = await SubscriptionModel.find({
        creator,
        isActive: true
    })
    .populate('subscriber', 'username avatar')
    .sort({ createdAt: -1 })
    .lean();
    return subscribers;
}

export async function getSubscriberSubscriptions(subscriber: string) {
    await connectDb()
    const subscriptions = await SubscriptionModel.find({
        subscriber,
        isActive: true
    }).lean();
    return subscriptions;
}

export async function getBillingHistory(subscriber: string) {
    await connectDb()
    // Get purchases (unlocks)
    const purchases = await PurchaseModel.find({ userId: subscriber })
        .populate('postId', 'creatorId')
        .sort({ createdAt: -1 })
        .lean();

    // Get subscriptions
    const subscriptions = await SubscriptionModel.find({
        subscriber,
        isActive: true
    }).lean();

    const history = [
        ...purchases.map(p => ({
            id: p._id.toString(),
            type: 'unlock' as const,
            amount: p.amount,
            description: `Content unlock`,
            date: p.createdAt.getTime(),
            postId: (p.postId as any)._id?.toString()
        })),
        ...subscriptions.map(s => ({
            id: s._id.toString(),
            type: 'subscription' as const,
            amount: s.totalPaid,
            description: `Subscription to creator`,
            date: s.createdAt.getTime(),
            creator: s.creator
        }))
    ];

    return history.sort((a, b) => b.date - a.date);
}

export async function cancelSubscription(subscriptionId: string, subscriber: string): Promise<void> {
    await connectDb()
    await SubscriptionModel.updateOne(
        { _id: subscriptionId, subscriber },
        { isActive: false, autoRenew: false }
    );
}

export async function manualRenewSubscription(subscriptionId: string, subscriber: string) {
    await connectDb()
    const subscription = await SubscriptionModel.findOne({
        _id: subscriptionId,
        subscriber
    });

    if (!subscription) throw new Error("Subscription not found");

    // Would need tier information - simplified for now
    return {
        tierId: subscription.tierId,
        price: 10, // Placeholder
        creator: subscription.creator,
    };
}

export async function renewSubscription(subscriptionId: string, amount: number): Promise<void> {
    await connectDb()
    const now = new Date();
    await SubscriptionModel.updateOne(
        { _id: subscriptionId, isActive: true, autoRenew: true },
        {
            endDate: new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)),
            lastPaymentDate: now,
            $inc: { totalPaid: amount }
        }
    );
}

export async function hasSubscriptionAccess(subscriber: string, creator: string): Promise<boolean> {
    const subscription = await getActiveSubscription(subscriber, creator);
    return !!subscription && subscription.endDate > new Date();
}

export async function togglePostPin(postId: string, author: string): Promise<void> {
    // Pinning not implemented yet
    throw new Error("Post pinning not yet implemented");
}

export async function getFollowingPosts(wallet: string, limit: number = 20, offset: number = 0) {
    await connectDb()

    // Get users this wallet is following
    const follows = await FollowModel.find({ follower: wallet }).lean();
    const followingWallets = follows.map(f => f.following);

    if (followingWallets.length === 0) {
        return [];
    }

    // Get posts from followed users
    const posts = await PostModel.find({
        creatorId: { $in: followingWallets }
    })
    .populate('creatorId', 'username bio avatar walletAddress')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .lean();

    return posts;
}


