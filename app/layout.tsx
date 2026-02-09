import '../styles/globals.css'
import type { Metadata } from 'next'
import WalletContextProvider from '../lib/WalletContextProvider'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: 'NIGHTSTUDIO - Creator Economy',
  description: 'Secure, scalable adult content platform with Solana payments',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <WalletContextProvider>
          <Header />
          <main className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </WalletContextProvider>
      </body>
    </html>
  )
}
