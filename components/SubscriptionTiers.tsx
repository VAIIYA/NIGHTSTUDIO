"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SubscriptionTier } from "@/types";
import {
  createSubscriptionTier,
  getCreatorTiers,
  updateSubscriptionTier
} from "@/lib/server-actions";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2, Crown } from "lucide-react";

export function SubscriptionTiers() {
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();

  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<SubscriptionTier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [tierName, setTierName] = useState("");
  const [tierDescription, setTierDescription] = useState("");
  const [tierPrice, setTierPrice] = useState("");
  const [tierBenefits, setTierBenefits] = useState<string[]>([""]);

  useEffect(() => {
    if (connected && publicKey) {
      loadTiers();
    }
  }, [connected, publicKey]);

  const loadTiers = async () => {
    try {
      setIsLoading(true);
      const fetchedTiers = await getCreatorTiers(publicKey!.toString());
      setTiers(fetchedTiers);
    } catch (error) {
      console.error("Failed to load tiers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTierName("");
    setTierDescription("");
    setTierPrice("");
    setTierBenefits([""]);
    setEditingTier(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (tier: SubscriptionTier) => {
    setEditingTier(tier);
    setTierName(tier.name);
    setTierDescription(tier.description || "");
    setTierPrice(tier.price.toString());
    setTierBenefits(tier.benefits || [""]);
    setIsDialogOpen(true);
  };

  const addBenefit = () => {
    setTierBenefits([...tierBenefits, ""]);
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...tierBenefits];
    newBenefits[index] = value;
    setTierBenefits(newBenefits);
  };

  const removeBenefit = (index: number) => {
    if (tierBenefits.length > 1) {
      setTierBenefits(tierBenefits.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey) return;

    const price = parseFloat(tierPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid price",
        description: "Please enter a valid price greater than 0",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const filteredBenefits = tierBenefits.filter(b => b.trim());

      if (editingTier) {
        // Update existing tier
        await updateSubscriptionTier(editingTier.id, publicKey.toString(), {
          name: tierName.trim(),
          description: tierDescription.trim() || undefined,
          price,
          benefits: filteredBenefits,
        });
        toast({
          title: "Tier updated!",
          description: "Your subscription tier has been updated",
        });
      } else {
        // Create new tier
        await createSubscriptionTier({
          creator: publicKey.toString(),
          name: tierName.trim(),
          description: tierDescription.trim() || undefined,
          price,
          benefits: filteredBenefits,
        });
        toast({
          title: "Tier created!",
          description: "Your new subscription tier is now live",
        });
      }

      await loadTiers();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save tier",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (tier: SubscriptionTier) => {
    try {
      await updateSubscriptionTier(tier.id, publicKey!.toString(), {
        isActive: !tier.isActive,
      });
      await loadTiers();
      toast({
        title: tier.isActive ? "Tier deactivated" : "Tier activated",
        description: `Tier "${tier.name}" has been ${tier.isActive ? "deactivated" : "activated"}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update tier",
      });
    }
  };

  if (!connected || !publicKey) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Connect your wallet to manage subscription tiers</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Subscription Tiers
          </h2>
          <p className="text-muted-foreground">
            Create subscription tiers for your exclusive content
          </p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Tier
        </Button>
      </div>

      {/* Tiers Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tiers.length === 0 ? (
        <div className="text-center py-12">
          <Crown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No subscription tiers yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first subscription tier to start earning from subscribers
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Tier
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.id} className={cn(!tier.isActive && "opacity-60")}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(tier)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(tier)}
                    >
                      {tier.isActive ? (
                        <span className="text-green-500">Active</span>
                      ) : (
                        <span className="text-gray-500">Inactive</span>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {tier.price} USDC/month
                </div>
              </CardHeader>
              <CardContent>
                {tier.description && (
                  <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTier ? "Edit Subscription Tier" : "Create Subscription Tier"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Tier Name</label>
              <Input
                value={tierName}
                onChange={(e) => setTierName(e.target.value)}
                placeholder="e.g., VIP Access, Premium Content"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <Textarea
                value={tierDescription}
                onChange={(e) => setTierDescription(e.target.value)}
                placeholder="Describe what subscribers get with this tier"
                rows={3}
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-2">Monthly Price (USDC)</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={tierPrice}
                onChange={(e) => setTierPrice(e.target.value)}
                placeholder="5.00"
                required
              />
            </div>

            {/* Benefits */}
            <div>
              <label className="block text-sm font-medium mb-2">Benefits</label>
              <div className="space-y-2">
                {tierBenefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder="e.g., Exclusive photos, Early access"
                    />
                    {tierBenefits.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeBenefit(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBenefit}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Benefit
                </Button>
              </div>
            </div>

            {/* Actions */}
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
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingTier ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingTier ? "Update Tier" : "Create Tier"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}