"use server";

import { turso } from './turso'
import { v4 as uuidv4 } from 'uuid'
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
    const validatedData = validateData(CreatePostSchema, {
        ...data,
        content: sanitizeString(data.content),
    }) as any;

    // Extract hashtags from content
    const hashtags = extractHashtags(validatedData.content);

    const id = uuidv4();
    await turso.execute({
        sql: `INSERT INTO posts (id, creatorId, content, priceUSDC, hashtags) VALUES (?, ?, ?, ?, ?)`,
        args: [id, validatedData.author, validatedData.content, validatedData.imagePrice || 0, JSON.stringify(hashtags)]
    });

    return { id, creatorId: validatedData.author, content: validatedData.content, priceUSDC: validatedData.imagePrice || 0, hashtags };
}

export async function getPosts(limit: number = 20, offset: number = 0) {
    const result = await turso.execute({
        sql: `
            SELECT p.*, c.username, c.bio as creatorBio, c.avatar, c.walletAddress
            FROM posts p
            LEFT JOIN creators c ON p.creatorId = c.id
            ORDER BY p.createdAt DESC
            LIMIT ? OFFSET ?
        `,
        args: [limit, offset]
    });
    return result.rows.map((row: any) => ({
        ...row,
        _id: row.id,
        creatorId: {
            _id: row.creatorId,
            username: row.username,
            bio: row.creatorBio,
            avatar: row.avatar,
            walletAddress: row.walletAddress
        }
    }));
}

export async function getPost(id: string) {
    const result = await turso.execute({
        sql: `
            SELECT p.*, c.username, c.bio as creatorBio, c.avatar, c.walletAddress
            FROM posts p
            LEFT JOIN creators c ON p.creatorId = c.id
            WHERE p.id = ?
        `,
        args: [id]
    });
    if (result.rows.length === 0) return null;
    const row = result.rows[0] as any;
    return {
        ...row,
        _id: row.id,
        creatorId: {
            _id: row.creatorId,
            username: row.username,
            bio: row.creatorBio,
            avatar: row.avatar,
            walletAddress: row.walletAddress
        }
    };
}

export async function getPostsByAuthor(author: string, limit: number = 100, offset: number = 0) {
    const result = await turso.execute({
        sql: `
            SELECT p.*, c.username, c.bio as creatorBio, c.avatar, c.walletAddress
            FROM posts p
            LEFT JOIN creators c ON p.creatorId = c.id
            WHERE p.creatorId = ?
            ORDER BY p.createdAt DESC
            LIMIT ? OFFSET ?
        `,
        args: [author, limit, offset]
    });
    return result.rows.map((row: any) => ({
        ...row,
        _id: row.id,
        creatorId: {
            _id: row.creatorId,
            username: row.username,
            bio: row.creatorBio,
            avatar: row.avatar,
            walletAddress: row.walletAddress
        }
    }));
}

export async function createUnlock(data: {
    postId: string;
    wallet: string;
    txSignature: string;
    amount: number;
}) {
    const validatedData = validateData(CreateUnlockSchema, data) as any;

    const id = uuidv4();
    const nonce = `unlock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Find internal userId
    const userRes = await turso.execute({
        sql: 'SELECT id FROM users WHERE walletAddress = ?',
        args: [validatedData.wallet]
    });
    const userId = userRes.rows.length > 0 ? (userRes.rows[0] as any).id : validatedData.wallet;

    await turso.execute({
        sql: `INSERT INTO purchases (id, userId, postId, txSignature, amount, nonce) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [id, userId, validatedData.postId, validatedData.txSignature, validatedData.amount, nonce]
    });

    const postRes = await turso.execute({
        sql: `
            SELECT c.walletAddress 
            FROM posts p 
            JOIN creators c ON p.creatorId = c.id 
            WHERE p.id = ?
        `,
        args: [validatedData.postId]
    });
    if (postRes.rows.length > 0) {
        const creatorWallet = (postRes.rows[0] as any).walletAddress;
        if (creatorWallet !== validatedData.wallet) {
            const notifId = uuidv4();
            await turso.execute({
                sql: `INSERT INTO notifications (id, recipient, sender, type, message, amount, postId) VALUES (?, ?, ?, 'unlock', ?, ?, ?)`,
                args: [notifId, creatorWallet, validatedData.wallet, `Someone unlocked your content for ${validatedData.amount} USDC`, validatedData.amount, validatedData.postId]
            });
        }
    }

    return { id, ...validatedData };
}

