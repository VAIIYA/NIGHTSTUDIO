import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { truncateWallet } from '../lib/solana';
import { formatCount } from '../lib/mockData';

export default function CreatorCard({ creator, variant = 'full' }) {
  const { subscriptions, subscribe, unsubscribe } = useApp();
  const navigate = useNavigate();
  const isSubscribed = subscriptions.has(creator.walletAddress);

  const handleSubscribe = (e) => {
    e.stopPropagation();
    if (isSubscribed) {
      unsubscribe(creator.walletAddress);
    } else {
      subscribe(creator.walletAddress, creator.subscriptionPrice || 0);
    }
  };

  if (variant === 'compact') {
    return (
      <div
        onClick={() => navigate(`/@/${creator.username}`)}
        className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
      >
        <img 
          src={creator.avatar} 
          alt="" 
          className="w-11 h-11 rounded-full object-cover bg-gray-200" 
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 truncate">{creator.displayName}</div>
          <div className="text-xs text-gray-500 truncate">@{creator.username}</div>
        </div>
        <button
          onClick={handleSubscribe}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            isSubscribed 
              ? 'bg-gray-100 text-gray-600 border border-gray-200' 
              : 'bg-blue-600 text-white'
          }`}
        >
          {isSubscribed ? 'Following' : 'Follow'}
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/@/${creator.username}`)}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1"
    >
      <div className="h-24 bg-gray-100 relative">
        {creator.banner && (
          <img 
            src={creator.banner} 
            alt="" 
            className="w-full h-full object-cover" 
          />
        )}
      </div>
      <div className="p-5 pt-12">
        <img 
          src={creator.avatar} 
          alt="" 
          className="absolute top-14 left-5 w-20 h-20 rounded-2xl border-4 border-white bg-gray-200 object-cover shadow-md"
          style={{ top: '5.5rem' }}
        />
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="font-bold text-gray-900 truncate">{creator.displayName}</div>
              {creator.isVerified && <CheckCircle size={14} className="text-blue-600 flex-shrink-0" />}
            </div>
            <div className="text-sm text-gray-500">@{creator.username}</div>
          </div>
          <button
            onClick={handleSubscribe}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              isSubscribed 
                ? 'bg-gray-100 text-gray-700 border border-gray-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubscribed ? 'Following' : 'Follow'}
          </button>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{creator.bio}</p>
        <div className="flex gap-4 text-xs text-gray-500">
          <span><strong className="text-gray-700">{formatCount(creator.followersCount || 0)}</strong> subscribers</span>
          <span><strong className="text-gray-700">{creator.postsCount || 0}</strong> posts</span>
        </div>
      </div>
    </div>
  );
}
