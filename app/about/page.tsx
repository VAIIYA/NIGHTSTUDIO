"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { WalletMultiButton } from "@/components/WalletMultiButton";
import { ArrowRight, Heart, Zap, Users, Crown, DollarSign, Star, Sparkles, Lock, Unlock } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-[#9945FF] selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#9945FF]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#14F195]/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-[#9945FF]/10 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <a href="#mission" className="hover:text-white transition-colors">Mission</a>
          <a href="#community" className="hover:text-white transition-colors">Community</a>
        </div>
        <div className="hidden md:block">
          <WalletMultiButton />
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-12">

            {/* Hero Title */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-[#14F195]">
                <Sparkles className="h-4 w-4 fill-current" />
                <span>The Future of Adult Social</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                <span className="block">Welcome to</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#14F195]">
                  NIGHTSTUDIO
                </span>
              </h1>

              <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                Where creators rule, communities thrive, and fantasies become fortunes.
                The most seductive social platform built on Solana blockchain.
              </p>
            </div>

            {/* Main Content Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">

              {/* Card 1: The Seduction */}
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#9945FF]/50 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#9945FF] to-[#14F195] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Seductive Freedom</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Express your wildest desires without judgment. Share intimate moments,
                  exclusive content, and connect with like-minded souls in a space designed
                  for pure, unfiltered passion.
                </p>
              </div>

              {/* Card 2: The Money */}
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#14F195]/50 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#14F195] to-[#9945FF] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Instant Riches</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Turn your allure into cold, hard USDC. Every like, every view, every
                  unlock flows directly to your wallet. No middlemen, no delays, just
                  pure financial ecstasy.
                </p>
              </div>

              {/* Card 3: The Community */}
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#9945FF]/50 transition-all duration-300 group md:col-span-2 lg:col-span-1">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#9945FF] to-[#14F195] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Vibrant Communities</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Build empires of desire. Connect with creators who ignite your passions
                  and fans who worship your every post. The ultimate playground for the
                  bold and beautiful.
                </p>
              </div>

            </div>

            {/* The Experience Section */}
            <div className="mt-20 space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold">The NIGHTSTUDIO Experience</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                  Imagine a world where your deepest fantasies become your greatest fortune.
                  Where every intimate moment, every seductive pose, every whispered secret
                  is worth real money.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left: Features */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#9945FF]/20 flex items-center justify-center flex-shrink-0">
                      <Lock className="h-5 w-5 text-[#9945FF]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Exclusive Content</h4>
                      <p className="text-zinc-400">
                        Lock your most tantalizing creations behind seductive paywalls.
                        Tease with blurred previews that drive fans wild with anticipation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#14F195]/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-5 w-5 text-[#14F195]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Lightning Fast</h4>
                      <p className="text-zinc-400">
                        Built on Solana&apos;s blazing-fast blockchain. Instant transactions,
                        zero fees, real-time payouts. Your money moves as fast as desire.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#9945FF]/20 flex items-center justify-center flex-shrink-0">
                      <Crown className="h-5 w-5 text-[#9945FF]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Creator First</h4>
                      <p className="text-zinc-400">
                        You own everything. Your content, your connections, your earnings.
                        Censorship-proof, decentralized, and utterly yours.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Visual */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#9945FF] to-[#14F195] rounded-3xl blur-2xl opacity-20 transform rotate-6 scale-95" />
                  <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="space-y-6">
                      {/* Mock Creator Profile */}
                      <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#9945FF] to-[#14F195] flex items-center justify-center">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">LuxeCreator</p>
                          <p className="text-sm text-zinc-400">@luxecreator • 10.2K fans</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-sm text-zinc-400">This month</p>
                          <p className="font-bold text-[#14F195]">$2,847.69</p>
                        </div>
                      </div>

                      {/* Mock Content */}
                      <div className="aspect-square rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
                        <div className="relative z-10 text-center">
                          <Lock className="h-16 w-16 mx-auto mb-4 text-[#9945FF] opacity-50" />
                          <p className="text-white font-semibold mb-2">Exclusive Content</p>
                          <p className="text-zinc-400 text-sm">Unlock for 0.5 USDC</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-zinc-400">
                        <span>💎 VIP Access: 5 USDC/month</span>
                        <span className="text-[#14F195] font-semibold">156 unlocks today</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-20 bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10 rounded-3xl border border-white/10 p-8 md:p-12">
              <div className="text-center space-y-6">
                <h3 className="text-2xl lg:text-3xl font-bold">Ready to Ignite Your Desires?</h3>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                  Join thousands of creators and fans already building fortunes from their passions.
                  The night is young, and the opportunities are endless.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                  <div className="scale-110">
                    <WalletMultiButton />
                  </div>
                  <button className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-semibold flex items-center gap-2 group">
                    Explore the Platform
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 relative z-10">
        <div className="container mx-auto px-6 text-center text-zinc-600 text-sm space-y-4">
          <div className="flex items-center justify-center gap-6 text-xs">
            <span>💜 Built with passion on Solana</span>
            <span>⚡ Lightning fast transactions</span>
            <span>💰 Creator-owned economy</span>
          </div>
           <p>&copy; {new Date().getFullYear()} NightStudio. Where fantasies become fortunes.</p>
           <div className="mt-4 flex items-center justify-center gap-6">
             <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">Terms of Service</Link>
             <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">Privacy Policy</Link>
             <Link href="/dmca" className="text-zinc-400 hover:text-white transition-colors">DMCA</Link>
             <Link href="/contract" className="text-zinc-400 hover:text-white transition-colors">Creator Contract</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}