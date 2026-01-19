"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { WalletMultiButton } from "@/components/WalletMultiButton";
import { ArrowRight, CheckCircle2, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-peach-gradient text-[#121212] overflow-hidden selection:bg-primary selection:text-white">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
            </div>

            {/* Navbar */}
            <header className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
                <Logo />
                <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#121212]/70">
                    <a href="#features" className="hover:text-primary transition-colors">Features</a>
                    <a href="/creators" className="hover:text-primary transition-colors">Creators</a>
                    <a href="/about" className="hover:text-primary transition-colors">About</a>
                </div>
                <div className="hidden md:block">
                    <Button variant="outline" className="rounded-full border-[#121212]/10 hover:bg-primary/5 text-sm font-bold">
                        Learn More
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 pt-20 pb-32">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">

                        {/* Left Content */}
                        <div className="flex-1 text-center lg:text-left space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-bold text-primary">
                                <Zap className="h-4 w-4 fill-current" />
                                <span>Powered by Solana</span>
                            </div>

                            <h1 className="text-6xl lg:text-8xl font-bold tracking-tight leading-[1] font-outfit">
                                <span className="block mb-2">Social.</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                                    Redefined.
                                </span>
                            </h1>

                            <p className="text-xl text-[#121212]/60 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                                NightStudio is a premium social experience built on Solana.
                                Connect with the world, share without limits, and own your digital presence.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <div className="scale-110">
                                    <WalletMultiButton />
                                </div>
                                <Button variant="ghost" className="rounded-full hover:bg-primary/10 text-primary font-bold flex items-center gap-2 group">
                                    Explore Creators
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>

                            <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-[#121212]/50 font-bold">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span>Direct Payouts</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-accent" />
                                    <span>Own Your Content</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Visual (Mockup) */}
                        <div className="flex-1 w-full max-w-[600px] lg:max-w-none relative">
                            {/* Decorative elements around the mockup */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent rounded-3xl blur-2xl opacity-10 transform rotate-6 scale-95" />

                            <div className="relative glass-card rounded-3xl p-6 shadow-2xl">
                                {/* Abstract UI Representation */}
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#9945FF] to-[#14F195]" />
                                            <div>
                                                <div className="h-3 w-24 bg-white/20 rounded-full mb-1" />
                                                <div className="h-2 w-16 bg-white/10 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-[#9945FF]/20 text-[#9945FF] text-xs font-bold">
                                            Following
                                        </div>
                                    </div>

                                    {/* Visual Content Placeholder */}
                                    <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 p-8 flex items-center justify-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-black/40" />
                                        <div className="relative z-10 text-center">
                                            <div className="h-12 w-12 mx-auto rounded-full bg-[#14F195]/20 flex items-center justify-center backdrop-blur-sm mb-3">
                                                <Shield className="h-6 w-6 text-[#14F195]" />
                                            </div>
                                            <p className="font-semibold text-white">Exclusive Content</p>
                                            <p className="text-xs text-white/60 mt-1">Unlock to view full post</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex gap-4">
                                            <div className="h-8 w-8 rounded-full bg-white/5" />
                                            <div className="h-8 w-8 rounded-full bg-white/5" />
                                            <div className="h-8 w-8 rounded-full bg-white/5" />
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-white/5" />
                                    </div>
                                </div>
                            </div>

                            {/* Floating Badges */}
                            <div className="absolute -right-8 top-1/4 bg-zinc-900 border border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-md animate-bounce duration-[3000ms]">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-[#14F195]/20 flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-[#14F195]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-400">Total Revenue</p>
                                        <p className="text-lg font-bold text-white">$42,069.00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer minimal */}
            <footer className="border-t border-primary/5 py-12 relative z-10">
                <div className="container mx-auto px-6 text-center text-[#121212]/40 text-xs font-semibold">
                    <p>&copy; {new Date().getFullYear()} NightStudio. Built on Solana.</p>
                    <div className="mt-4 flex items-center justify-center gap-6">
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/dmca" className="hover:text-primary transition-colors">DMCA</Link>
                        <Link href="/contract" className="hover:text-primary transition-colors">Creator Contract</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
