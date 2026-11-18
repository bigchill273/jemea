"use client";

import { BoardsSkeleton } from "@/components/skeletons/Boards";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Board } from "@/lib/supabase/models";
import { ArrowUpRight, Filter, Grid3X3, List, Plus, Search } from "lucide-react";
import Link from "next/link";

interface BoardsSectionProps {
  boards: Board[];
  loading: boolean;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onFilterClick: () => void;
  onCreateBoard: () => void;
  activeFilterCount: number;
  isFreeUser: boolean;
  onSearchChange: (value: string) => void;
  searchValue: string;
}

export function BoardsSection({
  boards,
  loading,
  viewMode,
  onViewModeChange,
  onFilterClick,
  onCreateBoard,
  activeFilterCount,
  isFreeUser,
  onSearchChange,
  searchValue,
}: BoardsSectionProps) {
  if (loading) {
    return <BoardsSkeleton />;
  }

  return (
    <div className="surface-panel p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Your Boards</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isFreeUser
              ? `Free Plan · ${boards.length}/1 board used`
              : `${boards.length} active ${boards.length === 1 ? "board" : "boards"}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              aria-label="Grid view"
              onClick={() => onViewModeChange("grid")}
              className="h-7 px-2.5 cursor-pointer"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              aria-label="List view"
              onClick={() => onViewModeChange("list")}
              className="h-7 px-2.5 cursor-pointer"
            >
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 cursor-pointer bg-card"
            onClick={onFilterClick}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-1 text-xs font-mono tabular-nums text-blue-600 dark:text-blue-400">
                ({activeFilterCount})
              </span>
            )}
          </Button>
          <Button
            size="sm"
            onClick={onCreateBoard}
            className="h-9 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Board
          </Button>
        </div>
      </div>

      {/* Search Boards */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="search"
          placeholder="Search boards by title..."
          className="pl-9 bg-background"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Boards Grid / List */}
      {boards.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-sm font-medium text-foreground mb-1">
            No matching boards
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Create a board from a template or adjust your search filters.
          </p>
          <Button size="sm" onClick={onCreateBoard} className="cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Create Board
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {boards.map((board) => (
            <Link href={`/boards/${board.id}`} key={board.id}>
              <Card className="h-full border border-border bg-background/50 hover:border-foreground/25 dark:hover:border-blue-500/40 transition-colors cursor-pointer group shadow-none py-0">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-3 h-3 rounded-sm shrink-0 ${board.color}`}
                      />
                      <CardTitle className="text-base truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {board.title}
                      </CardTitle>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-1 flex flex-col justify-between gap-4">
                  <CardDescription className="text-xs line-clamp-2 min-h-[2rem]">
                    {board.description || "Kanban project workspace"}
                  </CardDescription>
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono tabular-nums pt-2 border-t border-border">
                    <span>{board.totalTasks ?? 0} tasks</span>
                    <span>
                      Updated {new Date(board.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          <button
            type="button"
            onClick={onCreateBoard}
            className="border border-dashed border-border hover:border-blue-500/60 rounded-xl p-6 flex flex-col items-center justify-center min-h-[144px] bg-background/30 hover:bg-accent/40 transition-colors cursor-pointer group"
          >
            <Plus className="h-6 w-6 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2" />
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
              Create new board
            </span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-background/40">
          {boards.map((board) => (
            <Link
              href={`/boards/${board.id}`}
              key={board.id}
              className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-3 h-3 rounded-sm shrink-0 ${board.color}`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                    {board.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {board.description || "Kanban workspace"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground font-mono tabular-nums">
                <span>{board.totalTasks ?? 0} tasks</span>
                <span className="hidden sm:inline">
                  {new Date(board.updated_at).toLocaleDateString()}
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
