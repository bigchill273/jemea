"use client";

import { useEffect, useState } from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BoardLabel,
  Comment,
  Subtask,
  Task,
} from "@/lib/supabase/models";
import {
  PlanTier,
  canAddSubtask,
  canUseComments,
  getPlanLimits,
} from "@/lib/plans";
import { commentService } from "@/lib/services";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@/providers/AuthProvider";
import {
  Check,
  CheckSquare,
  Lock,
  MessageSquare,
  Plus,
  Square,
  Tag,
  Trash2,
} from "lucide-react";

interface TaskDetailDialogProps {
  task: Task | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  labels: BoardLabel[];
  plan: PlanTier;
  onUpdateTask: (
    taskId: string,
    updates: Partial<Task>,
    undoLabel?: string
  ) => Promise<Task | undefined>;
  onCommentCountChange: (taskId: string, delta: number) => void;
  onOpenManageLabels: () => void;
  onRequestUpgrade: (reason: string) => void;
}

export function TaskDetailDialog({
  task,
  isOpen,
  onOpenChange,
  boardId,
  labels,
  plan,
  onUpdateTask,
  onCommentCountChange,
  onOpenManageLabels,
  onRequestUpgrade,
}: TaskDetailDialogProps) {
  const { supabase } = useSupabase();
  const { user } = useUser();

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [assignee, setAssignee] = useState(task?.assignee ?? "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    task?.priority ?? "medium"
  );
  const [dueDate, setDueDate] = useState(task?.due_date ?? "");
  const [subtaskInput, setSubtaskInput] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  const limits = getPlanLimits(plan);
  const commentsUnlocked = canUseComments(plan);

  useEffect(() => {
    if (!task || !isOpen || !supabase) return;
    let active = true;
    void commentService.getComments(supabase, task.id).then((data) => {
      if (active) setComments(data);
    });
    return () => {
      active = false;
    };
  }, [task, isOpen, supabase]);

  if (!task) return null;

  const subtasks: Subtask[] = task.subtasks || [];
  const completedCount = subtasks.filter((s) => s.completed).length;
  const labelIds = task.label_ids || [];

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onUpdateTask(
      task.id,
      {
        title: title.trim(),
        description: description.trim() || null,
        assignee: assignee.trim() || null,
        priority,
        due_date: dueDate || null,
      },
      `Edit "${task.title}"`
    );
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskInput.trim()) return;
    if (!canAddSubtask(plan, subtasks.length)) {
      onRequestUpgrade(
        `Free plan is limited to ${limits.maxSubtasksPerTask} subtasks per task. Upgrade to Pro or Enterprise for unlimited checklists.`
      );
      return;
    }
    const next: Subtask[] = [
      ...subtasks,
      {
        id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: subtaskInput.trim(),
        completed: false,
      },
    ];
    setSubtaskInput("");
    await onUpdateTask(task.id, { subtasks: next }, `Add subtask to "${task.title}"`);
  };

  const handleToggleSubtask = async (subId: string) => {
    const next = subtasks.map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    await onUpdateTask(task.id, { subtasks: next }, `Toggle subtask on "${task.title}"`);
  };

  const handleDeleteSubtask = async (subId: string) => {
    const next = subtasks.filter((s) => s.id !== subId);
    await onUpdateTask(task.id, { subtasks: next }, `Remove subtask from "${task.title}"`);
  };

  const handleToggleLabel = async (labelId: string) => {
    if (plan === "free") {
      onRequestUpgrade(
        "Custom labels are available on Pro and Enterprise plans."
      );
      return;
    }
    const exists = labelIds.includes(labelId);
    const next = exists
      ? labelIds.filter((id) => id !== labelId)
      : [...labelIds, labelId];
    await onUpdateTask(task.id, { label_ids: next }, `Update labels on "${task.title}"`);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentsUnlocked) {
      onRequestUpgrade(
        "Task Comments are available on Pro and Enterprise plans."
      );
      return;
    }
    if (!commentInput.trim() || !supabase || !user) return;
    const created = await commentService.addComment(supabase, {
      task_id: task.id,
      board_id: boardId,
      user_id: user.id,
      user_name: user.fullName || user.firstName || "Demo User",
      content: commentInput.trim(),
    });
    setComments((prev) => [...prev, created]);
    setCommentInput("");
    onCommentCountChange(task.id, 1);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!supabase) return;
    await commentService.deleteComment(supabase, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    onCommentCountChange(task.id, -1);
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={task.title}
      description="Edit task details, checklist items, labels, and discussion comments."
      className="w-[95vw] max-w-[680px] max-h-[90vh] overflow-y-auto mx-auto"
    >
      <div className="space-y-6 mt-2">
        {/* Core Task Properties */}
        <form onSubmit={handleSaveDetails} className="space-y-3 pb-5 border-b border-border">
          <div className="space-y-1.5">
            <Label htmlFor="detail-title">Title</Label>
            <Input
              id="detail-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="detail-desc">Description</Label>
            <Textarea
              id="detail-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Add more context..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="detail-assignee">Assignee</Label>
              <Input
                id="detail-assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Unassigned"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) =>
                  setPriority(v as "low" | "medium" | "high")
                }
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="detail-due">Due Date</Label>
              <Input
                id="detail-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" className="cursor-pointer">
              Save Task Details
            </Button>
          </div>
        </form>

        {/* Custom Labels Section */}
        <div className="space-y-2.5 pb-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Tag className="w-4 h-4 text-muted-foreground" />
              Custom Labels
            </div>
            <button
              type="button"
              onClick={onOpenManageLabels}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Manage board labels
            </button>
          </div>

          {plan === "free" ? (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-muted/40">
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                Custom labels are locked on the Free plan.
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer h-7 text-xs"
                onClick={() =>
                  onRequestUpgrade(
                    "Custom labels require the Pro (up to 5/board) or Enterprise (unlimited) plan."
                  )
                }
              >
                Upgrade
              </Button>
            </div>
          ) : labels.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No labels yet. Click &ldquo;Manage board labels&rdquo; to create one.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {labels.map((lbl) => {
                const active = labelIds.includes(lbl.id);
                return (
                  <button
                    key={lbl.id}
                    type="button"
                    onClick={() => void handleToggleLabel(lbl.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                      active
                        ? "border-foreground/40 bg-accent text-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: lbl.color }}
                    />
                    <span>{lbl.name}</span>
                    {active && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Subtasks / Checklists Section */}
        <div className="space-y-3 pb-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CheckSquare className="w-4 h-4 text-muted-foreground" />
              Checklist
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                {completedCount}/{subtasks.length}
              </span>
            </div>
            {plan === "free" && (
              <span className="text-xs text-muted-foreground font-mono tabular-nums">
                Free limit: {subtasks.length}/{limits.maxSubtasksPerTask}
              </span>
            )}
          </div>

          {subtasks.length > 0 && (
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{
                  width: `${Math.round((completedCount / subtasks.length) * 100)}%`,
                }}
              />
            </div>
          )}

          <div className="space-y-1.5">
            {subtasks.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-background/60"
              >
                <button
                  type="button"
                  onClick={() => void handleToggleSubtask(sub.id)}
                  className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                >
                  {sub.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span
                    className={`text-sm truncate ${
                      sub.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {sub.title}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`Delete subtask ${sub.title}`}
                  onClick={() => void handleDeleteSubtask(sub.id)}
                  className="p-1 text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddSubtask} className="flex gap-2">
            <Input
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              placeholder="Add checklist item..."
              aria-label="New subtask title"
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="h-9 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Step
            </Button>
          </form>
        </div>

        {/* Task Comments Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              Comments
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                ({comments.length})
              </span>
            </div>
            {!commentsUnlocked && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                <Lock className="w-3 h-3" /> Pro Feature
              </span>
            )}
          </div>

          {comments.length > 0 && (
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl border border-border bg-background/60 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {c.user_name || "Team Member"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                      {commentsUnlocked && (
                        <button
                          type="button"
                          aria-label="Delete comment"
                          onClick={() => void handleDeleteComment(c.id)}
                          className="text-muted-foreground hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">
                    {c.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {commentsUnlocked ? (
            <form onSubmit={handleAddComment} className="flex gap-2">
              <Input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a comment..."
                aria-label="New comment"
              />
              <Button type="submit" size="sm" className="h-9 cursor-pointer">
                Post
              </Button>
            </form>
          ) : (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-muted/40">
              <span className="text-xs text-muted-foreground">
                Upgrade to Pro or Enterprise to post and manage task comments.
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer h-7 text-xs shrink-0"
                onClick={() =>
                  onRequestUpgrade(
                    "Task Comments require the Pro or Enterprise plan."
                  )
                }
              >
                Upgrade
              </Button>
            </div>
          )}
        </div>
      </div>
    </BaseDialog>
  );
}
