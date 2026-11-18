"use client";

import { Button } from "@/components/ui/button";
import {
  Filter,
  Keyboard,
  Lock,
  Plus,
  RotateCcw,
  Tag,
} from "lucide-react";
import { BoardHeaderSkeleton } from "@/components/skeletons/BoardHeader";
import { PlanTier, canUndo } from "@/lib/plans";

interface BoardHeaderProps {
  boardTitle?: string;
  boardColor?: string;
  totalTasks: number;
  loading: boolean;
  plan: PlanTier;
  undoLabel?: string | null;
  undoCount: number;
  filterCount: number;
  labelCount: number;
  onUndo: () => void;
  onOpenLabels: () => void;
  onOpenFilter: () => void;
  onOpenShortcuts: () => void;
  onCreateColumn: () => void;
  onCreateTask: () => void;
  onEditBoard: () => void;
}

export function BoardHeader({
  boardTitle,
  boardColor,
  totalTasks,
  loading,
  plan,
  undoLabel,
  undoCount,
  filterCount,
  labelCount,
  onUndo,
  onOpenLabels,
  onOpenFilter,
  onOpenShortcuts,
  onCreateColumn,
  onCreateTask,
  onEditBoard,
}: BoardHeaderProps) {
  if (loading) {
    return <BoardHeaderSkeleton />;
  }

  const undoUnlocked = canUndo(plan);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 pb-4 border-b border-border">
      <div className="flex flex-wrap items-center gap-3 min-w-0">
        {boardColor && (
          <span className={`w-3.5 h-3.5 rounded-sm shrink-0 ${boardColor}`} />
        )}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
          {boardTitle || "Board"}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onEditBoard}
            className="text-xs font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline cursor-pointer whitespace-nowrap"
          >
            Edit board
          </button>
          <span className="text-muted-foreground/50" aria-hidden="true">
            ·
          </span>
          <span className="text-xs font-mono tabular-nums text-muted-foreground whitespace-nowrap">
            {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={undoUnlocked && undoCount === 0}
          title={
            undoUnlocked
              ? undoLabel
                ? `Undo: ${undoLabel} (Ctrl+Z)`
                : "Nothing to undo"
              : "Undo requires Pro or Enterprise"
          }
          className="cursor-pointer rounded-full bg-card/80 whitespace-nowrap"
        >
          {undoUnlocked ? (
            <RotateCcw className="w-3.5 h-3.5" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span>Undo</span>
          {undoUnlocked && undoCount > 0 && (
            <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
              ({undoCount})
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenLabels}
          className="cursor-pointer rounded-full bg-card/80 whitespace-nowrap"
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Labels</span>
          {labelCount > 0 && (
            <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
              ({labelCount})
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenFilter}
          className={`cursor-pointer rounded-full bg-card/80 whitespace-nowrap ${
            filterCount > 0 ? "border-blue-500 text-blue-600 dark:text-blue-400" : ""
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filter</span>
          {filterCount > 0 && (
            <span className="text-[11px] font-mono tabular-nums">
              ({filterCount})
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenShortcuts}
          aria-label="Keyboard Shortcuts"
          title="Keyboard Shortcuts (?)"
          className="cursor-pointer rounded-full bg-card/80 whitespace-nowrap hidden sm:inline-flex"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <kbd className="text-[11px] font-mono">?</kbd>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer rounded-full bg-card/80 whitespace-nowrap"
          onClick={onCreateColumn}
        >
          <Plus className="w-3.5 h-3.5" />
          Add List
        </Button>

        <Button
          size="sm"
          className="cursor-pointer rounded-full shadow-sm shadow-blue-600/20 whitespace-nowrap"
          onClick={onCreateTask}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Task
        </Button>
      </div>
    </div>
  );
}