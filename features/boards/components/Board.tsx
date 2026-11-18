"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { ColumnWithTasks, Task } from "@/lib/supabase/models";
import { ErrorState } from "@/components/common/Error";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { TaskOverlay } from "./TaskOverlay";
import { BoardHeader } from "./BoardHeader";
import { BoardColumns } from "./BoardColumns";
import { EditBoardDialog } from "./EditBoardDialog";
import { BoardFilters, FilterDialog } from "./FilterDialog";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { CreateColumnDialog } from "./CreateColumnDialog";
import { DeleteTaskDialog } from "./DeleteTaskDialog";
import { EditColumnDialog } from "./EditColumnDialog";
import { DeleteColumnDialog } from "./DeleteColumnDialog";
import { TaskDetailDialog } from "./TaskDetailDialog";
import { ManageLabelsDialog } from "./ManageLabelsDialog";
import { KeyboardShortcutsDialog } from "@/components/common/KeyboardShortcutsDialog";
import { UpgradeDialog } from "@/features/dashboard/components/UpgradeDialog";
import { useBoard } from "../hooks/useBoard";
import { useAuth } from "@/providers/AuthProvider";
import { canUndo } from "@/lib/plans";
import { ArrowLeft } from "lucide-react";

export default function Board() {
  const { id } = useParams<{ id: string }>();
  const { plan } = useAuth();
  const {
    board,
    columns,
    labels,
    undoStack,
    loading,
    error,
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
  } = useBoard(id);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLabelsOpen, setIsLabelsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumnTitle, setEditingColumnTitle] = useState("");
  const [editingColumn, setEditingColumn] = useState<ColumnWithTasks | null>(
    null
  );
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isDeletingColumn, setIsDeletingColumn] = useState(false);
  const [deletingColumnId, setDeletingColumnId] = useState<string | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>(
    undefined
  );
  const [undoFeedback, setUndoFeedback] = useState<string | null>(null);

  const [filters, setFilters] = useState<BoardFilters>({
    priority: [],
    labelIds: [],
    assignee: [],
    dueDate: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const openUpgrade = useCallback((reason: string) => {
    setUpgradeReason(reason);
    setShowUpgradeDialog(true);
  }, []);

  const handleUndo = useCallback(async () => {
    if (!canUndo(plan)) {
      openUpgrade(
        "Undo Last Action is available on Pro (1-step Undo) and Enterprise (20-step Undo)."
      );
      return;
    }
    const undoneLabel = await undoLastAction();
    if (undoneLabel) {
      setUndoFeedback(`Undid: ${undoneLabel}`);
      setTimeout(() => setUndoFeedback(null), 2500);
    }
  }, [plan, undoLastAction, openUpgrade]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (e.key === "Escape") {
        setSelectedTaskId(null);
        setIsCreatingTask(false);
        setIsCreatingColumn(false);
        setIsFilterOpen(false);
        setIsLabelsOpen(false);
        setIsShortcutsOpen(false);
        return;
      }

      if (isTyping) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        void handleUndo();
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (key === "n") {
        e.preventDefault();
        setIsCreatingTask(true);
      } else if (key === "f") {
        e.preventDefault();
        setIsFilterOpen(true);
      } else if (key === "l") {
        e.preventDefault();
        if (plan === "free") {
          openUpgrade(
            "Custom Labels require Pro (up to 5/board) or Enterprise (unlimited)."
          );
        } else {
          setIsLabelsOpen(true);
        }
      } else if (plan !== "free" && (key === "1" || key === "2" || key === "3")) {
        e.preventDefault();
        const prio = key === "1" ? "low" : key === "2" ? "medium" : "high";
        setFilters((prev) => ({
          ...prev,
          priority: prev.priority.includes(prio)
            ? prev.priority.filter((p) => p !== prio)
            : [...prev.priority, prio],
        }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, openUpgrade, plan]);

  const handleFilterChange = (
    type: "priority" | "labelIds" | "assignee" | "dueDate",
    value: string | string[] | null
  ) => {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      priority: [],
      labelIds: [],
      assignee: [],
      dueDate: null,
    });
  };

  const handleUpdateBoard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTitle.trim() || !board) return;

    try {
      await updateBoard(board.id, {
        title: newTitle.trim(),
        color: newColor || board.color,
      });
      setIsEditingTitle(false);
    } catch (err) {
      console.error("Error updating board:", err);
    }
  };

  const createTask = async (
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      priority: "low" | "medium" | "high";
      dueDate?: string;
    },
    columnId?: string
  ) => {
    const targetColumn = columnId ? columnId : columns[0]?.id;
    if (!targetColumn) {
      throw new Error("No column found");
    }
    await createRealTask(targetColumn, taskData);
  };

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const taskData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string | undefined,
      assignee: formData.get("assignee") as string | undefined,
      priority:
        (formData.get("priority") as "low" | "medium" | "high") || "medium",
      dueDate: formData.get("dueDate") as string | undefined,
    };
    const columnId = formData.get("columnId") as string;
    if (taskData.title.trim()) {
      await createTask(taskData, columnId);
      setIsCreatingTask(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = columns
      .flatMap((column) => column.tasks)
      .find((t) => t.id === taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = () => {
    // visual drop target handled by useDroppable
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const targetColumn = columns.find((col) => col.id === overId);
    if (targetColumn) {
      const sourceColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === taskId)
      );

      if (sourceColumn && sourceColumn.id !== targetColumn.id) {
        await moveTask(taskId, targetColumn.id, targetColumn.tasks.length);
      }
    } else {
      const sourceColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === taskId)
      );

      const overTaskColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === overId)
      );

      if (sourceColumn && overTaskColumn) {
        const oldIndex = sourceColumn.tasks.findIndex(
          (task) => task.id === taskId
        );

        const newIndex = overTaskColumn.tasks.findIndex(
          (task) => task.id === overId
        );
        if (sourceColumn.id !== overTaskColumn.id || oldIndex !== newIndex) {
          await moveTask(taskId, overTaskColumn.id, newIndex);
        }
      }
    }
  };

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    await createColumn(newColumnTitle.trim());
    setNewColumnTitle("");
    setIsCreatingColumn(false);
  };

  const handleUpdateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingColumnTitle.trim() || !editingColumn) return;
    await updateColumn(editingColumn.id, editingColumnTitle);
    setEditingColumnTitle("");
    setIsEditingColumn(false);
    setEditingColumn(null);
  };

  const handleEditColumn = (column: ColumnWithTasks) => {
    setIsEditingColumn(true);
    setEditingColumn(column);
    setEditingColumnTitle(column.title);
  };

  const requestDeleteTask = (taskId: string) => {
    setDeletingTaskId(taskId);
    setIsDeletingTask(true);
  };

  const confirmDeleteTask = async () => {
    if (!deletingTaskId) return;
    await deleteRealTask(deletingTaskId);
    if (selectedTaskId === deletingTaskId) {
      setSelectedTaskId(null);
    }
    setIsDeletingTask(false);
    setDeletingTaskId(null);
  };

  const requestDeleteColumn = (columnId: string) => {
    setDeletingColumnId(columnId);
    setIsDeletingColumn(true);
  };

  const confirmDeleteColumn = async () => {
    if (!deletingColumnId) return;
    await deleteRealColumn(deletingColumnId);
    setIsDeletingColumn(false);
    setDeletingColumnId(null);
  };

  const filteredColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      if (
        filters.priority.length > 0 &&
        !filters.priority.includes(task.priority)
      ) {
        return false;
      }

      if (
        filters.labelIds.length > 0 &&
        !filters.labelIds.some((lid) => (task.label_ids || []).includes(lid))
      ) {
        return false;
      }

      if (filters.dueDate) {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date).toDateString();
        const filterDate = new Date(filters.dueDate).toDateString();
        if (taskDate !== filterDate) return false;
      }

      return true;
    }),
  }));

  const selectedTask =
    columns.flatMap((c) => c.tasks).find((t) => t.id === selectedTaskId) ||
    null;

  const activeFilterCount =
    filters.priority.length +
    filters.labelIds.length +
    filters.assignee.length +
    (filters.dueDate ? 1 : 0);

  if (error) {
    return (
      <WorkspaceShell
        headerLeft={
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        }
      >
        <ErrorState
          title="Error loading board"
          message={error}
          onRetry={() => window.location.reload()}
          retryText="Reload board"
        />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      headerLeft={
        <div className="flex items-center gap-2 text-sm min-w-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-foreground truncate">
            {board?.title || "Loading..."}
          </span>
        </div>
      }
      onOpenShortcuts={() => setIsShortcutsOpen(true)}
    >
      <BoardHeader
        boardTitle={board?.title}
        boardColor={board?.color}
        totalTasks={columns.reduce((sum, col) => sum + col.tasks.length, 0)}
        loading={loading}
        plan={plan}
        undoLabel={undoStack[0]?.label}
        undoCount={undoStack.length}
        filterCount={activeFilterCount}
        labelCount={labels.length}
        onUndo={() => void handleUndo()}
        onOpenLabels={() => setIsLabelsOpen(true)}
        onOpenFilter={() => setIsFilterOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onCreateColumn={() => setIsCreatingColumn(true)}
        onCreateTask={() => setIsCreatingTask(true)}
        onEditBoard={() => {
          setNewTitle(board?.title ?? "");
          setNewColor(board?.color ?? "");
          setIsEditingTitle(true);
        }}
      />

      {undoFeedback && (
        <div
          role="status"
          className="mb-4 px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-medium text-foreground inline-flex items-center gap-2"
        >
          {undoFeedback}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <BoardColumns
          columns={filteredColumns}
          labels={labels}
          loading={loading}
          onCreateTask={handleCreateTask}
          onEditColumn={handleEditColumn}
          onDeleteColumn={requestDeleteColumn}
          onDeleteTask={requestDeleteTask}
          onSelectTask={(task) => setSelectedTaskId(task.id)}
          onCreateColumn={() => setIsCreatingColumn(true)}
        />
        <DragOverlay>
          {activeTask ? <TaskOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <TaskDetailDialog
        key={selectedTask?.id ?? "none"}
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null);
        }}
        boardId={id}
        labels={labels}
        plan={plan}
        onUpdateTask={updateRealTask}
        onCommentCountChange={adjustTaskCommentCount}
        onOpenManageLabels={() => setIsLabelsOpen(true)}
        onRequestUpgrade={openUpgrade}
      />

      <ManageLabelsDialog
        isOpen={isLabelsOpen}
        onOpenChange={setIsLabelsOpen}
        labels={labels}
        plan={plan}
        onCreateLabel={createLabel}
        onDeleteLabel={deleteLabel}
        onRequestUpgrade={openUpgrade}
      />

      <EditBoardDialog
        isOpen={isEditingTitle}
        onOpenChange={setIsEditingTitle}
        title={newTitle}
        onTitleChange={setNewTitle}
        color={newColor}
        onColorChange={setNewColor}
        onSubmit={handleUpdateBoard}
      />

      <FilterDialog
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        labels={labels}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <CreateTaskDialog
        isOpen={isCreatingTask}
        onOpenChange={setIsCreatingTask}
        onSubmit={handleCreateTask}
      />

      <CreateColumnDialog
        isOpen={isCreatingColumn}
        onOpenChange={setIsCreatingColumn}
        title={newColumnTitle}
        onTitleChange={setNewColumnTitle}
        onSubmit={handleCreateColumn}
      />

      <EditColumnDialog
        isOpen={isEditingColumn}
        onOpenChange={setIsEditingColumn}
        title={editingColumnTitle}
        onTitleChange={setEditingColumnTitle}
        onSubmit={handleUpdateColumn}
        onCancel={() => {
          setIsEditingColumn(false);
          setEditingColumnTitle("");
          setEditingColumn(null);
        }}
      />

      <DeleteTaskDialog
        isOpen={isDeletingTask}
        onOpenChange={setIsDeletingTask}
        onConfirm={confirmDeleteTask}
      />

      <DeleteColumnDialog
        isOpen={isDeletingColumn}
        onOpenChange={setIsDeletingColumn}
        onConfirm={confirmDeleteColumn}
      />

      <KeyboardShortcutsDialog
        isOpen={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
        plan={plan}
      />

      <UpgradeDialog
        isOpen={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        reason={upgradeReason}
      />
    </WorkspaceShell>
  );
}
