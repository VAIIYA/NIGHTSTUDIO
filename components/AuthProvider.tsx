"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'

interface User {
    _id: string
    username: string
    walletAddress: string
    avatar?: string
}

interface AuthContextType {
    isAuthenticated: boolean
    user: User | null
    token: string | null
    login: () => Promise<void>
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    token: null,
    login: async () => { },
    logout: () => { },
    isLoading: true
})

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { publicKey, signMessage, disconnect } = useWallet()
    const [token, setToken] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Check for existing token on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('jwt')
        if (storedToken) {
            setToken(storedToken)
            fetchMe(storedToken)
        } else {
            setIsLoading(false)
        }
    }, [])

    // Clear auth if wallet disconnects or changes
    useEffect(() => {
        if (!publicKey && token) {
            logout()
        } else if (publicKey && user && user.walletAddress !== publicKey.toString()) {
            logout()
        }
    }, [publicKey, user])

    const fetchMe = async (jwt: string) => {
        try {
            const res = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${jwt}` }
            })
            if (res.ok) {
                const data = await res.json()
                setUser(data.creator || data.user)
            } else {
                logout() // Invalid token
            }
        } catch (e) {
            console.error('Auth verification failed', e)
            logout()
        } finally {
            setIsLoading(false)
        }
    }

    const login = async () => {
        if (!publicKey || !signMessage) return

        try {
            const message = `Login to NIGHTSTUDIO:${Date.now()}`
            const encodedMessage = new TextEncoder().encode(message)
            const signature = await signMessage(encodedMessage)

            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: publicKey.toString(),
                    message,
                    signature: Array.from(signature)
                })
            })

            if (res.ok) {
                const data = await res.json()
                const newToken = data.token
                localStorage.setItem('jwt', newToken)
                setToken(newToken)
                await fetchMe(newToken)
            } else {
                throw new Error('Login failed')
            }
        } catch (error) {
            console.error('Login error:', error)
            alert('Failed to login. Please try again.')
        }
    }

    const logout = () => {
        localStorage.removeItem('jwt')
        setToken(null)
        setUser(null)
        // Optionally disconnect wallet too, but usually users want to stay connected to dApp
        // disconnect() 
    }

    return (
        <AuthContext.Provider value={{
            isAuthenticated: !!token && !!user,
            user,
            token,
            login,
            logout,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    )
}
