"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BoardLabel, Task } from "@/lib/supabase/models";
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  Trash2,
  User,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getPriorityColor } from "../utils";

interface SortableTaskProps {
  task: Task;
  labels: BoardLabel[];
  onDeleteTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
}

export function SortableTask({
  task,
  labels,
  onDeleteTask,
  onSelectTask,
}: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    transform,
    isDragging,
  } = useSortable({ id: task.id });

  const styles = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const taskLabels = labels.filter((l) => (task.label_ids || []).includes(l.id));
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  return (
    <div ref={setNodeRef} style={styles} className="relative group/task">
      <Card
        {...attributes}
        {...listeners}
        onClick={() => onSelectTask(task)}
        className="cursor-pointer border border-border bg-card hover:border-foreground/25 dark:hover:border-blue-500/40 transition-colors shadow-none py-0"
      >
        <CardContent className="p-3.5">
          <div className="space-y-2.5">
            {taskLabels.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pr-7">
                {taskLabels.map((lbl) => (
                  <span
                    key={lbl.id}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground"
                  >
                    <span
                      className="w-2 h-2 rounded-xs shrink-0"
                      style={{ backgroundColor: lbl.color }}
                    />
                    {lbl.name}
                  </span>
                ))}
              </div>
            )}

            <div className="pr-7">
              <h4 className="font-medium text-foreground text-sm leading-snug">
                {task.title}
              </h4>
            </div>

            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground font-mono tabular-nums">
              <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                {subtasks.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <CheckSquare className="size-3.5" />
                    {completedSubtasks}/{subtasks.length}
                  </span>
                )}
                {(task.comment_count ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="size-3.5" />
                    {task.comment_count}
                  </span>
                )}
                {task.assignee && (
                  <span className="inline-flex items-center gap-1 font-sans truncate max-w-[90px]">
                    <User className="size-3 shrink-0" />
                    <span className="truncate">{task.assignee}</span>
                  </span>
                )}
                {task.due_date && (
                  <span className="inline-flex items-center gap-1 truncate">
                    <Calendar className="size-3 shrink-0" />
                    <span>{task.due_date}</span>
                  </span>
                )}
              </div>

              <span className="inline-flex items-center gap-1.5 text-[11px] font-sans font-medium capitalize shrink-0">
                <span
                  className={`w-2 h-2 rounded-full ${getPriorityColor(
                    task.priority
                  )}`}
                />
                {task.priority}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <button
        type="button"
        aria-label={`Delete task ${task.title}`}
        className="absolute top-3 right-3 z-10 p-1 hover:bg-muted rounded-md group shrink-0 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteTask(task.id);
        }}
      >
        <Trash2 className="text-muted-foreground group-hover:text-destructive w-3.5 h-3.5" />
      </button>
    </div>
  );
}
