import { createClient } from '@libsql/client/web';
import { DEVELOPER_WALLET, BROKER_WALLET } from './solana';

let _client = null;

export const getTursoClient = () => {
  if (_client) return _client;
  const url = import.meta.env.VITE_TURSO_DATABASE_URL;
  const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    console.warn('Turso env vars not set. Falling back to mock data.');
    return null;
  }
  _client = createClient({ url, authToken });
  return _client;
};

export const initDB = async () => {
  console.log('Bunny Ranch Initializing...');
  console.log('Developer Protocol Wallet:', DEVELOPER_WALLET.toString());
  console.log('Broker Protocol Wallet:', BROKER_WALLET.toString());

  const client = getTursoClient();
  if (!client) return;
  await client.batch([
    `CREATE TABLE IF NOT EXISTS users (
      wallet_address TEXT PRIMARY KEY,
      display_name TEXT,
      bio TEXT,
      avatar_url TEXT,
      banner_url TEXT,
      is_verified INTEGER DEFAULT 0,
      is_creator INTEGER DEFAULT 0,
      subscription_price_usdc REAL DEFAULT 0,
      trial_days INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      creator_wallet TEXT NOT NULL,
      text TEXT,
      media_url TEXT,
      media_type TEXT DEFAULT 'image',
      is_locked INTEGER DEFAULT 0,
      price_usdc REAL DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (creator_wallet) REFERENCES users(wallet_address)
    )`,
    `CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      subscriber_wallet TEXT NOT NULL,
      creator_wallet TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      expires_at TEXT,
      tx_signature TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      buyer_wallet TEXT NOT NULL,
      post_id TEXT NOT NULL,
      amount_usdc REAL NOT NULL,
      tx_signature TEXT NOT NULL,
      confirmed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_wallet TEXT NOT NULL,
      recipient_wallet TEXT NOT NULL,
      content TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
  ], 'write');
};

// Get or create a user row when they connect their wallet for the first time
export const upsertUser = async (walletAddress) => {
  const client = getTursoClient();
  if (!client) return null;
  await client.execute({
    sql: `INSERT INTO users (wallet_address) VALUES (?)
          ON CONFLICT(wallet_address) DO NOTHING`,
    args: [walletAddress],
  });
  return getUserByWallet(walletAddress);
};

export const getUserByWallet = async (walletAddress) => {
  const client = getTursoClient();
  if (!client) return null;
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE wallet_address = ?',
    args: [walletAddress],
  });
  return result.rows[0] || null;
};

export const updateUserProfile = async (walletAddress, fields) => {
  const client = getTursoClient();
  if (!client) return null;
  const keys = Object.keys(fields);
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(fields), walletAddress];
  await client.execute({
    sql: `UPDATE users SET ${setClause} WHERE wallet_address = ?`,
    args: values,
  });
  return getUserByWallet(walletAddress);
};

export const getCreatorPosts = async (creatorWallet, limit = 20, offset = 0) => {
  const client = getTursoClient();
  if (!client) return [];
  const result = await client.execute({
    sql: 'SELECT * FROM posts WHERE creator_wallet = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    args: [creatorWallet, limit, offset],
  });
  return result.rows;
};

export const createPost = async (postData) => {
  const client = getTursoClient();
  if (!client) return null;
  const id = crypto.randomUUID();
  await client.execute({
    sql: `INSERT INTO posts (id, creator_wallet, text, media_url, media_type, is_locked, price_usdc)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, postData.creatorWallet, postData.text, postData.mediaUrl,
      postData.mediaType || 'image', postData.isLocked ? 1 : 0, postData.priceUsdc || 0],
  });
  return id;
};

