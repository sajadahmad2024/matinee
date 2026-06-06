"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { RegionPriceEditor, type RegionPrice } from "./region-price-editor";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "monthly" | "yearly";
  isActive: boolean;
  features: string[];
  subscriberCount: number;
  isPopular?: boolean;
  /** per-region price overrides; regions without an entry use the base price */
  regionPrices?: RegionPrice[];
}

interface PlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: SubscriptionPlan | null;
  onSave: (plan: Partial<SubscriptionPlan>) => void;
}

export function PlanModal({ open, onOpenChange, plan, onSave }: PlanModalProps) {
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>(
    plan || {
      name: "",
      description: "",
      price: 0,
      currency: "USD",
      interval: "monthly",
      features: [],
      isPopular: false,
      regionPrices: [],
    },
  );

  const handleSubmit = () => {
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card max-h-[88vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
          <DialogDescription>
            {plan
              ? `Update ${plan.name} settings`
              : "Define a new subscription plan for your users"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plan Name</Label>
              <Input
                placeholder="e.g., Premium Monthly"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Billing Interval</Label>
              <Select
                value={formData.interval}
                onValueChange={(v) =>
                  setFormData({ ...formData, interval: v as "monthly" | "yearly" })
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                placeholder="24.99"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="border-border/30 space-y-3 rounded-lg border p-3">
            <div>
              <Label>Regional pricing</Label>
              <p className="text-muted-foreground text-xs">
                Override the base price per macro-region (currency localized).
              </p>
            </div>
            <RegionPriceEditor
              value={formData.regionPrices ?? []}
              basePrice={formData.price ?? 0}
              baseCurrency={formData.currency ?? "USD"}
              onChange={(regionPrices) => setFormData({ ...formData, regionPrices })}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe what users get with this plan..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Features (one per line)</Label>
            <Textarea
              placeholder="Full content library access&#10;4K HDR streaming&#10;4 devices simultaneously"
              rows={4}
              value={formData.features?.join("\n")}
              onChange={(e) => setFormData({ ...formData, features: e.target.value.split("\n") })}
            />
          </div>
          <div className="border-border/30 bg-accent/10 flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-foreground text-sm font-medium">Mark as Popular</p>
              <p className="text-muted-foreground text-xs">Highlight this plan in the paywall</p>
            </div>
            <Switch
              checked={formData.isPopular}
              onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{plan ? "Save Changes" : "Create Plan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
