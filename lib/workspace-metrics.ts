import { Board, Column, Task } from "./supabase/models";

export interface StageBucket {
  key: string;
  label: string;
  count: number;
}

export interface PriorityTaskItem {
  id: string;
  title: string;
  boardId: string;
  boardTitle: string;
  columnTitle: string;
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  assignee: string | null;
}

export interface WorkspaceMetrics {
  totalTasks: number;
  totalSubtasks: number;
  completedSubtasks: number;
  subtaskCompletionRate: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  stageBuckets: StageBucket[];
  priorityTasks: PriorityTaskItem[];
}

function normalizeStageKey(title: string): "backlog" | "progress" | "review" | "done" {
  const t = title.toLowerCase();
  if (
    t.includes("done") ||
    t.includes("ship") ||
    t.includes("launch") ||
    t.includes("verif") ||
    t.includes("publish")
  ) {
    return "done";
  }
  if (
    t.includes("review") ||
    t.includes("qa") ||
    t.includes("test") ||
    t.includes("edit") ||
    t.includes("flight")
  ) {
    return "review";
  }
  if (
    t.includes("progress") ||
    t.includes("dev") ||
    t.includes("fix") ||
    t.includes("draft") ||
    t.includes("asset") ||
    t.includes("creation")
  ) {
    return "progress";
  }
  return "backlog";
}

export function computeWorkspaceMetrics(
  boards: Board[],
  columns: Column[],
  tasks: Task[]
): WorkspaceMetrics {
  const boardMap = new Map(boards.map((b) => [b.id, b]));
  const columnMap = new Map(columns.map((c) => [c.id, c]));

  const visibleTasks = tasks.filter((t) => {
    const col = columnMap.get(t.column_id);
    return col ? boardMap.has(col.board_id) : false;
  });

  let totalSubtasks = 0;
  let completedSubtasks = 0;
  let highPriorityCount = 0;
  let mediumPriorityCount = 0;
  let lowPriorityCount = 0;

  const stageCounts = {
    backlog: 0,
    progress: 0,
    review: 0,
    done: 0,
  };

  for (const task of visibleTasks) {
    const subs = task.subtasks || [];
    totalSubtasks += subs.length;
    completedSubtasks += subs.filter((s) => s.completed).length;

    if (task.priority === "high") highPriorityCount += 1;
    else if (task.priority === "medium") mediumPriorityCount += 1;
    else lowPriorityCount += 1;

    const col = columnMap.get(task.column_id);
    if (col) {
      const bucket = normalizeStageKey(col.title);
      stageCounts[bucket] += 1;
    }
  }

  const subtaskCompletionRate =
    totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);

  const priorityRank: Record<"high" | "medium" | "low", number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  const priorityTasks: PriorityTaskItem[] = visibleTasks
    .filter((t) => {
      const col = columnMap.get(t.column_id);
      return col ? normalizeStageKey(col.title) !== "done" : true;
    })
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
    .slice(0, 4)
    .map((t) => {
      const col = columnMap.get(t.column_id);
      const board = col ? boardMap.get(col.board_id) : undefined;
      return {
        id: t.id,
        title: t.title,
        boardId: board?.id || "",
        boardTitle: board?.title || "Board",
        columnTitle: col?.title || "List",
        priority: t.priority,
        dueDate: t.due_date,
        assignee: t.assignee,
      };
    });

  return {
    totalTasks: visibleTasks.length,
    totalSubtasks,
    completedSubtasks,
    subtaskCompletionRate,
    highPriorityCount,
    mediumPriorityCount,
    lowPriorityCount,
    stageBuckets: [
      { key: "backlog", label: "Backlog", count: stageCounts.backlog },
      { key: "progress", label: "Active", count: stageCounts.progress },
      { key: "review", label: "Review", count: stageCounts.review },
      { key: "done", label: "Done", count: stageCounts.done },
    ],
    priorityTasks,
  };
}
