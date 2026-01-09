"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Profile } from "@/types";
import { getRandomProfiles } from "@/lib/server-actions";
import { shortenAddress } from "@/lib/utils";
import { Loader2, Users, TrendingUp } from "lucide-react";

export default function CreatorsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCreators = async () => {
      try {
        setIsLoading(true);
        const randomProfiles = await getRandomProfiles(24); // Get 24 random creators
        setProfiles(randomProfiles);
      } catch (error) {
        console.error("Failed to load creators:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCreators();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading creators...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Creators
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Connect with talented creators from around the world. Support their work and unlock exclusive content.
            </p>
          </div>
        </div>
      </div>

      {/* Creators Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">No creators found. Be the first to join!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <Link
                key={profile.wallet}
                href={`/profile/${profile.wallet}`}
                className="group"
              >
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover:scale-105">
                  {/* Avatar */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center border-4 border-zinc-800 group-hover:border-white/20 transition-colors">
                      {profile.avatar ? (
                        <Image
                          src={`https://ipfs.io/ipfs/${profile.avatar}`}
                          alt={profile.displayName || profile.username || "Creator"}
                          width={80}
                          height={80}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-mono text-sm">
                          {shortenAddress(profile.wallet, 2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {profile.displayName || profile.username || shortenAddress(profile.wallet)}
                    </h3>
                    {profile.username && (
                      <p className="text-sm text-zinc-400 mb-2">@{profile.username}</p>
                    )}
                    {profile.bio && (
                      <p className="text-sm text-zinc-300 mb-3 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{profile.followers || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{profile.posts || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-semibold"
          >
            Discover More Creators
          </button>
        </div>
      </div>
    </div>
  );
}