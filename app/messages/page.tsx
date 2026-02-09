"use client"
import React, { useState, useEffect } from 'react'
import { Send, Image as ImageIcon, Lock, Unlock, Loader2, ArrowLeft, Search, MoreVertical } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { resolveMediaUrl } from '@/lib/media'
import Link from 'next/link'
import {
    PublicKey,
    Transaction
} from '@solana/web3.js'
import {
    getAssociatedTokenAddressSync,
    createTransferInstruction
} from '@solana/spl-token'
import {
    USDC_MINT_ADDRESS as SOLANA_USDC_MINT,
    getConnection as getSolanaConnection,
    PLATFORM_SOLANA_WALLET as PLATFORM_WALLET,
    calculateUSDCSpit
} from '@/lib/solana'

export default function MessagesPage() {
    const [chats, setChats] = useState<any[]>([])
    const [selectedChat, setSelectedChat] = useState<string | null>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const { publicKey, sendTransaction } = useWallet()

    const handleUnlockMessage = async (msg: any) => {
        if (!publicKey || !sendTransaction) return
        try {
            const conn = getSolanaConnection()
            const usdcMint = new PublicKey(SOLANA_USDC_MINT)
            const recipientWallet = new PublicKey(msg.sender) // Paying the sender
            const platformWallet = new PublicKey(PLATFORM_WALLET)

            const { creatorAmount, platformAmount } = calculateUSDCSpit(msg.priceUSDC)

            const userAta = getAssociatedTokenAddressSync(usdcMint, publicKey)
            const creatorAta = getAssociatedTokenAddressSync(usdcMint, recipientWallet)
            const platformAta = getAssociatedTokenAddressSync(usdcMint, platformWallet)

            const tx = new Transaction().add(
                createTransferInstruction(userAta, creatorAta, publicKey, creatorAmount),
                createTransferInstruction(userAta, platformAta, publicKey, platformAmount)
            )

            const sig = await sendTransaction(tx, conn)
            // Backend update (Assuming we'd add an API for this, for now just update state for demo)
            setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isUnlocked: true } : m))
            alert('Unlocked media!')
        } catch (e) { console.error(e) }
    }

    useEffect(() => {
        if (publicKey) fetchChats()
    }, [publicKey])

    const fetchChats = async () => {
        // In a real app, you'd fetch unique conversation partners
        // For demo, list some creators
        const res = await fetch('/api/creators/search?query=')
        if (res.ok) setChats(await res.json())
        setLoading(false)
    }

    const fetchMessages = async (otherUser: string) => {
        const token = localStorage.getItem('jwt')
        const res = await fetch(`/api/messages?otherUser=${otherUser}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) setMessages(await res.json())
    }

    useEffect(() => {
        if (selectedChat) fetchMessages(selectedChat)
    }, [selectedChat])

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedChat) return
        const token = localStorage.getItem('jwt')
        const res = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ recipient: selectedChat, content: newMessage })
        })
        if (res.ok) {
            setNewMessage('')
            fetchMessages(selectedChat)
        }
    }

    return (
        <div className="min-h-screen bg-meta-peach/10 flex items-center justify-center p-0 md:p-8">
            <div className="w-full max-w-6xl h-full md:h-[800px] bg-white rounded-none md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-meta-navy/5">

                {/* Conversations Sidebar */}
                <aside className={`w-full md:w-[350px] border-r border-meta-navy/5 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                    <header className="p-6 border-b border-meta-navy/5">
                        <h1 className="text-2xl font-black text-meta-navy uppercase tracking-tight mb-4">Messages</h1>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-navy/30" size={18} />
                            <input type="text" placeholder="Search direct messages" className="w-full h-11 pl-12 pr-4 bg-meta-navy/5 border-none rounded-full text-sm font-bold" />
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto">
                        {chats.map(chat => (
                            <button
                                key={chat.walletAddress}
                                onClick={() => setSelectedChat(chat.walletAddress)}
                                className={`w-full p-4 flex items-center gap-4 hover:bg-meta-orange/5 transition-all text-left ${selectedChat === chat.walletAddress ? 'bg-meta-orange/10 border-r-4 border-meta-orange' : ''}`}
                            >
                                <div className="w-14 h-14 rounded-full bg-meta-peach border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                                    <img src={resolveMediaUrl(chat.avatar) || ''} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-meta-navy uppercase tracking-tight truncate">@{chat.username}</h3>
                                    <p className="text-xs font-bold text-meta-navy/40 truncate">Tap to open conversation</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Chat Area */}
                <main className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
                    {selectedChat ? (
                        <>
                            <header className="p-4 border-b border-meta-navy/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 hover:bg-meta-navy/5 rounded-full"><ArrowLeft size={20} /></button>
                                    <h2 className="font-black text-meta-navy uppercase tracking-tight">Chat with Creator</h2>
                                </div>
                                <button className="p-2 hover:bg-meta-navy/5 rounded-full"><MoreVertical size={20} /></button>
                            </header>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-meta-peach/5">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.sender === publicKey?.toString() ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-4 rounded-[2rem] shadow-sm ${msg.sender === publicKey?.toString() ? 'bg-meta-orange text-white rounded-tr-none' : 'bg-white text-meta-navy border border-meta-navy/5 rounded-tl-none'}`}>
                                            <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                            {msg.priceUSDC > 0 && !msg.isUnlocked && (
                                                <div className="mt-3 p-4 bg-black/10 rounded-2xl flex flex-col items-center gap-2">
                                                    <Lock size={20} />
                                                    <button className="px-4 py-2 bg-white text-meta-navy rounded-full text-[10px] font-black uppercase">Unlock for {msg.priceUSDC} USDC</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <footer className="p-6 bg-white border-t border-meta-navy/5">
                                <div className="flex items-center gap-4 bg-meta-navy/5 rounded-full p-2 pr-4 pl-4">
                                    <button className="p-2 text-meta-navy/30 hover:text-meta-orange transition-colors"><ImageIcon size={20} /></button>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                                        placeholder="Start a new message..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-meta-navy/20"
                                    />
                                    <button onClick={handleSend} className="w-10 h-10 bg-meta-orange text-white rounded-full flex items-center justify-center shadow-lg shadow-meta-orange/20 hover:scale-110 transition-transform">
                                        <Send size={18} />
                                    </button>
                                </div>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-meta-peach/5">
                            <div className="w-24 h-24 bg-meta-navy/5 text-meta-navy/10 rounded-[2.5rem] flex items-center justify-center mb-6">
                                <Send size={48} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-3xl font-black text-meta-navy uppercase tracking-tight mb-2">Your Conversations</h2>
                            <p className="text-meta-navy/40 font-bold max-w-xs">Select a chat from the sidebar to start messaging with your favorite creators.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
