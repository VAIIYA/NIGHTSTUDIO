"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { BarChart3, TrendingUp, DollarSign, Users, Upload, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, ArrowRight, Plus, Twitter, Youtube, Send, Globe, MessageSquare, MapPin } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { resolveMediaUrl } from '@/lib/media'

export default function Dashboard() {
  const [role, setRole] = useState<'user' | 'creator'>('user')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [avatar, setAvatar] = useState<File | string | null>(null)
  const [onboardingStatus, setOnboardingStatus] = useState('')
  const [onboardingError, setOnboardingError] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [blurImage, setBlurImage] = useState<string>('')
  const [price, setPrice] = useState('')
  const [uploadStatus, setUploadStatus] = useState('')
  const [username, setUsername] = useState('')
  const [socials, setSocials] = useState({
    twitter: '',
    youtube: '',
    reddit: '',
    telegram: '',
    website: ''
  })
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [creatorId, setCreatorId] = useState('')
  const [earnings, setEarnings] = useState<any>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState<'stats' | 'upload' | 'tiers' | 'referrals'>('stats')
  const [tiers, setTiers] = useState<any[]>([])
  const [newTier, setNewTier] = useState({ name: '', price: '', description: '' })
  const [analytics, setAnalytics] = useState<any>(null)

  const { publicKey, connected, signMessage: walletSignMessage } = useWallet()
  const { setVisible } = useWalletModal()

  useEffect(() => {
    setIsMounted(true)
    const token = localStorage.getItem('jwt')
    if (token) {
      setIsLoggedIn(true)
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setRole(data.user.role)
        if (data.creator) {
          setBio(data.creator.bio || '')
          setUsername(data.creator.username || '')
          setLocation(data.creator.location || '')
          setHashtags(data.creator.hashtags || [])
          setAvatar(data.creator.avatar || null)
          setSocials(data.creator.socialLinks || socials)
        }
        // If they are a creator, they should have a creator profile linked
        if (data.user.role === 'creator') {
          await fetchEarnings()
        }
      }
    } catch (e) {
      console.error('Profile fetch error:', e)
    }
    setLoading(false)
  }

  useEffect(() => {
    const token = localStorage.getItem('jwt')
    if (token && role === 'creator') {
      fetchEarnings()
    }
  }, [role])

  const fetchEarnings = async () => {
    const token = localStorage.getItem('jwt')
    const res = await fetch('/api/creators/earnings', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json()
      setEarnings(data)
    }
  }

  const fetchTiers = async () => {
    if (!publicKey) return
    const res = await fetch(`/api/creators/tiers?creator=${publicKey.toString()}`)
    if (res.ok) setTiers(await res.json())
  }

  const fetchAnalytics = async () => {
    const token = localStorage.getItem('jwt')
    const res = await fetch('/api/creators/analytics', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (res.ok) setAnalytics(await res.json())
  }

  useEffect(() => {
    if (connected && role === 'creator') {
      fetchTiers()
      fetchAnalytics()
    }
  }, [connected, role])

  const handleLogin = async () => {
    if (!publicKey || !walletSignMessage) return
    setIsLoggingIn(true)
    setOnboardingError('')
    try {
      const message = `Login to NIGHTSTUDIO:${Date.now()}`
      const signature = await walletSignMessage(new TextEncoder().encode(message))

      const resp = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          message,
          signature: Array.from(new Uint8Array(signature))
        }),
      })
      if (resp.ok) {
        const data = await resp.json()
        localStorage.setItem('jwt', data.token)
        setIsLoggedIn(true)
        await fetchProfile()
      } else {
        setOnboardingError('Identity verification failed')
      }
    } catch (e) {
      console.error('Login error:', e)
      setOnboardingError('Failed to sign message')
    }
    setIsLoggingIn(false)
  }

  const handleOnboard = async () => {
    setOnboardingError('')
    setOnboardingStatus('Onboarding...')
    try {
      const avatarBase64 = (avatar && typeof avatar !== 'string') ? await fileToBase64(avatar) : ''
      const token = localStorage.getItem('jwt')
      const res = await fetch('/api/creators/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ bio, avatarBase64, username, socialLinks: socials, location, hashtags }),
      })
      if (res.ok) {
        const data = await res.json()
        setCreatorId(data.creatorId)
        setOnboardingStatus(showSettings ? 'Profile updated!' : 'Creator profile created!')
        setRole('creator')
        if (showSettings) setTimeout(() => setShowSettings(false), 2000)
      } else {
        const error = await res.json()
        setOnboardingError(error.error || 'Onboarding failed')
      }
    } catch (e) {
      setOnboardingError('Network error')
    }
    setOnboardingStatus('')
  }

  const generateBlur = (file: File) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width / 10
      canvas.height = img.height / 10
      ctx!.filter = 'blur(5px)'
      ctx!.drawImage(img, 0, 0, canvas.width, canvas.height)
      setBlurImage(canvas.toDataURL())
    }
    img.src = URL.createObjectURL(file)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      generateBlur(file)
    }
  }

  const handleUpload = async () => {
    if (!image) {
      setUploadStatus('Please select an image first')
      return
    }
    const numericPrice = parseFloat(price)
    if (isNaN(numericPrice) || numericPrice < 0) {
      setUploadStatus('Please enter a valid price (0 or more)')
      return
    }

    const isFree = numericPrice === 0
    if (!isFree && !blurImage) {
      setUploadStatus('Failed to generate blur preview')
      return
    }

    setUploadStatus('Uploading original to Storacha...')
    try {
      const imageBase64 = await fileToBase64(image)

      // Upload original image
      const imageRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: 'image.jpg', imageBase64: imageBase64 })
      })

      if (!imageRes.ok) {
        const err = await imageRes.json()
        setUploadStatus(`Original upload failed: ${err.error || 'Server error'}`)
        return
      }

      const { cid: storachaCID } = await imageRes.json()
      let blurCID = storachaCID // Default for free posts

      if (!isFree) {
        setUploadStatus('Uploading blurred preview...')
        // Upload blurred image for paid posts
        const blurRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: 'blur.jpg', imageBase64: blurImage })
        })
        if (!blurRes.ok) {
          const err = await blurRes.json()
          setUploadStatus(`Blur upload failed: ${err.error || 'Server error'}`)
          return
        }
        const blurData = await blurRes.json()
        blurCID = blurData.cid
      }

      setUploadStatus('Finalizing post on blockchain...')
      // Create post
      const token = localStorage.getItem('jwt')
      const postRes = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          creatorId, // Note: backend uses wallet from token, but we send this anyway
          storachaCID,
          blurCID,
          priceUSDC: numericPrice
        }),
      })

      if (postRes.ok) {
        setUploadStatus('Post published successfully! ✨')
        setImage(null)
        setBlurImage('')
        setPrice('')
        // Refresh stats/history
        fetchEarnings()
        setTimeout(() => setUploadStatus(''), 5000)
      } else {
        const err = await postRes.json()
        setUploadStatus(`Publication failed: ${err.error || 'Check your profile status'}`)
      }
    } catch (e) {
      console.error('Upload error:', e)
      setUploadStatus('Network error during upload')
    }
  }

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-meta-peach/20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* Navigation Tabs (Mobile optimized) */}
        {role === 'creator' && !showSettings && (
          <div className="flex bg-white/50 p-1 rounded-2xl border border-meta-navy/5 overflow-x-auto no-scrollbar">
            {[
              { id: 'stats', label: 'Overview', icon: BarChart3 },
              { id: 'upload', label: 'Post', icon: Upload },
              { id: 'tiers', label: 'Tiers', icon: Users },
              { id: 'referrals', label: 'Referrals', icon: ArrowRight },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-meta-orange text-white shadow-lg shadow-meta-orange/20' : 'text-meta-navy/60 hover:bg-meta-navy/5'}`}
              >
                <tab.icon size={18} />
                <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-meta-navy tracking-tight mb-2 uppercase flex items-center gap-3">
              DASHBOARD
              <BarChart3 className="text-meta-orange" size={32} />
            </h1>
            <p className="text-meta-navy/60 font-bold tracking-tight">Manage your creator profile and track your earnings.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-white border border-meta-navy/10 rounded-full text-xs font-black tracking-widest uppercase hover:bg-meta-navy/5 transition-all text-meta-navy"
            >
              {showSettings ? 'Back to Stats' : 'Edit Profile'}
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm font-black tracking-widest uppercase border border-green-500/20">
              <CheckCircle2 size={16} />
              Verified Creator
            </div>
          </div>
        </header>

        {role === 'user' && (
          <div className="meta-card overflow-hidden max-w-3xl mx-auto w-full">
            <div className="bg-gradient-to-r from-meta-orange to-meta-orange/80 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 -translate-y-16 blur-3xl"></div>
              <h2 className="text-3xl font-black mb-2 tracking-tight uppercase">Join the Creator Economy</h2>
              <p className="text-white/80 font-bold tracking-tight">Set up your profile, share content, and keep 90% of every sale.</p>
            </div>

            <div className="p-8 md:p-12">
              {!connected ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-meta-navy/5 text-meta-navy/40 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                    <Users size={40} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black text-meta-navy mb-4 uppercase tracking-tight">Step 1: Connect Your Identity</h3>
                  <p className="text-meta-navy/60 font-medium mb-8 max-w-md mx-auto">
                    Your Solana wallet is your unique identifier on NIGHTSTUDIO. Connect it to start your creator journey.
                  </p>
                  <div className="meta-wallet-wrapper-login max-w-[240px] mx-auto">
                    <button
                      onClick={() => setVisible(true)}
                      className="meta-button-primary w-full h-14 text-lg flex items-center justify-center gap-2"
                    >
                      Connect Wallet
                    </button>
                  </div>
                </div>
              ) : !isLoggedIn ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-meta-orange/10 text-meta-orange rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black text-meta-navy mb-4 uppercase tracking-tight">Step 2: Confirm Identity</h3>
                  <p className="text-meta-navy/60 font-medium mb-8 max-w-md mx-auto">
                    Wallet connected! Now sign a one-time message to verify your ownership and secure your account.
                  </p>
                  <button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="meta-button-primary w-full h-14 text-lg flex items-center justify-center gap-2 max-w-[240px] mx-auto"
                  >
                    {isLoggingIn ? <Loader2 className="animate-spin" /> : 'Confirm Identity'}
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-black text-meta-navy/40 uppercase tracking-widest mb-2 text-left">Username</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-navy/40 font-bold">@</span>
                          <input
                            type="text"
                            placeholder="bunny_creator"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full h-14 pl-10 pr-4 bg-white border border-meta-navy/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-meta-orange/20 font-medium text-meta-navy shadow-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-meta-navy/40 uppercase tracking-widest mb-2 text-left">Bio</label>
                        <textarea
                          placeholder="Tell your fans who you are..."
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full min-h-[120px] p-4 bg-white border border-meta-navy/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-meta-orange/20 font-medium text-meta-navy shadow-sm resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-6 text-left">
                      <div>
                        <label className="block text-xs font-black text-meta-navy/40 uppercase tracking-widest mb-2">Profile Avatar</label>
                        <div className="relative h-40 w-full rounded-2xl bg-meta-navy/5 flex items-center justify-center border-2 border-dashed border-meta-navy/10 hover:border-meta-orange/40 transition-colors cursor-pointer overflow-hidden group">
                          <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                          {avatar ? (
                            <img src={typeof avatar === 'string' ? (resolveMediaUrl(avatar) || '') : URL.createObjectURL(avatar)} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Upload size={32} className="text-meta-navy/20 group-hover:text-meta-orange/40" />
                              <span className="text-sm font-bold text-meta-navy/30">Upload Avatar</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-xs font-black text-meta-navy/40 uppercase tracking-widest mb-1">Social Links</label>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="relative">
                            <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-navy/30" size={18} />
                            <input type="text" placeholder="X (Twitter) handle" value={socials.twitter} onChange={e => setSocials({ ...socials, twitter: e.target.value })} className="w-full h-12 pl-12 pr-4 bg-white border border-meta-navy/10 rounded-xl text-sm font-medium" />
                          </div>
                          <div className="relative">
                            <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-navy/30" size={18} />
                            <input type="text" placeholder="Youtube Channel URL" value={socials.youtube} onChange={e => setSocials({ ...socials, youtube: e.target.value })} className="w-full h-12 pl-12 pr-4 bg-white border border-meta-navy/10 rounded-xl text-sm font-medium" />
                          </div>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-navy/30" size={18} />
                            <input type="text" placeholder="Personal Website" value={socials.website} onChange={e => setSocials({ ...socials, website: e.target.value })} className="w-full h-12 pl-12 pr-4 bg-white border border-meta-navy/10 rounded-xl text-sm font-medium" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleOnboard}
                      disabled={!!onboardingStatus}
                      className="meta-button-primary w-full h-16 text-xl flex items-center justify-center gap-3 shadow-2xl shadow-meta-orange/20"
                    >
                      {onboardingStatus ? <Loader2 className="animate-spin" /> : (
                        <>
                          Complete Profile
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                    <p className="mt-4 text-xs font-bold text-meta-navy/40 uppercase tracking-[0.2em] text-center">
                      Instant Payouts • 90% Earnings • Decentralized
                    </p>
                  </div>
                </div>
              )}

              {onboardingError && (
                <div className="mt-8 p-4 bg-red-500/10 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-500/20">
                  <AlertCircle size={20} /> {onboardingError}
                </div>
              )}
            </div>
          </div>
        )}

        {role === 'creator' && !showSettings && activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2">
            {/* Left Column: Upload & History */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Detailed Analytics Summary */}
              <div className="meta-card p-8 bg-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-meta-orange/5 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
                <h2 className="text-2xl font-black text-meta-navy mb-1 uppercase tracking-tight relative z-10">Revenue Intelligence</h2>
                <p className="text-xs font-bold text-meta-navy/40 uppercase tracking-widest mb-8 relative z-10">Detailed performance across all revenue streams.</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                  {[
                    { label: 'PPV Unlocks', value: analytics?.overview?.unlockRevenue || 0, color: 'text-meta-orange' },
                    { label: 'Subscriptions', value: analytics?.overview?.subscriptionRevenue || 0, color: 'text-blue-500' },
                    { label: 'Total Fans', value: analytics?.overview?.activeSubscribers || 0, color: 'text-meta-navy' },
                    { label: '30d Growth', value: `+${analytics?.overview?.newSubscribersLast30Days || 0}`, color: 'text-green-500' },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 bg-meta-navy/[0.02] rounded-2xl border border-meta-navy/5">
                      <p className="text-[10px] font-black uppercase text-meta-navy/30 tracking-widest mb-1">{stat.label}</p>
                      <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Chart */}
              <div className="meta-card p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-meta-navy tracking-tight uppercase flex items-center gap-2">
                    <TrendingUp size={24} className="text-green-500" />
                    Growth Trends
                  </h2>
                </div>

                <div className="h-72 w-full">
                  {earnings ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={earnings.chartData}>
                        <defs>
                          <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#e2761b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#e2761b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2ece6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#24115060' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#24115060' }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 (0 / 0.1)' }}
                          itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="earnings" stroke="#e2761b" strokeWidth={4} fillOpacity={1} fill="url(#colorEarnings)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full bg-meta-navy/5 rounded-[2rem] flex items-center justify-center">
                      <Loader2 className="animate-spin text-meta-navy/20" size={32} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Mini Stats & History */}
            <div className="flex flex-col gap-6">
              <div className="meta-card p-6 border-l-8 border-meta-orange">
                <p className="text-[10px] font-black uppercase text-meta-navy/40 tracking-widest mb-1">Net Earnings</p>
                <p className="text-4xl font-black text-meta-navy tracking-tighter">
                  {earnings ? earnings.totalEarned.toFixed(2) : '--.--'}
                  <span className="text-sm ml-1 text-meta-orange">USDC</span>
                </p>
              </div>

              <div className="meta-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase text-meta-navy/40 tracking-widest">Recent Sales</p>
                  <Link href="/history" className="text-[10px] font-black text-meta-orange hover:underline uppercase">View All</Link>
                </div>

                <div className="space-y-3">
                  {earnings ? earnings.purchaseHistory.map((p: any) => (
                    <div key={p._id} className="flex items-center justify-between p-3 bg-meta-peach/40 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-meta-orange shadow-sm">
                          <CheckCircle2 size={16} />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs font-black text-meta-navy tracking-tight">{new Date(p.createdAt).toLocaleDateString()}</p>
                          <p className="text-[10px] font-bold text-meta-navy/40 uppercase tracking-tighter">Post #{p.postId.slice(-4)}</p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-meta-navy tracking-tighter">
                        +{(p.amount / 1e6).toFixed(2)}
                      </p>
                    </div>
                  )) : (
                    <p className="text-center text-xs font-bold text-meta-navy/30 py-8">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {role === 'creator' && !showSettings && activeTab === 'upload' && (
          <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2">
            <div className="meta-card p-6 md:p-8">
              <h2 className="text-2xl font-black text-meta-navy mb-6 tracking-tight uppercase flex items-center gap-2">
                <Upload size={24} className="text-meta-orange" />
                New Media Post
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="aspect-square rounded-[2rem] bg-meta-navy/5 border-4 border-dashed border-meta-navy/10 flex flex-col items-center justify-center gap-3 relative cursor-pointer hover:border-meta-orange/40 transition-all group overflow-hidden">
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {image ? (
                      <div className="w-full h-full relative">
                        <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="font-black uppercase tracking-tighter">Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-meta-navy/5 flex items-center justify-center text-meta-navy/20 group-hover:text-meta-orange group-hover:bg-meta-orange/10 transition-all">
                          <ImageIcon size={32} />
                        </div>
                        <span className="text-xs font-black text-meta-navy/30 uppercase tracking-widest">Select Media</span>
                      </>
                    )}
                  </div>
                  {blurImage && (
                    <div className="flex items-center gap-4 p-3 bg-meta-navy/5 rounded-2xl">
                      <div className="w-12 h-12 rounded-xl border-2 border-white shadow-sm overflow-hidden">
                        <img src={blurImage} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-black uppercase text-meta-navy/40 tracking-widest">Public Preview (Blurred)</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-black text-meta-navy/40 uppercase tracking-widest mb-2">Set Unlock Price (USDC)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-navy/30" size={20} />
                      <input
                        type="number"
                        placeholder="Price..."
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 bg-white border border-meta-navy/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-meta-orange/20 font-bold text-meta-navy shadow-sm transition-all"
                      />
                    </div>
                    <p className="mt-2 text-[10px] text-meta-navy/40 font-bold uppercase tracking-tight">Recommended: 2.00 - 15.00 USDC</p>
                  </div>

                  <div className="pt-8 md:pt-0">
                    <button
                      onClick={handleUpload}
                      disabled={!image || price === '' || uploadStatus === 'Uploading...'}
                      className="meta-button-primary w-full h-14 flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale transition-all shadow-xl shadow-meta-orange/20"
                    >
                      {uploadStatus === 'Uploading...' ? <Loader2 className="animate-spin" /> : parseFloat(price) === 0 ? 'Publish Free Post' : 'Publish Paid Post'}
                    </button>
                    <p className="mt-2 text-center text-[10px] font-black text-meta-navy uppercase tracking-widest opacity-40">{uploadStatus}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {role === 'creator' && !showSettings && activeTab === 'tiers' && (
          <div className="max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 space-y-8">
            <div className="meta-card p-8 bg-white">
              <h2 className="text-2xl font-black text-meta-navy mb-2 uppercase tracking-tight">Subscription Tiers</h2>
              <p className="text-xs font-bold text-meta-navy/40 uppercase tracking-widest mb-8">Offer exclusive benefits to your most loyal fans.</p>

              <div className="grid md:grid-cols-3 gap-6">
                {tiers.length === 0 && (
                  <div className="col-span-3 py-12 text-center bg-meta-navy/[0.02] border-2 border-dashed border-meta-navy/10 rounded-[2rem]">
                    <Users size={48} className="mx-auto mb-4 text-meta-navy/20" />
                    <h3 className="font-black text-meta-navy uppercase">No Tiers Created</h3>
                    <p className="text-sm font-bold text-meta-navy/40">Build your first tier to start earning recurring revenue.</p>
                  </div>
                )}
                {tiers.map((tier) => (
                  <div key={tier._id} className="p-6 bg-white border-2 border-meta-navy/5 rounded-[2rem] hover:border-meta-orange/20 transition-all">
                    <h3 className="text-xl font-black text-meta-navy uppercase tracking-tight">{tier.name}</h3>
                    <p className="text-3xl font-black text-meta-orange my-4">{tier.price} <span className="text-sm">USDC/mo</span></p>
                    <p className="text-sm font-medium text-meta-navy/60 mb-6">{tier.description}</p>
                    <button className="w-full h-11 bg-meta-navy/5 text-meta-navy rounded-xl font-black text-[10px] uppercase tracking-widest">Edit Tier</button>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-meta-navy/5">
                <h3 className="text-lg font-black text-meta-navy uppercase mb-6">Create New Tier</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Tier Name (e.g. Diamond)"
                    value={newTier.name}
                    onChange={e => setNewTier({ ...newTier, name: e.target.value })}
                    className="h-14 px-4 bg-meta-navy/[0.02] border rounded-2xl"
                  />
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-navy/30" size={18} />
                    <input
                      type="number"
                      placeholder="Price"
                      value={newTier.price}
                      onChange={e => setNewTier({ ...newTier, price: e.target.value })}
                      className="w-full h-14 pl-10 pr-4 bg-meta-navy/[0.02] border rounded-2xl"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('jwt')
                      const res = await fetch('/api/creators/tiers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify(newTier)
                      })
                      if (res.ok) {
                        setNewTier({ name: '', price: '', description: '' })
                        fetchTiers()
                      }
                    }}
                    className="meta-button-primary h-14 uppercase"
                  >Create Tier</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {role === 'creator' && !showSettings && activeTab === 'referrals' && (
          <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2">
            <div className="meta-card p-12 bg-meta-navy text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-meta-orange/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
              <div className="relative z-10">
                <ArrowRight className="text-meta-orange mb-6" size={48} />
                <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">Creator Referral Program</h2>
                <p className="text-white/60 font-bold mb-10 max-w-lg">Invite your fellow creators to NIGHTSTUDIO and earn 5% of their lifetime revenue as a referral reward.</p>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 bg-white/10 border border-white/20 rounded-2xl p-4 font-mono text-sm break-all flex items-center justify-between">
                    https://bunnyranch.io/join?ref={publicKey?.toString()?.slice(0, 12)}
                    <button className="ml-4 px-4 py-2 bg-white text-meta-navy rounded-xl font-black text-[10px] uppercase hover:scale-105 transition-all">Copy</button>
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-3 gap-8">
                  <div>
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Creators Referred</p>
                    <p className="text-3xl font-black">12</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Lifetime Reward</p>
                    <p className="text-3xl font-black">450.20 <span className="text-sm text-meta-orange">USDC</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {role === 'creator' && showSettings && (
          <div className="meta-card overflow-hidden max-w-3xl mx-auto w-full animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-meta-navy to-meta-navy/80 p-8 text-white relative">
              <h2 className="text-3xl font-black mb-2 tracking-tight uppercase">Profile Settings</h2>
              <p className="text-white/60 font-bold tracking-tight">Keep your profile fresh and your socials up to date.</p>
            </div>
            <div className="p-8 md:p-12">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-meta-navy/40 uppercase tracking-widest mb-2 text-left">Username</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-navy/40 font-bold">@</span>
                        <input
                          type="text"
                          placeholder="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full h-14 pl-12 pr-4 bg-white border border-meta-navy/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-meta-orange/20 font-bold text-meta-navy shadow-sm transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-meta-navy/40 uppercase tracking-widest mb-2 text-left">Short Bio</label>
                      <textarea
                        placeholder="Tell your fans who you are..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full p-4 bg-white border border-meta-navy/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-meta-orange/20 font-medium text-meta-navy shadow-sm transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-meta-navy/40 uppercase tracking-widest mb-2 text-left">Location (Country/City)</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-navy/30" size={18} />
                        <input
                          type="text"
                          placeholder="e.g. Netherlands"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full h-14 pl-12 pr-4 bg-white border border-meta-navy/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-meta-orange/20 font-bold text-meta-navy shadow-sm transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-meta-navy/40 uppercase tracking-widest mb-2 text-left flex justify-between">
                        <span>Hashtags (Max 10)</span>
                        <span className={hashtags.length >= 10 ? 'text-red-500' : ''}>{hashtags.length}/10</span>
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {hashtags.map((tag, i) => (
                          <div key={i} className="px-3 py-1 bg-meta-orange/10 text-meta-orange rounded-full text-[10px] font-black uppercase flex items-center gap-2 border border-meta-orange/20">
                            {tag}
                            <button onClick={() => setHashtags(hashtags.filter((_, idx) => idx !== i))} className="hover:text-meta-navy transition-colors">×</button>
                          </div>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. girl (press enter)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value.trim()
                            if (val && hashtags.length < 10) {
                              setHashtags([...hashtags, val.startsWith('#') ? val : `#${val}`]);
                              (e.target as HTMLInputElement).value = ''
                            }
                          }
                        }}
                        className="w-full h-14 px-4 bg-white border border-meta-navy/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-meta-orange/20 font-bold text-meta-navy shadow-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-meta-navy/40 uppercase tracking-widest mb-2 text-left">Profile Avatar</label>
                      <div className="relative h-32 w-32 rounded-3xl bg-meta-navy/5 flex items-center justify-center border-4 border-dashed border-meta-navy/10 hover:border-meta-orange/40 transition-all cursor-pointer overflow-hidden group">
                        <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        {avatar ? (
                          <img src={typeof avatar === 'string' ? (resolveMediaUrl(avatar) || '') : URL.createObjectURL(avatar)} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-meta-navy/20 group-hover:text-meta-orange/40 transition-colors">
                            <Upload size={32} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-xs font-black text-meta-navy/40 uppercase tracking-widest mb-2 text-left">Social Links</label>
                      <div className="grid gap-3">
                        <div className="relative">
                          <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-navy/30" size={18} />
                          <input type="text" placeholder="X (Twitter) URL" value={socials.twitter} onChange={e => setSocials({ ...socials, twitter: e.target.value })} className="w-full h-12 pl-12 pr-4 bg-white border border-meta-navy/10 rounded-xl text-sm font-medium" />
                        </div>
                        <div className="relative">
                          <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-navy/30" size={18} />
                          <input type="text" placeholder="Youtube Channel URL" value={socials.youtube} onChange={e => setSocials({ ...socials, youtube: e.target.value })} className="w-full h-12 pl-12 pr-4 bg-white border border-meta-navy/10 rounded-xl text-sm font-medium" />
                        </div>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-navy/30" size={18} />
                          <input type="text" placeholder="Personal Website" value={socials.website} onChange={e => setSocials({ ...socials, website: e.target.value })} className="w-full h-12 pl-12 pr-4 bg-white border border-meta-navy/10 rounded-xl text-sm font-medium" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleOnboard}
                    disabled={!!onboardingStatus}
                    className="meta-button-primary w-full h-16 text-xl flex items-center justify-center gap-3 shadow-2xl shadow-meta-orange/20"
                  >
                    {onboardingStatus ? <Loader2 className="animate-spin" /> : (
                      <>
                        Save Changes
                        <CheckCircle2 size={20} />
                      </>
                    )}
                  </button>
                  {onboardingError && (
                    <div className="mt-4 p-4 bg-red-500/10 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-500/20">
                      <AlertCircle size={20} /> {onboardingError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}
