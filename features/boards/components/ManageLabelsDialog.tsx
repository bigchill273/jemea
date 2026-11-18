"use client";

import { useState } from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BoardLabel } from "@/lib/supabase/models";
import { PlanTier, canCreateLabel, getPlanLimits } from "@/lib/plans";
import { Lock, Plus, Trash2 } from "lucide-react";

const LABEL_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#64748b",
];

interface ManageLabelsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  labels: BoardLabel[];
  plan: PlanTier;
  onCreateLabel: (name: string, color: string) => Promise<BoardLabel | null>;
  onDeleteLabel: (labelId: string) => Promise<void>;
  onRequestUpgrade: (reason: string) => void;
}

export function ManageLabelsDialog({
  isOpen,
  onOpenChange,
  labels,
  plan,
  onCreateLabel,
  onDeleteLabel,
  onRequestUpgrade,
}: ManageLabelsDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(LABEL_COLORS[0]);
  const limits = getPlanLimits(plan);
  const canAdd = canCreateLabel(plan, labels.length);
  const isProOrEnterprise = plan !== "free";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd) {
      onRequestUpgrade(
        plan === "free"
          ? "Custom labels are available on Pro (up to 5 per board) and Enterprise (unlimited)."
          : `Pro plan supports up to ${limits.maxCustomLabelsPerBoard} custom labels per board. Upgrade to Enterprise for unlimited labels.`
      );
      return;
    }
    if (!name.trim()) return;
    await onCreateLabel(name.trim(), color);
    setName("");
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Custom Board Labels"
      description={
        isProOrEnterprise
          ? `${labels.length} / ${
              limits.maxCustomLabelsPerBoard === Infinity
                ? "Unlimited"
                : limits.maxCustomLabelsPerBoard
            } labels used on this board`
          : "Custom labels require Pro or Enterprise"
      }
      className="w-[95vw] max-w-[460px] mx-auto"
    >
      <div className="space-y-5 mt-2">
        {!isProOrEnterprise ? (
          <div className="p-4 rounded-xl border border-border bg-muted/50 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Lock className="w-4 h-4 text-amber-500" />
              Custom Labels Locked on Free Plan
            </div>
            <p className="text-xs text-muted-foreground">
              Upgrade to Pro for up to 5 custom labels per board, or Enterprise
              for unlimited labels.
            </p>
            <Button
              type="button"
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                onOpenChange(false);
                onRequestUpgrade(
                  "Custom labels require the Pro (up to 5/board) or Enterprise (unlimited) plan."
                );
              }}
            >
              Upgrade Plan
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-label-name">New Label Name</Label>
              <div className="flex gap-2">
                <Input
                  id="new-label-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Security, Design, QA"
                />
                <Button type="submit" size="sm" className="cursor-pointer h-9">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {LABEL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Color ${c}`}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                    color === c
                      ? "ring-2 ring-offset-2 ring-foreground ring-offset-background scale-110"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </form>
        )}

        <div className="space-y-2">
          <Label>Existing Labels</Label>
          {labels.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              No custom labels created on this board yet.
            </p>
          ) : (
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
              {labels.map((lbl) => (
                <div
                  key={lbl.id}
                  className="flex items-center justify-between px-3 py-2.5 bg-card"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: lbl.color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {lbl.name}
                    </span>
                  </div>
                  {isProOrEnterprise && (
                    <button
                      type="button"
                      aria-label={`Delete label ${lbl.name}`}
                      onClick={() => void onDeleteLabel(lbl.id)}
                      className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BaseDialog>
  );
}
