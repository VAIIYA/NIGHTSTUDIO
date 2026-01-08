"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, VersionedTransaction } from "@solana/web3.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { buildUSDCTransferTransaction, calculateFee, getUSDCBalance } from "@/lib/solana/usdc";
import { getConnection } from "@/lib/solana/connection";
import { PLATFORM_FEE_PERCENT } from "@/lib/solana/constants";
import { useToast } from "@/hooks/use-toast";
import { recordUnlock } from "@/lib/server-actions";

interface PaymentConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  author: string; // Creator wallet public key
  price: number; // Price in USDC
  onSuccess?: () => void;
}

export function PaymentConfirmModal({
  open,
  onOpenChange,
  postId,
  author,
  price,
  onSuccess,
}: PaymentConfirmModalProps) {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const platformWallet = process.env.NEXT_PUBLIC_PLATFORM_WALLET
    ? new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_WALLET)
    : undefined;

  const { fee, remaining } = calculateFee(price);

  const handlePayment = async () => {
    if (!publicKey || !signTransaction || !sendTransaction) {
      toast({
        variant: "destructive",
        title: "Wallet Error",
        description: "Please connect your wallet",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const connection = getConnection();

      // Check USDC balance
      const { balance, hasAccount } = await getUSDCBalance(connection, publicKey);
      
      if (!hasAccount || balance < price) {
        toast({
          variant: "destructive",
          title: "Insufficient USDC",
          description: `You need at least ${price} USDC. Current balance: ${balance.toFixed(2)} USDC`,
        });
        setIsProcessing(false);
        return;
      }

      // Build transaction
      const transaction = await buildUSDCTransferTransaction(
        connection,
        publicKey,
        new PublicKey(author),
        price,
        platformWallet
      );

      // Sign transaction
      const signed = await signTransaction(transaction);

      // Send transaction
      const signature = await sendTransaction(signed, connection, {
        skipPreflight: false,
        maxRetries: 3,
      });

      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");

      // Record unlock in database
      try {
        await recordUnlock({
          postId,
          wallet: publicKey.toString(),
          txSignature: signature,
          amount: price,
        });
      } catch (error) {
        console.error("Failed to record unlock:", error);
        // Transaction succeeded but recording failed - still show success
        // In production, you might want to handle this differently
      }

      toast({
        variant: "success",
        title: "Payment Successful!",
        description: `Transaction: ${signature.slice(0, 8)}...`,
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error?.message || "Transaction failed. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirm Payment
          </DialogTitle>
          <DialogDescription>
            You are about to pay with REAL USDC on Solana mainnet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Box */}
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-sm text-red-400 font-semibold mb-2">
              ⚠️ MAINNET TRANSACTION
            </p>
            <p className="text-xs text-red-300">
              This is a real payment using real USDC. Double-check all details before confirming.
            </p>
          </div>

          {/* Payment Details */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Content Price:</span>
              <span className="font-semibold">{price} USDC</span>
            </div>
            {platformWallet && fee > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">NIGHT Platform Fee ({PLATFORM_FEE_PERCENT}%):</span>
                  <span className="font-semibold">{fee.toFixed(6)} USDC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Creator Receives:</span>
                  <span className="font-semibold text-accent">{remaining.toFixed(6)} USDC</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between text-base font-bold">
                    <span>Total You Pay:</span>
                    <span className="text-primary">{price} USDC</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Recipient Info */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Creator Wallet:</p>
            <p className="text-xs font-mono break-all">{author}</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="bg-primary hover:bg-primary/90"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Confirm Payment (${price} USDC)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

