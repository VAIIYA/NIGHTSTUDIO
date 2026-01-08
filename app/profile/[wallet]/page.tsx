"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TweetCard } from "@/components/TweetCard";
import { Post } from "@/types";
import { getPosts } from "@/lib/server-actions";
import { shortenAddress } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const params = useParams();
  const wallet = params.wallet as string;
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!wallet) return;

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const { getPostsByAuthor } = await import("@/lib/server-actions");
      const userPosts = await getPostsByAuthor(wallet, 100, 0);
      setPosts(userPosts);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

    loadPosts();
  }, [wallet]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-lg font-mono">
              {shortenAddress(wallet, 3)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{shortenAddress(wallet)}</h1>
            <p className="text-sm text-muted-foreground font-mono break-all">
              {wallet}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {posts.length} posts
            </p>
          </div>
        </div>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts yet</p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <TweetCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

