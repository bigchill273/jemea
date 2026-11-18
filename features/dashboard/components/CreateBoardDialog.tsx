"use client";

import { useState } from "react";
import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BOARD_TEMPLATES, BoardTemplate } from "@/lib/templates";
import { PlanTier, canCreateBoard, canUseTemplate } from "@/lib/plans";
import { colors } from "@/features/boards/constants";
import { Check, Lock } from "lucide-react";

interface CreateBoardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  plan: PlanTier;
  currentBoardCount: number;
  initialTemplateId?: string;
  onCreateBoard: (data: {
    title: string;
    description?: string;
    color?: string;
    templateId: string;
  }) => Promise<void>;
  onRequestUpgrade: (reason: string) => void;
}

export function CreateBoardDialog({
  isOpen,
  onOpenChange,
  plan,
  currentBoardCount,
  initialTemplateId,
  onCreateBoard,
  onRequestUpgrade,
}: CreateBoardDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialTemplateId || "standard-kanban"
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("bg-blue-500");

  const activeTemplate: BoardTemplate =
    BOARD_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
    BOARD_TEMPLATES[0];

  const handleSelectTemplate = (template: BoardTemplate) => {
    if (!canUseTemplate(plan, template.tier)) {
      const requiredPlan =
        template.tier === "enterprise_user" ? "Enterprise" : "Pro";
      onRequestUpgrade(
        `The "${template.name}" template requires the ${requiredPlan} plan.`
      );
      return;
    }
    setSelectedTemplateId(template.id);
    setColor(template.defaultColor);
    if (!title.trim()) {
      setTitle(template.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateBoard(plan, currentBoardCount)) {
      onOpenChange(false);
      onRequestUpgrade(
        "Free plan is limited to 1 board. Upgrade to Pro or Enterprise for unlimited boards."
      );
      return;
    }
    if (!canUseTemplate(plan, activeTemplate.tier)) {
      onOpenChange(false);
      onRequestUpgrade(
        `The "${activeTemplate.name}" template requires a higher subscription plan.`
      );
      return;
    }
    await onCreateBoard({
      title: title.trim() || activeTemplate.name,
      description: description.trim() || activeTemplate.description,
      color,
      templateId: activeTemplate.id,
    });
    setTitle("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Create Board from Template"
      description="Choose a workflow template or start with Standard Kanban."
      className="w-[95vw] max-w-[600px] mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-5 mt-2">
        <div className="space-y-2">
          <Label>Template</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {BOARD_TEMPLATES.map((tpl) => {
              const unlocked = canUseTemplate(plan, tpl.tier);
              const selected = activeTemplate.id === tpl.id;
              const tierLabel =
                tpl.tier === "enterprise_user"
                  ? "Enterprise"
                  : tpl.tier === "pro_user"
                  ? "Pro"
                  : "Free";

              return (
                <button
                  key={tpl.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                    selected
                      ? "border-blue-600 dark:border-blue-500 bg-blue-500/5"
                      : "border-border bg-card hover:bg-accent/50"
                  } ${!unlocked ? "opacity-75" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-sm shrink-0 ${tpl.defaultColor}`}
                      />
                      <span className="text-sm font-semibold text-foreground truncate">
                        {tpl.name}
                      </span>
                    </div>
                    {unlocked ? (
                      selected ? (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      ) : (
                        <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                          {tierLabel}
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 shrink-0">
                        <Lock className="w-3 h-3" />
                        {tierLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {tpl.columns.map((c) => c.title).join(" · ")}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="board-title">Board Title</Label>
          <Input
            id="board-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={activeTemplate.name}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="board-desc">Description</Label>
          <Input
            id="board-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={activeTemplate.description}
          />
        </div>

        <div className="space-y-2">
          <Label>Color Accent</Label>
          <div className="flex flex-wrap gap-2">
            {colors.slice(0, 8).map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Select ${c}`}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-lg cursor-pointer ${c} ${
                  color === c
                    ? "ring-2 ring-offset-2 ring-foreground ring-offset-background"
                    : "opacity-80 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer">
            Create Board
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
}
