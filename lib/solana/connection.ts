import { Connection } from "@solana/web3.js";
import { DEFAULT_RPC_URL } from "./constants";

// Get RPC URL from environment or use default
// WARNING: Default RPC is rate-limited. For production, use:
// - Helius: https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
// - QuickNode: https://YOUR_ENDPOINT.solana-mainnet.quiknode.pro/YOUR_KEY
// - Alchemy: https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
// - dRPC: https://lb.drpc.org/ogrq?api_key=YOUR_KEY
export function getConnection(): Connection {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || DEFAULT_RPC_URL;
  
  return new Connection(rpcUrl, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60000,
  });
}

