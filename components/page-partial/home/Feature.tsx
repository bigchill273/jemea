import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckSquare,
  Keyboard,
  LayoutTemplate,
  MessageSquare,
  RotateCcw,
  Tag,
} from "lucide-react";

const FEATURES = [
  {
    icon: CheckSquare,
    title: "Subtasks & Checklists",
    description:
      "Break complex deliverables into trackable checklist steps with live completion progress.",
  },
  {
    icon: Tag,
    title: "Custom Labels",
    description:
      "Organize cards by discipline, severity, or stream with color-coded board labels.",
  },
  {
    icon: LayoutTemplate,
    title: "Board Templates",
    description:
      "Launch instantly from Standard Kanban, Agile Sprint, Bug Triage, Product Launch, or Content Calendar.",
  },
  {
    icon: MessageSquare,
    title: "Task Comments",
    description:
      "Collaborate directly inside every task drawer with persistent discussion threads.",
  },
  {
    icon: RotateCcw,
    title: "Undo Last Action",
    description:
      "Step backward safely after accidental card moves, deletions, or list edits with Ctrl+Z.",
  },
  {
    icon: Keyboard,
    title: "Keyboard Shortcuts",
    description:
      "Create tasks, open filters, toggle themes, and navigate boards without leaving the keyboard.",
  },
];

function Feature() {
  return (
    <section id="features" className="py-20 border-b border-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3 text-balance">
            Built for structured execution
          </h2>
          <p className="text-base text-muted-foreground">
            Every workflow primitive you need—checklists, labels, templates,
            comments, undo history, and keyboard speed—adapted cleanly to light
            and dark environments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <Card
                key={feat.title}
                className="border border-border bg-card shadow-none hover:border-foreground/20 transition-colors"
              >
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <CardTitle className="text-base">{feat.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feat.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Feature;
