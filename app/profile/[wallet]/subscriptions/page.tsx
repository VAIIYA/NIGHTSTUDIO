"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { SubscriptionTiers } from "@/components/SubscriptionTiers";
import { Subscription } from "@/types";
import { getCreatorSubscribers, getSubscriberSubscriptions } from "@/lib/server-actions";
import { shortenAddress, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Crown, Calendar, DollarSign } from "lucide-react";

export default function SubscriptionsPage() {
  const params = useParams();
  const { publicKey, connected } = useWallet();
  const wallet = params.wallet as string;

  const [creatorSubscribers, setCreatorSubscribers] = useState<Subscription[]>([]);
  const [subscriberSubscriptions, setSubscriberSubscriptions] = useState<Subscription[]>([]);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(true);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);

  const isOwnProfile = publicKey?.toString() === wallet;

  useEffect(() => {
    if (connected && publicKey) {
      loadSubscriptionData();
    }
  }, [connected, publicKey, wallet]);

  const loadSubscriptionData = async () => {
    try {
      // Load creator subscribers if viewing own profile
      if (isOwnProfile) {
        setIsLoadingSubscribers(true);
        const subscribers = await getCreatorSubscribers(wallet);
        setCreatorSubscribers(subscribers);
        setIsLoadingSubscribers(false);
      }

      // Load subscriber subscriptions
      setIsLoadingSubscriptions(true);
      const subscriptions = await getSubscriberSubscriptions(publicKey!.toString());
      setSubscriberSubscriptions(subscriptions);
      setIsLoadingSubscriptions(false);
    } catch (error) {
      console.error("Failed to load subscription data:", error);
    }
  };

  if (!connected || !publicKey) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please connect your wallet to view subscriptions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage your subscription tiers and view your subscriptions
        </p>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage">Manage Tiers</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="subscriptions">My Subscriptions</TabsTrigger>
        </TabsList>

        {/* Manage Subscription Tiers */}
        <TabsContent value="manage">
          {isOwnProfile ? (
            <SubscriptionTiers />
          ) : (
            <div className="text-center py-12">
              <Crown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Only the profile owner can manage subscription tiers
              </p>
            </div>
          )}
        </TabsContent>

        {/* Subscribers (for creators) */}
        <TabsContent value="subscribers">
          {isOwnProfile ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Your Subscribers
                </h2>
                <p className="text-muted-foreground">
                  Manage your subscribers and earnings
                </p>
              </div>

              {isLoadingSubscribers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : creatorSubscribers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No subscribers yet</h3>
                  <p className="text-muted-foreground">
                    Create subscription tiers to start earning from fans
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {creatorSubscribers.map((subscription) => (
                    <Card key={subscription.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-sm font-mono">
                                {shortenAddress(subscription.subscriber, 2)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {shortenAddress(subscription.subscriber)}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Subscribed {formatDate(subscription.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {subscription.totalPaid} USDC total
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Expires</div>
                            <div className="font-semibold">
                              {formatDate(subscription.endDate)}
                            </div>
                            {subscription.autoRenew && (
                              <div className="text-xs text-green-600">Auto-renew on</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Only the profile owner can view subscribers
              </p>
            </div>
          )}
        </TabsContent>

        {/* My Subscriptions */}
        <TabsContent value="subscriptions">
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="h-6 w-6" />
              My Subscriptions
            </h2>
            <p className="text-muted-foreground">
              Creators you're subscribed to
            </p>
          </div>

          {isLoadingSubscriptions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : subscriberSubscriptions.length === 0 ? (
            <div className="text-center py-12">
              <Crown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No active subscriptions</h3>
              <p className="text-muted-foreground">
                Subscribe to your favorite creators to support them and unlock exclusive content
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {subscriberSubscriptions.map((subscription) => (
                <Card key={subscription.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-mono">
                            {shortenAddress(subscription.creator, 2)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {shortenAddress(subscription.creator)}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Since {formatDate(subscription.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {subscription.totalPaid} USDC total
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Next renewal</div>
                        <div className="font-semibold">
                          {formatDate(subscription.endDate)}
                        </div>
                        {subscription.autoRenew ? (
                          <div className="text-xs text-green-600">Auto-renew on</div>
                        ) : (
                          <div className="text-xs text-orange-600">Manual renewal</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}