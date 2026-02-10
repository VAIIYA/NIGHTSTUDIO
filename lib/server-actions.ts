"use server";

import { connectDb } from './db';
import { UserModel, CreatorModel } from '../models/User';
import { PostModel, InteractionModel } from '../models/Post';
import { SubscriptionModel, SubscriptionTierModel, NotificationModel } from '../models/Subscription';
import { FollowModel } from '../models/Follow';
import { validateData, sanitizeString, CreatePostSchema, CreateUnlockSchema, CreateSubscriptionSchema, CreateSubscriptionTierSchema } from "./validation";
import { extractHashtags } from "./engagementScorer";
import mongoose from 'mongoose';

// Post Functions
export async function createPost(data: any) {
    await connectDb();
    const validatedData = validateData(CreatePostSchema, {
        ...data,
        content: sanitizeString(data.content),
    }) as any;

    const hashtags = extractHashtags(validatedData.content);

    const post = new PostModel({
        creatorId: validatedData.author,
        content: validatedData.content,
        priceUSDC: validatedData.imagePrice || 0,
        hashtags,
    });

    await post.save();
    return JSON.parse(JSON.stringify(post));
}

export async function getPosts(limit: number = 20, offset: number = 0) {
    await connectDb();
    const posts = await PostModel.find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('creatorId')
        .lean();

    return JSON.parse(JSON.stringify(posts));
}

export async function getPost(id: string) {
    await connectDb();
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const post = await PostModel.findById(id).populate('creatorId').lean();
    return JSON.parse(JSON.stringify(post));
}

export async function getPostsByAuthor(authorId: string, limit: number = 100, offset: number = 0) {
    await connectDb();
    const posts = await PostModel.find({ creatorId: authorId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('creatorId')
        .lean();
    return JSON.parse(JSON.stringify(posts));
}

export async function togglePostPin(postId: string, creatorWallet: string) {
    await connectDb();
    const creator = await CreatorModel.findOne({ walletAddress: creatorWallet });
    if (!creator) throw new Error("Creator not found");

    const post = await PostModel.findOne({ _id: postId, creatorId: creator._id });
    if (!post) throw new Error("Post not found or not owned by creator");

    // Unpin others
    await PostModel.updateMany({ creatorId: creator._id, pinned: true }, { pinned: false });

    // Toggle
    post.pinned = !post.pinned;
    await post.save();
    return { success: true, pinned: post.pinned };
}

// Interaction/Unlock Functions
export async function createUnlock(data: any) {
    await connectDb();
    const validatedData = validateData(CreateUnlockSchema, data) as any;

    const post = await PostModel.findById(validatedData.postId);
    if (!post) throw new Error("Post not found");

    if (!post.unlockedUsers.includes(validatedData.wallet)) {
        post.unlockedUsers.push(validatedData.wallet);
        await post.save();

        // Notify creator
        const creator = await CreatorModel.findById(post.creatorId);
        if (creator && creator.walletAddress !== validatedData.wallet) {
            const notification = new NotificationModel({
                recipient: creator.walletAddress,
                sender: validatedData.wallet,
                type: 'unlock',
                message: `Someone unlocked your content for ${validatedData.amount} USDC`,
                amount: validatedData.amount,
                postId: validatedData.postId
            });
            await notification.save();
        }
    }

    return { success: true };
}

export async function hasUnlocked(postId: string, wallet: string) {
    await connectDb();
    if (!mongoose.Types.ObjectId.isValid(postId)) return false;
    const post = await PostModel.findOne({ _id: postId, unlockedUsers: wallet });
    return !!post;
}

// Profile Functions
export async function getOrCreateProfile(wallet: string) {
    await connectDb();
    let creator = await CreatorModel.findOne({ walletAddress: wallet }).lean();

    if (!creator) {
        let user = await UserModel.findOne({ walletAddress: wallet });
        if (!user) {
            user = new UserModel({ walletAddress: wallet });
            await user.save();
        }

        const newCreator = new CreatorModel({
            userId: user._id,
            walletAddress: wallet,
        });
        await newCreator.save();
        creator = await CreatorModel.findById(newCreator._id).lean();
    }

    return JSON.parse(JSON.stringify(creator));
}

export async function getProfile(wallet: string) {
    await connectDb();
    const creator = await CreatorModel.findOne({ walletAddress: wallet }).lean();
    return JSON.parse(JSON.stringify(creator));
}

export async function updateProfile(wallet: string, updates: any) {
    await connectDb();
    const creator = await CreatorModel.findOne({ walletAddress: wallet });
    if (!creator) throw new Error("Profile not found");

    if (updates.username && updates.username !== creator.username) {
        const existing = await CreatorModel.findOne({ username: updates.username });
        if (existing) throw new Error("Username already taken");
    }

    const allowedUpdates = ['username', 'bio', 'avatar', 'location', 'displayName', 'socialLinks', 'hashtags'];
    for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
            (creator as any)[key] = updates[key];
        }
    }

    await creator.save();
    return JSON.parse(JSON.stringify(creator));
}

