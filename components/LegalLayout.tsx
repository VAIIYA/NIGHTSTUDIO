"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Scale, ChevronRight } from 'lucide-react'

interface LegalLayoutProps {
    children: React.ReactNode
    title: string
    lastUpdated?: string
}

export default function LegalLayout({ children, title, lastUpdated }: LegalLayoutProps) {
    const pathname = usePathname()

    const sections = [
        { label: 'Privacy Policy', href: '/legal/privacy-policy' },
        { label: 'Terms & Conditions', href: '/legal/terms-conditions' },
        { label: 'Acceptable Use', href: '/legal/acceptable-use-policy' },
        { label: 'Community Guidelines', href: '/legal/community-guidelines' },
        { label: 'Standard Contract', href: '/legal/standard-contract' },
        { label: 'Content Moderation', href: '/legal/content-moderation' },
        { label: 'DMCA Policy', href: '/legal/dmca-policy' },
        { label: 'Age Verification', href: '/legal/age-verification' },
        { label: 'USC 2257', href: '/legal/usc-2257' },
    ]

    return (
        <div className="min-h-screen bg-meta-peach/20 pt-12 pb-24 px-4">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
                {/* Sidebar Navigation */}
                <aside className="lg:w-72 flex-shrink-0">
                    <div className="sticky top-24">
                        <div className="flex items-center gap-3 mb-8 px-2">
                            <div className="w-10 h-10 bg-meta-navy rounded-xl flex items-center justify-center text-white shadow-lg">
                                <Scale size={20} />
                            </div>
                            <h2 className="text-xl font-black text-meta-navy tracking-tight uppercase">Legal Hub</h2>
                        </div>

                        <nav className="flex flex-col gap-1">
                            {sections.map((section) => {
                                const isActive = pathname === section.href
                                return (
                                    <Link
                                        key={section.href}
                                        href={section.href}
                                        className={`flex items-center justify-between group px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm uppercase tracking-tight ${isActive
                                                ? 'bg-meta-orange text-white shadow-xl shadow-meta-orange/20'
                                                : 'text-meta-navy/60 hover:bg-white hover:text-meta-navy hover:shadow-lg hover:shadow-meta-navy/5'
                                            }`}
                                    >
                                        {section.label}
                                        <ChevronRight size={16} className={`transition-transform duration-300 ${isActive ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-1 min-w-0">
                    <div className="meta-card p-8 md:p-16">
                        <header className="mb-12 border-b border-meta-navy/5 pb-8">
                            <h1 className="text-4xl md:text-5xl font-black text-meta-navy tracking-tighter uppercase mb-4 leading-none">
                                {title}
                            </h1>
                            {lastUpdated && (
                                <p className="text-xs font-black text-meta-navy/30 uppercase tracking-[0.2em]">
                                    Last Updated: {lastUpdated}
                                </p>
                            )}
                        </header>

                        <article className="prose prose-slate prose-lg max-w-none 
              prose-headings:font-black prose-headings:text-meta-navy prose-headings:uppercase prose-headings:tracking-tight
              prose-p:text-meta-navy/70 prose-p:font-medium prose-p:leading-relaxed
              prose-li:text-meta-navy/70 prose-li:font-medium
              prose-strong:text-meta-navy prose-strong:font-black
              prose-a:text-meta-orange prose-a:font-bold prose-a:no-underline hover:prose-a:underline
            ">
                            {children}
                        </article>
                    </div>
                </main>
            </div>
        </div>
    )
}
