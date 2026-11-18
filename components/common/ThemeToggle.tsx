"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isDark = isMounted && resolvedTheme === "dark";

  if (compact) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-1 p-1 rounded-xl border border-border bg-muted/70",
          className
        )}
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-label="Switch to light mode"
          title="Light mode (T)"
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer",
            !isDark
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-label="Switch to dark mode"
          title="Dark mode (T)"
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer",
            isDark
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Moon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title="Toggle light/dark mode (T)"
      className={cn(
        "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors cursor-pointer",
        className
      )}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
