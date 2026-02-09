"use client"

import React from 'react'
import Link from 'next/link'
import { Twitter, Github, Mail, ShieldCheck } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const links = {
        platform: [
            { label: 'Explore', href: '/explore' },
            { label: 'Creators', href: '/creators' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Help Center', href: '/help' },
        ],
        legal: [
            { label: 'Privacy Policy', href: '/legal/privacy-policy' },
            { label: 'Terms & Conditions', href: '/legal/terms-conditions' },
            { label: 'Acceptable Use', href: '/legal/acceptable-use-policy' },
            { label: 'Community Guidelines', href: '/legal/community-guidelines' },
            { label: 'Standard Contract', href: '/legal/standard-contract' },
            { label: 'DMCA Policy', href: '/legal/dmca-policy' },
            { label: 'Age Verification', href: '/legal/age-verification' },
            { label: 'USC 2257', href: '/legal/usc-2257' },
        ],
        support: [
            { label: 'Content Moderation', href: '/legal/content-moderation' },
            { label: 'API Policy', href: '/legal/api-policy' },
            { label: 'Marketing Policy', href: '/legal/marketing-policy' },
            { label: 'Complaints Policy', href: '/legal/complaints-policy' },
            { label: 'Cookie Policy', href: '/legal/cookie-policy' },
        ]
    }

    return (
        <footer className="bg-white border-t border-meta-navy/5 pt-16 pb-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-6 group">
                            <div className="w-8 h-8 bg-meta-orange rounded-lg flex items-center justify-center text-white font-black text-xl group-hover:rotate-12 transition-transform">
                                N
                            </div>
                            <span className="font-black text-xl tracking-tight text-meta-navy uppercase">NIGHTSTUDIO</span>
                        </Link>
                        <p className="text-meta-navy/60 font-medium mb-8 max-w-xs leading-relaxed">
                            The premier Solana-native creator platform. Direct monetization, instant payouts, and zero compromise on privacy.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-meta-navy/5 rounded-full flex items-center justify-center text-meta-navy/60 hover:bg-meta-orange hover:text-white transition-all">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-meta-navy/5 rounded-full flex items-center justify-center text-meta-navy/60 hover:bg-meta-orange hover:text-white transition-all">
                                <Github size={20} />
                            </a>
                            <a href="mailto:support@bunnyranch.com" className="w-10 h-10 bg-meta-navy/5 rounded-full flex items-center justify-center text-meta-navy/60 hover:bg-meta-orange hover:text-white transition-all">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase text-meta-navy/30 tracking-[0.2em] mb-6">Platform</h4>
                        <ul className="space-y-4">
                            {links.platform.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm font-bold text-meta-navy/60 hover:text-meta-orange transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase text-meta-navy/30 tracking-[0.2em] mb-6">Legal</h4>
                        <ul className="space-y-4">
                            {links.legal.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm font-bold text-meta-navy/60 hover:text-meta-orange transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase text-meta-navy/30 tracking-[0.2em] mb-6">Support & Other</h4>
                        <ul className="space-y-4">
                            {links.support.map(link => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm font-bold text-meta-navy/60 hover:text-meta-orange transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-meta-navy/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-black text-meta-navy/30 uppercase tracking-widest">
                        © {currentYear} NIGHTSTUDIO. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex items-center gap-2 px-3 py-1 bg-meta-orange/5 text-meta-orange text-[10px] font-black uppercase tracking-widest rounded-full border border-meta-orange/10">
                        <ShieldCheck size={12} />
                        Privately secured on Solana
                    </div>
                </div>
            </div>
        </footer>
    )
}
