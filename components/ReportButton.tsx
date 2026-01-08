"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reportContent } from "@/lib/server-actions";
import { useToast } from "@/hooks/use-toast";
import { Flag, Loader2 } from "lucide-react";

interface ReportButtonProps {
  reportedUser: string;
  postId?: string;
  commentId?: string;
  variant?: "ghost" | "outline";
  size?: "sm" | "default";
}

export function ReportButton({ reportedUser, postId, commentId, variant = "ghost", size = "sm" }: ReportButtonProps) {
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected || !publicKey) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to report content",
      });
      return;
    }

    if (!reason) {
      toast({
        variant: "destructive",
        title: "Reason required",
        description: "Please select a reason for reporting",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await reportContent({
        reporter: publicKey.toString(),
        reportedUser,
        postId,
        commentId,
        reason: reason as any,
        description: description.trim() || undefined,
      });

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep the community safe. We'll review this report.",
      });

      setIsDialogOpen(false);
      setReason("");
      setDescription("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Report failed",
        description: error.message || "Failed to submit report",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Flag className="h-4 w-4" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason for reporting</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                <SelectItem value="copyright">Copyright violation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more context about why you're reporting this..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {description.length}/500
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !reason}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}