import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js'

export const USDC_MINT_ADDRESS = process.env.USDC_MINT_ADDRESS as string
export const SOLANA_NETWORK = (process.env.SOLANA_NETWORK || 'mainnet-beta') as string

export const PLATFORM_SOLANA_WALLET = process.env.PLATFORM_SOLANA_WALLET as string

export const HELIUS_RPC = process.env.HELIUS_RPC || 'https://mainnet.helius-rpc.com/?api-key=a587065c-5910-40c5-b3dc-af50da9f275d'

export const getConnection = (): Connection => {
  return new Connection(HELIUS_RPC, 'confirmed')
}

export const isSolanaAddress = (addr: string) => {
  try {
    new PublicKey(addr)
    return true
  } catch {
    return false
  }
}

/**
 * Calculates the 90/10 split in USDC base units (6 decimals).
 * @param priceUSDC Total price in USDC (e.g., 5.0)
 * @returns { creatorAmount: number, platformAmount: number }
 */
export const calculateUSDCSpit = (priceUSDC: number) => {
  const totalBaseUnits = Math.round(priceUSDC * 1e6)
  const platformAmount = Math.floor(totalBaseUnits * 0.1)
  const creatorAmount = totalBaseUnits - platformAmount
  return { creatorAmount, platformAmount, totalBaseUnits }
}

/**
 * Calculates a 3-way split (90% creator, 5% platform, 5% referrer)
 * @param priceUSDC Total price in USDC
 * @returns { creatorAmount, platformAmount, referrerAmount }
 */
export const calculateReferralSplit = (priceUSDC: number) => {
  const totalBaseUnits = Math.round(priceUSDC * 1e6)
  const platformAmount = Math.floor(totalBaseUnits * 0.05)
  const referrerAmount = Math.floor(totalBaseUnits * 0.05)
  const creatorAmount = totalBaseUnits - platformAmount - referrerAmount
  return { creatorAmount, platformAmount, referrerAmount, totalBaseUnits }
}
