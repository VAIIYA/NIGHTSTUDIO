"use client"

import React from 'react'
import Link from 'next/link'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Search, Compass, Users, LayoutDashboard, Bell } from 'lucide-react'

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-meta-navy/5 px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-meta-orange rounded-lg flex items-center justify-center text-white font-black text-xl group-hover:rotate-12 transition-transform">
                        N
                    </div>
                    <span className="font-black text-xl tracking-tight text-meta-navy">NIGHTSTUDIO</span>
                </Link>

                <nav className="hidden md:flex items-center gap-1 font-medium text-meta-navy/70">
                    <Link href="/feed" className="px-4 py-2 hover:bg-meta-navy/5 rounded-full flex items-center gap-2 transition-colors hover:text-meta-navy">
                        <Compass size={18} />
                        Feed
                    </Link>
                    <Link href="/explore" className="px-4 py-2 hover:bg-meta-navy/5 rounded-full flex items-center gap-2 transition-colors hover:text-meta-navy">
                        <Search size={18} />
                        Explore
                    </Link>
                    <Link href="/creators" className="px-4 py-2 hover:bg-meta-navy/5 rounded-full flex items-center gap-2 transition-colors hover:text-meta-navy">
                        <Users size={18} />
                        Creators
                    </Link>
                    <Link href="/dashboard" className="px-4 py-2 hover:bg-meta-navy/5 rounded-full flex items-center gap-2 transition-colors hover:text-meta-navy">
                        <LayoutDashboard size={18} />
                        Dashboard
                    </Link>
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <button className="hidden sm:flex p-2 text-meta-navy/60 hover:bg-meta-navy/5 rounded-full transition-colors">
                    <Search size={20} />
                </button>
                <button className="hidden sm:flex p-2 text-meta-navy/60 hover:bg-meta-navy/5 rounded-full transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-meta-orange rounded-full border-2 border-white"></span>
                </button>
                <div className="meta-wallet-wrapper">
                    <WalletMultiButton className="!bg-meta-orange !rounded-full !font-bold !h-10 !px-6 hover:!bg-meta-orange/90 !transition-all" />
                </div>
            </div>
        </header>
    )
}