export async function hasUnlocked(postId: string, wallet: string) {
    const result = await turso.execute({
        sql: `
            SELECT 1 FROM purchases pu
            JOIN users u ON pu.userId = u.id
            WHERE pu.postId = ? AND u.walletAddress = ?
        `,
        args: [postId, wallet]
    });
    return result.rows.length > 0;
}

export async function getUnlocksForPost(postId: string) {
    const result = await turso.execute({
        sql: `
            SELECT pu.*, u.username, u.avatar
            FROM purchases pu
            LEFT JOIN creators u ON pu.userId = u.id -- Assuming userId might be creatorId or check users table
            WHERE pu.postId = ?
            ORDER BY pu.createdAt DESC
        `,
        args: [postId]
    });
    return result.rows.map((row: any) => ({ ...row, _id: row.id }));
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
    let result = await turso.execute({
        sql: 'SELECT * FROM creators WHERE walletAddress = ?',
        args: [wallet]
    });

    if (result.rows.length === 0) {
        const userId = uuidv4();
        await turso.execute({
            sql: 'INSERT INTO users (id, walletAddress) VALUES (?, ?)',
            args: [userId, wallet]
        });
        const creatorId = uuidv4();
        await turso.execute({
            sql: 'INSERT INTO creators (id, userId, walletAddress) VALUES (?, ?, ?)',
            args: [creatorId, userId, wallet]
        });
        result = await turso.execute({
            sql: 'SELECT * FROM creators WHERE id = ?',
            args: [creatorId]
        });
    }

    const row = result.rows[0] as any;
    return { ...row, _id: row.id };
}

export async function getProfile(wallet: string) {
    const result = await turso.execute({
        sql: 'SELECT * FROM creators WHERE walletAddress = ?',
        args: [wallet]
    });
    if (result.rows.length === 0) return null;
    const row = result.rows[0] as any;
    return { ...row, _id: row.id };
}

export async function updateProfile(wallet: string, updates: any) {
    const sanitizedUpdates = {
        ...updates,
        bio: updates.bio ? sanitizeString(updates.bio) : updates.bio,
    };

    if (sanitizedUpdates.username) {
        const existing = await turso.execute({
            sql: 'SELECT 1 FROM creators WHERE username = ? AND walletAddress != ?',
            args: [sanitizedUpdates.username, wallet]
        });
        if (existing.rows.length > 0) {
            throw new Error("Username already taken");
        }
    }

    const setClause = [];
    const args = [];
    for (const [key, value] of Object.entries(sanitizedUpdates)) {
        if (['username', 'bio', 'avatar', 'location', 'displayName'].includes(key)) {
            setClause.push(`${key} = ?`);
            args.push(value);
        }
    }
    args.push(wallet);

    if (setClause.length > 0) {
        await turso.execute({
            sql: `UPDATE creators SET ${setClause.join(', ')} WHERE walletAddress = ?`,
            args
        });
    }

    return getProfile(wallet);
}

export async function searchProfiles(query: string, limit: number = 20, offset: number = 0) {
    const result = await turso.execute({
        sql: `SELECT * FROM creators WHERE username LIKE ? OR bio LIKE ? LIMIT ? OFFSET ?`,
        args: [`%${query}%`, `%${query}%`, limit, offset]
    });
    return result.rows.map((row: any) => ({ ...row, _id: row.id }));
}

export async function getRandomProfiles(limit: number = 20) {
    const result = await turso.execute({
        sql: `SELECT * FROM creators ORDER BY RANDOM() LIMIT ?`,
        args: [limit]
    });
    return result.rows.map((row: any) => ({ ...row, _id: row.id }));
}

