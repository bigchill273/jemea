"use client";

import { UserButton, useUser } from "@/providers/AuthProvider";
import { ArrowRight } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../common/ThemeToggle";
import { JemeaLogo } from "../common/JemeaLogo";

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className }: NavbarProps) => {
  const { isSignedIn } = useUser();

  return (
    <header
      className={cn(
        "border-b border-border bg-sidebar/85 backdrop-blur-md sticky top-0 z-50",
        className
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        <Link
          href="/"
          className="whitespace-nowrap shrink-0"
        >
          <JemeaLogo size="sm" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link
            href="/#features"
            className="hover:text-foreground transition-colors whitespace-nowrap shrink-0"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="hover:text-foreground transition-colors whitespace-nowrap shrink-0"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors whitespace-nowrap shrink-0"
          >
            Workspace
          </Link>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button size="sm" className="cursor-pointer whitespace-nowrap">
                  Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer whitespace-nowrap"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="cursor-pointer whitespace-nowrap">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
