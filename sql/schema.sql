CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  walletAddress TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS creators (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  walletAddress TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  bio TEXT,
  avatar TEXT,
  socialLinks TEXT, -- JSON string
  location TEXT,
  hashtags TEXT, -- JSON string
  referredBy TEXT,
  referralCode TEXT UNIQUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  creatorId TEXT NOT NULL,
  content TEXT,
  storachaCID TEXT,
  blurCID TEXT,
  priceUSDC REAL DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  unlockedUsers TEXT, -- JSON string of wallet addresses or user IDs
  hashtags TEXT, -- JSON string
  engagementScore REAL DEFAULT 0,
  stats_likes INTEGER DEFAULT 0,
  stats_reposts INTEGER DEFAULT 0,
  stats_comments INTEGER DEFAULT 0,
  FOREIGN KEY (creatorId) REFERENCES creators(id)
);

CREATE TABLE IF NOT EXISTS interactions (
  id TEXT PRIMARY KEY,
  postId TEXT NOT NULL,
  userId TEXT NOT NULL,
  type TEXT NOT NULL, -- 'like', 'repost', 'comment'
  content TEXT, -- for comments
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  postId TEXT NOT NULL,
  txSignature TEXT NOT NULL,
  amount REAL NOT NULL,
  nonce TEXT UNIQUE NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (postId) REFERENCES posts(id)
);

CREATE TABLE IF NOT EXISTS subscription_tiers (
  id TEXT PRIMARY KEY,
  creator TEXT NOT NULL, -- wallet address
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  benefits TEXT, -- JSON string
  isActive INTEGER DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  subscriber TEXT NOT NULL, -- wallet address
  creator TEXT NOT NULL, -- wallet address
  tierId TEXT NOT NULL,
  startDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  endDate DATETIME NOT NULL,
  isActive INTEGER DEFAULT 1,
  autoRenew INTEGER DEFAULT 1,
  lastPaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  totalPaid REAL DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tierId) REFERENCES subscription_tiers(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender TEXT NOT NULL, -- wallet address
  recipient TEXT NOT NULL, -- wallet address
  content TEXT,
  storachaCID TEXT,
  priceUSDC REAL DEFAULT 0,
  isUnlocked INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender) REFERENCES users(walletAddress),
  FOREIGN KEY (recipient) REFERENCES users(walletAddress)
);

CREATE TABLE IF NOT EXISTS nonces (
  id TEXT PRIMARY KEY,
  postId TEXT NOT NULL,
  userId TEXT NOT NULL,
  nonce TEXT UNIQUE NOT NULL,
  used INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  recipient TEXT NOT NULL, -- wallet address
  sender TEXT NOT NULL, -- wallet address
  type TEXT NOT NULL, -- like, comment, follow, unlock, subscription, repost
  postId TEXT,
  commentId TEXT,
  amount REAL,
  message TEXT NOT NULL,
  isRead INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient) REFERENCES users(walletAddress),
  FOREIGN KEY (sender) REFERENCES users(walletAddress)
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  postId TEXT NOT NULL,
  reporterId TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, reviewed, dismissed
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
