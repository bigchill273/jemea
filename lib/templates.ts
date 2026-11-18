import type { TemplateTier } from "./plans";

export interface BoardTemplateTaskSeed {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignee?: string;
  labelNames?: string[];
  subtasks?: string[];
}

export interface BoardTemplateColumnSeed {
  title: string;
  tasks: BoardTemplateTaskSeed[];
}

export interface BoardTemplateLabelSeed {
  name: string;
  color: string;
}

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  tier: TemplateTier;
  defaultColor: string;
  labels: BoardTemplateLabelSeed[];
  columns: BoardTemplateColumnSeed[];
}

export const BOARD_TEMPLATES: BoardTemplate[] = [
  {
    id: "standard-kanban",
    name: "Standard Kanban",
    description: "Classic 4-stage workflow to track tasks from backlog to done.",
    tier: "free",
    defaultColor: "bg-blue-500",
    labels: [],
    columns: [
      {
        title: "To Do",
        tasks: [
          {
            title: "Outline project goals",
            description: "Define deliverables and target milestones.",
            priority: "medium",
            subtasks: ["Draft scope", "Share with stakeholders"],
          },
        ],
      },
      { title: "In Progress", tasks: [] },
      { title: "Review", tasks: [] },
      { title: "Done", tasks: [] },
    ],
  },
  {
    id: "agile-sprint",
    name: "Agile Sprint",
    description: "Structured engineering sprint board with backlog, QA, and release.",
    tier: "pro_user",
    defaultColor: "bg-indigo-500",
    labels: [
      { name: "Frontend", color: "#3b82f6" },
      { name: "Backend", color: "#8b5cf6" },
      { name: "QA", color: "#10b981" },
    ],
    columns: [
      {
        title: "Sprint Backlog",
        tasks: [
          {
            title: "API pagination support",
            description: "Add cursor-based pagination to feed endpoint.",
            priority: "high",
            assignee: "Jordan",
            labelNames: ["Backend"],
            subtasks: ["Update schema", "Write integration tests"],
          },
        ],
      },
      {
        title: "In Development",
        tasks: [
          {
            title: "Refine board filter bar",
            description: "Add label and priority quick toggles.",
            priority: "medium",
            assignee: "Alex",
            labelNames: ["Frontend"],
          },
        ],
      },
      { title: "QA & Review", tasks: [] },
      { title: "Shipped", tasks: [] },
    ],
  },
  {
    id: "bug-triage",
    name: "Bug Triage",
    description: "Capture, reproduce, fix, and verify defects with clear priority tags.",
    tier: "pro_user",
    defaultColor: "bg-red-500",
    labels: [
      { name: "Critical", color: "#ef4444" },
      { name: "UI/UX", color: "#f59e0b" },
      { name: "Regression", color: "#ec4899" },
    ],
    columns: [
      {
        title: "Reported",
        tasks: [
          {
            title: "Safari date picker alignment",
            description: "Input clips slightly on narrow mobile screens.",
            priority: "medium",
            assignee: "Sam",
            labelNames: ["UI/UX"],
          },
        ],
      },
      { title: "Reproduced", tasks: [] },
      { title: "Fixing", tasks: [] },
      { title: "Verified", tasks: [] },
    ],
  },
  {
    id: "product-launch",
    name: "Product Launch",
    description: "Cross-functional GTM checklist covering design, docs, and marketing.",
    tier: "enterprise_user",
    defaultColor: "bg-emerald-500",
    labels: [
      { name: "Marketing", color: "#ec4899" },
      { name: "Docs", color: "#06b6d4" },
      { name: "Legal", color: "#64748b" },
      { name: "Launch Day", color: "#10b981" },
    ],
    columns: [
      {
        title: "Planning",
        tasks: [
          {
            title: "Finalize pricing page copy",
            description: "Align tier names and feature matrix before release.",
            priority: "high",
            assignee: "Taylor",
            labelNames: ["Marketing"],
            subtasks: ["Draft headline", "Review with PM", "Publish staging"],
          },
        ],
      },
      { title: "Asset Creation", tasks: [] },
      { title: "Pre-Flight Check", tasks: [] },
      { title: "Launched", tasks: [] },
    ],
  },
  {
    id: "content-calendar",
    name: "Content Calendar",
    description: "Editorial pipeline from ideation and drafting to scheduled publication.",
    tier: "enterprise_user",
    defaultColor: "bg-purple-500",
    labels: [
      { name: "Blog", color: "#6366f1" },
      { name: "Video", color: "#f97316" },
      { name: "Newsletter", color: "#14b8a6" },
    ],
    columns: [
      {
        title: "Ideas",
        tasks: [
          {
            title: "Q4 product changelog roundup",
            description: "Highlight dark mode, templates, and shortcuts.",
            priority: "medium",
            assignee: "Alex",
            labelNames: ["Blog", "Newsletter"],
          },
        ],
      },
      { title: "Drafting", tasks: [] },
      { title: "Editing", tasks: [] },
      { title: "Published", tasks: [] },
    ],
  },
];

export function getTemplateById(id: string): BoardTemplate | undefined {
  return BOARD_TEMPLATES.find((t) => t.id === id);
}