export async function searchPosts(query: string, limit: number = 20, offset: number = 0) {
    const result = await turso.execute({
        sql: `
            SELECT p.*, c.username, c.avatar 
            FROM posts p
            LEFT JOIN creators c ON p.creatorId = c.id
            WHERE p.content LIKE ? OR p.hashtags LIKE ?
            ORDER BY p.createdAt DESC
            LIMIT ? OFFSET ?
        `,
        args: [`%${query}%`, `%${query}%`, limit, offset]
    });
    return result.rows.map((row: any) => ({
        ...row,
        _id: row.id,
        creatorId: { _id: row.creatorId, username: row.username, avatar: row.avatar }
    }));
}

export async function searchComments(query: string, limit: number = 20, offset: number = 0) {
    const result = await turso.execute({
        sql: `
            SELECT i.*, u.username, u.avatar, p.content as postContent
            FROM interactions i
            LEFT JOIN users u ON i.userId = u.id
            LEFT JOIN posts p ON i.postId = p.id
            WHERE i.type = 'comment' AND i.content LIKE ?
            ORDER BY i.createdAt DESC
            LIMIT ? OFFSET ?
        `,
        args: [`%${query}%`, limit, offset]
    });
    return result.rows.map((row: any) => ({
        id: row.id,
        postId: row.postId,
        author: row.userId,
        content: row.content,
        createdAt: new Date(row.createdAt as string).getTime(),
        authorUsername: row.username,
        authorAvatar: row.avatar
    }));
}

export async function followUser(follower: string, following: string) {
    if (follower === following) throw new Error("Cannot follow yourself");

    await turso.execute("CREATE TABLE IF NOT EXISTS follows (id TEXT PRIMARY KEY, follower TEXT NOT NULL, following TEXT NOT NULL, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(follower, following))");

    const existing = await turso.execute({
        sql: 'SELECT 1 FROM follows WHERE follower = ? AND following = ?',
        args: [follower, following]
    });
    if (existing.rows.length > 0) throw new Error("Already following");

    const id = uuidv4();
    await turso.execute({
        sql: 'INSERT INTO follows (id, follower, following) VALUES (?, ?, ?)',
        args: [id, follower, following]
    });

    const notifId = uuidv4();
    await turso.execute({
        sql: `INSERT INTO notifications (id, recipient, sender, type, message) VALUES (?, ?, ?, 'follow', 'Someone started following you')`,
        args: [notifId, following, follower]
    });

    return { id, follower, following };
}

export async function unfollowUser(follower: string, following: string): Promise<void> {
    await turso.execute({
        sql: 'DELETE FROM follows WHERE follower = ? AND following = ?',
        args: [follower, following]
    });
}

export async function isFollowing(follower: string, following: string): Promise<boolean> {
    const result = await turso.execute({
        sql: 'SELECT 1 FROM follows WHERE follower = ? AND following = ?',
        args: [follower, following]
    });
    return result.rows.length > 0;
}

export async function getFollowers(wallet: string, limit: number = 50, offset: number = 0) {
    const result = await turso.execute({
        sql: `
            SELECT c.* FROM creators c
            JOIN follows f ON c.walletAddress = f.follower
            WHERE f.following = ?
            ORDER BY f.createdAt DESC
            LIMIT ? OFFSET ?
        `,
        args: [wallet, limit, offset]
    });
    return result.rows.map((row: any) => ({ ...row, _id: row.id }));
}

export async function getFollowing(wallet: string, limit: number = 50, offset: number = 0) {
    const result = await turso.execute({
        sql: `
            SELECT c.* FROM creators c
            JOIN follows f ON c.walletAddress = f.following
            WHERE f.follower = ?
            ORDER BY f.createdAt DESC
            LIMIT ? OFFSET ?
        `,
        args: [wallet, limit, offset]
    });
    return result.rows.map((row: any) => ({ ...row, _id: row.id }));
}

