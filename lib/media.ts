/**
 * Resolves a media CID or URL to a displayable URL.
 * Handles IPFS CIDs, base64 data URLs, and standard HTTP URLs.
 */
export function resolveMediaUrl(src: string | null | undefined): string | null {
    if (!src) return null
    if (src.startsWith('data:') || src.startsWith('http')) {
        return src
    }
    // If it looks like a mock CID from proto-mode
    if (src.startsWith('proto-mock:') || src.startsWith('QmMock')) {
        return null // Should have been handled by backend or resolved to base64
    }
    // Default to a performant IPFS gateway for CIDs
    return `https://gateway.lighthouse.storage/ipfs/${src}`
}
