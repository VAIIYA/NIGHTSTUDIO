import { connectDb } from './db'
import { InteractionModel } from '@/models/Post'

/**
 * Calculate engagement score for a post based on interactions
 * Formula: (likes × 1.0) + (comments × 2.0) + (reposts × 3.0)
 * with time decay: score × (1 / (1 + hoursSincePost / 24))
 */
export async function calculateEngagementScore(
    postId: string,
    createdAt: Date
): Promise<number> {
    await connectDb()

    // Fetch counts from MongoDB
    const likes = await InteractionModel.countDocuments({ postId, type: 'like' })
    const comments = await InteractionModel.countDocuments({ postId, type: 'comment' })
    const reposts = await InteractionModel.countDocuments({ postId, type: 'repost' })

    // Base engagement score with weighted actions
    const baseScore = (likes * 1.0) + (comments * 2.0) + (reposts * 3.0)

    // Apply time decay
    const now = new Date()
    const hoursSincePost = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    const timeDecayFactor = 1 / (1 + hoursSincePost / 24)

    return baseScore * timeDecayFactor
}

/**
 * Extract hashtags from text content
 * Returns normalized hashtags (lowercase, with # prefix)
 */
export function extractHashtags(text: string): string[] {
    if (!text) return []

    // Match hashtags: # followed by alphanumeric characters (2-30 chars)
    const hashtagRegex = /#([a-zA-Z0-9]{2,30})/g
    const matches = text.match(hashtagRegex)

    if (!matches) return []

    // Normalize: lowercase, keep # prefix, remove duplicates
    const normalized = matches.map(tag => tag.toLowerCase())
    return [...new Set(normalized)].slice(0, 10) // Max 10 hashtags
}

/**
 * Validate a single hashtag
 */
export function isValidHashtag(hashtag: string): boolean {
    if (!hashtag.startsWith('#')) return false
    const tag = hashtag.slice(1)
    return /^[a-zA-Z0-9]{2,30}$/.test(tag)
}
