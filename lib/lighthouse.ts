export const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY || '4cfee00f.8a22ed7fc4da4febb4f82e3b76cda16b'

export async function uploadToLighthouse(buffer: Buffer, filename: string): Promise<string> {
    const lighthouse = require('@lighthouse-web3/sdk')

    try {
        const uploadResponse = await lighthouse.uploadBuffer(buffer, LIGHTHOUSE_API_KEY)

        if (!uploadResponse?.data?.Hash) {
            throw new Error('Lighthouse upload failed: No hash returned')
        }

        return uploadResponse.data.Hash
    } catch (error) {
        console.error('Lighthouse upload error:', error)
        throw error
    }
}
