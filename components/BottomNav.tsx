"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Users, LayoutDashboard, User, Search } from 'lucide-react'

export default function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        { label: 'Feed', href: '/feed', icon: Compass },
        { label: 'Explore', href: '/explore', icon: Search },
        { label: 'Creators', href: '/creators', icon: Users },
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-meta-navy/5 h-16 flex items-center justify-around px-4 pb-safe">
            {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-meta-orange' : 'text-meta-navy/60'
                            }`}
                    >
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
