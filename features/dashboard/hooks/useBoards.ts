"use client";

import { boardDataService, boardService } from "@/lib/services";
import { Board } from "@/lib/supabase/models";
import { WorkspaceMetrics } from "@/lib/workspace-metrics";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@/providers/AuthProvider";
import { useCallback, useEffect, useState } from "react";

const EMPTY_METRICS: WorkspaceMetrics = {
  totalTasks: 0,
  totalSubtasks: 0,
  completedSubtasks: 0,
  subtaskCompletionRate: 0,
  highPriorityCount: 0,
  mediumPriorityCount: 0,
  lowPriorityCount: 0,
  stageBuckets: [
    { key: "backlog", label: "Backlog", count: 0 },
    { key: "progress", label: "Active", count: 0 },
    { key: "review", label: "Review", count: 0 },
    { key: "done", label: "Done", count: 0 },
  ],
  priorityTasks: [],
};

export function useBoards() {
  const { user } = useUser();
  const { supabase, isLoaded } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [metrics, setMetrics] = useState<WorkspaceMetrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBoards = useCallback(async () => {
    if (!user || !supabase) return;

    try {
      setLoading(true);
      setError(null);
      const [data, nextMetrics] = await Promise.all([
        boardService.getBoards(supabase, user.id),
        boardService.getWorkspaceMetrics(supabase, user.id),
      ]);
      setBoards(data);
      setMetrics(nextMetrics);
    } catch (err) {
      console.log(err);
      setError(err instanceof Error ? err.message : "Failed to load boards.");
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!user || !isLoaded || !supabase) return;

    let isCurrent = true;
    void Promise.all([
      boardService.getBoards(supabase, user.id),
      boardService.getWorkspaceMetrics(supabase, user.id),
    ])
      .then(([data, nextMetrics]) => {
        if (!isCurrent) return;
        setBoards(data);
        setMetrics(nextMetrics);
        setError(null);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setError(err instanceof Error ? err.message : "Failed to load boards.");
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [user, isLoaded, supabase]);

  async function createBoard(boardData: {
    title: string;
    description?: string;
    color?: string;
    templateId?: string;
  }): Promise<Board | null> {
    if (!user) throw new Error("User not authenticated");

    try {
      const newBoard = await boardDataService.createBoardFromTemplate(
        supabase!,
        {
          templateId: boardData.templateId || "standard-kanban",
          title: boardData.title,
          description: boardData.description,
          color: boardData.color,
          userId: user.id,
        }
      );
      setBoards((prev) => [newBoard, ...prev]);
      const nextMetrics = await boardService.getWorkspaceMetrics(
        supabase!,
        user.id
      );
      setMetrics(nextMetrics);
      return newBoard;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board.");
      return null;
    }
  }

  const refetch = () => {
    void loadBoards();
  };

  return { boards, metrics, loading, error, createBoard, refetch };
}
