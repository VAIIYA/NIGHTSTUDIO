"use client"

import React from 'react'
import { Search, Compass, Wallet, Shield, Users, Zap, Mail, ChevronRight, HelpCircle } from 'lucide-react'
import Link from 'next/link'

export default function HelpCenter() {
    const categories = [
        { title: 'Getting Started', icon: Compass, description: 'Learn the basics of using NIGHTSTUDIO.' },
        { title: 'Payments & Solana', icon: Wallet, description: 'How to use USDC and manage your wallet.' },
        { title: 'Creator Dashboard', icon: Zap, description: 'Uploading content and tracking earnings.' },
        { title: 'Safety & Privacy', icon: Shield, description: 'Your data, security, and verification.' },
        { title: 'Fan Support', icon: Users, description: 'Unlocking content and following creators.' },
        { title: 'Policies', icon: HelpCircle, description: 'Legal terms and community rules.' },
    ]

    return (
        <div className="min-h-screen bg-meta-peach/20">
            {/* Hero Search Section */}
            <section className="bg-meta-navy pt-24 pb-32 px-4 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-meta-orange/10 rounded-full blur-[120px]"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-6">
                        NIGHTSTUDIO <span className="text-meta-orange">HELP CENTER</span>
                    </h1>
                    <p className="text-white/60 text-lg font-medium mb-10">How can we help you today?</p>

                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={24} />
                        <input
                            type="text"
                            placeholder="Search for articles, guides..."
                            className="w-full h-18 pl-16 pr-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl text-white font-bold outline-none focus:ring-2 focus:ring-meta-orange transition-all text-lg"
                        />
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 -mt-16 pb-24">
                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {categories.map((cat) => {
                        const Icon = cat.icon
                        return (
                            <div key={cat.title} className="meta-card p-8 hover:shadow-2xl hover:shadow-meta-orange/10 transition-all duration-500 cursor-pointer group">
                                <div className="w-14 h-14 bg-meta-orange/10 text-meta-orange rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Icon size={28} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-black text-meta-navy uppercase tracking-tight mb-2">{cat.title}</h3>
                                <p className="text-meta-navy/60 font-medium mb-6 text-sm">{cat.description}</p>
                                <div className="flex items-center gap-2 text-meta-orange font-black text-xs uppercase tracking-widest">
                                    View Articles <ChevronRight size={14} />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Featured FAQ */}
                <section className="bg-white rounded-[3rem] p-8 md:p-16 border border-meta-navy/5 shadow-xl shadow-meta-navy/5">
                    <h2 className="text-3xl font-black text-meta-navy tracking-tighter uppercase mb-12 flex items-center gap-4">
                        <HelpCircle className="text-meta-orange" size={32} />
                        Frequently Asked Questions
                    </h2>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h4 className="font-black text-meta-navy uppercase tracking-tight">Do you require KYC for creators?</h4>
                            <p className="text-meta-navy/60 font-medium leading-relaxed">No. We use privacy-preserving age affirmation and Solana wallet signatures to verify our community without storing your ID documents.</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-black text-meta-navy uppercase tracking-tight">How do I get paid?</h4>
                            <p className="text-meta-navy/60 font-medium leading-relaxed">Earnings are paid instantly in USDC directly to your connected Solana wallet the moment a fan unlocks your post.</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-black text-meta-navy uppercase tracking-tight">What are the platform fees?</h4>
                            <p className="text-meta-navy/60 font-medium leading-relaxed">We keep it simple: 90% goes to the creator, and 10% is the platform fee to help us keep the ranch running smoothly.</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-black text-meta-navy uppercase tracking-tight">Is my content secure?</h4>
                            <p className="text-meta-navy/60 font-medium leading-relaxed">Yes. All media is encrypted and stored decentrally. Fans only gain access to the decrypted version after a successful blockchain payment.</p>
                        </div>
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="mt-16 text-center">
                    <div className="meta-card p-12 bg-meta-orange text-white relative overflow-hidden">
                        <div className="absolute top-[-50%] left-[-20%] w-96 h-96 bg-white/10 rounded-full blur-[60px]"></div>
                        <h3 className="text-3xl font-black tracking-tighter uppercase mb-4 relative z-10">Still need help?</h3>
                        <p className="text-white/80 font-medium mb-8 max-w-xl mx-auto relative z-10">Our dedicated support team is available 24/7 to help you with any platform issues or questions.</p>
                        <a href="mailto:support@bunnyranch.com" className="inline-flex items-center gap-3 h-14 px-10 bg-white text-meta-orange rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform relative z-10">
                            <Mail size={18} /> Contact Support
                        </a>
                    </div>
                </section>
            </div>
        </div>
    )
}
