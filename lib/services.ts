import {
  Board,
  BoardLabel,
  BoardMember,
  BoardInvitation,
  Column,
  ColumnWithTasks,
  Task,
  ActivityLogEntry,
  Comment,
} from "./supabase/models";
import { getTemplateById } from "./templates";
import { WorkspaceMetrics, computeWorkspaceMetrics } from "./workspace-metrics";

type MockClient = unknown;

interface StoreData {
  boards: Board[];
  columns: Column[];
  tasks: Task[];
  labels: BoardLabel[];
  boardMembers: BoardMember[];
  boardInvitations: BoardInvitation[];
  activityLog: ActivityLogEntry[];
  comments: Comment[];
}

const STORAGE_KEY = "trello_clone_mock_store_v2";

function generateId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function createInitialData(): StoreData {
  const now = new Date().toISOString();
  const boardId = "board_demo_1";
  const colTodoId = "col_todo_1";
  const colInProgressId = "col_progress_1";
  const colReviewId = "col_review_1";
  const colDoneId = "col_done_1";
  const userId = "user_demo_1";

  const labelDesignId = "lbl_design_1";
  const labelFrontendId = "lbl_frontend_1";
  const labelLaunchId = "lbl_launch_1";

  return {
    boards: [
      {
        id: boardId,
        title: "Product Roadmap",
        description:
          "Track upcoming product milestones, design tasks, and Q4 releases.",
        color: "bg-blue-500",
        user_id: userId,
        created_at: now,
        updated_at: now,
        role: "owner",
      },
    ],
    labels: [
      {
        id: labelDesignId,
        board_id: boardId,
        name: "Design",
        color: "#8b5cf6",
        created_at: now,
      },
      {
        id: labelFrontendId,
        board_id: boardId,
        name: "Frontend",
        color: "#3b82f6",
        created_at: now,
      },
      {
        id: labelLaunchId,
        board_id: boardId,
        name: "Release",
        color: "#10b981",
        created_at: now,
      },
    ],
    columns: [
      {
        id: colTodoId,
        board_id: boardId,
        title: "To Do",
        sort_order: 0,
        created_at: now,
        user_id: userId,
      },
      {
        id: colInProgressId,
        board_id: boardId,
        title: "In Progress",
        sort_order: 1,
        created_at: now,
        user_id: userId,
      },
      {
        id: colReviewId,
        board_id: boardId,
        title: "Review",
        sort_order: 2,
        created_at: now,
        user_id: userId,
      },
      {
        id: colDoneId,
        board_id: boardId,
        title: "Done",
        sort_order: 3,
        created_at: now,
        user_id: userId,
      },
    ],
    tasks: [
      {
        id: "task_1",
        column_id: colTodoId,
        title: "Design onboarding flow",
        description:
          "Create wireframes and copy for the new user welcome experience.",
        assignee: "Alex",
        due_date: "2026-11-24",
        priority: "high",
        sort_order: 0,
        created_at: now,
        updated_at: now,
        label_ids: [labelDesignId],
        subtasks: [
          { id: "sub_1", title: "Audit signup steps", completed: true },
          { id: "sub_2", title: "Draft empty-state copy", completed: false },
          { id: "sub_3", title: "Prototype dark mode tokens", completed: false },
        ],
      },
      {
        id: "task_2",
        column_id: colTodoId,
        title: "Audit mobile responsiveness",
        description:
          "Verify board columns scroll cleanly on smaller viewports.",
        assignee: "Sam",
        due_date: "2026-11-28",
        priority: "medium",
        sort_order: 1,
        created_at: now,
        updated_at: now,
        label_ids: [labelFrontendId],
        subtasks: [
          { id: "sub_4", title: "Test 390px viewport", completed: true },
          { id: "sub_5", title: "Verify modal overflow", completed: false },
        ],
      },
      {
        id: "task_3",
        column_id: colInProgressId,
        title: "Implement drag-and-drop cards",
        description: "Enable moving tasks smoothly across workflow lists.",
        assignee: "Jordan",
        due_date: "2026-11-22",
        priority: "high",
        sort_order: 0,
        created_at: now,
        updated_at: now,
        label_ids: [labelFrontendId],
        subtasks: [
          { id: "sub_6", title: "Configure pointer sensor", completed: true },
          { id: "sub_7", title: "Persist column order", completed: true },
        ],
      },
      {
        id: "task_4",
        column_id: colReviewId,
        title: "Update documentation",
        description: "Add keyboard shortcut notes and filter guide.",
        assignee: "Taylor",
        due_date: null,
        priority: "low",
        sort_order: 0,
        created_at: now,
        updated_at: now,
        label_ids: [labelLaunchId],
        subtasks: [],
      },
      {
        id: "task_5",
        column_id: colDoneId,
        title: "Project workspace setup",
        description: "Configure initial boards, columns, and UI components.",
        assignee: "Alex",
        due_date: null,
        priority: "medium",
        sort_order: 0,
        created_at: now,
        updated_at: now,
        label_ids: [labelLaunchId],
        subtasks: [
          { id: "sub_8", title: "Configure design tokens", completed: true },
        ],
      },
    ],
    boardMembers: [
      {
        id: "member_1",
        board_id: boardId,
        user_id: userId,
        role: "owner",
        invited_by: null,
        created_at: now,
      },
    ],
    boardInvitations: [],
    activityLog: [],
    comments: [
      {
        id: "comment_1",
        task_id: "task_1",
        board_id: boardId,
        user_id: userId,
        user_name: "Alex Rivera",
        content: "Shared the updated Figma wireframes for review.",
        created_at: now,
        updated_at: now,
      },
      {
        id: "comment_2",
        task_id: "task_3",
        board_id: boardId,
        user_id: userId,
        user_name: "Jordan Lee",
        content: "Drag overlay contrast looks sharp in both themes.",
        created_at: now,
        updated_at: now,
      },
    ],
  };
}

