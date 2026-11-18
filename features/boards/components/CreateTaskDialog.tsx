"use client";

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
import { BaseDialog } from "@/components/common/BaseDialog";

interface CreateTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  columnId?: string;
}

export function CreateTaskDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  columnId,
}: CreateTaskDialogProps) {
  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Create New Task"
      description="Add a new task card to the board"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            placeholder="Enter task title"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Enter task description"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assignee">Assignee</Label>
          <Input
            id="assignee"
            name="assignee"
            placeholder="Who should do this?"
          />
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select name="priority" defaultValue="medium">
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["low", "medium", "high"].map((priority) => (
                <SelectItem
                  key={priority}
                  value={priority}
                  className="cursor-pointer"
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input type="date" name="dueDate" id="dueDate" />
        </div>
        {columnId && <input type="hidden" name="columnId" value={columnId} />}
        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer">
            Create Task
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
}