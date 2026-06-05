"use client";

import { useState } from "react";

import { Check, Crown, Edit, Plus, Star, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";

import { PlanModal, type SubscriptionPlan } from "./plan-modal";

const mockPlans: SubscriptionPlan[] = [
  {
    id: "1",
    name: "Monthly",
    description: "Essential access to content library",
    price: 9.99,
    currency: "USD",
    interval: "monthly",
    isActive: true,
    features: [
      "Access to standard library",
      "SD streaming quality",
      "1 device at a time",
      "Basic game participation",
    ],
    subscriberCount: 1245,
  },
  {
    id: "2",
    name: "Premium Annual",
    description: "Best value for dedicated fans",
    price: 99.99,
    currency: "USD",
    interval: "yearly",
    isActive: true,
    features: [
      "Full 4K HDR access",
      "No advertisements",
      "4 devices simultaneously",
      "Elite game participation",
      "Priority customer support",
    ],
    subscriberCount: 856,
    isPopular: true,
  },
];

const planIcons: Record<string, typeof Crown> = {
  Basic: Star,
  Premium: Crown,
  Student: Zap,
};

function getPlanIcon(name: string) {
  const key = Object.keys(planIcons).find((k) => name.includes(k));
  return key ? planIcons[key] : Star;
}

export function PlanConfiguration() {
  const [plans, setPlans] = useState(mockPlans);
  const [modalState, setModalState] = useState<{
    open: boolean;
    plan: SubscriptionPlan | null;
  }>({ open: false, plan: null });
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);

  const handleDeletePlan = () => {
    if (deletingPlan) {
      setPlans((prev) => prev.filter((plan) => plan.id !== deletingPlan.id));
      toast.success(`Plan "${deletingPlan.name}" deleted successfully`);
      setDeletingPlan(null);
    }
  };

  const togglePlanStatus = (planId: string) => {
    setPlans((prev) =>
      prev.map((plan) => (plan.id === planId ? { ...plan, isActive: !plan.isActive } : plan)),
    );
  };

  const handleSavePlan = (planData: Partial<SubscriptionPlan>) => {
    if (modalState.plan) {
      // Edit
      setPlans((prev) =>
        prev.map((p) =>
          p.id === modalState.plan?.id ? ({ ...p, ...planData } as SubscriptionPlan) : p,
        ),
      );
      toast.success("Plan updated successfully");
    } else {
      // Create
      const newPlan: SubscriptionPlan = {
        id: crypto.randomUUID(),
        name: planData.name || "New Plan",
        description: planData.description || "",
        price: planData.price || 0,
        currency: planData.currency || "USD",
        interval: planData.interval || "monthly",
        isActive: true,
        features: planData.features || [],
        subscriberCount: 0,
        isPopular: planData.isPopular,
      };
      setPlans((prev) => [...prev, newPlan]);
      toast.success("New plan created successfully");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Subscription Plans</h3>
          <p className="text-muted-foreground text-sm">
            Manage plans displayed in your app&apos;s paywall
          </p>
        </div>
        <Button className="gap-2" onClick={() => setModalState({ open: true, plan: null })}>
          <Plus className="h-4 w-4" />
          Add Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = getPlanIcon(plan.name);
          return (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all ${
                plan.isActive
                  ? "border-border/50 bg-card/50"
                  : "border-muted/30 bg-muted/20 opacity-60"
              } ${plan.isPopular ? "ring-primary ring-2" : ""}`}>
              {plan.isPopular && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-primary text-primary-foreground rounded-none rounded-bl-lg">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        plan.isActive ? "bg-primary/20" : "bg-muted/20"
                      }`}>
                      <Icon
                        className={`h-4 w-4 ${plan.isActive ? "text-primary" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      <p className="text-muted-foreground text-xs">
                        {plan.subscriberCount} subscribers
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-foreground text-2xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground text-sm">
                      /{plan.interval === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">{plan.description}</p>
                </div>

                <div className="space-y-2">
                  {plan.features.slice(0, 4).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="text-success h-4 w-4 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                  {plan.features.length > 4 && (
                    <p className="text-muted-foreground pl-6 text-xs">
                      +{plan.features.length - 4} more features
                    </p>
                  )}
                </div>

                <div className="border-border/30 flex items-center justify-between border-t pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={plan.isActive}
                      onCheckedChange={() => togglePlanStatus(plan.id)}
                    />
                    <span className="text-muted-foreground text-xs">
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setModalState({ open: true, plan })}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={() => setDeletingPlan(plan)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <PlanModal
        key={modalState.plan?.id || (modalState.open ? "new" : "closed")}
        open={modalState.open}
        onOpenChange={(open) => setModalState({ ...modalState, open })}
        plan={modalState.plan}
        onSave={handleSavePlan}
      />

      <ConfirmationDialog
        open={!!deletingPlan}
        onOpenChange={() => setDeletingPlan(null)}
        title="Delete Plan"
        description={
          <>
            Are you sure you want to delete &quot;{deletingPlan?.name}&quot;? This action cannot be
            undone.
            {deletingPlan && deletingPlan.subscriberCount > 0 && (
              <p className="bg-destructive/10 text-destructive mt-3 rounded-lg border border-transparent p-3 text-sm">
                ⚠️ This plan has {deletingPlan.subscriberCount} active subscribers. They will need
                to be migrated to another plan.
              </p>
            )}
          </>
        }
        onConfirm={handleDeletePlan}
        action="delete"
      />
    </div>
  );
}