let memoryStore: StoreData | null = null;

function getStore(): StoreData {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoreData;
        if (!parsed.labels) parsed.labels = [];
        if (!parsed.comments) parsed.comments = [];
        memoryStore = parsed;
        return memoryStore;
      }
    } catch {
      // ignore localStorage read errors
    }
  }

  if (!memoryStore) {
    memoryStore = createInitialData();
    saveStore(memoryStore);
  }

  return memoryStore;
}

function saveStore(store: StoreData): void {
  memoryStore = store;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // ignore localStorage write errors
    }
  }
}

// ============================================
// Board Service
// ============================================
export const boardService = {
  async getBoard(_supabase: MockClient, boardId: string): Promise<Board> {
    const store = getStore();
    const board = store.boards.find((b) => b.id === boardId);
    if (!board) throw new Error("Board not found");
    return { ...board };
  },

  async getBoards(_supabase: MockClient, userId: string): Promise<Board[]> {
    const store = getStore();
    const ownedBoards = store.boards.filter((b) => b.user_id === userId);
    const memberships = store.boardMembers.filter(
      (m) => m.user_id === userId && m.role !== "owner"
    );
    const sharedIds = new Set(memberships.map((m) => m.board_id));
    const roleMap = new Map(memberships.map((m) => [m.board_id, m.role]));

    const mapBoard = (
      board: Board,
      role: "owner" | "editor" | "viewer"
    ): Board => {
      const boardColIds = new Set(
        store.columns.filter((c) => c.board_id === board.id).map((c) => c.id)
      );
      const totalTasks = store.tasks.filter((t) =>
        boardColIds.has(t.column_id)
      ).length;
      return {
        ...board,
        totalTasks,
        role,
      };
    };

    const owned = ownedBoards
      .slice()
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((b) => mapBoard(b, "owner"));

    const shared = store.boards
      .filter((b) => sharedIds.has(b.id) && b.user_id !== userId)
      .map((b) => mapBoard(b, roleMap.get(b.id) || "viewer"));

    return [...owned, ...shared];
  },

  async getWorkspaceMetrics(
    _supabase: MockClient,
    userId: string
  ): Promise<WorkspaceMetrics> {
    const store = getStore();
    const visibleBoards = await this.getBoards(_supabase, userId);
    return computeWorkspaceMetrics(visibleBoards, store.columns, store.tasks);
  },

  async createBoard(
    _supabase: MockClient,
    board: Omit<Board, "id" | "created_at" | "updated_at">
  ): Promise<Board> {
    const store = getStore();
    const now = new Date().toISOString();
    const newBoard: Board = {
      ...board,
      id: generateId("board"),
      created_at: now,
      updated_at: now,
    };
    store.boards.unshift(newBoard);
    saveStore(store);
    return { ...newBoard };
  },

  async updateBoard(
    _supabase: MockClient,
    boardId: string,
    updates: Partial<Board>
  ): Promise<Board> {
    const store = getStore();
    const index = store.boards.findIndex((b) => b.id === boardId);
    if (index === -1) throw new Error("Board not found");
    const updated: Board = {
      ...store.boards[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    store.boards[index] = updated;
    saveStore(store);
    return { ...updated };
  },

  async getUserRole(
    _supabase: MockClient,
    boardId: string,
    userId: string
  ): Promise<"owner" | "editor" | "viewer" | null> {
    const store = getStore();
    const board = store.boards.find((b) => b.id === boardId);
    if (board?.user_id === userId) return "owner";
    const member = store.boardMembers.find(
      (m) => m.board_id === boardId && m.user_id === userId
    );
    return member?.role || null;
  },
};

// ============================================
// Label Service
// ============================================
export const labelService = {
  async getLabels(_supabase: MockClient, boardId: string): Promise<BoardLabel[]> {
    const store = getStore();
    return store.labels
      .filter((l) => l.board_id === boardId)
      .map((l) => ({ ...l }));
  },

  async createLabel(
    _supabase: MockClient,
    boardId: string,
    name: string,
    color: string
  ): Promise<BoardLabel> {
    const store = getStore();
    const newLabel: BoardLabel = {
      id: generateId("lbl"),
      board_id: boardId,
      name: name.trim(),
      color,
      created_at: new Date().toISOString(),
    };
    store.labels.push(newLabel);
    saveStore(store);
    return { ...newLabel };
  },

  async deleteLabel(_supabase: MockClient, labelId: string): Promise<void> {
    const store = getStore();
    store.labels = store.labels.filter((l) => l.id !== labelId);
    store.tasks = store.tasks.map((t) => ({
      ...t,
      label_ids: (t.label_ids || []).filter((id) => id !== labelId),
    }));
    saveStore(store);
  },
};

// ============================================
// Column Service
// ============================================
export const columnService = {
  async getColumns(_supabase: MockClient, boardId: string): Promise<Column[]> {
    const store = getStore();
    return store.columns
      .filter((c) => c.board_id === boardId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({ ...c }));
  },

  async createColumn(
    _supabase: MockClient,
    column: Omit<Column, "id" | "created_at">
  ): Promise<Column> {
    const store = getStore();
    const newColumn: Column = {
      ...column,
      id: generateId("col"),
      created_at: new Date().toISOString(),
    };
    store.columns.push(newColumn);
    saveStore(store);
    return { ...newColumn };
  },

  async updateColumnTitle(
    _supabase: MockClient,
    columnId: string,
    title: string
  ): Promise<Column> {
    const store = getStore();
    const index = store.columns.findIndex((c) => c.id === columnId);
    if (index === -1) throw new Error("Column not found");
    store.columns[index] = { ...store.columns[index], title };
    saveStore(store);
    return { ...store.columns[index] };
  },

  async deleteColumn(_supabase: MockClient, columnId: string) {
    const store = getStore();
    store.columns = store.columns.filter((c) => c.id !== columnId);
    store.tasks = store.tasks.filter((t) => t.column_id !== columnId);
    saveStore(store);
    return null;
  },
};

// ============================================
// Task Service
// ============================================
export const taskService = {
  async getTasksByBoard(
    _supabase: MockClient,
    boardId: string
  ): Promise<Task[]> {
    const store = getStore();
    const colIds = new Set(
      store.columns.filter((c) => c.board_id === boardId).map((c) => c.id)
    );
    const commentCounts = new Map<string, number>();
    store.comments.forEach((c) => {
      commentCounts.set(c.task_id, (commentCounts.get(c.task_id) || 0) + 1);
    });

    return store.tasks
      .filter((t) => colIds.has(t.column_id))
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((t) => ({
        ...t,
        subtasks: t.subtasks ? [...t.subtasks] : [],
        label_ids: t.label_ids ? [...t.label_ids] : [],
        comment_count: commentCounts.get(t.id) || 0,
      }));
  },

  async getTasksAcrossBoards(
    _supabase: MockClient,
    boardIds: string[]
  ): Promise<
    (Task & { board_id: string; board_title?: string; board_color?: string })[]
  > {
    if (boardIds.length === 0) return [];
    const store = getStore();
    const boardIdSet = new Set(boardIds);
    const colMap = new Map(
      store.columns
        .filter((c) => boardIdSet.has(c.board_id))
        .map((c) => [c.id, c])
    );
    const boardMap = new Map(store.boards.map((b) => [b.id, b]));

    return store.tasks
      .filter((t) => colMap.has(t.column_id) && t.due_date !== null)
      .sort(
        (a, b) =>
          new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
      )
      .map((t) => {
        const col = colMap.get(t.column_id)!;
        const board = boardMap.get(col.board_id);
        return {
          ...t,
          board_id: col.board_id,
          board_title: board?.title || "",
          board_color: board?.color || "",
        };
      });
  },

  async createTask(
    _supabase: MockClient,
    task: Omit<Task, "id" | "created_at" | "updated_at">
  ): Promise<Task> {
    const store = getStore();
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      subtasks: task.subtasks || [],
      label_ids: task.label_ids || [],
      comment_count: 0,
      id: generateId("task"),
      created_at: now,
      updated_at: now,
    };
    store.tasks.push(newTask);
    saveStore(store);
    return { ...newTask };
  },

  async updateTask(
    _supabase: MockClient,
    taskId: string,
    updates: Partial<Task>
  ): Promise<Task> {
    const store = getStore();
    const index = store.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) throw new Error("Task not found");
    store.tasks[index] = {
      ...store.tasks[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveStore(store);
    return { ...store.tasks[index] };
  },

  async moveTask(
    _supabase: MockClient,
    taskId: string,
    newColumnId: string,
    newOrder: number
  ) {
    const store = getStore();
    const index = store.tasks.findIndex((t) => t.id === taskId);
    if (index === -1) throw new Error("Task not found");
    store.tasks[index] = {
      ...store.tasks[index],
      column_id: newColumnId,
      sort_order: newOrder,
      updated_at: new Date().toISOString(),
    };
    saveStore(store);
    return null;
  },

  async deleteTask(_supabase: MockClient, taskId: string) {
    const store = getStore();
    store.tasks = store.tasks.filter((t) => t.id !== taskId);
    saveStore(store);
    return null;
  },
};

// ============================================
// Board Data Service (composite operations)
// ============================================
export const boardDataService = {
  async getBoardWithColumns(supabase: MockClient, boardId: string) {
    const [board, columns, labels] = await Promise.all([
      boardService.getBoard(supabase, boardId),
      columnService.getColumns(supabase, boardId),
      labelService.getLabels(supabase, boardId),
    ]);

    if (!board) throw new Error("Board not found");

    const tasks = await taskService.getTasksByBoard(supabase, boardId);

    const columnsWithTasks = columns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.column_id === column.id),
    }));

    return {
      board,
      columnsWithTasks,
      labels,
    };
  },

  async restoreBoardSnapshot(
    _supabase: MockClient,
    boardId: string,
    columnsWithTasks: ColumnWithTasks[]
  ): Promise<void> {
    const store = getStore();
    const existingColIds = new Set(
      store.columns.filter((c) => c.board_id === boardId).map((c) => c.id)
    );
    store.columns = store.columns.filter((c) => c.board_id !== boardId);
    store.tasks = store.tasks.filter((t) => !existingColIds.has(t.column_id));

    columnsWithTasks.forEach((col, colIndex) => {
      const { tasks, ...colOnly } = col;
      store.columns.push({
        ...colOnly,
        sort_order: colIndex,
      });
      tasks.forEach((task, taskIndex) => {
        store.tasks.push({
          ...task,
          column_id: col.id,
          sort_order: taskIndex,
        });
      });
    });

    saveStore(store);
  },

  async createBoardWithDefaultColumns(
    supabase: MockClient,
    boardData: {
      title: string;
      description?: string;
      color?: string;
      userId: string;
    }
  ) {
    return boardDataService.createBoardFromTemplate(supabase, {
      templateId: "standard-kanban",
      title: boardData.title,
      description: boardData.description,
      color: boardData.color,
      userId: boardData.userId,
    });
  },

  async createBoardFromTemplate(
    supabase: MockClient,
    params: {
      templateId: string;
      title: string;
      description?: string;
      color?: string;
      userId: string;
    }
  ): Promise<Board> {
    const template = getTemplateById(params.templateId);
    const board = await boardService.createBoard(supabase, {
      title: params.title,
      description: params.description || template?.description || null,
      color: params.color || template?.defaultColor || "bg-blue-500",
      user_id: params.userId,
    });

    const labelNameToId = new Map<string, string>();
    if (template?.labels.length) {
      for (const lbl of template.labels) {
        const createdLabel = await labelService.createLabel(
          supabase,
          board.id,
          lbl.name,
          lbl.color
        );
        labelNameToId.set(lbl.name, createdLabel.id);
      }
    }

    const templateCols = template?.columns || [
      { title: "To Do", tasks: [] },
      { title: "In Progress", tasks: [] },
      { title: "Review", tasks: [] },
      { title: "Done", tasks: [] },
    ];

    let taskTotal = 0;
    for (let i = 0; i < templateCols.length; i++) {
      const colSeed = templateCols[i];
      const createdCol = await columnService.createColumn(supabase, {
        title: colSeed.title,
        sort_order: i,
        board_id: board.id,
        user_id: params.userId,
      });

      for (let t = 0; t < colSeed.tasks.length; t++) {
        const taskSeed = colSeed.tasks[t];
        const labelIds = (taskSeed.labelNames || [])
          .map((n) => labelNameToId.get(n))
          .filter((id): id is string => Boolean(id));
        const subtasks = (taskSeed.subtasks || []).map((st, idx) => ({
          id: generateId(`sub_${idx}`),
          title: st,
          completed: false,
        }));

        await taskService.createTask(supabase, {
          column_id: createdCol.id,
          title: taskSeed.title,
          description: taskSeed.description,
          assignee: taskSeed.assignee || null,
          due_date: null,
          priority: taskSeed.priority,
          sort_order: t,
          label_ids: labelIds,
          subtasks,
        });
        taskTotal++;
      }
    }

    await boardMemberService.addMember(
      supabase,
      board.id,
      params.userId,
      "owner"
    );

    return { ...board, totalTasks: taskTotal };
  },
};

