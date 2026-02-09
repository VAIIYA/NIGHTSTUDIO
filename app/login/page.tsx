"use client"

import { useState } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

function LoginPageContent() {
  const { publicKey } = useWallet()
  const [status, setStatus] = useState<string>('idle')

  async function login() {
    if (!publicKey) {
      setStatus('connect-wallet')
      return
    }
    setStatus('signing')
    try {
      const message = `Login to NIGHTSTUDIO:${Date.now()}`
      const signer = (window as any).solana
      let signature: any
      if (signer && signer.isPhantom) {
        // @ts-ignore
        signature = await signer.signMessage(new TextEncoder().encode(message))
      }
      if (!signature) {
        setStatus('signature-unavailable')
        return
      }
      const resp = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: publicKey.toString(), message, signature: Array.from(new Uint8Array(signature)) }),
      })
      if (resp.ok) {
        const data = await resp.json()
        localStorage.setItem('jwt', data.token)
        setStatus('logged-in')
      } else {
        setStatus('failed')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden bg-meta-peach/50">
      {/* Decorative Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-meta-orange/5 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-meta-navy/5 rounded-full blur-[100px] -z-10"></div>

      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-meta-navy/60 font-bold mb-6 hover:text-meta-navy transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="meta-card p-8 md:p-10 text-center relative">
          <div className="w-20 h-20 bg-meta-orange rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-meta-orange/30">
            <ShieldCheck size={40} strokeWidth={2.5} />
          </div>

          <h2 className="text-3xl font-black text-meta-navy mb-3 tracking-tight uppercase">SECURE LOGIN</h2>
          <p className="text-meta-navy/60 font-medium mb-10 leading-snug">
            Connect your Solana wallet to access your creator dashboard or unlock exclusive content.
          </p>

          <div className="space-y-4">
            <div className="meta-wallet-wrapper-login">
              <WalletMultiButton className="!w-full !justify-center !bg-meta-orange !rounded-2xl !font-black !h-14 !px-8 hover:!bg-meta-orange/90 !transition-all !text-lg !shadow-xl !shadow-meta-orange/20" />
            </div>

            {publicKey && (
              <button
                onClick={login}
                disabled={status === 'signing'}
                className="meta-button-secondary w-full h-14 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === 'signing' ? <Loader2 className="animate-spin" /> : 'Confirm Identity'}
              </button>
            )}
          </div>

          <div className="mt-10 pt-8 border-t border-meta-navy/5">
            <div className="flex items-center justify-center gap-2 text-sm font-bold tracking-tight text-meta-navy/40">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              SOLANA MAINNET ACTIVE
            </div>

            {status !== 'idle' && (
              <p className={`mt-4 text-sm font-bold tracking-tighter uppercase p-2 rounded-lg bg-meta-peach/50 ${status === 'logged-in' ? 'text-green-600' : 'text-meta-orange'
                }`}>
                {status.replace('-', ' ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(LoginPageContent), { ssr: false })
