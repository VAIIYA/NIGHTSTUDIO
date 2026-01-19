"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Heart, MessageCircle, Repeat2, Share2, Pin, PinOff, Loader2, AlertTriangle, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
const CommentsModal = dynamic(() => import('./CommentsModal').then(mod => mod.CommentsModal), { ssr: false });
import { ReportButton } from "./ReportButton";
import { Post } from "@/types";
import { getPosts, getFollowingPosts } from "@/lib/server-actions";
import { formatDate, shortenAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useRealtimePostUpdates } from "@/hooks/use-websocket";
import {
  likePost,
  unlikePost,
  hasLikedPost,
  repostPost,
  deleteRepost,
  hasRepostedPost,
  togglePostPin
} from "@/lib/server-actions";
import { useToast } from "@/hooks/use-toast";

interface TweetCardProps {
  post: Post;
  className?: string;
}

function TweetCardComponent({ post, className }: TweetCardProps) {
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();

  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [repostsCount, setRepostsCount] = useState(post.reposts);
  const [isLiking, setIsLiking] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [isPinned, setIsPinned] = useState(post.pinned || false);

  // Real-time updates
  const { postUpdates } = useRealtimePostUpdates(post.id);

  // Handle real-time updates
  useEffect(() => {
    postUpdates.forEach(update => {
      if (update.type === 'like' && update.data?.action === 'like') {
        setLikesCount(prev => prev + 1);
      } else if (update.type === 'comment' && update.data?.action === 'new_comment') {
        // Comments are handled by the CommentsModal component
        // We could update comment count here if needed
      }
    });
  }, [postUpdates]);

  const hasImage = false;
  const imageUrl = null;
  const blurredImageUrl = null;

  // Check if user has liked/reposted this post
  useEffect(() => {
    if (!connected || !publicKey) return;

    const checkEngagement = async () => {
      try {
        const [liked, reposted] = await Promise.all([
          hasLikedPost(post.id, publicKey.toString()),
          hasRepostedPost(post.id, publicKey.toString())
        ]);
        setIsLiked(liked);
        setIsReposted(reposted);
      } catch (error) {
        console.error("Failed to check engagement:", error);
      }
    };

    checkEngagement();
  }, [connected, publicKey, post.id]);

  const handleLike = async () => {
    if (!connected || !publicKey) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to like posts",
      });
      return;
    }

    setIsLiking(true);
    try {
      if (isLiked) {
        await unlikePost(post.id, publicKey.toString());
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await likePost(post.id, publicKey.toString());
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to toggle like",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleRepost = async () => {
    if (!connected || !publicKey) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to repost",
      });
      return;
    }

    setIsReposting(true);
    try {
      if (isReposted) {
        await deleteRepost(post.id, publicKey.toString());
        setIsReposted(false);
        setRepostsCount(prev => prev - 1);
      } else {
        await repostPost(post.id, publicKey.toString());
        setIsReposted(true);
        setRepostsCount(prev => prev + 1);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to toggle repost",
      });
    } finally {
      setIsReposting(false);
    }
  };

  const handlePin = async () => {
    if (!connected || !publicKey) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to pin posts",
      });
      return;
    }

    if (publicKey.toString() !== post.author) {
      toast({
        variant: "destructive",
        title: "Access denied",
        description: "You can only pin your own posts",
      });
      return;
    }

    setIsPinning(true);
    try {
      await togglePostPin(post.id, post.author);
      setIsPinned(!isPinned);
      toast({
        variant: "success",
        title: isPinned ? "Post unpinned" : "Post pinned",
        description: isPinned ? "Post has been removed from pinned position" : "Post is now pinned to the top of your profile",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to toggle pin status",
      });
    } finally {
      setIsPinning(false);
    }
  };

  return (
    <article
      className={cn(
        "border-b border-border p-4 hover:bg-accent/5 transition-colors",
        className
      )}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/profile/${post.author}`}>
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-mono">
              {shortenAddress(post.author, 2)}
            </span>
          </div>
        </Link>

        {/* Content */}
        <Card className="mb-4 overflow-hidden border-orange-500/10 shadow-sm hover:shadow-md transition-all rounded-2xl bg-white/80 backdrop-blur-sm">
          {/* Post content padding */}
          <div className="p-4 sm:p-5 flex gap-3 sm:gap-4">
            <Link href={`/profile/${post.author}`}>
              <span className="font-semibold hover:underline">
                {shortenAddress(post.author)}
              </span>
            </Link>
            {isPinned && (
              <Pin className="h-3 w-3 text-yellow-500" />
            )}
            <span className="text-muted-foreground text-sm">
              · {formatDate(post.createdAt)}
            </span>
          </div>

          {/* Text Content */}
          {post.content && (
            <p className="text-sm mb-3 whitespace-pre-wrap break-words">
              {post.content}
            </p>
          )}

          {/* Image */}
          {/* IPFS Images removed */}

          {/* Actions */}
          <div className="flex items-center gap-6 mt-3" role="group" aria-label="Post actions">
            <CommentsModal postId={post.id} commentCount={post.comments}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-blue-500/10 hover:text-blue-500"
                aria-label={`${post.comments} comments`}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">{post.comments}</span>
              </Button>
            </CommentsModal>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2",
                isReposted
                  ? "text-green-500 hover:bg-green-500/10"
                  : "hover:bg-green-500/10 hover:text-green-500"
              )}
              onClick={handleRepost}
              disabled={isReposting}
              aria-label={isReposted ? `Un repost post by ${shortenAddress(post.author)}` : `Repost post by ${shortenAddress(post.author)}`}
              aria-pressed={isReposted}
            >
              <Repeat2 className={cn("h-4 w-4", isReposted && "fill-current")} />
              <span className="text-xs">{repostsCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2",
                isLiked
                  ? "text-red-500 hover:bg-red-500/10"
                  : "hover:bg-red-500/10 hover:text-red-500"
              )}
              onClick={handleLike}
              disabled={isLiking}
              aria-label={isLiked ? `Unlike post by ${shortenAddress(post.author)}` : `Like post by ${shortenAddress(post.author)}`}
              aria-pressed={isLiked}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              <span className="text-xs">{likesCount}</span>
            </Button>
            {publicKey?.toString() === post.author && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2",
                  isPinned
                    ? "text-yellow-500 hover:bg-yellow-500/10"
                    : "hover:bg-yellow-500/10 hover:text-yellow-500"
                )}
                onClick={handlePin}
                disabled={isPinning}
                title={isPinned ? "Unpin post" : "Pin post to top"}
              >
                {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </Button>
            )}
            <ReportButton
              reportedUser={post.author}
              postId={post.id}
              variant="ghost"
              size="sm"
            />
          </div>
        </Card>
      </div>
    </article>
  );
}

export const TweetCard = React.memo(TweetCardComponent);

