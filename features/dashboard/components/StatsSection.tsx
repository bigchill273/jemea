"use client";

import { StatsSkeleton } from "@/components/skeletons/Stats";
import { Card, CardContent } from "@/components/ui/card";
import { Board } from "@/lib/supabase/models";
import { PlanTier, getPlanLimits } from "@/lib/plans";
import { WorkspaceMetrics } from "@/lib/workspace-metrics";
import { Activity, CheckSquare, Crown, UsersRound } from "lucide-react";

interface StatsSectionProps {
  boards: Board[];
  metrics: WorkspaceMetrics;
  loading: boolean;
  plan: PlanTier;
}

export function StatsSection({
  boards,
  metrics,
  loading,
  plan,
}: StatsSectionProps) {
  if (loading) {
    return <StatsSkeleton />;
  }

  const planConfig = getPlanLimits(plan);

  const stats = [
    {
      label: "Active Boards",
      value:
        plan === "free"
          ? `${boards.length} / ${planConfig.maxBoards}`
          : String(boards.length),
      delta: plan === "free" ? "Free tier cap" : "Unlimited",
      insight:
        plan === "free"
          ? "Upgrade for unlimited team boards"
          : "All crew workspaces synchronized",
      icon: UsersRound,
    },
    {
      label: "Active Tasks",
      value: String(metrics.totalTasks),
      delta: `${metrics.highPriorityCount} high priority`,
      insight: "Tracked across all workflow stages",
      icon: CheckSquare,
    },
    {
      label: "Checklist Completion",
      value: `${metrics.subtaskCompletionRate}%`,
      delta: `${metrics.completedSubtasks}/${metrics.totalSubtasks} steps`,
      insight:
        metrics.totalSubtasks > 0
          ? `${metrics.totalSubtasks - metrics.completedSubtasks} checklist items remaining`
          : "Add subtasks inside any card",
      icon: Activity,
    },
    {
      label: "Workspace Plan",
      value: planConfig.name,
      delta: `${planConfig.price}${planConfig.period}`,
      insight:
        plan === "enterprise_user"
          ? "Unlimited labels · 20-step Undo · 5 templates"
          : plan === "pro_user"
          ? "5 labels/board · Comments · 1-step Undo"
          : "3 subtasks/task · Standard Kanban only",
      icon: Crown,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="surface-panel py-0 transition-colors hover:border-primary/30"
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <span className="w-8 h-8 rounded-full border border-border bg-muted/50 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                </span>
              </div>

              <div className="flex items-baseline gap-2.5 flex-wrap">
                <p className="text-2xl font-bold text-foreground font-mono tabular-nums tracking-tight">
                  {stat.value}
                </p>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {stat.delta}
                </span>
              </div>

              <p className="text-xs text-muted-foreground pt-2.5 border-t border-border truncate">
                {stat.insight}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
