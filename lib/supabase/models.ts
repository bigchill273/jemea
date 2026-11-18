export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface BoardLabel {
  id: string;
  board_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Board {
  id: string;
  title: string;
  description: string | null;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  totalTasks?: number;
  role?: "owner" | "editor" | "viewer";
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  sort_order: number;
  created_at: string;
  user_id: string;
}

export type ColumnWithTasks = Column & {
  tasks: Task[];
};

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  assignee: string | null;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  sort_order: number;
  created_at: string;
  updated_at?: string;
  comment_count?: number;
  subtasks?: Subtask[];
  label_ids?: string[];
}

export interface BoardMember {
  id: string;
  board_id: string;
  user_id: string;
  role: "owner" | "editor" | "viewer";
  invited_by: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
  user_image_url?: string;
}

export interface BoardInvitation {
  id: string;
  board_id: string;
  inviter_user_id: string;
  invitee_email: string;
  role: "editor" | "viewer";
  status: "pending" | "accepted" | "declined";
  created_at: string;
  board_title?: string;
  inviter_name?: string;
}

export interface ActivityLogEntry {
  id: string;
  board_id: string;
  user_id: string;
  user_name: string | null;
  action: string;
  entity_type: "board" | "column" | "task" | "member" | "comment";
  entity_id: string | null;
  entity_title: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  board_id: string;
  user_id: string;
  user_name: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}
