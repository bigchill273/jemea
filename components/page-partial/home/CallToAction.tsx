import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function CallToAction() {
  return (
    <section className="py-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-14 text-center max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Ready to organize your workflow?
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Jump straight into your Kanban workspace, test board templates, and
            switch between warm stone light mode and deep midnight dark mode.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="px-7 h-11 cursor-pointer">
                Launch Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                size="lg"
                variant="outline"
                className="px-7 h-11 cursor-pointer"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
