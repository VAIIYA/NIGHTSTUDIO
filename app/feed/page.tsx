"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Heart, MessageCircle, Repeat2, Share2, Zap, Lock,
    MoreHorizontal, CheckCircle2, Loader2, Image as ImageIcon,
    Smile, Calendar, MapPin, Search, TrendingUp, UserPlus
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WhoToFollow, TrendingSidebar } from '../../components/DiscoverySidebar'
import { resolveMediaUrl } from '@/lib/media'
import WatermarkedImage from '@/components/WatermarkedImage'
import {
    PublicKey,
    Transaction
} from '@solana/web3.js'
import {
    getAssociatedTokenAddressSync,
    createTransferInstruction
} from '@solana/spl-token'
import {
    USDC_MINT_ADDRESS as SOLANA_USDC_MINT,
    getConnection as getSolanaConnection,
    PLATFORM_SOLANA_WALLET as PLATFORM_WALLET,
    calculateUSDCSpit
} from '@/lib/solana'

export default function FeedPage() {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('For You')
    const [hashtag, setHashtag] = useState('')
    const [commentingOn, setCommentingOn] = useState<string | null>(null)
    const [commentText, setCommentText] = useState('')
    const [unlockStatus, setUnlockStatus] = useState<{ [key: string]: string }>({})
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [postContent, setPostContent] = useState('')
    const [postPrice, setPostPrice] = useState('0')
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isPosting, setIsPosting] = useState(false)
    const [showPriceInput, setShowPriceInput] = useState(false)

    const { publicKey, connected, sendTransaction } = useWallet()

    useEffect(() => {
        fetchFeed(hashtag)
        fetchMe()
    }, [activeTab, hashtag, publicKey])

    const fetchMe = async () => {
        const token = localStorage.getItem('jwt')
        if (!token) return
        try {
            const res = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setCurrentUser(data.creator || data.user)
            }
        } catch (e) {
            console.error('Me fetch error:', e)
        }
    }

    const fetchFeed = async (hashtagFilter?: string) => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (activeTab === 'Following') {
                params.set('sort', 'following')
                params.set('userId', 'current-user') // You'd get this from wallet context
            }
            if (hashtagFilter) {
                params.set('hashtag', hashtagFilter)
            }
            const res = await fetch(`/api/feed?${params}`)
            if (res.ok) {
                const data = await res.json()
                setPosts(data.posts)
            }
        } catch (e) {
            console.error('Feed fetch error:', e)
        }
        setLoading(false)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
                setSelectedImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handlePost = async () => {
        if (!postContent.trim() && !selectedImage) return
        const token = localStorage.getItem('jwt')
        if (!token) return alert('Please login first')

        setIsPosting(true)
        try {
            const res = await fetch('/api/posts/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: postContent,
                    priceUSDC: parseFloat(postPrice) || 0,
                    imagePreview: selectedImage
                })
            })
            if (res.ok) {
                setPostContent('')
                setSelectedImage(null)
                setImagePreview(null)
                setPostPrice('0')
                setShowPriceInput(false)
                fetchFeed()
            } else {
                const err = await res.json()
                alert(err.error || 'Failed to post')
            }
        } catch (e) {
            console.error('Post error:', e)
        }
        setIsPosting(false)
    }

    const handleInteract = async (postId: string, type: string, content?: string) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null
        if (!token) return alert('Please login first')

        if (type === 'like' || type === 'repost') {
            setPosts(prev => prev.map(p => {
                if (p._id === postId) {
                    const stats = { ...p.stats }
                    stats[type === 'like' ? 'likes' : 'reposts'] += 1
                    return { ...p, stats }
                }
                return p
            }))
        }

        try {
            const res = await fetch(`/api/posts/${postId}/interact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ type, content })
            })
            if (res.ok) {
                fetchFeed()
                if (type === 'comment') {
                    setCommentingOn(null)
                    setCommentText('')
                }
            }
        } catch (e) {
            console.error('Interact error:', e)
        }
    }

    const handleUnlock = async (postId: string, price: number) => {
        if (!connected || !publicKey) {
            alert('Please connect your wallet first')
            // Or trigger modal
            return
        }

        setUnlockStatus(prev => ({ ...prev, [postId]: 'Requesting nonce...' }))
        try {
            const token = localStorage.getItem('jwt')

            // 1. Get Nonce
            const nonceRes = await fetch('/api/purchases/request-nonce', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ postId }),
            })
            if (!nonceRes.ok) throw new Error('Failed to get security nonce')
            const { nonce } = await nonceRes.json()

            setUnlockStatus(prev => ({ ...prev, [postId]: 'Preparing transaction...' }))
            const connection = getSolanaConnection()
            const usdcMint = new PublicKey(SOLANA_USDC_MINT)
            const platformWallet = new PublicKey(PLATFORM_WALLET)

            // We need the creator's wallet. We'll find it from the post in state
            const targetPost = posts.find(p => p._id === postId)
            if (!targetPost || !targetPost.creatorId?.walletAddress) throw new Error('Creator info missing')
            const creatorWallet = new PublicKey(targetPost.creatorId.walletAddress)

            // Calculate split
            const { creatorAmount, platformAmount } = calculateUSDCSpit(price)

            // ATAs
            const userAta = getAssociatedTokenAddressSync(usdcMint, publicKey)
            const creatorAta = getAssociatedTokenAddressSync(usdcMint, creatorWallet)
            const platformAta = getAssociatedTokenAddressSync(usdcMint, platformWallet)

            const transaction = new Transaction()

            // Add Transfer to Creator (90%)
            transaction.add(
                createTransferInstruction(userAta, creatorAta, publicKey, creatorAmount)
            )

            // Add Transfer to Platform (10%)
            transaction.add(
                createTransferInstruction(userAta, platformAta, publicKey, platformAmount)
            )

            setUnlockStatus(prev => ({ ...prev, [postId]: 'Sign in wallet...' }))
            const signature = await sendTransaction(transaction, connection)

            setUnlockStatus(prev => ({ ...prev, [postId]: 'Confirming...' }))

            // 2. Verify on Backend
            const verifyRes = await fetch('/api/purchases/unlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    txSignature: signature,
                    postId,
                    userWallet: publicKey.toString(),
                    priceUSDC: price,
                    nonce
                }),
            })

            if (verifyRes.ok) {
                setUnlockStatus(prev => ({ ...prev, [postId]: 'Revealing content...' }))
                setTimeout(() => {
                    setUnlockStatus(prev => {
                        const next = { ...prev }; delete next[postId]; return next
                    })
                    fetchFeed()
                }, 2000)
            } else {
                const errData = await verifyRes.json()
                throw new Error(errData.error || 'Verification failed')
            }
        } catch (e: any) {
            console.error(e)
            setUnlockStatus(prev => ({ ...prev, [postId]: `Failed: ${e.message.slice(0, 15)}...` }))
            setTimeout(() => setUnlockStatus(prev => {
                const next = { ...prev }; delete next[postId]; return next
            }), 3000)
        }
    }

    return (
        <div className="min-h-screen bg-white text-meta-navy">
            <div className="max-w-[1300px] mx-auto flex justify-center">

                {/* Main Feed Column */}
                <main className="w-full max-w-[600px] border-x border-meta-navy/5 min-h-screen">

                    {/* Top Tabs */}
                    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-meta-navy/5">
                        <h1 className="px-4 py-3 text-xl font-black uppercase tracking-tight">Home</h1>
                        <div className="flex">
                            {['For You', 'Following'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className="flex-1 py-4 hover:bg-meta-navy/5 transition-colors relative"
                                >
                                    <span className={`text-sm font-black uppercase tracking-widest ${activeTab === tab ? 'text-meta-navy' : 'text-meta-navy/40'}`}>
                                        {tab}
                                    </span>
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-meta-orange rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Hashtag Search */}
                        <div className="px-4 pb-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-meta-navy/30" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by hashtag (e.g. #bunny #art)"
                                    value={hashtag}
                                    onChange={(e) => setHashtag(e.target.value)}
                                    className="w-full h-9 pl-9 pr-3 bg-meta-navy/5 border-none rounded-full focus:ring-1 focus:ring-meta-orange focus:bg-white text-sm font-medium transition-all placeholder:text-meta-navy/40"
                                />
                                {hashtag && (
                                    <button
                                        onClick={() => setHashtag('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-meta-navy/40 hover:text-meta-navy"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Compose Box */}
                    <div className="p-4 border-b border-meta-navy/5 flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-meta-orange/10 flex-shrink-0 overflow-hidden">
                            {currentUser?.avatar ? (
                                <img
                                    src={resolveMediaUrl(currentUser.avatar) || ''}
                                    className="w-full h-full object-cover"
                                    alt="me"
                                />
                            ) : (
                                <div className="w-full h-full bg-meta-orange text-white flex items-center justify-center font-black">
                                    {currentUser?.username?.[0] || '?'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 pt-2">
                            <textarea
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                placeholder="What's happening?"
                                className="w-full bg-transparent border-none focus:ring-0 text-xl font-medium placeholder:text-meta-navy/40 resize-none min-h-[50px] h-auto"
                            />

                            {imagePreview && (
                                <div className="relative mt-2 rounded-2xl overflow-hidden border border-meta-navy/5">
                                    <img src={imagePreview} className="w-full object-cover max-h-[400px]" alt="preview" />
                                    <button
                                        onClick={() => { setImagePreview(null); setSelectedImage(null); }}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            {showPriceInput && (
                                <div className="mt-3 flex items-center gap-3 p-3 bg-meta-peach/30 rounded-2xl border border-meta-orange/10 animate-in fade-in slide-in-from-top-2">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-meta-orange">Set Unlock Price (USDC)</div>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={postPrice}
                                        onChange={(e) => setPostPrice(e.target.value)}
                                        className="bg-white border-none rounded-lg h-8 w-24 text-xs font-bold focus:ring-1 focus:ring-meta-orange px-2"
                                    />
                                    <button onClick={() => setShowPriceInput(false)} className="text-[10px] font-bold text-meta-navy/40 hover:text-meta-navy uppercase">Cancel</button>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-4 border-t border-meta-navy/5 pt-3">
                                <div className="flex gap-2 text-meta-orange">
                                    <label className="p-2 hover:bg-meta-orange/10 rounded-full transition-colors cursor-pointer">
                                        <ImageIcon size={18} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                    <button onClick={() => setShowPriceInput(!showPriceInput)} className={`p-2 hover:bg-meta-orange/10 rounded-full transition-colors ${showPriceInput ? 'bg-meta-orange/10' : ''}`} title="Set Price">
                                        <Zap size={18} className={postPrice !== '0' ? 'fill-meta-orange' : ''} />
                                    </button>
                                    <button className="p-2 hover:bg-meta-orange/10 rounded-full transition-colors"><Smile size={18} /></button>
                                </div>
                                <button
                                    onClick={handlePost}
                                    disabled={isPosting || (!postContent.trim() && !selectedImage)}
                                    className={`bg-meta-orange text-white px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest transition-all ${(isPosting || (!postContent.trim() && !selectedImage)) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-meta-orange/90 shadow-lg shadow-meta-orange/20'
                                        }`}
                                >
                                    {isPosting ? <Loader2 size={16} className="animate-spin" /> : 'Post'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Posts List */}
                    {loading ? (
                        <div className="p-4 space-y-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 animate-pulse">
                                    <div className="w-12 h-12 rounded-full bg-meta-navy/5" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-meta-navy/5 rounded w-1/3" />
                                        <div className="h-40 bg-meta-navy/5 rounded-2xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="divide-y divide-meta-navy/5">
                            {posts.map((post) => (
                                <article key={post._id} className="p-4 hover:bg-meta-navy/[0.01] transition-colors">
                                    <div className="flex gap-3">
                                        <Link href={`/creator/${post.creatorId?._id}`} className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-meta-orange/10 overflow-hidden">
                                                {post.creatorId?.avatar ? (
                                                    <img
                                                        src={resolveMediaUrl(post.creatorId.avatar) || ''}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-meta-orange text-white flex items-center justify-center font-black">
                                                        {post.creatorId?.username?.[0] || 'B'}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <div className="flex items-center gap-1 min-w-0">
                                                    <Link href={`/creator/${post.creatorId?._id}`} className="font-black text-sm uppercase tracking-tight hover:underline truncate">
                                                        {post.creatorId?.username || 'Anonymous'}
                                                    </Link>
                                                    <CheckCircle2 size={14} className="text-blue-500 flex-shrink-0" />
                                                    <span className="text-sm text-meta-navy/40 font-medium truncate">@{post.creatorId?.walletAddress?.slice(0, 8)}...</span>
                                                    <span className="text-sm text-meta-navy/40 font-medium">· 2h</span>
                                                </div>
                                                <button className="text-meta-navy/40 hover:text-meta-navy"><MoreHorizontal size={18} /></button>
                                            </div>

                                            <p className="text-[15px] font-medium leading-relaxed mt-1 mb-3">
                                                {post.content || 'No content provided.'}
                                            </p>

                                            {/* Post Media */}
                                            {post.blurCID && (
                                                <div className="relative rounded-2xl overflow-hidden border border-meta-navy/5 bg-meta-navy/5 aspect-video mb-3 group">
                                                    {post.isUnlocked || post.priceUSDC === 0 ? (
                                                        <WatermarkedImage
                                                            src={resolveMediaUrl(post.storachaCID) || ''}
                                                            watermarkText={publicKey?.toString().slice(0, 8) || 'BUNNY FAN'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={resolveMediaUrl(post.blurCID) || ''}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                            alt="content"
                                                        />
                                                    )}

                                                    {post.priceUSDC > 0 && !post.isUnlocked && (
                                                        <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                                                            {unlockStatus[post._id] ? (
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <Loader2 className="animate-spin text-meta-orange" size={32} />
                                                                    <span className="text-white text-[10px] font-black uppercase tracking-widest animate-pulse">{unlockStatus[post._id]}</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-meta-navy shadow-2xl">
                                                                        <Lock size={24} />
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleUnlock(post._id, post.priceUSDC)}
                                                                        className="meta-button-primary h-10 px-6 text-xs flex items-center gap-2 shadow-xl shadow-meta-orange/20"
                                                                    >
                                                                        <Zap size={14} className="fill-current" />
                                                                        Unlock for {post.priceUSDC} USDC
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-md text-[9px] font-black text-white uppercase tracking-wider border border-white/10">
                                                        {post.priceUSDC === 0 ? 'Free' : 'Premium'}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Bar */}
                                            <div className="flex items-center justify-between max-w-sm ml -ml-2 text-meta-navy/40">
                                                <button className="flex items-center gap-1 group/btn px-2 py-1 hover:text-meta-orange transition-colors">
                                                    <div className="p-2 group-hover/btn:bg-meta-orange/10 rounded-full transition-colors"><MessageCircle size={18} /></div>
                                                    <span className="text-xs font-bold">{post.stats?.comments || 0}</span>
                                                </button>
                                                <button className="flex items-center gap-1 group/btn px-2 py-1 hover:text-green-500 transition-colors">
                                                    <div className="p-2 group-hover/btn:bg-green-500/10 rounded-full transition-colors"><Repeat2 size={18} /></div>
                                                    <span className="text-xs font-bold">{post.stats?.reposts || 1}</span>
                                                </button>
                                                <button className="flex items-center gap-1 group/btn px-2 py-1 hover:text-red-500 transition-colors">
                                                    <div className="p-2 group-hover/btn:bg-red-500/10 rounded-full transition-colors"><Heart size={18} /></div>
                                                    <span className="text-xs font-bold">{post.stats?.likes || 5}</span>
                                                </button>
                                                <button
                                                    onClick={() => window.location.href = `/creator/${post.creatorId?._id}?tip=true`}
                                                    className="flex items-center gap-1 group/btn px-2 py-1 hover:text-meta-orange transition-colors"
                                                >
                                                    <div className="p-2 group-hover/btn:bg-meta-orange/10 rounded-full transition-colors"><Zap size={18} className="fill-current" /></div>
                                                    <span className="text-xs font-bold text-meta-orange">Tip</span>
                                                </button>
                                                <button className="flex items-center gap-1 group/btn px-2 py-1 hover:text-meta-navy transition-colors">
                                                    <div className="p-2 group-hover/btn:bg-meta-navy/5 rounded-full transition-colors"><Share2 size={18} /></div>
                                                    <span className="text-xs font-bold">12</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </main>

                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-[350px] p-4 space-y-4">
                    {/* Search */}
                    <div className="sticky top-0 z-40 bg-white py-2">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-navy/30 group-focus-within:text-meta-orange transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search NIGHTSTUDIO"
                                className="w-full h-11 pl-12 pr-4 bg-meta-navy/5 border-none rounded-full focus:ring-1 focus:ring-meta-orange focus:bg-white text-sm font-medium transition-all"
                            />
                        </div>
                    </div>

                    <TrendingSidebar />
                    <WhoToFollow />

                    {/* Small Footer */}
                    <div className="px-4 text-[10px] text-meta-navy/30 font-bold flex flex-wrap gap-x-3 gap-y-1">
                        <a href="#" className="hover:underline">Terms of Service</a>
                        <a href="#" className="hover:underline">Privacy Policy</a>
                        <a href="#" className="hover:underline">Cookie Policy</a>
                        <a href="#" className="hover:underline">Accessibility</a>
                        <a href="#" className="hover:underline">Ads info</a>
                        <span>© 2026 NIGHTSTUDIO Corp.</span>
                    </div>
                </aside>

            </div>
        </div>
    )
}