// ============================================
// Board Member Service (sharing)
// ============================================
export const boardMemberService = {
  async getMembers(
    _supabase: MockClient,
    boardId: string
  ): Promise<BoardMember[]> {
    const store = getStore();
    return store.boardMembers.filter((m) => m.board_id === boardId);
  },

  async addMember(
    _supabase: MockClient,
    boardId: string,
    userId: string,
    role: "owner" | "editor" | "viewer",
    invitedBy?: string
  ): Promise<BoardMember> {
    const store = getStore();
    const member: BoardMember = {
      id: generateId("member"),
      board_id: boardId,
      user_id: userId,
      role,
      invited_by: invitedBy || null,
      created_at: new Date().toISOString(),
    };
    store.boardMembers.push(member);
    saveStore(store);
    return member;
  },

  async updateRole(
    _supabase: MockClient,
    memberId: string,
    role: "owner" | "editor" | "viewer"
  ): Promise<BoardMember> {
    const store = getStore();
    const index = store.boardMembers.findIndex((m) => m.id === memberId);
    if (index === -1) throw new Error("Member not found");
    store.boardMembers[index] = { ...store.boardMembers[index], role };
    saveStore(store);
    return store.boardMembers[index];
  },

  async removeMember(_supabase: MockClient, memberId: string) {
    const store = getStore();
    store.boardMembers = store.boardMembers.filter((m) => m.id !== memberId);
    saveStore(store);
  },
};