export async function likePost(postId: string, wallet: string) {
    const existing = await turso.execute({
        sql: "SELECT 1 FROM interactions WHERE postId = ? AND userId = (SELECT id FROM users WHERE walletAddress = ?) AND type = 'like'",
        args: [postId, wallet]
    });
    if (existing.rows.length > 0) throw new Error("Already liked");

    const id = uuidv4();
    await turso.execute({
        sql: "INSERT INTO interactions (id, postId, userId, type) VALUES (?, ?, (SELECT id FROM users WHERE walletAddress = ?), 'like')",
        args: [id, postId, wallet]
    });

    // Notify creator
    const postRes = await turso.execute({
        sql: "SELECT c.walletAddress FROM posts p JOIN creators c ON p.creatorId = c.id WHERE p.id = ?",
        args: [postId]
    });
    if (postRes.rows.length > 0) {
        const creatorWallet = (postRes.rows[0] as any).walletAddress;
        if (creatorWallet !== wallet) {
            const notifId = uuidv4();
            await turso.execute({
                sql: `INSERT INTO notifications (id, recipient, sender, type, message, postId) VALUES (?, ?, ?, 'like', 'Someone liked your post', ?)`,
                args: [notifId, creatorWallet, wallet, postId]
            });
        }
    }

    return { id, postId, wallet, type: 'like' };
}

export async function unlikePost(postId: string, wallet: string): Promise<void> {
    await turso.execute({
        sql: "DELETE FROM interactions WHERE postId = ? AND userId = (SELECT id FROM users WHERE walletAddress = ?) AND type = 'like'",
        args: [postId, wallet]
    });
}

export async function hasLikedPost(postId: string, wallet: string): Promise<boolean> {
    const result = await turso.execute({
        sql: "SELECT 1 FROM interactions WHERE postId = ? AND userId = (SELECT id FROM users WHERE walletAddress = ?) AND type = 'like'",
        args: [postId, wallet]
    });
    return result.rows.length > 0;
}

export async function getPostLikes(postId: string) {
    const result = await turso.execute({
        sql: `
            SELECT i.*, u.username, u.avatar
            FROM interactions i
            JOIN users u ON i.userId = u.id
            WHERE i.postId = ? AND i.type = 'like'
            ORDER BY i.createdAt DESC
        `,
        args: [postId]
    });
    return result.rows.map((row: any) => ({ ...row, _id: row.id }));
}

export async function addComment(postId: string, author: string, content: string) {
    const id = uuidv4();
    await turso.execute({
        sql: "INSERT INTO interactions (id, postId, userId, type, content) VALUES (?, ?, (SELECT id FROM users WHERE walletAddress = ?), 'comment', ?)",
        args: [id, postId, author, content]
    });

    // Notify creator
    const postRes = await turso.execute({
        sql: "SELECT c.walletAddress FROM posts p JOIN creators c ON p.creatorId = c.id WHERE p.id = ?",
        args: [postId]
    });
    if (postRes.rows.length > 0) {
        const creatorWallet = (postRes.rows[0] as any).walletAddress;
        if (creatorWallet !== author) {
            const notifId = uuidv4();
            await turso.execute({
                sql: `INSERT INTO notifications (id, recipient, sender, type, message, postId) VALUES (?, ?, ?, 'comment', 'Someone commented on your post', ?)`,
                args: [notifId, creatorWallet, author, postId]
            });
        }
    }

    return { id, postId, author, content, createdAt: Date.now() };
}

export async function getPostComments(postId: string, limit: number = 50, offset: number = 0) {
    const result = await turso.execute({
        sql: `
            SELECT i.*, u.username, u.avatar
            FROM interactions i
            JOIN users u ON i.userId = u.id
            WHERE i.postId = ? AND i.type = 'comment'
            ORDER BY i.createdAt DESC
            LIMIT ? OFFSET ?
        `,
        args: [postId, limit, offset]
    });
    return result.rows.map((row: any) => ({
        ...row,
        _id: row.id,
        authorUsername: row.username,
        authorAvatar: row.avatar
    }));
}

