"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SubscriptionTier, Subscription } from "@/types";
import {
  getCreatorTiers,
  getActiveSubscription,
  subscribeToTier,
  hasSubscriptionAccess
} from "@/lib/server-actions";
import { useToast } from "@/hooks/use-toast";
import { Crown, Loader2, CheckCircle, CreditCard } from "lucide-react";
import { buildUSDCTransferTransaction, getUSDCBalance, USDC_DECIMALS, PLATFORM_FEE_PERCENT } from "@/lib/solana/usdc";
import { getConnection } from "@/lib/solana/connection";

interface SubscribeButtonProps {
  creator: string;
  children?: React.ReactNode;
}

export function SubscribeButton({ creator, children }: SubscribeButtonProps) {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { toast } = useToast();

  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = publicKey?.toString() === creator;

  useEffect(() => {
    if (connected && publicKey && !isOwnProfile) {
      loadSubscriptionData();
    } else {
      setIsLoading(false);
    }
  }, [connected, publicKey, creator, isOwnProfile]);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      const [fetchedTiers, subscription, access] = await Promise.all([
        getCreatorTiers(creator),
        getActiveSubscription(publicKey!.toString(), creator),
        hasSubscriptionAccess(publicKey!.toString(), creator)
      ]);

      setTiers(fetchedTiers);
      setActiveSubscription(subscription);
      setHasAccess(access);
    } catch (error) {
      console.error("Failed to load subscription data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!publicKey || !connected) return;

    setIsSubscribing(true);

    try {
      // Check USDC balance
      const connection = getConnection();
      const balance = await getUSDCBalance(connection, publicKey);
      const totalCost = tier.price;

      if (balance.balance < totalCost) {
        toast({
          variant: "destructive",
          title: "Insufficient USDC",
          description: `You need ${totalCost} USDC but only have ${balance.balance.toFixed(2)} USDC`,
        });
        return;
      }

      // Build transaction
      const transaction = await buildUSDCTransferTransaction(
        connection,
        publicKey,
        creator, // Send to creator
        totalCost,
        process.env.NEXT_PUBLIC_PLATFORM_WALLET // Platform fee wallet
      );

      // Send transaction
      const signature = await sendTransaction(transaction, connection);

      // Confirm transaction
      await connection.confirmTransaction(signature, "confirmed");

      // Record subscription
      await subscribeToTier({
        subscriber: publicKey.toString(),
        creator,
        tierId: tier.id,
      });

      toast({
        title: "Subscription successful!",
        description: `You're now subscribed to ${tier.name} for ${tier.price} USDC/month`,
      });

      setIsDialogOpen(false);
      await loadSubscriptionData();

    } catch (error: any) {
      console.error("Subscription failed:", error);
      toast({
        variant: "destructive",
        title: "Subscription failed",
        description: error.message || "Something went wrong",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  // Don't show button for own profile
  if (isOwnProfile) {
    return null;
  }

  // Don't show button if not connected
  if (!connected) {
    return children || (
      <Button variant="outline" disabled>
        <Crown className="h-4 w-4 mr-2" />
        Subscribe
      </Button>
    );
  }

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  // Show current subscription status
  if (hasAccess && activeSubscription) {
    const currentTier = tiers.find(t => t.id === activeSubscription.tierId);
    return (
      <Button variant="outline" className="text-green-600 border-green-600" disabled>
        <CheckCircle className="h-4 w-4 mr-2" />
        Subscribed to {currentTier?.name || "Tier"}
      </Button>
    );
  }

  // Show subscribe button
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Crown className="h-4 w-4 mr-2" />
            Subscribe
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Subscribe to Creator
          </DialogTitle>
        </DialogHeader>

        {tiers.length === 0 ? (
          <div className="text-center py-8">
            <Crown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              This creator hasn't set up subscription tiers yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Choose a subscription tier to support this creator and unlock exclusive content.
            </p>

            <div className="grid gap-4">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{tier.name}</h3>
                      <div className="text-2xl font-bold text-primary">
                        {tier.price} USDC/month
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSubscribe(tier)}
                      disabled={isSubscribing}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isSubscribing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Subscribe
                        </>
                      )}
                    </Button>
                  </div>

                  {tier.description && (
                    <p className="text-muted-foreground mb-3">{tier.description}</p>
                  )}

                  {tier.benefits && tier.benefits.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Benefits:</h4>
                      <ul className="text-sm space-y-1">
                        {tier.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
              <p>
                <strong>Platform Fee:</strong> {PLATFORM_FEE_PERCENT}% of subscription price goes to platform.
                Creator receives: {(100 - PLATFORM_FEE_PERCENT)}% of the subscription cost.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}