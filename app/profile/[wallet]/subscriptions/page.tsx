"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { SubscriptionTiers } from "@/components/SubscriptionTiers";
import { Subscription } from "@/types";
import { getCreatorSubscribers, getSubscriberSubscriptions, cancelSubscription, manualRenewSubscription, getBillingHistory } from "@/lib/server-actions";
import { shortenAddress, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Crown, Calendar, DollarSign, X, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionsPage() {
  const params = useParams();
  const { publicKey, connected } = useWallet();
  const wallet = params.wallet as string;

  const [creatorSubscribers, setCreatorSubscribers] = useState<Subscription[]>([]);
  const [subscriberSubscriptions, setSubscriberSubscriptions] = useState<Subscription[]>([]);
  const [billingHistory, setBillingHistory] = useState<Array<{
    id: string;
    type: 'subscription' | 'unlock';
    amount: number;
    description: string;
    date: number;
    creator?: string;
    postId?: string;
  }>>([]);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(true);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const { toast } = useToast();

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

      // Load billing history
      setIsLoadingHistory(true);
      const history = await getBillingHistory(publicKey!.toString());
      setBillingHistory(history);
      setIsLoadingHistory(false);
    } catch (error) {
      console.error("Failed to load subscription data:", error);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string, creator: string) => {
    if (!publicKey) return;

    try {
      setCancellingId(subscriptionId);
      await cancelSubscription(subscriptionId, publicKey.toString());

      // Update local state
      setSubscriberSubscriptions(prev =>
        prev.filter(sub => sub.id !== subscriptionId)
      );

      toast({
        variant: "success",
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled successfully",
      });
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      toast({
        variant: "destructive",
        title: "Cancellation failed",
        description: "Failed to cancel subscription. Please try again.",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleRenewSubscription = async (subscriptionId: string) => {
    if (!publicKey) return;

    try {
      setRenewingId(subscriptionId);
      const { tierId, price, creator } = await manualRenewSubscription(subscriptionId, publicKey.toString());

      // Here we would typically redirect to payment with the renewal details
      // For now, show a message about the renewal process
      toast({
        variant: "default",
        title: "Renewal initiated",
        description: `Redirecting to payment for ${price} USDC renewal...`,
      });

      // In a full implementation, this would redirect to payment flow
      // router.push(`/pay/${creator}/${tierId}?renewal=${subscriptionId}`);

    } catch (error) {
      console.error("Failed to initiate renewal:", error);
      toast({
        variant: "destructive",
        title: "Renewal failed",
        description: "Failed to initiate renewal. Please try again.",
      });
    } finally {
      setRenewingId(null);
    }
  };

  const needsRenewal = (subscription: Subscription) => {
    const now = Date.now();
    const daysUntilExpiry = (subscription.endDate - now) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 7; // Show renew button if expires within 7 days
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="manage">Manage Tiers</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="subscriptions">My Subscriptions</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
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
              Creators you&apos;re subscribed to
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
                       <div className="text-right flex flex-col items-end gap-2">
                         <div>
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
                         <div className="flex gap-2">
                           {needsRenewal(subscription) && (
                             <Button
                               variant="default"
                               size="sm"
                               onClick={() => handleRenewSubscription(subscription.id)}
                               disabled={renewingId === subscription.id}
                             >
                               {renewingId === subscription.id ? (
                                 <Loader2 className="h-4 w-4 animate-spin" />
                               ) : (
                                 "Renew"
                               )}
                             </Button>
                           )}
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => handleCancelSubscription(subscription.id, subscription.creator)}
                             disabled={cancellingId === subscription.id}
                             className="text-destructive hover:text-destructive"
                           >
                             {cancellingId === subscription.id ? (
                               <Loader2 className="h-4 w-4 animate-spin" />
                             ) : (
                               <>
                                 <X className="h-4 w-4 mr-1" />
                                 Cancel
                               </>
                             )}
                           </Button>
                         </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Billing History */}
        <TabsContent value="billing">
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Receipt className="h-6 w-6" />
              Billing History
            </h2>
            <p className="text-muted-foreground">
              Your payment history and transaction records
            </p>
          </div>

          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : billingHistory.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No billing history</h3>
              <p className="text-muted-foreground">
                Your payment history will appear here once you make purchases
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {billingHistory.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          item.type === 'subscription' ? 'bg-green-500/20' : 'bg-blue-500/20'
                        }`}>
                          {item.type === 'subscription' ? (
                            <Crown className="h-6 w-6 text-green-600" />
                          ) : (
                            <DollarSign className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{item.description}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(item.date)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.type === 'subscription'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{item.amount} USDC</div>
                        <div className="text-xs text-muted-foreground">Paid</div>
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