export async function repostPost(originalPostId: string, author: string, content?: string) {
    const id = uuidv4();
    await turso.execute({
        sql: "INSERT INTO interactions (id, postId, userId, type, content) VALUES (?, ?, (SELECT id FROM users WHERE walletAddress = ?), 'repost', ?)",
        args: [id, originalPostId, author, content]
    });

    // Notify creator
    const postRes = await turso.execute({
        sql: "SELECT c.walletAddress FROM posts p JOIN creators c ON p.creatorId = c.id WHERE p.id = ?",
        args: [originalPostId]
    });
    if (postRes.rows.length > 0) {
        const creatorWallet = (postRes.rows[0] as any).walletAddress;
        if (creatorWallet !== author) {
            const notifId = uuidv4();
            await turso.execute({
                sql: `INSERT INTO notifications (id, recipient, sender, type, message, postId) VALUES (?, ?, ?, 'repost', 'Someone reposted your post', ?)`,
                args: [notifId, creatorWallet, author, originalPostId]
            });
        }
    }

    return { id, postId: originalPostId, author, type: 'repost' };
}

export async function getPostReposts(postId: string) {
    const result = await turso.execute({
        sql: `
            SELECT i.*, u.username, u.avatar
            FROM interactions i
            JOIN users u ON i.userId = u.id
            WHERE i.postId = ? AND i.type = 'repost'
            ORDER BY i.createdAt DESC
        `,
        args: [postId]
    });
    return result.rows.map((row: any) => ({ ...row, _id: row.id }));
}

export async function deleteRepost(originalPostId: string, author: string): Promise<void> {
    await turso.execute({
        sql: "DELETE FROM interactions WHERE postId = ? AND userId = (SELECT id FROM users WHERE walletAddress = ?) AND type = 'repost'",
        args: [originalPostId, author]
    });
}

export async function hasRepostedPost(originalPostId: string, wallet: string): Promise<boolean> {
    const result = await turso.execute({
        sql: "SELECT 1 FROM interactions WHERE postId = ? AND userId = (SELECT id FROM users WHERE walletAddress = ?) AND type = 'repost'",
        args: [originalPostId, wallet]
    });
    return result.rows.length > 0;
}

export async function createSubscriptionTier(data: any) {
    const id = uuidv4();
    await turso.execute({
        sql: 'INSERT INTO subscription_tiers (id, creator, name, description, price, benefits) VALUES (?, ?, ?, ?, ?, ?)',
        args: [id, data.creator, data.name, data.description, data.price, JSON.stringify(data.benefits || [])]
    });
    return { id, ...data };
}

export async function getCreatorTiers(creator: string) {
    const result = await turso.execute({
        sql: 'SELECT * FROM subscription_tiers WHERE creator = ? AND isActive = 1 ORDER BY price ASC',
        args: [creator]
    });
    return result.rows.map((row: any) => ({ ...row, _id: row.id }));
}

export async function updateSubscriptionTier(tierId: string, creator: string, updates: any) {
    const setClause = [];
    const args = [];
    for (const [key, value] of Object.entries(updates)) {
        if (['name', 'description', 'price', 'benefits', 'isActive'].includes(key)) {
            setClause.push(`${key} = ?`);
            args.push(key === 'benefits' ? JSON.stringify(value) : value);
        }
    }
    args.push(tierId, creator);

    if (setClause.length > 0) {
        await turso.execute({
            sql: `UPDATE subscription_tiers SET ${setClause.join(', ')} WHERE id = ? AND creator = ?`,
            args
        });
    }

    const res = await turso.execute({ sql: 'SELECT * FROM subscription_tiers WHERE id = ?', args: [tierId] });
    return res.rows.length > 0 ? { ...(res.rows[0] as any), _id: (res.rows[0] as any).id } : null;
}

export async function subscribeToTier(data: any) {
    const tierRes = await turso.execute({
        sql: 'SELECT * FROM subscription_tiers WHERE id = ? AND creator = ? AND isActive = 1',
        args: [data.tierId, data.creator]
    });
    if (tierRes.rows.length === 0) throw new Error("Subscription tier not found");
    const tier = tierRes.rows[0] as any;

    const id = uuidv4();
    await turso.execute({
        sql: 'INSERT INTO subscriptions (id, subscriber, creator, tierId, endDate, totalPaid) VALUES (?, ?, ?, ?, datetime(CURRENT_TIMESTAMP, "+30 days"), ?)',
        args: [id, data.subscriber, data.creator, data.tierId, tier.price]
    });

    const notifId = uuidv4();
    await turso.execute({
        sql: `INSERT INTO notifications (id, recipient, sender, type, message, amount) VALUES (?, ?, ?, 'subscription', ?, ?)`,
        args: [notifId, data.creator, data.subscriber, `New subscriber! Someone subscribed to your content for ${tier.price} USDC/month`, tier.price]
    });

    return { id, ...data };
}