// ============================================
// Board Invitation Service
// ============================================
export const boardInvitationService = {
  async getInvitations(
    _supabase: MockClient,
    boardId: string
  ): Promise<BoardInvitation[]> {
    const store = getStore();
    return store.boardInvitations.filter((i) => i.board_id === boardId);
  },

  async getMyInvitations(
    _supabase: MockClient,
    email: string
  ): Promise<BoardInvitation[]> {
    const store = getStore();
    return store.boardInvitations
      .filter((i) => i.invitee_email === email && i.status === "pending")
      .map((inv) => ({
        ...inv,
        board_title:
          store.boards.find((b) => b.id === inv.board_id)?.title ||
          "Unknown Board",
      }));
  },

  async createInvitation(
    _supabase: MockClient,
    boardId: string,
    inviterUserId: string,
    inviteeEmail: string,
    role: "editor" | "viewer",
    inviterName?: string
  ): Promise<BoardInvitation> {
    const store = getStore();
    const inv: BoardInvitation = {
      id: generateId("inv"),
      board_id: boardId,
      inviter_user_id: inviterUserId,
      invitee_email: inviteeEmail,
      role,
      status: "pending",
      created_at: new Date().toISOString(),
      inviter_name: inviterName,
    };
    store.boardInvitations.unshift(inv);
    saveStore(store);
    return inv;
  },

  async acceptInvitation(
    supabase: MockClient,
    invitationId: string,
    userId: string
  ): Promise<void> {
    const store = getStore();
    const inv = store.boardInvitations.find((i) => i.id === invitationId);
    if (!inv) throw new Error("Invitation not found");
    await boardMemberService.addMember(
      supabase,
      inv.board_id,
      userId,
      inv.role,
      inv.inviter_user_id
    );
    inv.status = "accepted";
    saveStore(store);
  },

  async declineInvitation(
    _supabase: MockClient,
    invitationId: string
  ): Promise<void> {
    const store = getStore();
    const inv = store.boardInvitations.find((i) => i.id === invitationId);
    if (inv) {
      inv.status = "declined";
      saveStore(store);
    }
  },

  async deleteInvitation(
    _supabase: MockClient,
    invitationId: string
  ): Promise<void> {
    const store = getStore();
    store.boardInvitations = store.boardInvitations.filter(
      (i) => i.id !== invitationId
    );
    saveStore(store);
  },
};