export const recordPurchase = async (buyerWallet, postId, amountUsdc, txSignature) => {
  const client = getTursoClient();
  if (!client) return;
  const id = crypto.randomUUID();
  await client.execute({
    sql: `INSERT INTO purchases (id, buyer_wallet, post_id, amount_usdc, tx_signature, confirmed)
          VALUES (?, ?, ?, ?, ?, 1)`,
    args: [id, buyerWallet, postId, amountUsdc, txSignature],
  });
};

export const hasPurchased = async (buyerWallet, postId) => {
  const client = getTursoClient();
  if (!client) return false;
  const result = await client.execute({
    sql: 'SELECT id FROM purchases WHERE buyer_wallet = ? AND post_id = ? AND confirmed = 1',
    args: [buyerWallet, postId],
  });
  return result.rows.length > 0;
};

export const isSubscribed = async (subscriberWallet, creatorWallet) => {
  const client = getTursoClient();
  if (!client) return false;
  const result = await client.execute({
    sql: `SELECT id FROM subscriptions
          WHERE subscriber_wallet = ? AND creator_wallet = ? AND status = 'active'
          AND (expires_at IS NULL OR expires_at > datetime('now'))`,
    args: [subscriberWallet, creatorWallet],
  });
  return result.rows.length > 0;
};

export const recordSubscription = async (subscriberWallet, creatorWallet, txSignature, days = 30) => {
  const client = getTursoClient();
  if (!client) return;
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
  await client.execute({
    sql: `INSERT INTO subscriptions (id, subscriber_wallet, creator_wallet, status, expires_at, tx_signature)
          VALUES (?, ?, ?, 'active', ?, ?)`,
    args: [id, subscriberWallet, creatorWallet, expiresAt, txSignature],
  });
};

export const getFeedPosts = async (limit = 30) => {
  const client = getTursoClient();
  if (!client) return [];
  const result = await client.execute({
    sql: `SELECT p.*, u.display_name, u.avatar_url, u.is_verified
          FROM posts p
          JOIN users u ON p.creator_wallet = u.wallet_address
          ORDER BY p.created_at DESC LIMIT ?`,
    args: [limit],
  });
  return result.rows;
};

// Admin & Creator management functions

export const getAllCreators = async (limit = 50) => {
  const client = getTursoClient();
  if (!client) return [];
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE is_creator = 1 ORDER BY created_at DESC LIMIT ?',
    args: [limit],
  });
  return result.rows;
};

export const getAllUsers = async (limit = 100) => {
  const client = getTursoClient();
  if (!client) return [];
  const result = await client.execute({
    sql: 'SELECT * FROM users ORDER BY created_at DESC LIMIT ?',
    args: [limit],
  });
  return result.rows;
};

export const getRecentPurchases = async (limit = 50) => {
  const client = getTursoClient();
  if (!client) return [];
  const result = await client.execute({
    sql: 'SELECT * FROM purchases ORDER BY created_at DESC LIMIT ?',
    args: [limit],
  });
  return result.rows;
};

export const getPlatformStats = async () => {
  const client = getTursoClient();
  if (!client) return { totalUsers: 0, totalCreators: 0, totalPurchases: 0, totalVolume: 0 };

  const [users, creators, purchases, volume] = await Promise.all([
    client.execute('SELECT COUNT(*) as count FROM users'),
    client.execute('SELECT COUNT(*) as count FROM users WHERE is_creator = 1'),
    client.execute('SELECT COUNT(*) as count FROM purchases'),
    client.execute('SELECT SUM(amount_usdc) as sum FROM purchases WHERE confirmed = 1'),
  ]);

  return {
    totalUsers: Number(users.rows[0].count),
    totalCreators: Number(creators.rows[0].count),
    totalPurchases: Number(purchases.rows[0].count),
    totalVolume: Number(volume.rows[0].sum || 0),
  };
};

export const suspendCreator = async (walletAddress) => {
  const client = getTursoClient();
  if (!client) return;
  await client.execute({
    sql: 'UPDATE users SET is_creator = 0 WHERE wallet_address = ?',
    args: [walletAddress],
  });
};
