"use client";

import { BaseDialog } from "./BaseDialog";
import { PlanTier, getPlanLimits } from "@/lib/plans";
import { Lock } from "lucide-react";

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: PlanTier;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  minTier: PlanTier;
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ["?"], description: "Open keyboard shortcuts reference", minTier: "free" },
  { keys: ["T"], description: "Toggle Light / Dark mode", minTier: "free" },
  { keys: ["N"], description: "Create new task (board) or board (dashboard)", minTier: "free" },
  { keys: ["F"], description: "Open filter panel", minTier: "free" },
  { keys: ["Esc"], description: "Close open dialog", minTier: "free" },
  { keys: ["Ctrl", "Z"], description: "Undo last board action", minTier: "pro_user" },
  { keys: ["L"], description: "Manage custom board labels", minTier: "pro_user" },
  { keys: ["1-3"], description: "Filter by Low / Medium / High priority", minTier: "pro_user" },
  { keys: ["G", "D"], description: "Jump to Dashboard", minTier: "enterprise_user" },
  { keys: ["G", "P"], description: "Jump to Plans & Pricing", minTier: "enterprise_user" },
];

const TIER_RANK: Record<PlanTier, number> = {
  free: 0,
  pro_user: 1,
  enterprise_user: 2,
};

export function KeyboardShortcutsDialog({
  isOpen,
  onOpenChange,
  plan = "free",
}: KeyboardShortcutsDialogProps) {
  const limits = getPlanLimits(plan);
  const currentRank = TIER_RANK[plan];

  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Keyboard Shortcuts"
      description={`Active tier: ${limits.name} (${limits.shortcutsLevel} shortcuts)`}
      className="w-[95vw] max-w-[520px] mx-auto"
    >
      <div className="divide-y divide-border mt-2">
        {SHORTCUTS.map((item) => {
          const unlocked = currentRank >= TIER_RANK[item.minTier];
          const tierLabel =
            item.minTier === "enterprise_user"
              ? "Enterprise"
              : item.minTier === "pro_user"
              ? "Pro"
              : "Free";

          return (
            <div
              key={item.description}
              className={`flex items-center justify-between py-2.5 gap-4 ${
                unlocked ? "" : "opacity-55"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-foreground truncate">
                  {item.description}
                </span>
                {!unlocked && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground shrink-0">
                    <Lock className="w-3 h-3" />
                    {tierLabel}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {item.keys.map((key) => (
                  <kbd
                    key={key}
                    className="px-2 py-0.5 text-xs font-mono font-medium rounded-md border border-border bg-muted text-foreground"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </BaseDialog>
  );
}
