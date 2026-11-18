"use client";

import React from "react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Minus } from "lucide-react";
import { PLAN_CONFIGS, PlanTier } from "@/lib/plans";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

const TIERS: PlanTier[] = ["free", "pro_user", "enterprise_user"];

const COMPARISON_ROWS: Array<{
  feature: string;
  free: string;
  pro: string;
  enterprise: string;
}> = [
  {
    feature: "Active Boards",
    free: "1 board",
    pro: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    feature: "Subtasks & Checklists",
    free: "Up to 3 / task",
    pro: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    feature: "Custom Labels",
    free: "Locked",
    pro: "Up to 5 / board",
    enterprise: "Unlimited",
  },
  {
    feature: "Board Templates",
    free: "Standard Kanban (1)",
    pro: "Starter (3 templates)",
    enterprise: "All 5 templates",
  },
  {
    feature: "Task Comments",
    free: "Locked",
    pro: "Enabled",
    enterprise: "Enabled",
  },
  {
    feature: "Undo Last Action",
    free: "Locked",
    pro: "1-step Undo (Ctrl+Z)",
    enterprise: "20-step Undo Stack",
  },
  {
    feature: "Keyboard Shortcuts",
    free: "Basic (?, N, F, T)",
    pro: "Full Board (L, Ctrl+Z, 1-3)",
    enterprise: "Power Navigation (G+D, G+P)",
  },
];

export default function Pricing() {
  const { plan, setPlan, isSignedIn, signIn } = useAuth();
  const router = useRouter();

  const handleSelectPlan = (selectedPlan: PlanTier) => {
    if (!isSignedIn) {
      signIn();
    }
    setPlan(selectedPlan);
    router.push("/dashboard");
  };

  return (
    <WorkspaceShell
      headerLeft={
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">Workspace</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">Plans &amp; Billing</span>
        </div>
      }
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Plans &amp; Feature Tiers
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Switch between Free, Pro, and Enterprise to test every feature
            limitation across your boards.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {TIERS.map((tierId) => {
            const tier = PLAN_CONFIGS[tierId];
            const isCurrent = plan === tierId;
            const isPro = tierId === "pro_user";
            return (
              <Card
                key={tier.id}
                className={`relative bg-card shadow-none ${
                  isPro
                    ? "border-2 border-blue-600 dark:border-blue-500"
                    : "border border-border"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    {isPro && (
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-foreground font-mono tabular-nums pt-2">
                    {tier.price}
                    <span className="text-sm font-sans font-normal text-muted-foreground">
                      {tier.period}
                    </span>
                  </div>
                  <CardDescription>{tier.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <ul className="space-y-2.5 text-sm">
                    {tier.highlights.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={
                      isCurrent
                        ? "secondary"
                        : isPro
                        ? "default"
                        : "outline"
                    }
                    className="w-full cursor-pointer"
                    onClick={() => handleSelectPlan(tier.id)}
                  >
                    {isCurrent
                      ? "Active Plan · Open Dashboard"
                      : `Switch to ${tier.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Comparison Matrix */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">
              Feature Comparison Across Subscriptions
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground">
                  <th className="px-6 py-3">Capability</th>
                  <th className="px-6 py-3">Free</th>
                  <th className="px-6 py-3">Pro</th>
                  <th className="px-6 py-3">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.feature}
                    className="hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-6 py-3.5 font-medium text-foreground">
                      {row.feature}
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground font-mono text-xs tabular-nums">
                      {row.free === "Locked" ? (
                        <span className="inline-flex items-center gap-1 opacity-70">
                          <Minus className="w-3.5 h-3.5" /> Locked
                        </span>
                      ) : (
                        row.free
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-foreground font-mono text-xs tabular-nums">
                      {row.pro}
                    </td>
                    <td className="px-6 py-3.5 text-blue-600 dark:text-blue-400 font-mono text-xs font-medium tabular-nums">
                      {row.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
