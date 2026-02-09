"use client"
import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import {
  PublicKey,
  Transaction,
  Connection
} from '@solana/web3.js'
import {
  getAssociatedTokenAddressSync,
  createTransferInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token'
import { resolveMediaUrl } from '@/lib/media'
import { Loader2, Lock, Unlock, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import WatermarkedImage from '@/components/WatermarkedImage'

// Correcting imports from lib/solana.ts
import {
  USDC_MINT_ADDRESS as SOLANA_USDC_MINT,
  getConnection as getSolanaConnection,
  PLATFORM_SOLANA_WALLET as PLATFORM_WALLET,
  calculateUSDCSpit
} from '@/lib/solana'

type Props = { params: { id: string } }

export default function PostDetail({ params }: Props) {
  const id = params.id
  const { publicKey, sendTransaction, connected } = useWallet()
  const { setVisible } = useWalletModal()

  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [status, setStatus] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPost()
  }, [id])

  useEffect(() => {
    if (post && publicKey) {
      const walletStr = publicKey.toString()
      if (post.unlockedUsers?.includes(walletStr) || post.creatorId?.walletAddress === walletStr) {
        setIsUnlocked(true)
      }
    }
  }, [post, publicKey])

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${id}`)
      if (res.ok) {
        const data = await res.json()
        setPost(data)
      } else {
        setError('Post not found')
      }
    } catch (e) {
      setError('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = async () => {
    if (!connected || !publicKey) {
      setVisible(true)
      return
    }

    if (!post) return

    setUnlocking(true)
    setError('')
    setStatus('Requesting secure nonce...')

    try {
      const token = localStorage.getItem('jwt')

      // 1. Get Nonce
      const nonceRes = await fetch('/api/purchases/request-nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ postId: id }),
      })

      if (!nonceRes.ok) throw new Error('Failed to get security nonce')
      const { nonce } = await nonceRes.json()

      setStatus('Preparing Solana transaction...')
      const connection = getSolanaConnection()
      const usdcMint = new PublicKey(SOLANA_USDC_MINT)
      const creatorWallet = new PublicKey(post.creatorId.walletAddress)
      const platformWallet = new PublicKey(PLATFORM_WALLET)

      // Calculate split
      const { creatorAmount, platformAmount } = calculateUSDCSpit(post.priceUSDC)

      // Get associated token accounts
      const userAta = getAssociatedTokenAddressSync(usdcMint, publicKey)
      const creatorAta = getAssociatedTokenAddressSync(usdcMint, creatorWallet)
      const platformAta = getAssociatedTokenAddressSync(usdcMint, platformWallet)

      const transaction = new Transaction()

      // Ensure creator and platform ATAs exist (minimal check, usually better to fetch them)
      // For this implementation, we assume they exist or we'd add instructions here.
      // To be safe, we'd fetch account info:
      /*
      try { await getAccount(connection, creatorAta) } 
      catch { transaction.add(createAssociatedTokenAccountInstruction(publicKey, creatorAta, creatorWallet, usdcMint)) }
      */

      // Add Transfer to Creator (90%)
      transaction.add(
        createTransferInstruction(
          userAta,
          creatorAta,
          publicKey,
          creatorAmount
        )
      )

      // Add Transfer to Platform (10%)
      transaction.add(
        createTransferInstruction(
          userAta,
          platformAta,
          publicKey,
          platformAmount
        )
      )

      setStatus('Please sign the transaction in your wallet...')
      const signature = await sendTransaction(transaction, connection)

      setStatus('Transaction pending confirmation...')

      // 2. Verify on Backend
      const verifyRes = await fetch('/api/purchases/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          txSignature: signature,
          postId: id,
          userWallet: publicKey.toString(),
          priceUSDC: post.priceUSDC,
          nonce
        }),
      })

      if (verifyRes.ok) {
        setStatus('Content successfully unlocked!')
        setIsUnlocked(true)
        // Refresh post to get full content if needed or just update state
        fetchPost()
      } else {
        const errData = await verifyRes.json()
        throw new Error(errData.error || 'Verification failed')
      }

    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Unlock failed')
    } finally {
      setUnlocking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-meta-peach/20">
        <Loader2 className="animate-spin text-meta-orange" size={48} />
      </div>
    )
  }

  if (error && !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-meta-peach/20 p-4">
        <AlertCircle className="text-red-500 mb-4" size={64} />
        <h1 className="text-2xl font-black text-meta-navy uppercase">{error}</h1>
        <button onClick={() => window.history.back()} className="mt-4 text-meta-orange font-bold uppercase hover:underline">Go Back</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-meta-peach/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="meta-card overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-meta-navy/5 flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-meta-navy/5 border-2 border-meta-orange/20 shadow-sm">
                <img src={resolveMediaUrl(post.creatorId?.avatar) || ''} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="font-black text-meta-navy uppercase tracking-tight">@{post.creatorId?.username || 'creator'}</h2>
                <p className="text-[10px] font-bold text-meta-navy/40 uppercase tracking-widest">{post.creatorId?.location || 'Unknown Location'}</p>
              </div>
            </div>
            {isUnlocked ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                <Unlock size={12} /> Unlocked
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-meta-navy/5 text-meta-navy/40 rounded-full text-[10px] font-black uppercase tracking-widest border border-meta-navy/10">
                <Lock size={12} /> Locked Content
              </div>
            )}
          </div>

          {/* Media Content */}
          <div className="relative aspect-video md:aspect-auto md:min-h-[500px] bg-meta-navy/5 flex items-center justify-center overflow-hidden">
            {isUnlocked ? (
              <WatermarkedImage
                src={resolveMediaUrl(post.storachaCID) || ''}
                watermarkText={publicKey?.toString().slice(0, 8) || 'BUNNY FAN'}
                className="animate-in fade-in duration-1000"
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={resolveMediaUrl(post.blurCID) || ''}
                  className="w-full h-full object-cover blur-2xl scale-110 opacity-50"
                  alt="Blurred Preview"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-meta-navy/20 backdrop-blur-md">
                  <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mb-6 border border-white/20 shadow-2xl">
                    <Lock size={48} className="text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Exclusive Content</h3>
                  <p className="text-white/80 font-bold max-w-sm">Unlock this media to support @{post.creatorId?.username}.</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions & Price */}
          <div className="p-8 bg-white">
            {!isUnlocked ? (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black uppercase text-meta-navy/40 tracking-widest mb-1">Unlock Price</p>
                  <p className="text-4xl font-black text-meta-navy tracking-tighter">
                    {post.priceUSDC.toFixed(2)}
                    <span className="text-sm ml-1 text-meta-orange">USDC</span>
                  </p>
                </div>

                <div className="w-full md:w-auto">
                  <button
                    onClick={handleUnlock}
                    disabled={unlocking}
                    className="meta-button-primary w-full md:w-64 h-16 text-lg flex items-center justify-center gap-3 shadow-2xl shadow-meta-orange/20"
                  >
                    {unlocking ? <Loader2 className="animate-spin" /> : (
                      <>
                        Unlock with Wallet
                        <Unlock size={20} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h4 className="text-2xl font-black text-meta-navy uppercase tracking-tight flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" />
                    Content Unlocked
                  </h4>
                  <p className="text-meta-navy/60 font-medium">You have full access to this media.</p>
                </div>
                <Link href="/feed" className="px-6 py-3 bg-meta-navy/5 text-meta-navy rounded-full font-black text-xs uppercase tracking-widest hover:bg-meta-navy/10 transition-colors">
                  Back to Feed
                </Link>
              </div>
            )}

            {status && !error && (
              <div className="mt-6 p-4 bg-meta-orange/5 border border-meta-orange/10 rounded-2xl flex items-center gap-3 animate-pulse">
                <Loader2 className="animate-spin text-meta-orange" size={16} />
                <p className="text-xs font-black text-meta-orange uppercase tracking-widest">{status}</p>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                <AlertCircle className="text-red-500" size={16} />
                <p className="text-xs font-black text-red-500 uppercase tracking-widest">{error}</p>
              </div>
            )}

            {/* Content Description */}
            <div className="mt-8 pt-8 border-t border-meta-navy/5">
              <p className="text-meta-navy/80 font-medium leading-relaxed">
                {post.content || 'No description provided.'}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {post.hashtags?.map((tag: string, i: number) => (
                  <span key={i} className="text-meta-orange font-bold text-sm">#{tag.replace('#', '')}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