export async function searchProfiles(query: string, limit: number = 20, offset: number = 0) {
    await connectDb();
    const creators = await CreatorModel.find({
        $or: [
            { username: { $regex: query, $options: 'i' } },
            { bio: { $regex: query, $options: 'i' } }
        ]
    })
        .skip(offset)
        .limit(limit)
        .lean();
    return JSON.parse(JSON.stringify(creators));
}

export async function getRandomProfiles(limit: number = 20) {
    await connectDb();
    const creators = await CreatorModel.aggregate([{ $sample: { size: limit } }]);
    return JSON.parse(JSON.stringify(creators));
}

export async function searchPosts(query: string, limit: number = 20, offset: number = 0) {
    await connectDb();
    const posts = await PostModel.find({
        $or: [
            { content: { $regex: query, $options: 'i' } },
            { hashtags: { $regex: query, $options: 'i' } }
        ]
    })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('creatorId')
        .lean();
    return JSON.parse(JSON.stringify(posts));
}

// Follow Functions
export async function followUser(followerWallet: string, followingWallet: string) {
    await connectDb();
    if (followerWallet === followingWallet) throw new Error("Cannot follow yourself");

    const existing = await FollowModel.findOne({ follower: followerWallet, following: followingWallet });
    if (existing) throw new Error("Already following");

    const follow = new FollowModel({ follower: followerWallet, following: followingWallet });
    await follow.save();

    const notification = new NotificationModel({
        recipient: followingWallet,
        sender: followerWallet,
        type: 'follow',
        message: 'Someone started following you'
    });
    await notification.save();

    return JSON.parse(JSON.stringify(follow));
}

export async function unfollowUser(followerWallet: string, followingWallet: string) {
    await connectDb();
    await FollowModel.deleteOne({ follower: followerWallet, following: followingWallet });
}

export async function isFollowing(followerWallet: string, followingWallet: string) {
    await connectDb();
    const follow = await FollowModel.findOne({ follower: followerWallet, following: followingWallet });
    return !!follow;
}

export async function getFollowers(wallet: string, limit: number = 50, offset: number = 0) {
    await connectDb();
    const follows = await FollowModel.find({ following: wallet })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
    const followerWallets = follows.map(f => f.follower);
    const creators = await CreatorModel.find({ walletAddress: { $in: followerWallets } }).lean();
    return JSON.parse(JSON.stringify(creators));
}

export async function getFollowing(wallet: string, limit: number = 50, offset: number = 0) {
    await connectDb();
    const follows = await FollowModel.find({ follower: wallet })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
    const followingWallets = follows.map(f => f.following);
    const creators = await CreatorModel.find({ walletAddress: { $in: followingWallets } }).lean();
    return JSON.parse(JSON.stringify(creators));
}

// Like Functions
export async function likePost(postId: string, wallet: string) {
    await connectDb();
    const user = await UserModel.findOne({ walletAddress: wallet });
    if (!user) throw new Error("User not found");

    const existing = await InteractionModel.findOne({ postId, userId: user._id, type: 'like' });
    if (existing) throw new Error("Already liked");

    const interaction = new InteractionModel({
        postId,
        userId: user._id,
        type: 'like'
    });
    await interaction.save();

    await PostModel.findByIdAndUpdate(postId, { $inc: { 'stats.likes': 1 } });

    // Notify creator
    const post = await PostModel.findById(postId);
    if (post) {
        const creator = await CreatorModel.findById(post.creatorId);
        if (creator && creator.walletAddress !== wallet) {
            const notification = new NotificationModel({
                recipient: creator.walletAddress,
                sender: wallet,
                type: 'like',
                message: 'Someone liked your post',
                postId
            });
            await notification.save();
        }
    }

    return JSON.parse(JSON.stringify(interaction));
}

