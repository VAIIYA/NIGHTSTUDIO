import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      pathname: '/',
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock Solana wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    publicKey: null,
    connected: false,
    connecting: false,
    disconnect: jest.fn(),
    select: jest.fn(),
    wallets: [],
  }),
  WalletProvider: ({ children }: { children: React.ReactNode }) => children,
  WalletModalProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Heart: () => 'Heart',
  Zap: () => 'Zap',
  Users: () => 'Users',
  Crown: () => 'Crown',
  DollarSign: () => 'DollarSign',
  Star: () => 'Star',
  Sparkles: () => 'Sparkles',
  Lock: () => 'Lock',
  Unlock: () => 'Unlock',
  ArrowLeft: () => 'ArrowLeft',
  ArrowRight: () => 'ArrowRight',
  // Add other icons as needed
}));

// Global test utilities
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
};