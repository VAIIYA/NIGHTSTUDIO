import { useState } from 'react';
import { Search, Star, Heart } from 'lucide-react';
import { MOCK_CREATORS } from '../lib/mockData';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';

const CATEGORIES = ['All', 'Lifestyle', 'Fitness', 'Fashion', 'Beauty', 'Art', 'Travel'];

export default function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const filteredCreators = activeCategory === 'All' 
    ? MOCK_CREATORS 
    : MOCK_CREATORS.filter(c => c.tags?.includes(activeCategory.toLowerCase()));

  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover</h1>
        <p className="text-gray-500">Find your next favorite creators</p>
      </header>

      <div className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search creators..."
          className="w-full pl-11 pr-4 py-3 rounded-xl text-sm"
        />
      </div>

      <div 
        className="flex gap-2 overflow-x-auto pb-4 mb-8 -mx-4 px-4 scroll-x-mobile"
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCreators.map((creator) => (
          <div
            key={creator.id}
            onClick={() => navigate(`/@/${creator.username}`)}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1"
          >
            <div className="h-36 bg-gray-100 relative">
              <img 
                src={`https://images.unsplash.com/photo-1579540673398-9fdd95019387?w=400&q=80&seed=${creator.username}`} 
                alt="" 
                className="w-full h-full object-cover"
              />
              <div className="absolute -bottom-6 left-4">
                <img 
                  src={creator.avatar} 
                  alt="" 
                  className="w-12 h-12 rounded-2xl border-4 border-white bg-gray-200 object-cover"
                />
              </div>
            </div>
            <div className="pt-8 pb-4 px-4">
              <div className="font-bold text-gray-900 mb-1">{creator.displayName}</div>
              <div className="text-sm text-gray-500 mb-3">@{creator.username}</div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-700">4.9</span>
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={14} className="text-rose-500" />
                  <span className="font-semibold text-gray-700">12K</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
