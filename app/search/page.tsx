"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, FileText, MessageCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDate, shortenAddress } from "@/lib/utils";

interface SearchResult {
  query: string;
  type: string;
  results: {
    posts?: any[];
    profiles?: any[];
    comments?: any[];
  };
  meta: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState(searchParams.get("type") || "all");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (searchQuery: string, type: string = "all") => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${type}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.data);
      } else {
        console.error("Search failed:", response.statusText);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&type=${activeTab}`);
      performSearch(query, activeTab);
    }
  };

  // Perform search when URL params change
  useEffect(() => {
    const q = searchParams.get("q");
    const type = searchParams.get("type") || "all";

    if (q && q !== query) {
      setQuery(q);
      setActiveTab(type);
      performSearch(q, type);
    }
  }, [searchParams, query]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&type=${value}`);
      performSearch(query, value);
    }
  };

  return (
    <div className="min-h-screen bg-peach-gradient text-[#121212]">
      {/* Header */}
      <div className="border-b border-primary/10 py-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-outfit tracking-tight">
              Search NightStudio
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover creators, posts, and conversations
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for creators, posts, comments..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 bg-white border-primary/20 text-[#121212] placeholder:text-muted-foreground shadow-sm rounded-full focus:border-primary focus:ring-primary/20"
                />
              </div>
              <Button type="submit" disabled={isLoading || !query.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {results && (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/50 border border-primary/10 rounded-full p-1">
              <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
                All
              </TabsTrigger>
              <TabsTrigger value="posts" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
                Posts
              </TabsTrigger>
              <TabsTrigger value="profiles" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
                Creators
              </TabsTrigger>
              <TabsTrigger value="comments" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
                Comments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="space-y-6">
                {results.results.posts && results.results.posts.length > 0 && (
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#9945FF]">
                        <FileText className="h-5 w-5" />
                        Posts ({results.results.posts.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.results.posts.slice(0, 5).map((post: any) => (
                          <Link
                            key={post.id}
                            href={`/profile/${post.author}`}
                            className="block p-3 rounded-lg hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/5"
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-mono">
                                  {shortenAddress(post.author, 2)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#121212]/80 line-clamp-2">
                                  {post.content}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(post.createdAt)}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {results.results.profiles && results.results.profiles.length > 0 && (
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-accent">
                        <User className="h-5 w-5" />
                        Creators ({results.results.profiles.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.results.profiles.slice(0, 6).map((profile: any) => (
                          <Link
                            key={profile.wallet}
                            href={`/profile/${profile.wallet}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/5"
                          >
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-mono">
                                {shortenAddress(profile.wallet, 2)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {profile.displayName || profile.username || shortenAddress(profile.wallet)}
                              </p>
                              {profile.username && (
                                <p className="text-xs text-muted-foreground">@{profile.username}</p>
                              )}
                              {profile.bio && (
                                <p className="text-xs text-[#121212]/60 line-clamp-1 mt-1">
                                  {profile.bio}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {results.results.comments && results.results.comments.length > 0 && (
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-500">
                        <MessageCircle className="h-5 w-5" />
                        Comments ({results.results.comments.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.results.comments.slice(0, 5).map((comment: any) => (
                          <Link
                            key={comment.id}
                            href={`/profile/${comment.author}`}
                            className="block p-3 rounded-lg hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/5"
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-mono">
                                  {shortenAddress(comment.author, 2)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#121212]/80 line-clamp-2">
                                  {comment.content}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(comment.createdAt)}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              {/* Posts only */}
              {results.results.posts && results.results.posts.length > 0 ? (
                <div className="space-y-4">
                  {results.results.posts.map((post: any) => (
                    <Card key={post.id} className="glass-card">
                      <CardContent className="p-6">
                        <Link href={`/profile/${post.author}`} className="hover:opacity-80 transition-opacity">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-mono">
                                {shortenAddress(post.author, 2)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">
                                  {shortenAddress(post.author)}
                                </span>
                                <span className="text-zinc-500 text-sm">
                                  · {formatDate(post.createdAt)}
                                </span>
                              </div>
                              <p className="text-[#121212]/80 mb-3">{post.content}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{post.likes} likes</span>
                                <span>{post.comments} comments</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No posts found matching your search.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="profiles" className="mt-6">
              {/* Profiles only */}
              {results.results.profiles && results.results.profiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.results.profiles.map((profile: any) => (
                    <Card key={profile.wallet} className="glass-card">
                      <CardContent className="p-6">
                        <Link href={`/profile/${profile.wallet}`} className="block hover:opacity-80 transition-opacity">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg font-mono">
                                {shortenAddress(profile.wallet, 2)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg truncate">
                                {profile.displayName || profile.username || shortenAddress(profile.wallet)}
                              </h3>
                              {profile.username && (
                                <p className="text-muted-foreground">@{profile.username}</p>
                              )}                   </div>
                          </div>
                          {profile.bio && (
                            <p className="text-[#121212]/70 text-sm line-clamp-3 mb-4">
                              {profile.bio}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{profile.followers || 0} followers</span>
                            <span>{profile.posts || 0} posts</span>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No creators found matching your search.</p>
                </div>
              )}   </TabsContent>

            <TabsContent value="comments" className="mt-6">
              {/* Comments only */}
              {results.results.comments && results.results.comments.length > 0 ? (
                <div className="space-y-4">
                  {results.results.comments.map((comment: any) => (
                    <Card key={comment.id} className="glass-card">
                      <CardContent className="p-6">
                        <Link href={`/profile/${comment.author}`} className="block hover:opacity-80 transition-opacity">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-mono">
                                {shortenAddress(comment.author, 2)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">
                                  {shortenAddress(comment.author)}
                                </span>
                                <span className="text-zinc-500 text-sm">
                                  · {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-[#121212]/80 mb-3">{comment.content}</p>
                              <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-semibold">
                                Comment on post
                              </span>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No comments found matching your search.</p>
                </div>
              )}   </TabsContent>
          </Tabs>
          {
          hasSearched && !results && !isLoading && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Start typing to search for creators, posts, and comments.</p>
            </div>
          )
        }
      </div >
      );
}