export async function unlikePost(postId: string, wallet: string) {
    await connectDb();
    const user = await UserModel.findOne({ walletAddress: wallet });
    if (!user) return;
    await InteractionModel.deleteOne({ postId, userId: user._id, type: 'like' });
    await PostModel.findByIdAndUpdate(postId, { $inc: { 'stats.likes': -1 } });
}

export async function hasLikedPost(postId: string, wallet: string) {
    await connectDb();
    const user = await UserModel.findOne({ walletAddress: wallet });
    if (!user) return false;
    const like = await InteractionModel.findOne({ postId, userId: user._id, type: 'like' });
    return !!like;
}

export async function getPostLikes(postId: string) {
    await connectDb();
    const likes = await InteractionModel.find({ postId, type: 'like' })
        .populate('userId')
        .sort({ createdAt: -1 })
        .lean();
    return JSON.parse(JSON.stringify(likes));
}

// Comment Functions
export async function addComment(postId: string, authorWallet: string, content: string) {
    await connectDb();
    const user = await UserModel.findOne({ walletAddress: authorWallet });
    if (!user) throw new Error("User not found");

    const interaction = new InteractionModel({
        postId,
        userId: user._id,
        type: 'comment',
        content: sanitizeString(content)
    });
    await interaction.save();

    await PostModel.findByIdAndUpdate(postId, { $inc: { 'stats.comments': 1 } });

    // Notify creator
    const post = await PostModel.findById(postId);
    if (post) {
        const creator = await CreatorModel.findById(post.creatorId);
        if (creator && creator.walletAddress !== authorWallet) {
            const notification = new NotificationModel({
                recipient: creator.walletAddress,
                sender: authorWallet,
                type: 'comment',
                message: 'Someone commented on your post',
                postId
            });
            await notification.save();
        }
    }

    return JSON.parse(JSON.stringify(interaction));
}

export async function getPostComments(postId: string, limit: number = 50, offset: number = 0) {
    await connectDb();
    const comments = await InteractionModel.find({ postId, type: 'comment' })
        .populate('userId')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
    return JSON.parse(JSON.stringify(comments));
}

// Repost Functions
export async function repostPost(postId: string, authorWallet: string, content?: string) {
    await connectDb();
    const user = await UserModel.findOne({ walletAddress: authorWallet });
    if (!user) throw new Error("User not found");

    const interaction = new InteractionModel({
        postId,
        userId: user._id,
        type: 'repost',
        content: content ? sanitizeString(content) : undefined
    });
    await interaction.save();

    await PostModel.findByIdAndUpdate(postId, { $inc: { 'stats.reposts': 1 } });

    // Notify creator
    const post = await PostModel.findById(postId);
    if (post) {
        const creator = await CreatorModel.findById(post.creatorId);
        if (creator && creator.walletAddress !== authorWallet) {
            const notification = new NotificationModel({
                recipient: creator.walletAddress,
                sender: authorWallet,
                type: 'repost',
                message: 'Someone reposted your post',
                postId
            });
            await notification.save();
        }
    }

    return JSON.parse(JSON.stringify(interaction));
}

export async function deleteRepost(postId: string, wallet: string) {
    await connectDb();
    const user = await UserModel.findOne({ walletAddress: wallet });
    if (!user) return;
    await InteractionModel.deleteOne({ postId, userId: user._id, type: 'repost' });
    await PostModel.findByIdAndUpdate(postId, { $inc: { 'stats.reposts': -1 } });
}

export async function hasRepostedPost(postId: string, wallet: string) {
    await connectDb();
    const user = await UserModel.findOne({ walletAddress: wallet });
    if (!user) return false;
    const repost = await InteractionModel.findOne({ postId, userId: user._id, type: 'repost' });
    return !!repost;
}

export async function getPostReposts(postId: string) {
    await connectDb();
    const reposts = await InteractionModel.find({ postId, type: 'repost' })
        .populate('userId')
        .sort({ createdAt: -1 })
        .lean();
    return JSON.parse(JSON.stringify(reposts));
}

