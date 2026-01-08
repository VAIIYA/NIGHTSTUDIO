"use client";

import { useState, useEffect } from "react";

export function useHasUnlocked(postId: string, wallet: string | null | undefined) {
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!wallet || !postId) {
      setHasUnlocked(false);
      setIsLoading(false);
      return;
    }

    // Check if wallet has unlocked this post
    // In production, this would be a server action or API call
    fetch(`/api/unlocks?postId=${postId}&wallet=${wallet}`)
      .then((res) => res.json())
      .then((data) => {
        setHasUnlocked(data.unlocked || false);
      })
      .catch((error) => {
        console.error("Failed to check unlock status:", error);
        setHasUnlocked(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [postId, wallet]);

  return { hasUnlocked, isLoading };
}