export async function getActiveSubscription(subscriber: string, creator: string) {
    const result = await turso.execute({
        sql: 'SELECT * FROM subscriptions WHERE subscriber = ? AND creator = ? AND isActive = 1 AND endDate > CURRENT_TIMESTAMP',
        args: [subscriber, creator]
    });
    if (result.rows.length === 0) return null;
    const row = result.rows[0] as any;
    return { ...row, _id: row.id };
}

export async function createNotification(data: any) {
    const notifId = uuidv4();
    await turso.execute({
        sql: `INSERT INTO notifications (id, recipient, sender, type, message, postId, amount) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [notifId, data.recipient, data.sender, data.type, data.message, data.postId || null, data.amount || null]
    });
    return { id: notifId, ...data };
}

export async function getNotifications(wallet: string, limit: number = 50, offset: number = 0) {
    const result = await turso.execute({
        sql: `
            SELECT n.*, c.username, c.avatar
            FROM notifications n
            LEFT JOIN creators c ON n.sender = c.walletAddress
            WHERE n.recipient = ?
            ORDER BY n.createdAt DESC
            LIMIT ? OFFSET ?
        `,
        args: [wallet, limit, offset]
    });
    return result.rows.map((row: any) => ({
        ...row,
        _id: row.id,
        sender: { username: row.username, avatar: row.avatar }
    }));
}

export async function markNotificationAsRead(notificationId: string, recipient: string): Promise<void> {
    await turso.execute({
        sql: 'UPDATE notifications SET isRead = 1 WHERE id = ? AND recipient = ?',
        args: [notificationId, recipient]
    });
}

export async function markAllNotificationsAsRead(recipient: string): Promise<void> {
    await turso.execute({
        sql: 'UPDATE notifications SET isRead = 1 WHERE recipient = ? AND isRead = 0',
        args: [recipient]
    });
}

export async function getUnreadNotificationCount(recipient: string): Promise<number> {
    const result = await turso.execute({
        sql: 'SELECT COUNT(*) as count FROM notifications WHERE recipient = ? AND isRead = 0',
        args: [recipient]
    });
    return Number((result.rows[0] as any).count);
}

export async function deleteNotification(notificationId: string, recipient: string): Promise<void> {
    await turso.execute({
        sql: 'DELETE FROM notifications WHERE id = ? AND recipient = ?',
        args: [notificationId, recipient]
    });
}

export async function reportContent(data: any) {
    const id = uuidv4();
    await turso.execute({
        sql: 'INSERT INTO reports (id, postId, reporterId, reason) VALUES (?, ?, ?, ?)',
        args: [id, data.postId, data.reporter, data.reason]
    });
    return { id, ...data };
}

export async function getReports(status?: string, limit: number = 50, offset: number = 0) {
    let sql = 'SELECT * FROM reports';
    const args: any[] = [];
    if (status) {
        sql += ' WHERE status = ?';
        args.push(status);
    }
    sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    args.push(limit, offset);

    const result = await turso.execute({ sql, args });
    return result.rows.map((row: any) => ({ ...row, _id: row.id }));
}

export async function updateReportStatus(reportId: string, status: string, reviewedBy: string): Promise<void> {
    await turso.execute({
        sql: 'UPDATE reports SET status = ? WHERE id = ?',
        args: [status, reportId]
    });
}

export async function getCreatorSubscribers(creator: string) {
    const result = await turso.execute({
        sql: `
            SELECT s.*, c.username, c.avatar
            FROM subscriptions s
            LEFT JOIN creators c ON s.subscriber = c.walletAddress
            WHERE s.creator = ? AND s.isActive = 1
            ORDER BY s.createdAt DESC
        `,
        args: [creator]
    });
    return result.rows.map((row: any) => ({
        ...row,
        _id: row.id,
        subscriber: { username: row.username, avatar: row.avatar }
    }));
}

export async function getSubscriberSubscriptions(subscriber: string) {
    const result = await turso.execute({
        sql: 'SELECT * FROM subscriptions WHERE subscriber = ? AND isActive = 1',
        args: [subscriber]
    });
    return result.rows.map((row: any) => ({ ...row, _id: row.id }));
}

export async function getBillingHistory(subscriber: string) {
    const purchaseRes = await turso.execute({
        sql: 'SELECT * FROM purchases WHERE userId = (SELECT id FROM users WHERE walletAddress = ?) ORDER BY createdAt DESC',
        args: [subscriber]
    });
    const subRes = await turso.execute({
        sql: 'SELECT * FROM subscriptions WHERE subscriber = ? AND isActive = 1 ORDER BY createdAt DESC',
        args: [subscriber]
    });

    const history = [
        ...purchaseRes.rows.map((p: any) => ({
            id: p.id,
            type: 'unlock' as const,
            amount: p.amount,
            description: `Content unlock`,
            date: new Date(p.createdAt as string).getTime(),
            postId: p.postId
        })),
        ...subRes.rows.map((s: any) => ({
            id: s.id,
            type: 'subscription' as const,
            amount: s.totalPaid,
            description: `Subscription to creator`,
            date: new Date(s.createdAt as string).getTime(),
            creator: s.creator
        }))
    ];

    return history.sort((a, b: any) => b.date - a.date);
}

export async function cancelSubscription(subscriptionId: string, subscriber: string): Promise<void> {
    await turso.execute({
        sql: 'UPDATE subscriptions SET isActive = 0, autoRenew = 0 WHERE id = ? AND subscriber = ?',
        args: [subscriptionId, subscriber]
    });
}

export async function manualRenewSubscription(subscriptionId: string, subscriber: string) {
    const result = await turso.execute({
        sql: 'SELECT * FROM subscriptions WHERE id = ? AND subscriber = ?',
        args: [subscriptionId, subscriber]
    });

    if (result.rows.length === 0) throw new Error("Subscription not found");
    const sub = result.rows[0];

    return {
        tierId: sub.tierId,
        price: 10,
        creator: sub.creator,
    };
}

export async function renewSubscription(subscriptionId: string, amount: number): Promise<void> {
    await turso.execute({
        sql: 'UPDATE subscriptions SET endDate = datetime(CURRENT_TIMESTAMP, "+30 days"), lastPaymentDate = CURRENT_TIMESTAMP, totalPaid = totalPaid + ? WHERE id = ? AND isActive = 1 AND autoRenew = 1',
        args: [amount, subscriptionId]
    });
}

export async function hasSubscriptionAccess(subscriber: string, creator: string): Promise<boolean> {
    const sub = await getActiveSubscription(subscriber, creator);
    return !!sub;
}

export async function togglePostPin(postId: string, author: string): Promise<void> {
    throw new Error("Post pinning not yet implemented");
}

export async function getFollowingPosts(wallet: string, limit: number = 20, offset: number = 0) {
    const result = await turso.execute({
        sql: `
            SELECT p.*, c.username, c.avatar, c.walletAddress
            FROM posts p
            JOIN follows f ON p.creatorId = (SELECT id FROM creators WHERE walletAddress = f.following)
            JOIN creators c ON p.creatorId = c.id
            WHERE f.follower = ?
            ORDER BY p.createdAt DESC
            LIMIT ? OFFSET ?
        `,
        args: [wallet, limit, offset]
    });
    return result.rows.map((row: any) => ({
        ...row,
        _id: row.id,
        creatorId: { _id: row.creatorId, username: row.username, avatar: row.avatar, walletAddress: row.walletAddress }
    }));
}

export async function updateProfileStats(wallet: string, updates: any): Promise<void> {
    return;
}