// Subscription Functions
export async function createSubscriptionTier(data: any) {
    await connectDb();
    const tier = new SubscriptionTierModel(data);
    await tier.save();
    return JSON.parse(JSON.stringify(tier));
}

export async function getCreatorTiers(creatorWallet: string) {
    await connectDb();
    const tiers = await SubscriptionTierModel.find({ creator: creatorWallet, isActive: true }).sort({ price: 1 }).lean();
    return JSON.parse(JSON.stringify(tiers));
}

export async function updateSubscriptionTier(tierId: string, creatorWallet: string, updates: any) {
    await connectDb();
    const tier = await SubscriptionTierModel.findOneAndUpdate(
        { _id: tierId, creator: creatorWallet },
        { $set: updates },
        { new: true }
    ).lean();
    return JSON.parse(JSON.stringify(tier));
}

export async function subscribeToTier(data: any) {
    await connectDb();
    const tier = await SubscriptionTierModel.findById(data.tierId);
    if (!tier) throw new Error("Tier not found");

    const subscription = new SubscriptionModel({
        subscriber: data.subscriber,
        creator: data.creator,
        tierId: data.tierId,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        totalPaid: tier.price
    });
    await subscription.save();

    // Notify creator
    const notification = new NotificationModel({
        recipient: data.creator,
        sender: data.subscriber,
        type: 'subscription',
        message: `New subscriber! Someone subscribed for ${tier.price} USDC/month`,
        amount: tier.price
    });
    await notification.save();

    return JSON.parse(JSON.stringify(subscription));
}

export async function getActiveSubscription(subscriber: string, creator: string) {
    await connectDb();
    const subscription = await SubscriptionModel.findOne({
        subscriber,
        creator,
        isActive: true,
        endDate: { $gt: new Date() }
    }).lean();
    return JSON.parse(JSON.stringify(subscription));
}

export async function hasSubscriptionAccess(subscriber: string, creator: string) {
    await connectDb();
    const sub = await getActiveSubscription(subscriber, creator);
    return !!sub;
}

export async function getCreatorSubscribers(creatorWallet: string) {
    await connectDb();
    const subs = await SubscriptionModel.find({ creator: creatorWallet, isActive: true }).lean();
    return JSON.parse(JSON.stringify(subs));
}

export async function getSubscriberSubscriptions(subscriberWallet: string) {
    await connectDb();
    const subs = await SubscriptionModel.find({ subscriber: subscriberWallet, isActive: true }).lean();
    return JSON.parse(JSON.stringify(subs));
}

export async function cancelSubscription(id: string, wallet: string) {
    await connectDb();
    await SubscriptionModel.findOneAndUpdate({ _id: id, subscriber: wallet }, { isActive: false, autoRenew: false });
}

export async function renewSubscription(id: string, amount: number) {
    await connectDb();
    const sub = await SubscriptionModel.findById(id);
    if (!sub) return;
    sub.endDate = new Date(sub.endDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    sub.totalPaid += amount;
    await sub.save();
}

// Notification Functions
export async function getNotifications(wallet: string, limit: number = 50, offset: number = 0) {
    await connectDb();
    const notifications = await NotificationModel.find({ recipient: wallet })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
    return JSON.parse(JSON.stringify(notifications));
}

export async function getUnreadNotificationCount(wallet: string) {
    await connectDb();
    const count = await NotificationModel.countDocuments({ recipient: wallet, isRead: false });
    return count;
}

export async function markNotificationAsRead(id: string) {
    await connectDb();
    await NotificationModel.findByIdAndUpdate(id, { isRead: true });
}

export async function markAllNotificationsAsRead(wallet: string) {
    await connectDb();
    await NotificationModel.updateMany({ recipient: wallet, isRead: false }, { isRead: true });
}

export async function deleteNotification(id: string, wallet: string) {
    await connectDb();
    await NotificationModel.deleteOne({ _id: id, recipient: wallet });
}

// Report Functions
export async function reportContent(data: any) {
    await connectDb();
    return { success: true };
}

export async function getReports() {
    return [];
}

export async function updateReportStatus() {
}

// Billing
export async function getBillingHistory(wallet: string) {
    await connectDb();
    const subscriptions = await SubscriptionModel.find({ subscriber: wallet }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(subscriptions));
}
