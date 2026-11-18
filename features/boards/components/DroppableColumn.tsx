"use client";

import { Button } from "@/components/ui/button";
import { ColumnWithTasks } from "@/lib/supabase/models";
import { Plus, Trash2, MoreHorizontal } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { useState } from "react";

interface DroppableColumnProps {
  column: ColumnWithTasks;
  children: React.ReactNode;
  onCreateTask: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onEditColumn: (column: ColumnWithTasks) => void;
  onDeleteColumn: (columnId: string) => void;
}

export function DroppableColumn({
  column,
  children,
  onCreateTask,
  onEditColumn,
  onDeleteColumn,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    await onCreateTask(e);
    setIsCreatingTask(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`w-full lg:shrink-0 lg:w-80 rounded-2xl transition-colors ${
        isOver ? "bg-blue-500/10" : ""
      }`}
    >
      <div
        className={`bg-muted/60 dark:bg-card/80 rounded-2xl border ${
          isOver ? "border-blue-500 ring-2 ring-blue-500/20" : "border-border"
        }`}
      >
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {column.title}
              </h3>
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                {column.tasks.length}
              </span>
            </div>
            <div className="flex items-center shrink-0">
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Delete list ${column.title}`}
                className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-destructive"
                onClick={() => onDeleteColumn(column.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Edit list ${column.title}`}
                className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => onEditColumn(column)}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-2.5">
          {children}
          <Button
            variant="ghost"
            className="cursor-pointer w-full mt-2.5 text-muted-foreground hover:text-foreground justify-start text-xs h-8"
            onClick={() => setIsCreatingTask(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </Button>
          <CreateTaskDialog
            isOpen={isCreatingTask}
            onOpenChange={setIsCreatingTask}
            onSubmit={handleCreateTask}
            columnId={column.id}
          />
        </div>
      </div>
    </div>
  );
}
