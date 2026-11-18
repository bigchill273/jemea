"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { Board } from "@/lib/supabase/models";
import { useBoards } from "../hooks/useBoards";
import { usePlan } from "../hooks/usePlan";
import { UpgradeDialog } from "./UpgradeDialog";
import { DashboardFilters, FilterDialog } from "./FilterDialog";
import { BoardsSection } from "./BoardsSection";
import { StatsSection } from "./StatsSection";
import { DashboardHeader } from "./DashboardHeader";
import { CreateBoardDialog } from "./CreateBoardDialog";
import { ErrorState } from "@/components/common/Error";
import { BOARD_TEMPLATES } from "@/lib/templates";
import { canCreateBoard, canUseTemplate, getPlanLimits } from "@/lib/plans";
import { useAuth } from "@/providers/AuthProvider";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ListChecks,
  Lock,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { plan } = useAuth();
  const { createBoard, boards, metrics, loading, error, refetch } = useBoards();
  const { isFreeUser } = usePlan();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<string>("standard-kanban");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState<boolean>(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>(
    undefined
  );
  const [filters, setFilters] = useState<DashboardFilters>({
    search: "",
    dateRange: {
      start: null,
      end: null,
    },
    taskCount: {
      min: null,
      max: null,
    },
  });

  const planConfig = getPlanLimits(plan);
  const boardAllowed = canCreateBoard(plan, boards.length);

  const openUpgrade = (reason: string) => {
    setUpgradeReason(reason);
    setShowUpgradeDialog(true);
  };

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (isTyping) return;

      if ((e.key === "n" || e.key === "N") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (!canCreateBoard(plan, boards.length)) {
          openUpgrade(
            "Free plan is limited to 1 board. Upgrade to Pro or Enterprise for unlimited boards."
          );
        } else {
          setIsCreateBoardOpen(true);
        }
      } else if ((e.key === "f" || e.key === "F") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsFilterOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [plan, boards.length]);

  function clearFilters() {
    setFilters({
      search: "",
      dateRange: {
        start: null,
        end: null,
      },
      taskCount: {
        min: null,
        max: null,
      },
    });
  }

  const handleOpenCreateBoard = (templateId?: string) => {
    if (!boardAllowed) {
      openUpgrade(
        "Free plan is limited to 1 board. Upgrade to Pro or Enterprise to create unlimited boards."
      );
      return;
    }
    setSelectedTemplateId(templateId || "standard-kanban");
    setIsCreateBoardOpen(true);
  };

  const handleCreateBoardSubmit = async (data: {
    title: string;
    description?: string;
    color?: string;
    templateId: string;
  }) => {
    const created = await createBoard(data);
    if (created) {
      router.push(`/boards/${created.id}`);
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
  };

  const filteredBoards = boards.filter((board: Board) => {
    const taskCount = board.totalTasks ?? 0;
    const matchesSearch = board.title
      .toLowerCase()
      .includes(filters.search.toLowerCase());

    const matchesDateRange =
      (!filters.dateRange.start ||
        new Date(board.created_at) >= new Date(filters.dateRange.start)) &&
      (!filters.dateRange.end ||
        new Date(board.created_at) <= new Date(filters.dateRange.end));
    const matchesTaskCount =
      (!filters.taskCount.min || taskCount >= filters.taskCount.min) &&
      (!filters.taskCount.max || taskCount <= filters.taskCount.max);

    return matchesSearch && matchesDateRange && matchesTaskCount;
  });

  const activeFilterCount = [
    filters.search ? 1 : 0,
    filters.dateRange.start ? 1 : 0,
    filters.dateRange.end ? 1 : 0,
    filters.taskCount.min !== null ? 1 : 0,
    filters.taskCount.max !== null ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const maxStageCount = Math.max(
    1,
    ...metrics.stageBuckets.map((bucket) => bucket.count)
  );

  if (error) {
    return (
      <WorkspaceShell
        headerLeft={
          <span className="text-sm font-semibold text-foreground">
            Workspace / Dashboard
          </span>
        }
      >
        <ErrorState
          title="Error loading boards"
          message={error}
          onRetry={refetch}
          retryText="Reload boards"
        />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      onOpenTemplates={() => handleOpenCreateBoard()}
    >
      <DashboardHeader
        onCreateBoard={() => handleOpenCreateBoard()}
        onOpenTemplates={() => handleOpenCreateBoard()}
        loading={loading}
      />

      <StatsSection
        boards={boards}
        metrics={metrics}
        loading={loading}
        plan={plan}
      />

      {/* Row 2: Workflow Pulse + Checklist Velocity + Board Templates (mirrors reference bento) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Stage Distribution Bar Panel */}
        <section className="lg:col-span-5 surface-panel p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Workflow Pulse
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Live task distribution across stages
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-muted-foreground">
              {metrics.totalTasks} total
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3 sm:gap-4 items-end flex-1 min-h-[196px] pt-2">
            {metrics.stageBuckets.map((bucket) => {
              const heightPct = Math.max(
                14,
                Math.round((bucket.count / maxStageCount) * 100)
              );
              return (
                <div
                  key={bucket.key}
                  className="flex flex-col items-center gap-2 h-full justify-end"
                >
                  <span className="text-xs font-mono tabular-nums font-semibold text-foreground">
                    {bucket.count}
                  </span>
                  <div className="w-full flex-1 flex items-end bg-muted/40 rounded-xl p-1 border border-border/50">
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-blue-600 via-indigo-500 to-violet-400 transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground truncate max-w-full">
                    {bucket.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Checklist Velocity Gauge Panel */}
        <section className="lg:col-span-3 surface-panel p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Checklist Progress
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Subtasks across all boards
            </p>
          </div>

          <div className="my-5 flex items-center justify-center">
            <div
              className="relative w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(var(--primary) ${
                  metrics.subtaskCompletionRate * 3.6
                }deg, var(--muted) 0deg)`,
              }}
            >
              <div className="w-24 h-24 rounded-full bg-card flex flex-col items-center justify-center border border-border">
                <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
                  {metrics.subtaskCompletionRate}%
                </span>
                <span className="text-[11px] text-muted-foreground">Done</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-mono tabular-nums text-foreground font-semibold">
                {metrics.completedSubtasks}
              </span>
              <span>done</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
              <ListChecks className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="font-mono tabular-nums text-foreground font-semibold">
                {metrics.totalSubtasks - metrics.completedSubtasks}
              </span>
              <span>open</span>
            </div>
          </div>
        </section>

        {/* Board Templates Quick-Launch */}
        <section className="lg:col-span-4 surface-panel p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Board Templates
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Start from a curated workflow
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenCreateBoard()}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="space-y-2">
            {BOARD_TEMPLATES.map((tpl) => {
              const unlocked = canUseTemplate(plan, tpl.tier);
              const tierLabel =
                tpl.tier === "enterprise_user"
                  ? "Enterprise"
                  : tpl.tier === "pro_user"
                  ? "Pro"
                  : "Free";

              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    if (!unlocked) {
                      openUpgrade(
                        `The "${tpl.name}" template requires the ${tierLabel} plan.`
                      );
                    } else {
                      handleOpenCreateBoard(tpl.id);
                    }
                  }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-accent/50 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-sm shrink-0 ${tpl.defaultColor}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {tpl.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {tpl.columns.length} lists · {tpl.labels.length} labels
                      </p>
                    </div>
                  </div>
                  {unlocked ? (
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 shrink-0">
                      <Lock className="w-3 h-3" />
                      {tierLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Row 3: Boards Grid + Priority Actions & Plan Limits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <BoardsSection
            boards={filteredBoards}
            loading={loading}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFilterClick={() => setIsFilterOpen(true)}
            onCreateBoard={() => handleOpenCreateBoard()}
            activeFilterCount={activeFilterCount}
            isFreeUser={isFreeUser}
            onSearchChange={handleSearchChange}
            searchValue={filters.search}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Priority Actions */}
          <section className="surface-panel p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Priority Actions
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Open deliverables needing focus
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                {metrics.priorityTasks.length} active
              </span>
            </div>

            {metrics.priorityTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border rounded-xl">
                All tasks are complete. Add a card on any board to track it here.
              </p>
            ) : (
              <div className="space-y-2.5">
                {metrics.priorityTasks.map((item) => (
                  <Link
                    key={item.id}
                    href={`/boards/${item.boardId}`}
                    className="block p-3 rounded-xl border border-border bg-background/50 hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`text-[11px] font-medium capitalize ${
                          item.priority === "high"
                            ? "text-rose-600 dark:text-rose-400"
                            : item.priority === "medium"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {item.priority} priority
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1 truncate">
                      {item.boardTitle} · {item.columnTitle}
                      {item.assignee ? ` · ${item.assignee}` : ""}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Plan Limits Summary */}
          <section className="surface-panel p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">
                {planConfig.name} Plan Limits
              </h2>
              <Link
                href="/pricing"
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Manage plan
              </Link>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {planConfig.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <FilterDialog
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      <CreateBoardDialog
        key={selectedTemplateId}
        isOpen={isCreateBoardOpen}
        onOpenChange={setIsCreateBoardOpen}
        plan={plan}
        currentBoardCount={boards.length}
        initialTemplateId={selectedTemplateId}
        onCreateBoard={handleCreateBoardSubmit}
        onRequestUpgrade={openUpgrade}
      />

      <UpgradeDialog
        isOpen={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        reason={upgradeReason}
      />
    </WorkspaceShell>
  );
}
