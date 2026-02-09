# NIGHTSTUDIO

A production-ready web3 creator platform built with Next.js, Solana, and MongoDB. Creators post images (blurred by default), users unlock via USDC payments on Solana. Secure, scalable, and deployable on Vercel.

## Features

- **Wallet Authentication**: Solana wallet login with signature verification (Phantom, Solflare).
- **Creator Onboarding**: Register as creator, upload bio/avatar.
- **Image Upload & Storage**: Client-side blur generation, Storacha IPFS storage.
- **Payment Flow**: On-chain USDC unlocks with 90% to creator, 10% platform fee.
- **Earnings Dashboard**: Charts, purchase history, fee breakdown.
- **Explore Page**: Search creators, filter by price, trending posts.
- **Content Moderation**: Image validation, user reporting, admin review queue.
- **Security**: Nonce-based replay protection, rate limiting, server-side verification.

## Tech Stack

- **Frontend**: Next.js 13 (App Router), TypeScript, TailwindCSS, Solana Wallet Adapter, Recharts.
- **Backend**: Next.js API Routes, MongoDB Atlas, Mongoose.
- **Blockchain**: Solana (USDC SPL token), Storacha (IPFS storage).
- **Deployment**: Vercel.

## Getting Started

1. **Clone the repo**:
   ```bash
   git clone https://github.com/meneergroot/BUNNY-RANCH.git
   cd bunny-ranch
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Copy `.env.example` to `.env.local` and fill:
   - `MONGODB_URI`: MongoDB Atlas connection string. (NIGHTSTUDIO)
   - `STORACHA_SPACE_DID`: Storacha space DID.
   - `PLATFORM_SOLANA_WALLET`: Platform Solana wallet address.
   - `SOLANA_NETWORK`: 'mainnet-beta'.
   - `USDC_MINT_ADDRESS`: USDC mint address on Solana.
   - `JWT_SECRET`: Random secret for JWT.

4. **Run locally**:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## Deployment to Vercel

1. Push to GitHub.
2. Connect Vercel to the repo.
3. Set environment variables in Vercel dashboard.
4. Deploy.

## API Endpoints

- `POST /api/auth/verify`: Wallet login.
- `POST /api/creators/onboard`: Become creator.
- `POST /api/upload`: Upload image to Storacha.
- `POST /api/posts/create`: Create post.
- `GET /api/posts/search`: Search/filter posts.
- `POST /api/purchases/request-nonce`: Get unlock nonce.
- `POST /api/purchases/unlock`: Unlock post.
- `GET /api/creators/earnings`: Get earnings data.
- `POST /api/posts/report`: Report post.
- `GET/POST /api/admin/reports`: Admin review reports.

## Security Notes

- All payments verified on-chain.
- Nonce prevents replay attacks.
- Rate limiting on sensitive endpoints.
- Image validation and moderation.

## Contributing

PRs welcome. Ensure tests pass and code is linted.

## License

MIT.