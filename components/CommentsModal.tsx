"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Comment } from "@/types";
import { addComment, getPostComments, getCommentReplies } from "@/lib/server-actions";
import { shortenAddress, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Loader2, Send } from "lucide-react";

interface CommentsModalProps {
  postId: string;
  commentCount: number;
  children: React.ReactNode;
}

export function CommentsModal({ postId, commentCount, children }: CommentsModalProps) {
  const { connected, publicKey } = useWallet();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, Comment[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedComments = await getPostComments(postId, 100, 0);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  const loadReplies = async (commentId: string) => {
    setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
    try {
      const fetchedReplies = await getCommentReplies(commentId, 20, 0);
      setReplies(prev => ({ ...prev, [commentId]: fetchedReplies }));
    } catch (error) {
      console.error("Failed to load replies:", error);
    } finally {
      setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
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
      await addComment(postId, publicKey.toString(), newComment.trim(), replyingTo || undefined);
      setNewComment("");
      setReplyingTo(null);

      if (replyingTo) {
        // Reload replies for the parent comment
        await loadReplies(replyingTo);
      } else {
        // Reload main comments
        await loadComments();
      }

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

                      {/* Reply button and actions */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Reply
                        </button>
                        {comment.replyCount && comment.replyCount > 0 && (
                          <button
                            onClick={() => loadReplies(comment.id)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            disabled={loadingReplies[comment.id]}
                          >
                            {loadingReplies[comment.id] ? (
                              <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                            ) : null}
                            {replies[comment.id] ? 'Hide replies' : `View ${comment.replyCount} repl${comment.replyCount === 1 ? 'y' : 'ies'}`}
                          </button>
                        )}
                      </div>

                      {/* Reply form */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 pl-4 border-l-2 border-border">
                          <form onSubmit={handleSubmitComment} className="flex gap-2">
                            <Textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder={`Reply to ${shortenAddress(comment.author)}...`}
                              className="min-h-[60px] resize-none text-sm"
                              maxLength={280}
                            />
                            <div className="flex flex-col gap-1">
                              <Button
                                type="submit"
                                size="sm"
                                disabled={isSubmitting || !newComment.trim()}
                              >
                                {isSubmitting ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Send className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setNewComment("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Nested replies */}
                      {replies[comment.id] && replies[comment.id].length > 0 && (
                        <div className="mt-3 space-y-3">
                          {replies[comment.id].map((reply) => (
                            <div key={reply.id} className="pl-4 border-l-2 border-border">
                              <div className="flex gap-3">
                                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-mono">
                                    {shortenAddress(reply.author, 1)}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-xs">
                                      {shortenAddress(reply.author)}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                      · {formatDate(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-xs whitespace-pre-wrap break-words">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
                  placeholder={replyingTo ? `Replying to comment...` : "Write a comment..."}
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
                         {replyingTo ? "Reply" : "Comment"}
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