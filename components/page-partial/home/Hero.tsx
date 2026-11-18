import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Check, CheckSquare, MessageSquare, Tag } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">
                Visual Kanban · Checklists · Keyboard-First Workflows
              </p>
              <h1 className="text-4xl lg:text-[3.5rem] font-bold tracking-tight text-foreground leading-[1.08] text-balance">
                Organize every project with{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  clarity and speed
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Plan sprints, track subtasks, tag work with custom labels, and
                move cards across columns in a unified light and dark workspace.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base px-7 h-12 cursor-pointer"
                >
                  Open Workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base px-7 h-12 cursor-pointer bg-card"
                >
                  Compare Plans
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Free starter board
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                5 pre-built templates
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Light &amp; dark themes
              </span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Product Roadmap
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    4 lists · 5 active tasks · Undo ready
                  </p>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  Press ? for shortcuts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-muted/60 rounded-xl p-3.5 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-xs text-foreground">
                      To Do
                    </h4>
                    <span className="text-xs font-mono tabular-nums text-muted-foreground">
                      2
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="bg-card p-3 rounded-lg border border-border space-y-2">
                      <p className="text-xs font-medium text-foreground">
                        Design onboarding flow
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <CheckSquare className="w-3 h-3" /> 1/3
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> 1
                        </span>
                        <span className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400">
                          <Tag className="w-3 h-3" /> Design
                        </span>
                      </div>
                    </div>
                    <div className="bg-card p-3 rounded-lg border border-border">
                      <p className="text-xs font-medium text-foreground">
                        Audit mobile layout
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/60 rounded-xl p-3.5 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-xs text-foreground">
                      In Progress
                    </h4>
                    <span className="text-xs font-mono tabular-nums text-muted-foreground">
                      1
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="bg-card p-3 rounded-lg border border-border space-y-2">
                      <p className="text-xs font-medium text-foreground">
                        Drag-and-drop cards
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <CheckSquare className="w-3 h-3" /> 2/2
                        </span>
                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <Tag className="w-3 h-3" /> Frontend
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/60 rounded-xl p-3.5 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-xs text-foreground">
                      Done
                    </h4>
                    <span className="text-xs font-mono tabular-nums text-muted-foreground">
                      2
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="bg-card p-3 rounded-lg border border-border">
                      <p className="text-xs font-medium text-foreground">
                        Workspace setup
                      </p>
                    </div>
                    <div className="bg-card p-3 rounded-lg border border-border">
                      <p className="text-xs font-medium text-foreground">
                        Team review
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
