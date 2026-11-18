"use client";

import { HeaderSkeleton } from "@/components/skeletons/DashboardHeader";
import { Button } from "@/components/ui/button";
import { useUser } from "@/providers/AuthProvider";
import { LayoutTemplate, Plus } from "lucide-react";

interface DashboardHeaderProps {
  onCreateBoard: () => void;
  onOpenTemplates: () => void;
  loading: boolean;
}

export function DashboardHeader({
  onCreateBoard,
  onOpenTemplates,
  loading,
}: DashboardHeaderProps) {
  const { user } = useUser();

  if (loading) {
    return <HeaderSkeleton />;
  }

  const displayName =
    user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? "Crew";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight text-foreground">
          Jeme&apos;a Command Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {displayName} · Real-time overview of your crew&apos;s
          boards, checklists, and sprint momentum.
        </p>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <Button
          variant="outline"
          className="cursor-pointer rounded-full bg-card/80 px-4 whitespace-nowrap"
          onClick={onOpenTemplates}
        >
          <LayoutTemplate className="w-4 h-4" />
          Templates
        </Button>
        <Button
          className="cursor-pointer rounded-full px-5 shadow-sm shadow-blue-600/20 whitespace-nowrap"
          onClick={onCreateBoard}
        >
          <Plus className="w-4 h-4" />
          Create Board
        </Button>
      </div>
    </div>
  );
}
