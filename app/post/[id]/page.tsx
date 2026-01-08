"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TweetCard } from "@/components/TweetCard";
import { Post } from "@/types";
import { getPost } from "@/lib/server-actions";
import { Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    const loadPost = async () => {
      try {
        setIsLoading(true);
        const fetchedPost = await getPost(postId);
        setPost(fetchedPost);
      } catch (error) {
        console.error("Failed to load post:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Post not found</p>
          <Link href="/" className="text-primary hover:underline mt-4 inline-block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <TweetCard post={post} />
    </div>
  );
}

