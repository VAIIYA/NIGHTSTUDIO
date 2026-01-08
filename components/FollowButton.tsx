"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { followUser, unfollowUser, isFollowing } from "@/lib/server-actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, UserMinus } from "lucide-react";

interface FollowButtonProps {
  targetWallet: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({ targetWallet, onFollowChange }: FollowButtonProps) {
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();

  const [isFollowingState, setIsFollowingState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingFollow, setIsCheckingFollow] = useState(true);

  const isOwnProfile = publicKey?.toString() === targetWallet;

  useEffect(() => {
    if (!connected || !publicKey || isOwnProfile) {
      setIsCheckingFollow(false);
      return;
    }

    const checkFollowStatus = async () => {
      try {
        const following = await isFollowing(publicKey.toString(), targetWallet);
        setIsFollowingState(following);
      } catch (error) {
        console.error("Failed to check follow status:", error);
      } finally {
        setIsCheckingFollow(false);
      }
    };

    checkFollowStatus();
  }, [connected, publicKey, targetWallet, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (!connected || !publicKey) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to follow users",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isFollowingState) {
        await unfollowUser(publicKey.toString(), targetWallet);
        setIsFollowingState(false);
        toast({
          title: "Unfollowed",
          description: "You have unfollowed this user",
        });
      } else {
        await followUser(publicKey.toString(), targetWallet);
        setIsFollowingState(true);
        toast({
          title: "Following",
          description: "You are now following this user",
        });
      }

      onFollowChange?.(!isFollowingState);
    } catch (error: any) {
      console.error("Failed to toggle follow:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update follow status",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button for own profile
  if (isOwnProfile) {
    return null;
  }

  // Don't show button if not connected
  if (!connected) {
    return null;
  }

  if (isCheckingFollow) {
    return (
      <Button variant="outline" disabled className="min-w-[100px]">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowingState ? "outline" : "default"}
      onClick={handleFollowToggle}
      disabled={isLoading}
      className="min-w-[100px]"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {isFollowingState ? "Unfollowing..." : "Following..."}
        </>
      ) : isFollowingState ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}