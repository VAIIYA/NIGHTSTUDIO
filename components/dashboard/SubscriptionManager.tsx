"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Users, DollarSign, Crown } from "lucide-react";

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  subscriberCount: number;
  benefits: string[];
}

export function SubscriptionManager() {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([
    {
      id: '1',
      name: 'VIP Access',
      price: 5.00,
      currency: 'USDC',
      description: 'Full access to all premium content',
      subscriberCount: 127,
      benefits: ['Exclusive photos', 'Direct messages', 'Live streams', 'Custom content']
    },
    {
      id: '2',
      name: 'Standard',
      price: 2.50,
      currency: 'USDC',
      description: 'Access to most premium content',
      subscriberCount: 89,
      benefits: ['Premium photos', 'Direct messages', 'Live streams']
    },
    {
      id: '3',
      name: 'Basic',
      price: 1.00,
      currency: 'USDC',
      description: 'Entry level premium access',
      subscriberCount: 245,
      benefits: ['Basic premium content', 'Direct messages']
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<SubscriptionTier | null>(null);

  const handleCreateTier = () => {
    // Implementation for creating new tier
    setIsCreateDialogOpen(false);
  };

  const handleEditTier = (tier: SubscriptionTier) => {
    setEditingTier(tier);
  };

  const handleDeleteTier = (tierId: string) => {
    setTiers(tiers.filter(tier => tier.id !== tierId));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-[#121212]/70 mt-2">
            Create and manage your subscription tiers to monetize your content.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Tier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Subscription Tier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tier-name">Tier Name</Label>
                <Input id="tier-name" placeholder="VIP Access" />
              </div>
              <div>
                <Label htmlFor="tier-price">Price (USDC)</Label>
                <Input id="tier-price" type="number" placeholder="5.00" />
              </div>
              <div>
                <Label htmlFor="tier-description">Description</Label>
                <Input id="tier-description" placeholder="Full access to all premium content" />
              </div>
              <Button onClick={handleCreateTier} className="w-full">
                Create Tier
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-md border-[#121212]/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">461</div>
            <p className="text-xs text-accent">+8.2% this month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#121212]/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,847.69</div>
            <p className="text-xs text-accent">+12.5% this month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border-[#121212]/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tiers</CardTitle>
            <Crown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-[#121212]/60">Subscription tiers</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Tiers */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Your Subscription Tiers</h2>

        {tiers.map((tier) => (
          <Card key={tier.id} className="bg-white/80 backdrop-blur-md border-[#121212]/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    {tier.name}
                  </CardTitle>
                  <p className="text-[#121212]/70 mt-1">{tier.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-accent">{tier.price} {tier.currency}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTier(tier)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTier(tier.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Benefits</h4>
                  <ul className="space-y-1">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-[#121212]/70 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Subscribers</h4>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-lg font-bold">{tier.subscriberCount}</span>
                    <span className="text-sm text-[#121212]/60">active subscribers</span>
                  </div>
                  <div className="mt-2 text-sm text-accent">
                    Revenue: ${(tier.price * tier.subscriberCount).toFixed(2)}/month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}