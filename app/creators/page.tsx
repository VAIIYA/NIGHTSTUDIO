"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Profile } from "@/types";
import { getRandomProfiles } from "@/lib/server-actions";
import { shortenAddress } from "@/lib/utils";
import { Loader2, Users, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="min-h-screen bg-peach-gradient text-[#121212]">
        {/* Header Skeleton */}
        <div className="border-b border-primary/10 py-8 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <Skeleton className="h-12 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
          </div>
        </div>

        {/* Creators Grid Skeleton */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card p-6">
                <div className="mb-4">
                  <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                </div>
                <div className="text-center space-y-2">
                  <Skeleton className="h-6 w-32 mx-auto" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                  <div className="flex justify-center gap-4 pt-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-peach-gradient text-[#121212]">
      {/* Header */}
      <div className="border-b border-primary/10 py-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-outfit tracking-tight text-[#121212]">
              Discover Creators
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with talented creators from around the world. Support their work and unlock exclusive content.
            </p>
          </div>
        </div>
      </div>

      {/* Creators Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No creators found. Be the first to join!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <Link
                key={profile.wallet}
                href={`/profile/${profile.wallet}`}
                className="group"
              >
                <div className="glass-card p-6 hover:border-primary/20 transition-all duration-300 hover:scale-105 h-full flex flex-col items-center">
                  {/* Avatar */}
                  <div className="mb-4 relative">
                     <div className="relative h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm group-hover:shadow-md transition-shadow">
                       {profile.avatar ? (
                         <Image src={profile.avatar} alt={profile.username || 'Creator'} fill className="object-cover rounded-full" />
                       ) : (
                        <span className="text-lg font-mono text-primary/80">
                          {shortenAddress(profile.wallet, 2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="text-center w-full">
                    <h3 className="font-bold text-lg mb-1 truncate text-[#121212]">
                      {profile.displayName || profile.username || shortenAddress(profile.wallet)}
                    </h3>
                    {profile.username && (
                      <p className="text-sm text-primary mb-2 font-medium">@{profile.username}</p>
                    )}
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 h-10">
                        {profile.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-4 text-sm text-[#121212]/70 pt-4 border-t border-primary/5 w-full mt-auto">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{profile.followers || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-accent" />
                        <span className="font-semibold">{profile.posts || 0}</span>
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
            className="px-8 py-3 rounded-full bg-white border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold shadow-sm hover:shadow-lg hover:-translate-y-0.5"
          >
            Discover More Creators
          </button>
        </div>
      </div>
    </div>
  );
}