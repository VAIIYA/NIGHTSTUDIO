export const MOCK_CREATORS = [
  {
    id: '1',
    wallet_address: '7xKqAB3mNpRt9sFzYwLmQdJkHvPc2eXuiGbTrNsWoY1',
    display_name: 'Millie 🎬',
    bio: 'exclusive content. no filters.',
    tagline: "i'm shy but it's worth a shot :3",
    avatar_url: 'https://i.pravatar.cc/150?img=47',
    banner_url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=900&q=80',
    is_verified: 1, is_online: true, is_nearby: true,
    followersCount: 10700, postsCount: 25, mediaCount: 24,
    subscription_price_usdc: 0, trial_days: 7,
    tags: ['lifestyle', 'aesthetic', 'fashion'],
  },
  {
    id: '2',
    wallet_address: 'AnnaSecretWallet9sFzYwLmQdJkHvPc2eXuiGbTrNsW',
    display_name: 'Anna 🌹',
    bio: 'Your favorite secret ✨',
    avatar_url: 'https://i.pravatar.cc/150?img=32',
    banner_url: 'https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=900&q=80',
    is_verified: 1, is_online: false, is_nearby: false,
    followersCount: 45200, postsCount: 142, mediaCount: 180,
    subscription_price_usdc: 9.99, trial_days: 3,
    tags: ['fitness', 'lifestyle', 'travel'],
  },
  {
    id: '3',
    wallet_address: 'DianaWallet01mNpRt9sFzYwLmQdJkHvPc2eXuiGbTr',
    display_name: 'Diana 💎',
    bio: 'Living life one post at a time 🎀',
    avatar_url: 'https://i.pravatar.cc/150?img=25',
    banner_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=900&q=80',
    is_verified: false, is_online: true, is_nearby: false,
    followersCount: 8900, postsCount: 67, mediaCount: 89,
    subscription_price_usdc: 14.99, trial_days: 0,
    tags: ['beauty', 'fashion'],
  },
  {
    id: '4',
    wallet_address: 'LunaVibesWalletYwLmQdJkHvPc2eXuiGbTrNsWoY4',
    display_name: 'Luna 🌙',
    bio: 'Dreamy content for night owls ✨',
    avatar_url: 'https://i.pravatar.cc/150?img=45',
    banner_url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=900&q=80',
    is_verified: 1, is_online: true, is_nearby: false,
    followersCount: 22100, postsCount: 98, mediaCount: 120,
    subscription_price_usdc: 4.99, trial_days: 7,
    tags: ['aesthetic', 'art', 'lifestyle'],
  },
  {
    id: '5',
    wallet_address: 'CrystalClearWalletQdJkHvPc2eXuiGbTrNsWoY5xx',
    display_name: 'Crystal 💎',
    bio: 'Quality content only. Elevate your feed.',
    avatar_url: 'https://i.pravatar.cc/150?img=29',
    banner_url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=900&q=80',
    is_verified: 1, is_online: false, is_nearby: true,
    followersCount: 67800, postsCount: 234, mediaCount: 300,
    subscription_price_usdc: 19.99, trial_days: 0,
    tags: ['fitness', 'wellness', 'modeling'],
  },
  {
    id: '6',
    wallet_address: 'StardustGirlWalletJkHvPc2eXuiGbTrNsWoY6xxxx',
    display_name: 'Stardust ⭐',
    bio: 'Your daily dose of sparkle 🌟',
    avatar_url: 'https://i.pravatar.cc/150?img=38',
    banner_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&q=80',
    is_verified: false, is_online: true, is_nearby: false,
    followersCount: 5400, postsCount: 31, mediaCount: 44,
    subscription_price_usdc: 0, trial_days: 0,
    tags: ['casual', 'aesthetic'],
  },
];

export const generatePosts = (creatorId, count = 8) => {
  const posts = [];
  for (let i = 0; i < count; i++) {
    const isLocked = Math.random() > 0.4;
    posts.push({
      id: `${creatorId}-post-${i}`,
      creator_wallet: MOCK_CREATORS.find(c => c.id === creatorId)?.wallet_address || creatorId,
      creatorId,
      created_at: new Date(Date.now() - i * 86400000 * Math.random() * 5).toISOString(),
      text: ['New content just dropped 🔥', 'feeling this 🎬', 'Behind the scenes 📸', 'exclusive drop 💋', null][Math.floor(Math.random() * 5)],
      is_locked: isLocked,
      price_usdc: isLocked ? parseFloat((Math.random() * 10 + 2).toFixed(2)) : 0,
      mediaType: Math.random() > 0.8 ? 'video' : 'image',
      thumbnail: `https://picsum.photos/seed/${creatorId}${i}/600/600`,
      likesCount: Math.floor(Math.random() * 500) + 10,
      commentsCount: Math.floor(Math.random() * 50),
      isLiked: Math.random() > 0.7,
    });
  }
  return posts;
};

export const MOCK_MESSAGES = [
  { id: 1, wallet_address: '7xKqAB3mNpRt9sFzYwLmQdJkHvPc2eXuiGbTrNsWoY1', display_name: 'Millie 🎬', avatar_url: 'https://i.pravatar.cc/150?img=47', lastMessage: 'hey!! glad you subbed 🥺', time: '2m', unread: 2, isOnline: true },
  { id: 2, wallet_address: 'AnnaSecretWallet9sFzYwLmQdJkHvPc2eXuiGbTrNsW', display_name: 'Anna 🌹', avatar_url: 'https://i.pravatar.cc/150?img=32', lastMessage: 'thank you for the tip!! 💕', time: '1h', unread: 0, isOnline: false },
  { id: 3, wallet_address: 'LunaVibesWalletYwLmQdJkHvPc2eXuiGbTrNsWoY4', display_name: 'Luna 🌙', avatar_url: 'https://i.pravatar.cc/150?img=45', lastMessage: 'new post dropping tonight 🌙', time: '3h', unread: 1, isOnline: true },
];

export const formatCount = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
  return Math.floor(seconds / 86400) + 'd';
};

export const truncateWallet = (address, chars = 4) => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const calculateSplit = (amountUsdc) => {
  const dev = parseFloat((amountUsdc * 0.05).toFixed(2));
  const broker = parseFloat((amountUsdc * 0.05).toFixed(2));
  const creator = parseFloat((amountUsdc - dev - broker).toFixed(2));
  return { creator, developer: dev, broker, total: amountUsdc };
};
