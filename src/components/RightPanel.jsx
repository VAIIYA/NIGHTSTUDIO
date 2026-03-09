import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp } from 'lucide-react';
import { MOCK_CREATORS } from '../lib/mockData';
import CreatorCard from './CreatorCard';

export default function RightPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const suggested = MOCK_CREATORS.slice(0, 4);

  const trendingTags = [
    { tag: '#lifestyle', posts: '12.4K', rank: 1 },
    { tag: '#fitness', posts: '8.2K', rank: 2 },
    { tag: '#fashion', posts: '6.8K', rank: 3 },
    { tag: '#beauty', posts: '5.1K', rank: 4 },
    { tag: '#art', posts: '3.9K', rank: 5 },
  ];

  return (
    <aside className="w-72 flex-shrink-0 h-screen sticky top-0 border-l border-gray-200 bg-white overflow-y-auto">
      <div className="p-5">
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm"
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-blue-600" />
            <span className="font-bold text-gray-900">Trending</span>
          </div>
          {trendingTags.map((item, i) => (
            <div 
              key={item.tag}
              className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
            >
              <div>
                <div className="font-semibold text-sm text-gray-900">{item.tag}</div>
                <div className="text-xs text-gray-500">{item.posts} posts</div>
              </div>
              <span className="text-xs font-semibold text-green-600">#{item.rank}</span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
          <div className="mb-4">
            <span className="font-bold text-gray-900">Suggested Creators</span>
          </div>
          <div className="flex flex-col gap-1">
            {suggested.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} variant="compact" />
            ))}
          </div>
          <Link 
            to="/discover"
            className="block text-center mt-3 py-2 px-4 rounded-xl text-blue-600 text-sm font-semibold bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            Show more →
          </Link>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-4">
          <div className="text-xs text-gray-500 mb-1.5">Powered by</div>
          <div className="font-bold text-gray-900 mb-2">Solana</div>
          <div className="text-xs text-gray-600 leading-relaxed">
            Fast, secure payments with near-zero fees. Connect your wallet to get started.
          </div>
        </div>
      </div>
    </aside>
  );
}
