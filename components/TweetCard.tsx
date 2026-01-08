"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Repeat2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LockedImage } from "./LockedImage";
import { Post } from "@/types";
import { formatDate, shortenAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TweetCardProps {
  post: Post;
  className?: string;
}

export function TweetCard({ post, className }: TweetCardProps) {
  const hasImage = post.imageBlurred || post.imageOriginal;
  const imageUrl = post.imageOriginal 
    ? `https://gateway.lighthouse.storage/ipfs/${post.imageOriginal}`
    : post.imageBlurred
    ? `https://gateway.lighthouse.storage/ipfs/${post.imageBlurred}`
    : null;

  const blurredImageUrl = post.imageBlurred
    ? `https://gateway.lighthouse.storage/ipfs/${post.imageBlurred}`
    : imageUrl;

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
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/profile/${post.author}`}>
              <span className="font-semibold hover:underline">
                {shortenAddress(post.author)}
              </span>
            </Link>
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
          {hasImage && post.imagePrice && blurredImageUrl ? (
            <div className="mb-3">
              <LockedImage
                postId={post.id}
                author={post.author}
                blurredImageUrl={blurredImageUrl}
                originalImageUrl={imageUrl || blurredImageUrl}
                price={post.imagePrice}
              />
            </div>
          ) : hasImage && imageUrl ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3">
              <Image
                src={imageUrl}
                alt="Post image"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex items-center gap-6 mt-3">
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{post.comments}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Repeat2 className="h-4 w-4" />
              <span className="text-xs">{post.reposts}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="text-xs">{post.likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

