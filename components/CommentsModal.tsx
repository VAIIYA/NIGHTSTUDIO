"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Comment } from "@/types";
import { addComment, getPostComments } from "@/lib/server-actions";
import { shortenAddress, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Loader2, Send } from "lucide-react";

interface CommentsModalProps {
  postId: string;
  commentCount: number;
  children: React.ReactNode;
}

export function CommentsModal({ postId, commentCount, children }: CommentsModalProps) {
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const fetchedComments = await getPostComments(postId, 100, 0);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected || !publicKey) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to comment",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        variant: "destructive",
        title: "Empty comment",
        description: "Please write something to comment",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addComment(postId, publicKey.toString(), newComment.trim());
      setNewComment("");
      await loadComments(); // Reload comments to show the new one
      toast({
        title: "Comment added!",
        description: "Your comment has been posted",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add comment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments ({commentCount})
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-border pb-4 last:border-b-0">
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-mono">
                        {shortenAddress(comment.author, 2)}
                      </span>
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {shortenAddress(comment.author)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          · {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Form */}
        {connected && publicKey ? (
          <form onSubmit={handleSubmitComment} className="border-t border-border pt-4">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-mono">
                  {shortenAddress(publicKey.toString(), 2)}
                </span>
              </div>
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-[80px] resize-none"
                  maxLength={280}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">
                    {newComment.length}/280
                  </span>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting || !newComment.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="border-t border-border pt-4 text-center">
            <p className="text-muted-foreground text-sm">
              Connect your wallet to join the conversation
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}