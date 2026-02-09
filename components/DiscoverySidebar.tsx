"use client"
import React, { useState, useEffect } from 'react'
import { UserPlus, TrendingUp, MoreHorizontal, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { resolveMediaUrl } from '@/lib/media'

export function WhoToFollow() {
    const [creators, setCreators] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const { publicKey } = useWallet()

    useEffect(() => {
        fetch('/api/creators/featured')
            .then(res => res.json())
            .then(data => {
                let list = data.creators || []
                if (publicKey) {
                    list = list.filter((c: any) => c.walletAddress !== publicKey.toString())
                }
                setCreators(list.slice(0, 3))
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [publicKey])

    if (loading) return <div className="h-40 bg-meta-navy/[0.02] animate-pulse rounded-2xl" />

    return (
        <div className="bg-meta-navy/[0.02] rounded-2xl border border-meta-navy/5 overflow-hidden">
            <div className="p-4">
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    <UserPlus size={20} className="text-meta-orange" />
                    Who to follow
                </h3>
            </div>
            {creators.map((c) => (
                <Link key={c._id} href={`/creator/${c.walletAddress || c._id}`} className="p-4 hover:bg-meta-navy/5 transition-all flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-meta-orange/10 overflow-hidden flex-shrink-0">
                            {c.avatar ? (
                                <img
                                    src={resolveMediaUrl(c.avatar) || ''}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-meta-orange text-white flex items-center justify-center font-black">{c.username?.[0] || 'C'}</div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-black uppercase tracking-tight truncate leading-tight">{c.username || 'Anonymous'}</span>
                                <CheckCircle2 size={12} className="text-blue-500 flex-shrink-0" />
                            </div>
                            <div className="text-[10px] font-bold text-meta-navy/40 truncate">@{c.walletAddress?.slice(0, 8)}...</div>
                        </div>
                    </div>
                    <button className="bg-meta-navy text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-meta-navy/90 transition-all">
                        Follow
                    </button>
                </Link>
            ))}
            <Link href="/creators" className="block w-full text-left p-4 text-meta-orange text-xs font-black uppercase tracking-widest hover:bg-meta-navy/5 transition-colors">
                Show more
            </Link>
        </div>
    )
}

export function TrendingSidebar() {
    return (
        <div className="bg-meta-navy/[0.02] rounded-2xl border border-meta-navy/5 overflow-hidden">
            <div className="p-4">
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    <TrendingUp size={20} className="text-meta-orange" />
                    What's happening
                </h3>
            </div>
            {[
                { tag: '#Solana', posts: '124K posts', sub: 'Trending in Tech' },
                { tag: '$BONK', posts: '89K posts', sub: 'Trending in Finance' },
                { tag: 'BunnyRanch', posts: '12K posts', sub: 'Vibe check' },
                { tag: 'IPFS', posts: '4.2K posts', sub: 'Decentralized storage' },
            ].map((trend, i) => (
                <button key={i} className="w-full p-4 hover:bg-meta-navy/5 transition-colors text-left group">
                    <div className="flex justify-between text-[11px] font-black text-meta-navy/40 uppercase tracking-widest mb-0.5">
                        <span>{trend.sub}</span>
                        <MoreHorizontal size={14} className="opacity-0 group-hover:opacity-100" />
                    </div>
                    <div className="text-sm font-black text-meta-navy">{trend.tag}</div>
                    <div className="text-[11px] font-bold text-meta-navy/40">{trend.posts}</div>
                </button>
            ))}
        </div>
    )
}
