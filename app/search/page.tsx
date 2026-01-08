"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TweetCard } from "@/components/TweetCard";
import { FollowButton } from "@/components/FollowButton";
import { SubscribeButton } from "@/components/SubscribeButton";
import { Post, Profile } from "@/types";
import { searchProfiles } from "@/lib/server-actions";
import { shortenAddress, formatDate } from "@/lib/utils";
import { Search, Users, FileText, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      // Update URL
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      router.replace(`/search?${params.toString()}`);

      // Search profiles (we'll need to add post search to server actions)
      const foundProfiles = await searchProfiles(searchQuery, 20);
      setProfiles(foundProfiles);

      // For now, we'll just search profiles. Post search would need to be added to server actions
      setPosts([]);

      setHasSearched(true);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleProfileClick = (wallet: string) => {
    router.push(`/profile/${wallet}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for users, posts, or hashtags..."
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isLoading || !query.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Search
          </Button>
        </form>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users ({profiles.length})
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Posts ({posts.length})
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  Try searching for a different username or display name
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {profiles.map((profile) => (
                  <div
                    key={profile.wallet}
                    className="border border-border rounded-lg p-6 hover:bg-accent/5 transition-colors cursor-pointer"
                    onClick={() => handleProfileClick(profile.wallet)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        {profile.avatar ? (
                          <img
                            src={`https://gateway.lighthouse.storage/ipfs/${profile.avatar}`}
                            alt="Profile"
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-mono">
                            {shortenAddress(profile.wallet, 2)}
                          </span>
                        )}
                      </div>

                      {/* Profile Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg truncate">
                            {profile.displayName || profile.username || shortenAddress(profile.wallet)}
                          </h3>
                          {profile.verified && (
                            <span className="text-primary text-sm">✓</span>
                          )}
                        </div>

                        {profile.username && (
                          <p className="text-muted-foreground mb-2">@{profile.username}</p>
                        )}

                        {profile.bio && (
                          <p className="text-muted-foreground mb-3 line-clamp-2">
                            {profile.bio}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="flex gap-6 text-sm text-muted-foreground mb-4">
                          <span>{profile.followers} followers</span>
                          <span>{profile.following} following</span>
                          <span>{profile.posts} posts</span>
                          {profile.earnings > 0 && (
                            <span>{profile.earnings} USDC earned</span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <FollowButton targetWallet={profile.wallet} />
                          <SubscribeButton creator={profile.wallet} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                <p className="text-muted-foreground">
                  Try searching for different keywords or hashtags
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <TweetCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Initial State */}
      {!hasSearched && !isLoading && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Search NightStudio</h3>
          <p className="text-muted-foreground">
            Find users, posts, and trending content
          </p>
        </div>
      )}
    </div>
  );
}