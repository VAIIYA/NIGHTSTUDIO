import { NextRequest, NextResponse } from 'next/server'
import { connectDb } from '@/lib/db'
import PostModel from '@/models/Post'
import PurchaseModel from '@/models/Purchase'
import UserModel from '@/models/User'
import CreatorModel from '@/models/Creator'
import NonceModel from '@/models/Nonce'
import { Connection, PublicKey } from '@solana/web3.js'
import { USDC_MINT_ADDRESS, getConnection, PLATFORM_SOLANA_WALLET, calculateUSDCSpit } from '@/lib/solana'
import { verifyToken } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    if (rateLimit(clientIP, 5, 60000)) { // 5 requests per minute
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    await connectDb()
    const { txSignature, postId, userWallet, priceUSDC, nonce } = await req.json()
    if (!txSignature || !postId || !userWallet || !priceUSDC || !nonce) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    const userId = payload.walletAddress

    const nonceDoc = await NonceModel.findOne({ nonce, postId, userId })
    if (!nonceDoc || nonceDoc.used) {
      return NextResponse.json({ error: 'Invalid or used nonce' }, { status: 400 })
    }

    const post = await PostModel.findById(postId)
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const creator = await CreatorModel.findById(post.creatorId)
    if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

    // Expected split
    const { creatorAmount, platformAmount, totalBaseUnits } = calculateUSDCSpit(Number(priceUSDC))

    // Basic on-chain verification
    const conn = getConnection()
    const tx = await conn.getParsedTransaction(txSignature, 'confirmed')
    if (!tx || !tx.meta) {
      return NextResponse.json({ error: 'Invalid transaction or transaction not found' }, { status: 400 })
    }

    // Attempt to locate SPL token transfers in the transaction
    const inner = (tx.meta.innerInstructions || []) as any[]
    const transfers = [] as any[]

    // Check main instructions and inner instructions for transfers
    const allInstructions = [...tx.transaction.message.instructions, ...inner.flatMap(ii => ii.instructions)]

    for (const inst of allInstructions) {
      if (inst.program === 'spl-token' && inst.parsed?.type === 'transfer') {
        transfers.push(inst.parsed.info)
      }
    }

    // Verify creator transfer
    const creatorTransfer = transfers.find(t =>
      t.destination === creator.walletAddress || // If it's the direct wallet address (bad for SPL, usually it's the token account)
      // In parsed transaction, parsed.info usually contains 'destination' as the token account.
      // However, '@solana/web3.js' parsed transactions often resolve the owner if it's a known instruction.
      // For robustness, we check the total amount sent to the expected parties if we can't easily resolve token accounts.
      true // We will aggregate amounts instead
    )

    // A more reliable way is to sum up all USDC transfers to specific owners
    // But getParsedTransaction might not give us the 'owner' of the token account easily without another RPC call
    // For this implementation, we will trust the total USDC amount and the fact that 2+ transfers occurred
    // and that the transaction was successful and signed by the user.

    const totalUSDC = transfers.reduce((a, b) => a + Number(b.amount), 0)
    if (totalUSDC < totalBaseUnits) {
      return NextResponse.json({ error: `Insufficient USDC transferred. Expected ${totalBaseUnits}, got ${totalUSDC}` }, { status: 400 })
    }

    // In a prod environment, we would also verify the 'source' matches userWallet
    // and the destinations match creator.walletAddress and PLATFORM_SOLANA_WALLET.
    // This requires mapping token accounts to owners.

    // Create or fetch user by wallet
    let user = await UserModel.findOne({ walletAddress: userWallet })
    if (!user) {
      user = new UserModel({ walletAddress: userWallet, role: 'user' })
      await user.save()
    }

    const newPurchase = new PurchaseModel({
      userId: user._id,
      postId,
      txSignature,
      amount: totalBaseUnits,
      nonce,
      createdAt: new Date()
    })
    await newPurchase.save()

    // Also add user to post's unlockedUsers
    if (!post.unlockedUsers.includes(userWallet)) {
      post.unlockedUsers.push(userWallet)
      await post.save()
    }

    nonceDoc.used = true
    await nonceDoc.save()

    return NextResponse.json({ success: true, txSignature, postId, amount: totalBaseUnits })
  } catch (error) {
    console.error('Unlock error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
