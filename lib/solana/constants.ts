import { PublicKey } from "@solana/web3.js";

// MAINNET ONLY - NO DEVNET MODE
export const CLUSTER = "mainnet-beta" as const;

// Official Circle USDC mint address on Solana mainnet
export const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

// USDC has 6 decimals
export const USDC_DECIMALS = 6;

// NIGHT platform fee percentage (1%)
export const PLATFORM_FEE_PERCENT = 1;

// Default RPC endpoint (rate-limited, recommend using paid RPC in production)
export const DEFAULT_RPC_URL = "https://api.mainnet-beta.solana.com";

