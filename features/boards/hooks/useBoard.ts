"use client";

import {
  boardDataService,
  boardService,
  columnService,
  labelService,
  taskService,
} from "@/lib/services";
import {
  Board,
  BoardLabel,
  ColumnWithTasks,
  Task,
} from "@/lib/supabase/models";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useAuth, useUser } from "@/providers/AuthProvider";
import { useCallback, useEffect, useState } from "react";
import {
  UndoEntry,
  popUndoEntry,
  pushUndoEntry,
} from "@/lib/board-history";
import { canUndo, getMaxUndoSteps } from "@/lib/plans";

export function useBoard(boardId: string) {
  const { supabase, isLoaded } = useSupabase();
  const { user } = useUser();
  const { plan } = useAuth();

  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
  const [labels, setLabels] = useState<BoardLabel[]>([]);
  const [undoStack, setUndoStack] = useState<UndoEntry<ColumnWithTasks[]>[]>(
    []
  );
  const [loadedBoardId, setLoadedBoardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<{
    boardId: string;
    message: string;
  } | null>(null);
  const loading = loadedBoardId !== boardId;
  const displayError =
    error ?? (loadError?.boardId === boardId ? loadError.message : null);

  const maxUndoSteps = getMaxUndoSteps(plan);

  useEffect(() => {
    if (!boardId || !isLoaded || !supabase) return;

    let isCurrent = true;
    void boardDataService
      .getBoardWithColumns(supabase, boardId)
      .then((data) => {
        if (!isCurrent) return;
        setBoard(data.board);
        setColumns(data.columnsWithTasks);
        setLabels(data.labels);
        setUndoStack([]);
        setError(null);
        setLoadError(null);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setLoadError({
          boardId,
          message:
            err instanceof Error ? err.message : "Failed to load boards.",
        });
      })
      .finally(() => {
        if (isCurrent) setLoadedBoardId(boardId);
      });

    return () => {
      isCurrent = false;
    };
  }, [boardId, isLoaded, supabase]);

  const recordUndo = useCallback(
    (label: string, snapshot: ColumnWithTasks[]) => {
      if (maxUndoSteps <= 0) return;
      setUndoStack((prev) =>
        pushUndoEntry(
          prev,
          { label, snapshot: structuredClone(snapshot) },
          maxUndoSteps
        )
      );
    },
    [maxUndoSteps]
  );

  async function updateBoard(targetBoardId: string, updates: Partial<Board>) {
    try {
      const updatedBoard = await boardService.updateBoard(
        supabase!,
        targetBoardId,
        updates
      );
      setBoard(updatedBoard);
      return updatedBoard;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update the board."
      );
    }
  }

  async function createRealTask(
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      dueDate?: string;
      priority?: "low" | "medium" | "high";
    }
  ) {
    const prevSnapshot = structuredClone(columns);
    try {
      const newTask = await taskService.createTask(supabase!, {
        title: taskData.title,
        description: taskData.description || null,
        assignee: taskData.assignee || null,
        due_date: taskData.dueDate || null,
        column_id: columnId,
        sort_order:
          columns.find((col) => col.id === columnId)?.tasks.length || 0,
        priority: taskData.priority || "medium",
        subtasks: [],
        label_ids: [],
      });

      recordUndo(`Create "${newTask.title}"`, prevSnapshot);

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
        )
      );

      return newTask;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create the task."
      );
    }
  }

  async function updateRealTask(
    taskId: string,
    updates: Partial<Task>,
    undoLabel?: string
  ) {
    const prevSnapshot = structuredClone(columns);
    try {
      const updated = await taskService.updateTask(supabase!, taskId, updates);
      if (undoLabel) {
        recordUndo(undoLabel, prevSnapshot);
      }
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updated } : t
          ),
        }))
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task.");
    }
  }

  function adjustTaskCommentCount(taskId: string, delta: number) {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) =>
          t.id === taskId
            ? { ...t, comment_count: Math.max(0, (t.comment_count || 0) + delta) }
            : t
        ),
      }))
    );
  }

  async function moveTask(
    taskId: string,
    newColumnId: string,
    newOrder: number
  ) {
    const prevColumns = structuredClone(columns);
    const movingTask = columns
      .flatMap((c) => c.tasks)
      .find((t) => t.id === taskId);

    try {
      recordUndo(
        `Move "${movingTask?.title || "task"}"`,
        prevColumns
      );
      setColumns((prev) => {
        const newColumns = prev.map((col) => ({
          ...col,
          tasks: [...col.tasks],
        }));

        let taskToMove: Task | null = null;
        for (const col of newColumns) {
          const taskIndex = col.tasks.findIndex((task) => task.id === taskId);
          if (taskIndex !== -1) {
            taskToMove = col.tasks[taskIndex];
            col.tasks.splice(taskIndex, 1);
            break;
          }
        }

        if (taskToMove) {
          const targetColumn = newColumns.find((col) => col.id === newColumnId);
          if (targetColumn) {
            targetColumn.tasks.splice(newOrder, 0, {
              ...taskToMove,
              column_id: newColumnId,
            });
          }
        }

        return newColumns;
      });
      await taskService.moveTask(supabase!, taskId, newColumnId, newOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move task.");
      setColumns(prevColumns);
    }
  }

  async function createColumn(title: string) {
    if (!board || !user) throw new Error("Board not loaded");
    const prevSnapshot = structuredClone(columns);

    try {
      const newColumn = await columnService.createColumn(supabase!, {
        title,
        board_id: board.id,
        sort_order: columns.length,
        user_id: user.id,
      });

      recordUndo(`Add list "${title}"`, prevSnapshot);
      setColumns((prev) => [...prev, { ...newColumn, tasks: [] }]);
      return newColumn;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create column.");
    }
  }

  async function updateColumn(columnId: string, title: string) {
    const prevSnapshot = structuredClone(columns);
    try {
      const updatedColumn = await columnService.updateColumnTitle(
        supabase!,
        columnId,
        title
      );

      recordUndo(`Rename list to "${title}"`, prevSnapshot);
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, ...updatedColumn } : col
        )
      );

      return updatedColumn;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update column.");
    }
  }

  async function deleteRealTask(taskId: string) {
    const prevColumns = structuredClone(columns);
    const targetTask = columns
      .flatMap((c) => c.tasks)
      .find((t) => t.id === taskId);

    try {
      recordUndo(`Delete "${targetTask?.title || "task"}"`, prevColumns);
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
        }))
      );
      await taskService.deleteTask(supabase!, taskId);
    } catch (err) {
      console.error("Failed to delete task:", err);
      setColumns(prevColumns);
    }
  }

  async function deleteRealColumn(columnId: string) {
    const prevColumns = structuredClone(columns);
    const targetCol = columns.find((c) => c.id === columnId);

    try {
      recordUndo(`Delete list "${targetCol?.title || "list"}"`, prevColumns);
      setColumns((prev) => prev.filter((c) => c.id !== columnId));
      await columnService.deleteColumn(supabase!, columnId);
    } catch (err) {
      console.error("Failed to delete column:", err);
      setColumns(prevColumns);
    }
  }

  async function createLabel(name: string, color: string) {
    if (!board) return null;
    try {
      const created = await labelService.createLabel(
        supabase!,
        board.id,
        name,
        color
      );
      setLabels((prev) => [...prev, created]);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create label.");
      return null;
    }
  }

  async function deleteLabel(labelId: string) {
    try {
      await labelService.deleteLabel(supabase!, labelId);
      setLabels((prev) => prev.filter((l) => l.id !== labelId));
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) => ({
            ...t,
            label_ids: (t.label_ids || []).filter((id) => id !== labelId),
          })),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete label.");
    }
  }

  async function undoLastAction(): Promise<string | null> {
    if (!canUndo(plan)) return null;
    const { entry, remaining } = popUndoEntry(undoStack);
    if (!entry) return null;

    setUndoStack(remaining);
    setColumns(entry.snapshot);
    await boardDataService.restoreBoardSnapshot(
      supabase!,
      boardId,
      entry.snapshot
    );
    return entry.label;
  }

  return {
    board,
    columns,
    labels,
    undoStack,
    setColumns,
    loading,
    error: displayError,
    updateBoard,
    createRealTask,
    updateRealTask,
    adjustTaskCommentCount,
    moveTask,
    createColumn,
    updateColumn,
    deleteRealTask,
    deleteRealColumn,
    createLabel,
    deleteLabel,
    undoLastAction,
  };
}
