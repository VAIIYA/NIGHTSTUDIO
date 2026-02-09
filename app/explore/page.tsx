"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, ArrowRight, Zap, Filter, CheckCircle2 } from 'lucide-react'
import { resolveMediaUrl } from '@/lib/media'

interface Post {
  _id: string
  blurCID: string
  priceUSDC: number
  creatorId: { _id: string; bio: string; avatar: string; username?: string; walletAddress: string }
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [location, setLocation] = useState('')
  const [hashtag, setHashtag] = useState('')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    fetchPosts()
  }, [query, priceMin, priceMax, sort, location, hashtag])

  const fetchPosts = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ q: query, priceMin, priceMax, sort, location, hashtag })
      const res = await fetch(`/api/posts/search?${params}`)
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts)
      } else {
        setError('Failed to load posts')
      }
    } catch (e) {
      setError('Network error')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-meta-peach/30">
      <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">

        {/* Header & Search */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black text-meta-navy tracking-tight mb-2 flex items-center gap-3">
              EXPLORE
              <Zap size={32} className="text-meta-orange fill-meta-orange" />
            </h1>
            <p className="text-meta-navy/60 font-medium">Discover premium content from the world's top creators.</p>
          </div>

          <div className="w-full md:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-navy/40" size={20} />
            <input
              type="text"
              placeholder="Search creators or content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-white border border-meta-navy/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-meta-orange/20 font-medium text-meta-navy transition-all shadow-sm"
            />
          </div>
        </section>

        {/* Filters Bar */}
        <section className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-meta-navy text-white rounded-full text-sm font-bold">
            <Filter size={16} />
            FILTERS
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 px-4 bg-white border border-meta-navy/5 rounded-full text-sm font-bold text-meta-navy outline-none cursor-pointer hover:border-meta-orange transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="trending">Trending Now</option>
            <option value="price_low">Price: Low to High</option>
          </select>

          <div className="h-10 px-4 bg-white border border-meta-navy/5 rounded-full flex items-center gap-2">
            <span className="text-xs font-black text-meta-navy/40 uppercase tracking-widest">Global</span>
            <input
              type="text"
              placeholder="Location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-24 outline-none text-sm font-bold text-meta-navy bg-transparent"
            />
          </div>

          <div className="h-10 px-4 bg-white border border-meta-navy/5 rounded-full flex items-center gap-2">
            <span className="text-xs font-black text-meta-navy/40">#</span>
            <input
              type="text"
              placeholder="Tag..."
              value={hashtag}
              onChange={(e) => setHashtag(e.target.value)}
              className="w-24 outline-none text-sm font-bold text-meta-navy bg-transparent"
            />
          </div>
        </section>

        {error && (
          <div className="p-4 bg-red-500/10 text-red-600 rounded-2xl font-bold text-center">
            {error}
          </div>
        )}

        {/* Media Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="bg-white/50 border border-meta-navy/5 rounded-3xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {posts.map((post) => (
              <Link key={post._id} href={`/creator/${post.creatorId?.walletAddress || post.creatorId?._id || 'unknown'}`} className="group relative block aspect-[3/4] rounded-3xl overflow-hidden bg-meta-navy/5 hover:shadow-2xl hover:shadow-meta-orange/20 transition-all duration-500 hover:-translate-y-1 border border-meta-navy/5">
                <img
                  src={resolveMediaUrl(post.blurCID) || ''}
                  alt="Post"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Overlay Details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>

                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-meta-orange flex items-center justify-center text-[10px] font-black overflow-hidden">
                      {post.creatorId?.avatar ? (
                        <img
                          src={resolveMediaUrl(post.creatorId.avatar) || ''}
                          className="w-full h-full object-cover"
                        />
                      ) : 'B'}
                    </div>
                    <span className="text-xs font-black tracking-tight uppercase truncate">
                      {post.creatorId?.username || post.creatorId?.bio?.split(' ')[0] || 'Unknown'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      {post.priceUSDC === 0 ? (
                        <div className="flex items-center gap-1.5 text-meta-orange">
                          <CheckCircle2 size={12} strokeWidth={3} />
                          <span className="text-sm font-black tracking-widest uppercase">FREE</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Zap size={12} className="text-meta-orange fill-meta-orange" />
                          <span className="text-sm font-black">{post.priceUSDC} USDC</span>
                        </div>
                      )}
                    </div>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                <div className="absolute top-4 right-4">
                  <div className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-wider border border-white/20">
                    Premium
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 && !loading && (
          <div className="py-32 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-meta-navy/5 rounded-full flex items-center justify-center text-meta-navy/20">
              <Search size={32} />
            </div>
            <p className="text-meta-navy/40 font-black text-xl">NO CREATORS FOUND</p>
            <button
              onClick={() => { setQuery(''); setPriceMin(''); setPriceMax(''); setLocation(''); setHashtag(''); }}
              className="meta-button-ghost"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}