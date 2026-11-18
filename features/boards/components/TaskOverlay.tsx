"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/lib/supabase/models";
import { Calendar, CheckSquare, MessageSquare, User } from "lucide-react";
import { getPriorityColor } from "../utils";

interface TaskOverlayProps {
  task: Task;
}

export function TaskOverlay({ task }: TaskOverlayProps) {
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  return (
    <Card className="cursor-grabbing border border-blue-500/50 bg-card shadow-lg py-0">
      <CardContent className="p-3.5">
        <div className="space-y-2.5">
          <h4 className="font-medium text-foreground text-sm leading-snug">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground font-mono tabular-nums">
            <div className="flex items-center gap-2.5 min-w-0">
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
                <span className="inline-flex items-center gap-1 font-sans truncate">
                  <User className="size-3" />
                  <span className="truncate">{task.assignee}</span>
                </span>
              )}
              {task.due_date && (
                <span className="inline-flex items-center gap-1 truncate">
                  <Calendar className="size-3" />
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
  );
}
