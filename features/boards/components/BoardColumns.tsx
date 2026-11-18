"use client";

import { Button } from "@/components/ui/button";
import { BoardLabel, ColumnWithTasks, Task } from "@/lib/supabase/models";
import { Plus } from "lucide-react";
import { BoardColumnsSkeleton } from "@/components/skeletons/BoardColumns";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DroppableColumn } from "./DroppableColumn";
import { SortableTask } from "./SortableTask";

interface BoardColumnsProps {
  columns: ColumnWithTasks[];
  labels: BoardLabel[];
  loading: boolean;
  onCreateTask: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onEditColumn: (column: ColumnWithTasks) => void;
  onDeleteColumn: (columnId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onCreateColumn: () => void;
}

export function BoardColumns({
  columns,
  labels,
  loading,
  onCreateTask,
  onEditColumn,
  onDeleteColumn,
  onDeleteTask,
  onSelectTask,
  onCreateColumn,
}: BoardColumnsProps) {
  if (loading) {
    return <BoardColumnsSkeleton />;
  }

  return (
    <div className="flex flex-col lg:flex-row lg:space-x-5 lg:overflow-x-auto lg:pb-6 lg:px-1 space-y-4 lg:space-y-0">
      {columns.map((column) => (
        <DroppableColumn
          key={column.id}
          column={column}
          onCreateTask={onCreateTask}
          onEditColumn={onEditColumn}
          onDeleteColumn={onDeleteColumn}
        >
          <SortableContext
            items={column.tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2.5">
              {column.tasks.map((task) => (
                <SortableTask
                  key={task.id}
                  task={task}
                  labels={labels}
                  onDeleteTask={onDeleteTask}
                  onSelectTask={onSelectTask}
                />
              ))}
            </div>
          </SortableContext>
        </DroppableColumn>
      ))}
      <div className="w-full lg:shrink-0 lg:w-80">
        <Button
          variant="outline"
          className="w-full h-[120px] rounded-2xl border-dashed border-2 border-border bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card cursor-pointer"
          onClick={onCreateColumn}
        >
          <Plus className="w-4 h-4" />
          Add another list
        </Button>
      </div>
    </div>
  );
}
