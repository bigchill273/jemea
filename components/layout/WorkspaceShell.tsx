"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  Keyboard,
  LayoutDashboard,
  LayoutTemplate,
} from "lucide-react";
import { useTheme } from "next-themes";
import { UserButton, useAuth } from "@/providers/AuthProvider";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { KeyboardShortcutsDialog } from "@/components/common/KeyboardShortcutsDialog";
import { JemeaLogo } from "@/components/common/JemeaLogo";
import { getPlanLimits } from "@/lib/plans";
import { cn } from "@/lib/utils";

interface WorkspaceShellProps {
  children: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  onOpenTemplates?: () => void;
  onOpenShortcuts?: () => void;
}

export function WorkspaceShell({
  children,
  headerLeft,
  headerRight,
  onOpenTemplates,
  onOpenShortcuts,
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { plan } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const planConfig = getPlanLimits(plan);

  useEffect(() => {
    let lastKey = "";
    let lastKeyTime = 0;

    const handleGlobalKeys = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (isTyping) return;

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        if (onOpenShortcuts) {
          onOpenShortcuts();
        } else {
          setShortcutsOpen(true);
        }
        return;
      }

      if (
        (e.key === "t" || e.key === "T") &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        return;
      }

      if (plan === "enterprise_user" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const now = Date.now();
        const keyLower = e.key.toLowerCase();
        if (lastKey === "g" && now - lastKeyTime < 800) {
          if (keyLower === "d") {
            e.preventDefault();
            router.push("/dashboard");
          } else if (keyLower === "p") {
            e.preventDefault();
            router.push("/pricing");
          }
          lastKey = "";
          return;
        }
        lastKey = keyLower;
        lastKeyTime = now;
      }
    };

    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [onOpenShortcuts, plan, resolvedTheme, router, setTheme]);

  const isBoardRoute = pathname.startsWith("/boards/");
  const isDashboardActive = pathname === "/dashboard" || isBoardRoute;
  const isPricingActive = pathname === "/pricing";

  const railItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: isDashboardActive,
    },
    {
      href: "/pricing",
      label: "Plans & Billing",
      icon: CreditCard,
      active: isPricingActive,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground workspace-backdrop flex flex-col">
      {/* Full-Width Command Header (matches reference architecture) */}
      <header className="sticky top-0 z-40 h-16 border-b border-border bg-sidebar/85 backdrop-blur-md">
        <div className="h-full max-w-[1600px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/" aria-label="Jeme'a Home" className="shrink-0">
              <JemeaLogo size="sm" />
            </Link>

            {isBoardRoute && headerLeft ? (
              <div className="min-w-0 pl-2 border-l border-border">
                {headerLeft}
              </div>
            ) : (
              <nav
                aria-label="Workspace navigation"
                className="hidden md:flex items-center gap-1.5"
              >
                <Link
                  href="/dashboard"
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0",
                    pathname === "/dashboard"
                      ? "bg-primary text-primary-foreground shadow-sm shadow-blue-600/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/pricing"
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0",
                    isPricingActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-blue-600/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  )}
                >
                  Plans
                </Link>
                {onOpenTemplates && (
                  <button
                    type="button"
                    onClick={onOpenTemplates}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Templates
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    onOpenShortcuts ? onOpenShortcuts() : setShortcutsOpen(true)
                  }
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Shortcuts
                </button>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {headerRight}
            <Link
              href="/pricing"
              className="hidden sm:inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap px-3 py-1.5 rounded-full border border-border bg-card/60 hover:bg-accent/60"
            >
              {planConfig.name} Plan
            </Link>
            <button
              type="button"
              onClick={() =>
                onOpenShortcuts ? onOpenShortcuts() : setShortcutsOpen(true)
              }
              aria-label="Open keyboard shortcuts"
              title="Keyboard Shortcuts (?)"
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
            </button>
            <ThemeToggle className="md:hidden" />
            <UserButton />
          </div>
        </div>
      </header>

      {/* Rail + Workspace Canvas */}
      <div className="flex-1 flex min-h-0 max-w-[1600px] w-full mx-auto">
        <aside className="hidden md:flex w-16 shrink-0 flex-col items-center justify-between py-5 pb-14 border-r border-border bg-sidebar/40 sticky top-16 h-[calc(100vh-4rem)] z-30">
          <nav className="flex flex-col items-center gap-2.5">
            {railItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  aria-label={item.label}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors border",
                    item.active
                      ? "bg-primary/15 text-primary border-primary/40 shadow-xs"
                      : "border-border/80 bg-card/40 text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </Link>
              );
            })}

            {onOpenTemplates && (
              <button
                type="button"
                onClick={onOpenTemplates}
                title="Board Templates"
                aria-label="Board Templates"
                className="w-10 h-10 rounded-full border border-border/80 bg-card/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors cursor-pointer"
              >
                <LayoutTemplate className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                onOpenShortcuts ? onOpenShortcuts() : setShortcutsOpen(true)
              }
              title="Keyboard Shortcuts (?)"
              aria-label="Keyboard Shortcuts"
              className="w-10 h-10 rounded-full border border-border/80 bg-card/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </nav>

          <div className="flex flex-col items-center">
            <ThemeToggle compact />
          </div>
        </aside>

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>

      <KeyboardShortcutsDialog
        isOpen={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
        plan={plan}
      />
    </div>
  );
}