// ============================================
// Activity Log Service
// ============================================
export const activityService = {
  async logActivity(
    _supabase: MockClient,
    entry: Omit<ActivityLogEntry, "id" | "created_at">
  ): Promise<void> {
    const store = getStore();
    store.activityLog.unshift({
      ...entry,
      id: generateId("act"),
      created_at: new Date().toISOString(),
    });
    saveStore(store);
  },

  async getActivityLog(
    _supabase: MockClient,
    boardId: string,
    limit: number = 50
  ): Promise<ActivityLogEntry[]> {
    const store = getStore();
    return store.activityLog
      .filter((a) => a.board_id === boardId)
      .slice(0, limit);
  },

  async getTaskActivity(
    _supabase: MockClient,
    taskId: string,
    limit: number = 20
  ): Promise<ActivityLogEntry[]> {
    const store = getStore();
    return store.activityLog
      .filter((a) => a.entity_id === taskId && a.entity_type === "task")
      .slice(0, limit);
  },
};

// ============================================
// Comment Service
// ============================================
export const commentService = {
  async getComments(
    _supabase: MockClient,
    taskId: string
  ): Promise<Comment[]> {
    const store = getStore();
    return store.comments.filter((c) => c.task_id === taskId);
  },

  async addComment(
    _supabase: MockClient,
    comment: Omit<Comment, "id" | "created_at" | "updated_at">
  ): Promise<Comment> {
    const store = getStore();
    const now = new Date().toISOString();
    const newComment: Comment = {
      ...comment,
      id: generateId("comment"),
      created_at: now,
      updated_at: now,
    };
    store.comments.push(newComment);
    saveStore(store);
    return newComment;
  },

  async updateComment(
    _supabase: MockClient,
    commentId: string,
    content: string
  ): Promise<Comment> {
    const store = getStore();
    const index = store.comments.findIndex((c) => c.id === commentId);
    if (index === -1) throw new Error("Comment not found");
    store.comments[index] = {
      ...store.comments[index],
      content,
      updated_at: new Date().toISOString(),
    };
    saveStore(store);
    return store.comments[index];
  },

  async deleteComment(_supabase: MockClient, commentId: string) {
    const store = getStore();
    store.comments = store.comments.filter((c) => c.id !== commentId);
    saveStore(store);
  },

  async getCommentCount(
    _supabase: MockClient,
    taskIds: string[]
  ): Promise<Map<string, number>> {
    const store = getStore();
    const idSet = new Set(taskIds);
    const counts = new Map<string, number>();
    store.comments.forEach((c) => {
      if (idSet.has(c.task_id)) {
        counts.set(c.task_id, (counts.get(c.task_id) || 0) + 1);
      }
    });
    return counts;
  },
};
