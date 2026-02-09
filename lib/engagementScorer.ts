import InteractionModel from '@/models/Interaction'

/**
 * Calculate engagement score for a post based on interactions
 * Formula: (likes × 1.0) + (comments × 2.0) + (reposts × 3.0)
 * with time decay: score × (1 / (1 + hoursSincePost / 24))
 */
export async function calculateEngagementScore(
    postId: string,
    createdAt: Date
): Promise<number> {
    // Aggregate interactions for this post
    const interactions = await InteractionModel.aggregate([
        { $match: { postId } },
        {
            $group: {
                _id: '$postId',
                likes: { $sum: { $cond: [{ $eq: ['$type', 'like'] }, 1, 0] } },
                comments: { $sum: { $cond: [{ $eq: ['$type', 'comment'] }, 1, 0] } },
                reposts: { $sum: { $cond: [{ $eq: ['$type', 'repost'] }, 1, 0] } },
            }
        }
    ])

    if (interactions.length === 0) {
        return 0
    }

    const { likes, comments, reposts } = interactions[0]

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
