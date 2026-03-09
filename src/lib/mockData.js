export const MOCK_CREATORS = [
  {
    id: '1',
    username: 'babyxmillie',
    displayName: 'Millie 🐱',
    bio: 'idk i made this for fun lol',
    tagline: "i'm shy but it's worth a shot :3",
    avatar: 'https://i.pravatar.cc/150?img=47',
    banner: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=900&q=80',
    isVerified: true,
    isOnline: true,
    isNearby: true,
    followersCount: 10700,
    postsCount: 25,
    mediaCount: 24,
    subscriptionPrice: 0,
    trialDays: 7,
    tags: ['lifestyle', 'aesthetic', 'fashion'],
    joinDate: '2024-01-15',
  },
  {
    id: '2',
    username: 'anna.secret',
    displayName: 'Anna 🌹',
    bio: 'Your favorite secret ✨',
    avatar: 'https://i.pravatar.cc/150?img=32',
    banner: 'https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=900&q=80',
    isVerified: true,
    isOnline: false,
    isNearby: false,
    followersCount: 45200,
    postsCount: 142,
    mediaCount: 180,
    subscriptionPrice: 9.99,
    trialDays: 3,
    tags: ['fitness', 'lifestyle', 'travel'],
    joinDate: '2023-06-10',
  },
  {
    id: '3',
    username: 'dianadaniels01',
    displayName: 'Diana Daniels',
    bio: 'Living life one post at a time 🎀',
    avatar: 'https://i.pravatar.cc/150?img=25',
    banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=900&q=80',
    isVerified: false,
    isOnline: true,
    isNearby: false,
    followersCount: 8900,
    postsCount: 67,
    mediaCount: 89,
    subscriptionPrice: 14.99,
    trialDays: 0,
    tags: ['beauty', 'fashion'],
    joinDate: '2024-03-01',
  },
  {
    id: '4',
    username: 'luna.vibes',
    displayName: 'Luna 🌙',
    bio: 'Dreamy content for night owls ✨',
    avatar: 'https://i.pravatar.cc/150?img=45',
    banner: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=900&q=80',
    isVerified: true,
    isOnline: true,
    isNearby: false,
    followersCount: 22100,
    postsCount: 98,
    mediaCount: 120,
    subscriptionPrice: 4.99,
    trialDays: 7,
    tags: ['aesthetic', 'art', 'lifestyle'],
    joinDate: '2023-11-20',
  },
  {
    id: '5',
    username: 'crystalclear',
    displayName: 'Crystal 💎',
    bio: 'Quality content only. Elevate your feed.',
    avatar: 'https://i.pravatar.cc/150?img=29',
    banner: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=900&q=80',
    isVerified: true,
    isOnline: false,
    isNearby: true,
    followersCount: 67800,
    postsCount: 234,
    mediaCount: 300,
    subscriptionPrice: 19.99,
    trialDays: 0,
    tags: ['fitness', 'wellness', 'modeling'],
    joinDate: '2023-01-05',
  },
  {
    id: '6',
    username: 'stardustgirl',
    displayName: 'Stardust ⭐',
    bio: 'Your daily dose of sparkle 🌟',
    avatar: 'https://i.pravatar.cc/150?img=38',
    banner: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&q=80',
    isVerified: false,
    isOnline: true,
    isNearby: false,
    followersCount: 5400,
    postsCount: 31,
    mediaCount: 44,
    subscriptionPrice: 0,
    trialDays: 0,
    tags: ['casual', 'aesthetic'],
    joinDate: '2024-05-12',
  },
];

export const generatePosts = (creatorId, count = 12) => {
  const posts = [];
  const unsplashIds = [1, 2, 3, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  
  for (let i = 0; i < count; i++) {
    const isLocked = Math.random() > 0.4;
    const price = isLocked ? (Math.random() * 10 + 2).toFixed(2) : 0;
    posts.push({
      id: `${creatorId}-post-${i}`,
      creatorId,
      createdAt: new Date(Date.now() - i * 86400000 * Math.random() * 5).toISOString(),
      text: [
        'New content just dropped 🔥 hope you enjoy it',
        'feeling cute today ✨',
        'Behind the scenes 📸',
        'Exclusive for my subscribers only 💋',
        'Good morning beautiful people ☀️',
        null,
      ][Math.floor(Math.random() * 6)],
      isLocked,
      price: parseFloat(price),
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
  { id: 1, username: 'babyxmillie', displayName: 'Millie 🐱', avatar: 'https://i.pravatar.cc/150?img=47', lastMessage: 'hey!! glad you subbed 🥺', time: '2m', unread: 2, isOnline: true },
  { id: 2, username: 'anna.secret', displayName: 'Anna 🌹', avatar: 'https://i.pravatar.cc/150?img=32', lastMessage: 'thank you for the tip!! 💕', time: '1h', unread: 0, isOnline: false },
  { id: 3, username: 'luna.vibes', displayName: 'Luna 🌙', avatar: 'https://i.pravatar.cc/150?img=45', lastMessage: 'new post coming tonight 🌙', time: '3h', unread: 1, isOnline: true },
];

export const CURRENT_USER = {
  id: 'me',
  username: 'bunnyranch',
  displayName: 'Bunny Ranch',
  avatar: 'https://i.pravatar.cc/150?img=12',
  walletBalance: 0,
  solanaWallet: null,
  isCreator: false,
};

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
