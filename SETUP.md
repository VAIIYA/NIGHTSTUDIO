# Quick Setup Guide

## 1. Install Dependencies

```bash
yarn install
# or
npm install
```

## 2. Create Environment File

Create a `.env.local` file in the root directory with the following variables:

```env
# Required: Lighthouse.storage API Key
# Get one at: https://lighthouse.storage
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here

# Required: Platform Wallet Address (for receiving fees)
# This must be a valid Solana mainnet wallet address
NEXT_PUBLIC_PLATFORM_WALLET=your_platform_wallet_address_here

# Optional: Custom RPC URL (highly recommended for production)
# Default uses public RPC which is rate-limited
# Recommended services: Helius, QuickNode, Alchemy, dRPC
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
```

## 3. Generate PWA Icons

Place your PWA icons in `public/icons/`:
- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)

You can use tools like [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) to generate these.

## 4. Run Development Server

```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Test with Small Amounts

⚠️ **IMPORTANT**: Before using in production:
- Test with very small amounts (0.01-0.1 USDC)
- Verify all transactions on [Solscan](https://solscan.io)
- Double-check wallet addresses
- Ensure you have enough SOL for transaction fees

## Next Steps

- Configure a production database (Upstash Redis or Vercel Postgres)
- Set up a paid RPC endpoint for better performance
- Deploy to Vercel or your preferred hosting platform
- Test all payment flows thoroughly

For detailed information, see [README.md](./README.md).

