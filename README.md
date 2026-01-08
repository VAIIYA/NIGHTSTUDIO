# NightStudio

**⚠️ MAINNET ONLY - REAL MONEY AT RISK ⚠️**

A Twitter clone with OnlyFans-style paid image unlocks, built entirely on **Solana MAINNET**. This application handles **REAL USDC** transactions - all payments are final and irreversible.

## 🚨 CRITICAL WARNINGS

### ⚠️ This App Uses Real Money

- **MAINNET ONLY**: This application is configured for Solana mainnet only. There is NO devnet mode or toggle.
- **REAL USDC**: All payments use real USDC (SPL Token) on mainnet. Transactions are final and cannot be reversed.
- **TEST SMALL AMOUNTS FIRST**: Strongly recommended to test with very small amounts (0.01-0.1 USDC) initially.
- **DOUBLE-CHECK ADDRESSES**: Always verify wallet addresses and transaction details before confirming payments.
- **PLATFORM FEE**: The platform takes a configurable fee (default 10%) on all paid unlocks.

### Security Notes

- **Never expose private keys**: Private keys should never be stored in code, environment variables, or committed to git.
- **Validate transactions server-side**: In production, always validate transactions on the server before recording unlocks.
- **Use secure RPC**: The default RPC endpoint is rate-limited. Use a paid RPC service (Helius, QuickNode, Alchemy, dRPC) for production.
- **Test thoroughly**: Test all payment flows with small amounts before deploying to production.

## Features

