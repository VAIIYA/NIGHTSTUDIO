"use client"
import React, { useState, useEffect } from 'react'
import {
  Zap, Shield, ArrowLeft, Heart, MessageCircle, Share2, Repeat2,
  MoreHorizontal, Lock, CheckCircle2, Twitter, Youtube,
  Globe, Mail, Calendar, MapPin, Link as LinkIcon, Search, TrendingUp, UserPlus, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { WhoToFollow, TrendingSidebar } from '../../../components/DiscoverySidebar'
import { usePathname } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import EditProfileModal from '@/components/EditProfileModal'
import { Settings, Edit, Flag, Share, Users } from 'lucide-react'
import { resolveMediaUrl } from '@/lib/media'
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
  calculateUSDCSpit,
  calculateReferralSplit
} from '@/lib/solana'

type Props = { params: { id: string } }

export default function CreatorProfile({ params }: Props) {
  const [creator, setCreator] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Posts')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [tiers, setTiers] = useState<any[]>([])
  const [showTiers, setShowTiers] = useState(false)
  const [tipping, setTipping] = useState(false)
  const [tipOpen, setTipOpen] = useState(false)
  const [tipAmount, setTipAmount] = useState('5')

  const { publicKey } = useWallet()
  const isOwner = publicKey && creator && publicKey.toString() === creator.walletAddress

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [creatorRes, postsRes] = await Promise.all([
          fetch(`/api/creators/${params.id}`),
          fetch(`/api/posts/creator/${params.id}`)
        ])

        let creatorData = null
        if (creatorRes.ok) {
          const json = await creatorRes.json()
          creatorData = json.creator
          setCreator(creatorData)
        }

        if (postsRes.ok) setPosts((await postsRes.json()).posts)

        // Fetch tiers
        const tiersRes = await fetch(`/api/creators/tiers?creator=${creatorData.walletAddress}`)
        if (tiersRes.ok) setTiers(await tiersRes.json())

        // Fetch follow status if logged in
        if (publicKey && creatorData) {
          const followRes = await fetch(`/api/follow?follower=${publicKey.toString()}&following=${creatorData.walletAddress}`)
          if (followRes.ok) {
            const followData = await followRes.json()
            setIsFollowing(followData.isFollowing)
          }
        }
      } catch (e) {
        console.error('Fetch error:', e)
      }
      setLoading(false)
    }
    fetchData()
  }, [params.id, publicKey])

  const { sendTransaction } = useWallet()

  const handleSubscribe = async (tier: any) => {
    if (!publicKey || !sendTransaction) return alert('Connect wallet')
    setLoading(true)
    try {
      const conn = getSolanaConnection()
      const usdcMint = new PublicKey(SOLANA_USDC_MINT)
      const creatorWallet = new PublicKey(creator.walletAddress)
      const platformWallet = new PublicKey(PLATFORM_WALLET)

      // Split (90/10)
      const { creatorAmount, platformAmount, totalBaseUnits } = calculateUSDCSpit(tier.price)

      const userAta = getAssociatedTokenAddressSync(usdcMint, publicKey)
      const creatorAta = getAssociatedTokenAddressSync(usdcMint, creatorWallet)
      const platformAta = getAssociatedTokenAddressSync(usdcMint, platformWallet)

      const tx = new Transaction().add(
        createTransferInstruction(userAta, creatorAta, publicKey, creatorAmount),
        createTransferInstruction(userAta, platformAta, publicKey, platformAmount)
      )

      const sig = await sendTransaction(tx, conn)
      const verify = await fetch('/api/subscriptions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('jwt')}` },
        body: JSON.stringify({ txSignature: sig, tierId: tier._id, subscriberWallet: publicKey.toString() })
      })
      if (verify.ok) alert('Subscribed!')
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleTip = async () => {
    if (!publicKey || !sendTransaction) return
    setTipping(true)
    try {
      const conn = getSolanaConnection()
      const usdcMint = new PublicKey(SOLANA_USDC_MINT)
      const creatorWallet = new PublicKey(creator.walletAddress)
      const platformWallet = new PublicKey(PLATFORM_WALLET)

      const amount = parseFloat(tipAmount)
      const { creatorAmount, platformAmount } = calculateUSDCSpit(amount)

      const userAta = getAssociatedTokenAddressSync(usdcMint, publicKey)
      const creatorAta = getAssociatedTokenAddressSync(usdcMint, creatorWallet)
      const platformAta = getAssociatedTokenAddressSync(usdcMint, platformWallet)

      const tx = new Transaction().add(
        createTransferInstruction(userAta, creatorAta, publicKey, creatorAmount),
        createTransferInstruction(userAta, platformAta, publicKey, platformAmount)
      )

      const sig = await sendTransaction(tx, conn)
      await fetch('/api/purchases/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('jwt')}` },
        body: JSON.stringify({ txSignature: sig, creatorWallet: creator.walletAddress, amountUSDC: amount })
      })
      alert('Tip sent!')
      setTipOpen(false)
    } catch (e) { console.error(e) }
    setTipping(false)
  }

  const handleFollow = async () => {
    if (!publicKey || !creator) return
    setFollowLoading(true)
    try {
      if (isFollowing) {
        const res = await fetch('/api/follow', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ follower: publicKey.toString(), following: creator.walletAddress })
        })
        if (res.ok) setIsFollowing(false)
      } else {
        const res = await fetch('/api/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ follower: publicKey.toString(), following: creator.walletAddress })
        })
        if (res.ok) setIsFollowing(true)
      }
    } catch (e) {
      console.error('Follow error:', e)
    }
    setFollowLoading(false)
  }

  return (
    <div className="min-h-screen bg-white text-meta-navy">
      <div className="max-w-[1300px] mx-auto flex justify-center">

        {/* Main Profile Column */}
        <main className="w-full max-w-[600px] border-x border-meta-navy/5 min-h-screen relative pb-20">

          {/* Header */}
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-meta-navy/5 p-4 flex items-center gap-8">
            <Link href="/feed" className="p-2 hover:bg-meta-navy/5 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight leading-tight">
                {creator?.username || 'Profile'}
              </h2>
              <p className="text-[11px] font-bold text-meta-navy/40 uppercase tracking-widest leading-none">
                {posts.length} Posts
              </p>
            </div>
          </header>

          {/* Banner */}
          <div className="h-48 bg-meta-navy relative">
            <div className="absolute inset-0 bg-gradient-to-br from-meta-orange/20 to-meta-navy/20"></div>
          </div>

          {/* Profile Area */}
          <div className="px-4 relative">
            {/* Avatar Box */}
            <div className="flex justify-between items-start pt-3">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-meta-peach shadow-sm overflow-hidden -mt-16 z-10">
                {creator?.avatar ? (
                  <img
                    src={resolveMediaUrl(creator.avatar) || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-meta-orange/10 flex items-center justify-center text-meta-orange font-black text-4xl">
                    {creator?.bio?.[0]?.toUpperCase() || params.id[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-2 border border-meta-navy/10 rounded-full hover:bg-meta-navy/5 transition-colors"
                  >
                    <MoreHorizontal size={20} />
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-meta-navy/5 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {isOwner && (
                          <button
                            onClick={() => {
                              setIsEditModalOpen(true)
                              setIsDropdownOpen(false)
                            }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-meta-navy/5 text-sm font-bold text-meta-navy transition-colors text-left"
                          >
                            <Edit size={16} className="text-meta-orange" />
                            Edit Profile
                          </button>
                        )}
                        <button className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-meta-navy/5 text-sm font-bold text-meta-navy transition-colors text-left">
                          <Share size={16} />
                          Share Profile
                        </button>
                        {!isOwner && (
                          <button className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-meta-navy/5 text-sm font-bold text-red-500 transition-colors text-left">
                            <Flag size={16} />
                            Report
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setTipOpen(!tipOpen)}
                  className="p-2 border border-meta-orange/20 rounded-full hover:bg-meta-orange/5 transition-colors text-meta-orange"
                >
                  <Zap size={20} className="fill-current" />
                </button>
                <button className="p-2 border border-meta-navy/10 rounded-full hover:bg-meta-navy/5 transition-colors">
                  <Mail size={20} />
                </button>
                {isOwner && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 bg-meta-navy text-white px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest hover:bg-meta-navy/90 transition-all shadow-lg shadow-meta-navy/10"
                  >
                    <Edit size={14} />
                    Edit Profile
                  </button>
                )}
                {publicKey && !isOwner && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest transition-all ${isFollowing
                      ? 'border-2 border-meta-navy/10 text-meta-navy hover:border-red-500/20 hover:text-red-500 hover:bg-red-50/50 group/follow'
                      : 'bg-meta-navy text-white hover:bg-meta-navy/90 shadow-lg shadow-meta-navy/10'
                      }`}
                  >
                    {followLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : isFollowing ? (
                      <span className="flex items-center gap-2">
                        <span className="group-hover/follow:hidden">Following</span>
                        <span className="hidden group-hover/follow:inline">Unfollow</span>
                      </span>
                    ) : (
                      'Follow'
                    )}
                  </button>
                )}
                {!publicKey && (
                  <Link href="/login" className="bg-meta-navy text-white px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest hover:bg-meta-navy/90 transition-all flex items-center justify-center">
                    Follow
                  </Link>
                )}
              </div>
            </div>

            {/* Bio Info */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black uppercase tracking-tight">{creator?.username || 'Anonymous'}</h1>
                <CheckCircle2 size={24} className="text-blue-500 fill-blue-500/10" />
              </div>
              <div className="text-sm font-bold text-meta-navy/40 -mt-2">
                @{creator?.walletAddress?.slice(0, 8)}...
              </div>

              <p className="text-sm font-medium leading-relaxed max-w-lg">
                {creator?.bio || "No bio provided."}
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-meta-navy/40 capitalize">
                  <MapPin size={14} /> {creator?.location || 'Global'}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-meta-navy/40">
                  <Calendar size={14} /> Joined Nov 2023
                </div>
              </div>

              {creator?.hashtags && creator.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {creator.hashtags.map((tag: string, i: number) => (
                    <Link key={i} href={`/explore?hashtag=${tag.replace('#', '')}`} className="text-xs font-black text-meta-orange hover:underline">
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex gap-4 pt-1">
                <button className="text-sm hover:underline"><span className="font-black text-meta-navy">1.2K</span> <span className="text-meta-navy/40 font-bold">Following</span></button>
                <button className="text-sm hover:underline"><span className="font-black text-meta-navy">8.5K</span> <span className="text-meta-navy/40 font-bold">Followers</span></button>
              </div>
            </div>

            {/* Subscription & Tipping Modals/Sections */}
            {tipOpen && (
              <div className="mx-4 mt-6 p-6 bg-meta-orange/5 border border-meta-orange/20 rounded-[2rem] animate-in fade-in zoom-in-95">
                <h3 className="font-black uppercase text-meta-orange mb-4 flex items-center gap-2">
                  <Zap size={18} className="fill-current" /> Send a Creator Tip
                </h3>
                <div className="flex gap-4">
                  {[5, 10, 25, 50].map(amt => (
                    <button key={amt} onClick={() => setTipAmount(amt.toString())} className={`flex-1 py-3 rounded-2xl font-black ${tipAmount === amt.toString() ? 'bg-meta-orange text-white' : 'bg-white text-meta-navy'}`}>{amt}</button>
                  ))}
                </div>
                <button
                  onClick={handleTip}
                  disabled={tipping}
                  className="w-full mt-4 h-14 bg-meta-navy text-white rounded-2xl font-black uppercase tracking-widest hover:bg-meta-navy/90"
                >
                  {tipping ? <Loader2 className="animate-spin mx-auto" /> : `Tip ${tipAmount} USDC`}
                </button>
              </div>
            )}

            {tiers.length > 0 && (
              <div className="mx-4 mt-6">
                <button
                  onClick={() => setShowTiers(!showTiers)}
                  className="w-full h-14 bg-meta-navy/[0.03] border-2 border-dashed border-meta-navy/10 rounded-2xl flex items-center justify-center gap-3 hover:border-meta-orange/20 transition-all group"
                >
                  <Users size={20} className="text-meta-navy/40 group-hover:text-meta-orange" />
                  <span className="font-black uppercase tracking-widest text-meta-navy/60 group-hover:text-meta-navy">View Subscription Tiers ({tiers.length})</span>
                </button>

                {showTiers && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in slide-in-from-top-4 duration-500">
                    {tiers.map(tier => (
                      <div key={tier._id} className="meta-card p-6 border-2 border-meta-navy/5 hover:border-meta-orange/40 transition-all cursor-pointer bg-white" onClick={() => handleSubscribe(tier)}>
                        <h4 className="font-black text-meta-navy uppercase">{tier.name}</h4>
                        <p className="text-2xl font-black text-meta-orange my-2">{(tier.price).toFixed(2)} <span className="text-xs">USDC/mo</span></p>
                        <ul className="space-y-1 mb-4">
                          {tier.benefits?.map((b: string, i: number) => (
                            <li key={i} className="text-[10px] font-bold text-meta-navy/50 uppercase flex items-center gap-2">
                              <CheckCircle2 size={10} className="text-green-500" /> {b}
                            </li>
                          ))}
                        </ul>
                        <button className="w-full h-10 bg-meta-navy text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Select Tier</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Tabs */}
          <div className="flex border-b border-meta-navy/5 mt-6 overflow-x-auto scrollbar-hide">
            {['Posts', 'Replies', 'Media', 'Likes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 min-w-[100px] py-4 hover:bg-meta-navy/5 transition-colors relative"
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

          {/* Grid/Feed Mix */}
          {loading ? (
            <div className="p-4 grid grid-cols-3 gap-1">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square bg-meta-navy/5 animate-pulse rounded-md" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-meta-navy/5">
              {posts.map((post, i) => (
                <article key={i} className="p-4 hover:bg-meta-navy/[0.01] transition-colors">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-meta-orange/10 overflow-hidden flex-shrink-0">
                      {creator?.avatar ? <img src={creator.avatar} /> : <div className="w-full h-full bg-meta-orange text-white flex items-center justify-center font-black">{creator?.username?.[0] || 'N'}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-black text-sm uppercase tracking-tight">{creator?.username || 'Anonymous'}</span>
                        <CheckCircle2 size={12} className="text-blue-500" />
                        <span className="text-xs text-meta-navy/40 font-bold">@{creator?.walletAddress?.slice(0, 6)} · Jan 20</span>
                      </div>
                      <p className="text-sm font-medium mt-1 mb-2 leading-relaxed">
                        {post.content || post.bio || 'Sharing a new update!'}
                      </p>

                      {post.blurCID && (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-meta-navy/5 bg-meta-navy/5 group">
                          <img src={resolveMediaUrl(post.blurCID) || ''} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          {post.priceUSDC > 0 && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-meta-navy shadow-lg"><Lock size={20} /></div>
                              <div className="px-3 py-1 bg-meta-orange text-white text-[10px] font-black uppercase tracking-widest rounded-full">{post.priceUSDC} USDC</div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between max-w-sm mt-3 -ml-2 text-meta-navy/40">
                        <button className="flex items-center gap-1 group/btn px-2 hover:text-meta-orange transition-colors"><div className="p-2 group-hover/btn:bg-meta-orange/10 rounded-full transition-colors"><MessageCircle size={18} /></div><span className="text-xs font-bold">12</span></button>
                        <button className="flex items-center gap-1 group/btn px-2 hover:text-green-500 transition-colors"><div className="p-2 group-hover/btn:bg-green-500/10 rounded-full transition-colors"><Repeat2 size={18} /></div><span className="text-xs font-bold">5</span></button>
                        <button className="flex items-center gap-1 group/btn px-2 hover:text-red-500 transition-colors"><div className="p-2 group-hover/btn:bg-red-500/10 rounded-full transition-colors"><Heart size={18} /></div><span className="text-xs font-bold">84</span></button>
                        <button className="flex items-center group/btn px-2 hover:text-meta-navy transition-colors"><div className="p-2 group-hover/btn:bg-meta-navy/5 rounded-full transition-colors"><Share2 size={18} /></div></button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block w-[350px] p-4 space-y-4">
          {/* Search */}
          <div className="sticky top-0 z-40 bg-white py-2">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-navy/30 group-focus-within:text-meta-orange transition-colors" size={18} />
              <input type="text" placeholder="Search NIGHTSTUDIO" className="w-full h-11 pl-12 pr-4 bg-meta-navy/5 border-none rounded-full focus:ring-1 focus:ring-meta-orange focus:bg-white text-sm font-medium transition-all" />
            </div>
          </div>

          <WhoToFollow />
          <TrendingSidebar />
        </aside>

      </div>

      {creator && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          creator={creator}
          onUpdate={(updated) => setCreator(updated)}
        />
      )}
    </div>
  )
}
