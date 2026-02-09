"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Users, ShieldCheck, ArrowRight, Zap, Star } from 'lucide-react'
import { resolveMediaUrl } from '@/lib/media'

export default function CreatorsPage() {
    const [creators, setCreators] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')

    useEffect(() => {
        fetchCreators()
    }, [])

    const fetchCreators = async () => {
        try {
            const res = await fetch('/api/creators/featured') // Using existing featured endpoint as a base
            if (res.ok) {
                const data = await res.json()
                setCreators(data.creators)
            }
        } catch (e) {
            console.error('Fetch error:', e)
        }
        setLoading(false)
    }

    const filteredCreators = creators.filter(c =>
        (c.username?.toLowerCase() || '').includes(query.toLowerCase()) ||
        (c.bio?.toLowerCase() || '').includes(query.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-meta-peach/10">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <h1 className="text-5xl font-black text-meta-navy tracking-tight mb-3 uppercase flex items-center gap-4">
                            CREATORS
                            <Users size={40} className="text-meta-orange" />
                        </h1>
                        <p className="text-meta-navy/60 font-bold text-lg">Browse the best creators on the NIGHTSTUDIO ecosystem.</p>
                    </div>

                    <div className="w-full md:w-96 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-navy/30" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or bio..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-white border border-meta-navy/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-meta-orange/20 font-medium text-meta-navy shadow-sm transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array(8).fill(0).map((_, i) => (
                            <div key={i} className="meta-card h-80 animate-pulse bg-white/50" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCreators.map((creator) => (
                            <Link
                                key={creator._id}
                                href={`/creator/${creator.walletAddress || creator._id}`}
                                className="meta-card group hover:shadow-2xl hover:shadow-meta-orange/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col h-full"
                            >
                                <div className="h-24 bg-meta-navy relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-meta-orange/20 to-transparent"></div>
                                </div>

                                <div className="px-6 pb-6 pt-0 flex-1 flex flex-col relative">
                                    <div className="w-20 h-20 rounded-[1.5rem] bg-white border-4 border-white shadow-xl -mt-10 mb-4 overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                                        {creator.avatar ? (
                                            <img
                                                src={resolveMediaUrl(creator.avatar) || ''}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-meta-orange/10 flex items-center justify-center text-meta-orange font-black text-2xl uppercase">
                                                {creator.username?.[0] || 'N'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 mb-1">
                                        <h3 className="font-black text-meta-navy uppercase tracking-tight text-lg truncate">
                                            {creator.username || 'Anonymous'}
                                        </h3>
                                        <ShieldCheck size={16} className="text-blue-500 flex-shrink-0" />
                                    </div>

                                    <p className="text-xs font-black text-meta-navy/30 mb-4 tracking-widest uppercase">
                                        @{creator.walletAddress.slice(0, 4)}...{creator.walletAddress.slice(-4)}
                                    </p>

                                    <p className="text-sm font-medium text-meta-navy/60 line-clamp-2 mb-6 flex-1">
                                        {creator.bio || 'Sharing premium content on NIGHTSTUDIO.'}
                                    </p>

                                    <div className="pt-4 border-t border-meta-navy/5 flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-1">
                                            <Zap size={14} className="text-meta-orange fill-meta-orange" />
                                            <span className="text-xs font-black text-meta-navy uppercase">Premium</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-meta-orange font-black text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
                                            View Profile
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && filteredCreators.length === 0 && (
                    <div className="text-center py-24">
                        <div className="w-20 h-20 bg-meta-navy/5 rounded-full flex items-center justify-center mx-auto mb-6 text-meta-navy/20">
                            <Users size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-meta-navy uppercase tracking-tight">No creators found</h3>
                        <p className="text-meta-navy/40 font-bold mt-2">Try searching with a different keyword.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
