"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Shield, Zap, DollarSign } from 'lucide-react'

export default function Home() {
  const [creators, setCreators] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/creators/featured')
      .then(res => res.json())
      .then(data => setCreators(data.creators || []))
  }, [])
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 right-[-10%] w-[40%] h-[40%] bg-meta-orange/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-10 left-[-5%] w-[30%] h-[30%] bg-meta-navy/10 rounded-full blur-[100px] -z-10 animate-pulse delay-1000"></div>

        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-meta-orange/10 text-meta-orange text-xs font-black uppercase tracking-widest mb-6">
            <Zap size={14} fill="currentColor" />
            Social Redefined
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-meta-navy leading-[0.9] mb-8 tracking-tighter">
            THE FUTURE OF <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-meta-orange to-[#ff9d4d]">
              CREATOR ECONOMY
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-meta-navy/70 font-medium mb-12 leading-relaxed">
            Direct-to-fan monetization powered by Solana. Post media, set your price, and get paid instantly in USDC. No middlemen, no delays.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="meta-button-primary w-full sm:w-auto h-14 px-10 flex items-center justify-center gap-2 text-lg">
              Start Creating
              <ArrowRight size={20} />
            </Link>
            <Link href="/explore" className="meta-button-ghost w-full sm:w-auto h-14 px-10 flex items-center justify-center gap-2 text-lg">
              Explore Content
            </Link>
          </div>

          {/* Mockup / Feature Showcase */}
          <div className="mt-20 relative">
            <div className="max-w-4xl mx-auto meta-card p-4 md:p-8 aspect-video md:aspect-[21/9] flex items-center justify-center overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-meta-orange/10 text-meta-orange flex items-center justify-center mb-2">
                    <Shield size={24} />
                  </div>
                  <h3 className="font-bold text-lg">Secure & Private</h3>
                  <p className="text-sm text-meta-navy/60">Fully encrypted media and verifiable blockchain transactions.</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center mb-2">
                    <DollarSign size={24} />
                  </div>
                  <h3 className="font-bold text-lg">90% Creator Split</h3>
                  <p className="text-sm text-meta-navy/60">Industry leading splits. You keep almost everything you earn.</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2">
                    <Zap size={24} />
                  </div>
                  <h3 className="font-bold text-lg">Instant Payouts</h3>
                  <p className="text-sm text-meta-navy/60">USDC lands in your wallet the moment a fan unlocks your post.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section placeholder */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black text-meta-navy mb-2 tracking-tight">TRENDING CREATORS</h2>
              <p className="text-meta-navy/60 font-medium">Top profiles active right now</p>
            </div>
            <Link href="/explore" className="text-meta-orange font-bold flex items-center gap-1 hover:underline">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {creators.length > 0 ? creators.map((creator) => (
              <Link key={creator._id} href={`/creator/${creator._id}`} className="group cursor-pointer">
                <div className="aspect-[3/4] rounded-3xl bg-meta-peach overflow-hidden mb-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button className="w-full py-2 bg-white text-black font-bold rounded-xl text-sm">View Profile</button>
                  </div>
                  {creator.avatar ? (
                    <img src={creator.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-meta-orange/20 to-meta-navy/20 flex items-center justify-center text-meta-orange font-black text-4xl">
                      {creator.bio?.[0]?.toUpperCase() || 'B'}
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-meta-navy group-hover:text-meta-orange transition-colors truncate">
                  {creator.bio?.split(' ')[0] || 'Anonymous'}
                </h4>
                <p className="text-sm text-meta-navy/50 font-medium tracking-tight truncate">
                  @{creator.walletAddress.slice(0, 4)}...{creator.walletAddress.slice(-4)}
                </p>
              </Link>
            )) : (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-3xl bg-meta-navy/5 animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
