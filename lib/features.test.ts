import test from "node:test";
import assert from "node:assert/strict";
import {
  canAddSubtask,
  canCreateBoard,
  canCreateLabel,
  canUndo,
  canUseComments,
  canUseTemplate,
  getMaxUndoSteps,
} from "./plans";
import { BOARD_TEMPLATES, getTemplateById } from "./templates";
import { computeWorkspaceMetrics } from "./workspace-metrics";
import { popUndoEntry, pushUndoEntry } from "./board-history";

test("Free plan limits boards, subtasks, labels, comments, templates, and undo", () => {
  assert.equal(canCreateBoard("free", 0), true);
  assert.equal(canCreateBoard("free", 1), false);

  assert.equal(canAddSubtask("free", 2), true);
  assert.equal(canAddSubtask("free", 3), false);

  assert.equal(canCreateLabel("free", 0), false);
  assert.equal(canUseComments("free"), false);
  assert.equal(canUndo("free"), false);
  assert.equal(getMaxUndoSteps("free"), 0);

  assert.equal(canUseTemplate("free", "free"), true);
  assert.equal(canUseTemplate("free", "pro_user"), false);
  assert.equal(canUseTemplate("free", "enterprise_user"), false);
});

test("Pro plan unlocks unlimited boards/subtasks, 5 labels, comments, starter templates, and 1-step undo", () => {
  assert.equal(canCreateBoard("pro_user", 10), true);
  assert.equal(canAddSubtask("pro_user", 25), true);

  assert.equal(canCreateLabel("pro_user", 4), true);
  assert.equal(canCreateLabel("pro_user", 5), false);

  assert.equal(canUseComments("pro_user"), true);
  assert.equal(canUndo("pro_user"), true);
  assert.equal(getMaxUndoSteps("pro_user"), 1);

  assert.equal(canUseTemplate("pro_user", "free"), true);
  assert.equal(canUseTemplate("pro_user", "pro_user"), true);
  assert.equal(canUseTemplate("pro_user", "enterprise_user"), false);
});

test("Enterprise plan unlocks unlimited labels, all templates, and 20-step undo", () => {
  assert.equal(canCreateBoard("enterprise_user", 100), true);
  assert.equal(canCreateLabel("enterprise_user", 99), true);
  assert.equal(canUseComments("enterprise_user"), true);
  assert.equal(canUndo("enterprise_user"), true);
  assert.equal(getMaxUndoSteps("enterprise_user"), 20);

  assert.equal(canUseTemplate("enterprise_user", "enterprise_user"), true);
});

test("Board templates lookup and tier coverage", () => {
  assert.equal(BOARD_TEMPLATES.length, 5);
  const sprint = getTemplateById("agile-sprint");
  assert.ok(sprint);
  assert.equal(sprint.tier, "pro_user");
  assert.ok(sprint.columns.length >= 4);
  assert.ok(sprint.labels.length >= 2);
});

test("Undo history stack enforces maxSteps and LIFO order", () => {
  let stack = pushUndoEntry([], { label: "First", snapshot: { count: 1 } }, 1);
  stack = pushUndoEntry(stack, { label: "Second", snapshot: { count: 2 } }, 1);
  assert.equal(stack.length, 1);
  assert.equal(stack[0].label, "Second");

  let entStack = pushUndoEntry([], { label: "A", snapshot: 1 }, 20);
  entStack = pushUndoEntry(entStack, { label: "B", snapshot: 2 }, 20);
  const { entry, remaining } = popUndoEntry(entStack);
  assert.equal(entry?.label, "B");
  assert.equal(entry?.snapshot, 2);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].label, "A");
});

test("Workspace metrics computes live stage counts, subtask completion, and priority tasks", () => {
  const now = "2026-11-18T00:00:00.000Z";
  const metrics = computeWorkspaceMetrics(
    [
      {
        id: "b1",
        title: "Core",
        description: null,
        color: "bg-blue-500",
        user_id: "u1",
        created_at: now,
        updated_at: now,
      },
    ],
    [
      { id: "c1", board_id: "b1", title: "To Do", sort_order: 0, created_at: now, user_id: "u1" },
      { id: "c2", board_id: "b1", title: "Done", sort_order: 1, created_at: now, user_id: "u1" },
    ],
    [
      {
        id: "t1",
        column_id: "c1",
        title: "Urgent task",
        description: null,
        assignee: "Alex",
        due_date: null,
        priority: "high",
        sort_order: 0,
        created_at: now,
        subtasks: [
          { id: "s1", title: "Step 1", completed: true },
          { id: "s2", title: "Step 2", completed: false },
        ],
      },
      {
        id: "t2",
        column_id: "c2",
        title: "Shipped item",
        description: null,
        assignee: null,
        due_date: null,
        priority: "low",
        sort_order: 0,
        created_at: now,
        subtasks: [{ id: "s3", title: "Done step", completed: true }],
      },
    ]
  );

  assert.equal(metrics.totalTasks, 2);
  assert.equal(metrics.totalSubtasks, 3);
  assert.equal(metrics.completedSubtasks, 2);
  assert.equal(metrics.subtaskCompletionRate, 67);
  assert.equal(metrics.highPriorityCount, 1);
  assert.equal(metrics.stageBuckets.find((s) => s.key === "backlog")?.count, 1);
  assert.equal(metrics.stageBuckets.find((s) => s.key === "done")?.count, 1);
  assert.equal(metrics.priorityTasks.length, 1);
  assert.equal(metrics.priorityTasks[0].title, "Urgent task");
});
