import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: {
    default: "NightStudio - Premium Social Experience",
    template: "%s | NightStudio"
  },
  description: "NightStudio is a premium social experience built on Solana. Connect with the world, share without limits, and own your digital presence.",
  keywords: [
    "social network",
    "blockchain",
    "solana",
    "creators",
    "paid content",
    "web3 social",
    "decentralized social",
    "content monetization"
  ],
  authors: [{ name: "NightStudio Team" }],
  creator: "NightStudio",
  publisher: "NightStudio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  themeColor: "#9945FF",
  colorScheme: "light",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: [
      { url: "/logo.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/logo.jpg", sizes: "16x16", type: "image/jpeg" }
    ],
    shortcut: "/logo.jpg",
    apple: [
      { url: "/logo.jpg", sizes: "180x180", type: "image/jpeg" }
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nightstudio.vercel.app",
    title: "NightStudio - Premium Social Experience",
    description: "Connect with creators, share exclusive content, and own your digital presence on Solana blockchain.",
    siteName: "NightStudio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NightStudio - Premium Social Experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NightStudio - Premium Social Experience",
    description: "Connect with creators, share exclusive content, and own your digital presence on Solana blockchain.",
    images: ["/og-image.jpg"],
    creator: "@nightstudio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <ErrorBoundary>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}

