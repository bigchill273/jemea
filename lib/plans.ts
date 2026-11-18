export type PlanTier = "free" | "pro_user" | "enterprise_user";
export type TemplateTier = "free" | "pro_user" | "enterprise_user";

export interface PlanConfig {
  id: PlanTier;
  name: string;
  tagline: string;
  price: string;
  period: string;
  maxBoards: number;
  maxSubtasksPerTask: number;
  maxCustomLabelsPerBoard: number;
  allowedTemplateTiers: TemplateTier[];
  canComment: boolean;
  maxUndoSteps: number;
  shortcutsLevel: "basic" | "full" | "power";
  highlights: string[];
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "For individuals getting started",
    price: "$0",
    period: "/mo",
    maxBoards: 1,
    maxSubtasksPerTask: 3,
    maxCustomLabelsPerBoard: 0,
    allowedTemplateTiers: ["free"],
    canComment: false,
    maxUndoSteps: 0,
    shortcutsLevel: "basic",
    highlights: [
      "1 active board",
      "Up to 3 subtasks per task",
      "Standard Kanban template",
      "Basic keyboard shortcuts (?, N, F, T)",
    ],
  },
  pro_user: {
    id: "pro_user",
    name: "Pro",
    tagline: "For growing teams & active projects",
    price: "$9.99",
    period: "/mo",
    maxBoards: Infinity,
    maxSubtasksPerTask: Infinity,
    maxCustomLabelsPerBoard: 5,
    allowedTemplateTiers: ["free", "pro_user"],
    canComment: true,
    maxUndoSteps: 1,
    shortcutsLevel: "full",
    highlights: [
      "Unlimited boards",
      "Unlimited subtasks & checklists",
      "Up to 5 custom labels per board",
      "Starter templates (Kanban, Sprint, Bug Triage)",
      "Task comments & 1-step Undo (Ctrl+Z)",
      "Full board keyboard shortcuts",
    ],
  },
  enterprise_user: {
    id: "enterprise_user",
    name: "Enterprise",
    tagline: "For scaling organizations & power workflows",
    price: "$29.99",
    period: "/mo",
    maxBoards: Infinity,
    maxSubtasksPerTask: Infinity,
    maxCustomLabelsPerBoard: Infinity,
    allowedTemplateTiers: ["free", "pro_user", "enterprise_user"],
    canComment: true,
    maxUndoSteps: 20,
    shortcutsLevel: "power",
    highlights: [
      "Everything in Pro",
      "Unlimited custom labels per board",
      "All 5 board templates (Launch & Content)",
      "20-step Undo action history",
      "Power workspace shortcuts (G+D, G+P)",
    ],
  },
};

export function getPlanLimits(plan: PlanTier): PlanConfig {
  return PLAN_CONFIGS[plan] ?? PLAN_CONFIGS.free;
}

export function canCreateBoard(plan: PlanTier, currentBoardCount: number): boolean {
  return currentBoardCount < getPlanLimits(plan).maxBoards;
}

export function canAddSubtask(
  plan: PlanTier,
  currentSubtaskCount: number
): boolean {
  return currentSubtaskCount < getPlanLimits(plan).maxSubtasksPerTask;
}

export function canCreateLabel(
  plan: PlanTier,
  currentLabelCount: number
): boolean {
  return currentLabelCount < getPlanLimits(plan).maxCustomLabelsPerBoard;
}

export function canUseTemplate(
  plan: PlanTier,
  templateTier: TemplateTier
): boolean {
  return getPlanLimits(plan).allowedTemplateTiers.includes(templateTier);
}

export function canUseComments(plan: PlanTier): boolean {
  return getPlanLimits(plan).canComment;
}

export function canUndo(plan: PlanTier): boolean {
  return getPlanLimits(plan).maxUndoSteps > 0;
}

export function getMaxUndoSteps(plan: PlanTier): number {
  return getPlanLimits(plan).maxUndoSteps;
}