- 🔐 **Wallet Authentication**: Connect with Phantom, Backpack, Solflare, or Ledger
- 💰 **Real USDC Payments**: All payments use official Circle USDC on Solana mainnet
- 🖼️ **IPFS Image Storage**: Images stored decentralized on IPFS via Lighthouse.storage
- 🔒 **Paid Content Unlocks**: Blurred preview with paid unlock functionality
- 📱 **PWA Mobile-First**: Progressive Web App with bottom navigation, scales to desktop
- 🎨 **Dark Mode**: Sleek dark UI with Solana brand colors (#9945FF purple, #14F195 neon green)

## Tech Stack

- **Next.js 15** (App Router)
- **Solana Web3.js** ^1.95+
- **Solana SPL Token** ^0.4+ (Token 2022 support)
- **Solana Wallet Adapter** (React)
- **Lighthouse.storage** (IPFS)
- **Tailwind CSS** + **shadcn/ui**
- **TypeScript**

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Solana wallet (Phantom, Backpack, Solflare, etc.)
- USDC on Solana mainnet (for testing payments)
- Lighthouse.storage API key ([Get one here](https://lighthouse.storage))

## Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd NIGHTSTUDIO
```

2. **Install dependencies**

```bash
yarn install
# or
npm install
# or
pnpm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

- `MONGODB_URI`: Your MongoDB Atlas connection string (required)
- `NEXT_PUBLIC_LIGHTHOUSE_STORAGE` or `NEXT_PUBLIC_LIGHTHOUSE_API_KEY`: Your Lighthouse.storage API key
- `NEXT_PUBLIC_PLATFORM_WALLET`: Your Solana wallet address for receiving platform fees
- `NEXT_PUBLIC_RPC_URL`: (Optional) Custom RPC endpoint. Default uses public RPC (rate-limited)

**Example `.env.local`:**

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
NEXT_PUBLIC_LIGHTHOUSE_STORAGE=your_lighthouse_api_key_here
NEXT_PUBLIC_PLATFORM_WALLET=YourPlatformWalletAddressHere
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

4. **Run the development server**

```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI` (required)
   - `NEXT_PUBLIC_LIGHTHOUSE_STORAGE` or `NEXT_PUBLIC_LIGHTHOUSE_API_KEY`
   - `NEXT_PUBLIC_PLATFORM_WALLET`
   - `NEXT_PUBLIC_RPC_URL` (recommended)
4. Deploy

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:

- `MONGODB_URI`: Required for database storage
- `NEXT_PUBLIC_LIGHTHOUSE_STORAGE` or `NEXT_PUBLIC_LIGHTHOUSE_API_KEY`: Required for image uploads
- `NEXT_PUBLIC_PLATFORM_WALLET`: Required for receiving platform fees
- `NEXT_PUBLIC_RPC_URL`: **Highly recommended** - use a paid RPC service for production

## Project Structure

```
├── app/
│   ├── layout.tsx               # Root layout + WalletProvider + Toaster
│   ├── page.tsx                 # Main infinite-scroll feed
│   ├── profile/[wallet]/page.tsx
│   ├── post/[id]/page.tsx
│   ├── compose/page.tsx         # Create post + image upload + paid toggle
│   ├── notifications/page.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── Navbar.tsx
│   ├── MobileBottomNav.tsx
│   ├── DesktopSideNav.tsx
│   ├── TweetCard.tsx
│   ├── LockedImage.tsx          # Blur + unlock CTA + payment modal
│   ├── WalletMultiButton.tsx
│   ├── ImageUploadWithPrice.tsx
│   └── PaymentConfirmModal.tsx  # Transaction confirmation
│
├── lib/
│   ├── solana/
│   │   ├── providers.tsx        # WalletAdapterProvider (mainnet)
│   │   ├── connection.ts        # RPC connection
│   │   ├── usdc.ts              # USDC transfer helpers
│   │   └── constants.ts         # USDC mint, cluster, etc.
│   ├── lighthouse.ts            # IPFS upload helper
│   └── server-actions.ts        # Server actions for posts/unlocks
│
├── hooks/
│   ├── useWalletStatus.ts
│   └── useHasUnlocked.ts
│
└── types/
    └── index.ts
```

## Key Technical Details

### USDC Configuration

- **Mint Address**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` (Official Circle USDC)
- **Decimals**: 6
- **Network**: Solana Mainnet only

### Payment Flow

1. User clicks "Unlock" on a blurred image
2. Payment modal shows transaction details (price, fee, recipient)
3. User confirms payment
4. Transaction is signed and sent to Solana mainnet
5. Transaction is confirmed
6. Unlock is recorded in database
7. Original image is displayed

### Platform Fee

- Default: 10% of unlock price
- Fee is split: Platform receives fee, creator receives remainder
- Platform wallet address: Set via `NEXT_PUBLIC_PLATFORM_WALLET` env var

### Image Storage

- Images are uploaded to IPFS via Lighthouse.storage
- Two versions are stored:
  - **Blurred**: Public preview (blurred with CSS filter)
  - **Original**: Unlocked content (accessible after payment)
- Both versions are stored on IPFS with unique CIDs

### Database

The application uses **MongoDB Atlas** for persistent storage:

- **Posts**: Stored in `posts` collection, indexed by `createdAt`, `author`, and `id`
- **Unlocks**: Stored in `unlocks` collection, indexed by `postId`, `wallet`, and `postId+wallet` combination
- **Connection**: Uses MongoDB connection pooling for optimal performance
- **Environment Variable**: `MONGODB_URI` must be set in your environment

The database connection is managed in `lib/mongodb.ts` and all database operations are in `lib/server-actions.ts`.

## Testing Recommendations

1. **Start Small**: Test with 0.01-0.1 USDC first
2. **Test Payment Flow**: Create a post with a paid image, unlock it from another wallet
3. **Verify Transactions**: Check transactions on [Solscan](https://solscan.io)
4. **Test Edge Cases**: Insufficient balance, cancelled transactions, etc.

## Troubleshooting

### "LIGHTHOUSE_API_KEY not set"

Make sure you've set `NEXT_PUBLIC_LIGHTHOUSE_API_KEY` in your `.env.local` file.

### "Insufficient USDC"

Ensure your wallet has enough USDC. You can get USDC on Solana via:
- [Jupiter](https://jup.ag) (swap from SOL)
- [Coinbase](https://coinbase.com) (direct USDC on Solana)
- Other exchanges

### RPC Rate Limiting

If you see RPC errors, switch to a paid RPC service:
- [Helius](https://helius.dev)
- [QuickNode](https://quicknode.com)
- [Alchemy](https://alchemy.com)
- [dRPC](https://drpc.org)

### Transaction Failures

- Check your wallet has enough SOL for transaction fees
- Verify you have enough USDC balance
- Ensure the recipient wallet address is correct
- Check network congestion on [Solana Status](https://status.solana.com)

## License

MIT

## Disclaimer

This software is provided "as is" without warranty. Use at your own risk. The developers are not responsible for any financial losses resulting from the use of this application. Always test with small amounts first and verify all transactions before confirming.

---

**Remember: This app uses REAL MONEY. Test thoroughly with small amounts before deploying to production.**
