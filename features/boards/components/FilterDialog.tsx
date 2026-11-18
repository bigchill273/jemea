"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseDialog } from "@/components/common/BaseDialog";
import { BoardLabel } from "@/lib/supabase/models";

export interface BoardFilters {
  priority: string[];
  labelIds: string[];
  assignee: string[];
  dueDate: string | null;
}

interface FilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: BoardFilters;
  labels: BoardLabel[];
  onFilterChange: (
    type: "priority" | "labelIds" | "assignee" | "dueDate",
    value: string | string[] | null
  ) => void;
  onClearFilters: () => void;
}

export function FilterDialog({
  isOpen,
  onOpenChange,
  filters,
  labels,
  onFilterChange,
  onClearFilters,
}: FilterDialogProps) {
  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Filter Tasks"
      description="Filter tasks by priority, custom label, or due date"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <div className="flex flex-wrap gap-2">
            {["low", "medium", "high"].map((priority) => (
              <Button
                key={priority}
                type="button"
                size="sm"
                onClick={() => {
                  const newPriorities = filters.priority.includes(priority)
                    ? filters.priority.filter((p) => p !== priority)
                    : [...filters.priority, priority];
                  onFilterChange("priority", newPriorities);
                }}
                variant={
                  filters.priority.includes(priority) ? "default" : "outline"
                }
                className="cursor-pointer"
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {labels.length > 0 && (
          <div className="space-y-2">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2">
              {labels.map((lbl) => {
                const selected = filters.labelIds.includes(lbl.id);
                return (
                  <Button
                    key={lbl.id}
                    type="button"
                    size="sm"
                    variant={selected ? "default" : "outline"}
                    className="cursor-pointer gap-1.5"
                    onClick={() => {
                      const next = selected
                        ? filters.labelIds.filter((id) => id !== lbl.id)
                        : [...filters.labelIds, lbl.id];
                      onFilterChange("labelIds", next);
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: lbl.color }}
                    />
                    {lbl.name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Due Date</Label>
          <Input
            type="date"
            value={filters.dueDate || ""}
            onChange={(e) => onFilterChange("dueDate", e.target.value || null)}
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClearFilters}
          >
            Clear Filters
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}
