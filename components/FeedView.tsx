"use client";

import { useEffect, useState } from "react";
import { TweetCard } from "@/components/TweetCard";
import { Post } from "@/types";
import { getPosts } from "@/lib/server-actions";
import { Loader2, AlertTriangle } from "lucide-react";

export function FeedView() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setIsLoading(true);
            const fetchedPosts = await getPosts(20, 0);
            setPosts(fetchedPosts);
        } catch (err) {
            setError("Failed to load posts");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Mainnet Warning Banner */}
            <div className="bg-red-500/10 border-b border-red-500/50 p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-red-400 mb-1">
                            ⚠️ MAINNET ONLY - REAL MONEY AT RISK
                        </h3>
                        <p className="text-sm text-red-300">
                            This app uses REAL USDC on Solana mainnet. All payments are final.
                            Test with small amounts (0.01-0.1 USDC) first. Double-check all
                            transaction details before confirming.
                        </p>
                    </div>
                </div>
            </div>

            {/* Feed */}
            {posts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
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
