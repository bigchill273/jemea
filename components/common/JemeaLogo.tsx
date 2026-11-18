import { UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface JemeaLogoProps {
  showWordmark?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function JemeaLogo({
  showWordmark = true,
  size = "md",
  className,
}: JemeaLogoProps) {
  const iconBoxSize = size === "sm" ? "w-8 h-8 rounded-lg" : "w-9 h-9 rounded-xl";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-[18px] h-[18px]";
  const textSize = size === "sm" ? "text-base" : "text-lg";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none",
        className
      )}
    >
      <span
        className={cn(
          "relative flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 text-white shadow-sm shadow-blue-600/25 ring-1 ring-white/20",
          iconBoxSize
        )}
      >
        <UsersRound className={iconSize} strokeWidth={2.2} />
      </span>
      {showWordmark && (
        <span
          className={cn(
            "font-bold tracking-tight text-foreground",
            textSize
          )}
        >
          Jeme&apos;a
        </span>
      )}
    </span>
  );
}
