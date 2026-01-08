"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentConfirmModal } from "./PaymentConfirmModal";
import { useWallet } from "@solana/wallet-adapter-react";
import { useHasUnlocked } from "@/hooks/useHasUnlocked";

interface LockedImageProps {
  postId: string;
  author: string; // Creator wallet
  blurredImageUrl: string;
  originalImageUrl: string;
  price: number; // Price in USDC
  className?: string;
}

export function LockedImage({
  postId,
  author,
  blurredImageUrl,
  originalImageUrl,
  price,
  className = "",
}: LockedImageProps) {
  const { publicKey, connected } = useWallet();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { hasUnlocked, isLoading } = useHasUnlocked(postId, publicKey?.toString());

  const isUnlocked = hasUnlocked || (publicKey?.toString() === author);

  if (isLoading) {
    return (
      <div className={`relative w-full aspect-video bg-gray-900 rounded-lg ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (isUnlocked) {
    return (
      <div className={`relative w-full aspect-video rounded-lg overflow-hidden ${className}`}>
        <Image
          src={originalImageUrl}
          alt="Unlocked content"
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <>
      <div className={`relative w-full aspect-video rounded-lg overflow-hidden group ${className}`}>
        {/* Blurred image */}
        <div className="absolute inset-0">
          <Image
            src={blurredImageUrl}
            alt="Locked content"
            fill
            className="object-cover blur-xl"
            unoptimized
          />
        </div>

        {/* Overlay with unlock CTA */}
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 p-4">
          <div className="text-center">
            <Lock className="h-12 w-12 mx-auto mb-3 text-accent" />
            <h3 className="text-xl font-bold text-white mb-2">Unlock Content</h3>
            <p className="text-lg font-semibold text-accent mb-1">
              {price} USDC
            </p>
            <p className="text-sm text-gray-300 mb-4">
              Pay to view the original image
            </p>
          </div>

          {!connected ? (
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">
                Connect wallet to unlock
              </p>
            </div>
          ) : (
            <Button
              onClick={() => setShowPaymentModal(true)}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              size="lg"
            >
              <Unlock className="h-4 w-4 mr-2" />
              Unlock for {price} USDC
            </Button>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <PaymentConfirmModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          postId={postId}
          author={author}
          price={price}
          onSuccess={() => {
            setShowPaymentModal(false);
            // The useHasUnlocked hook will refetch automatically
          }}
        />
      )}
    </>
  );
}

