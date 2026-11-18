import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { PLAN_CONFIGS, PlanTier } from "@/lib/plans";

const TIERS: PlanTier[] = ["free", "pro_user", "enterprise_user"];

export default function Pricing() {
  return (
    <section className="py-20 border-b border-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Features scale cleanly across Free, Pro, and Enterprise workspaces.
            Switch plans anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TIERS.map((tierId) => {
            const tier = PLAN_CONFIGS[tierId];
            const isPro = tierId === "pro_user";
            return (
              <Card
                key={tierId}
                className={`relative bg-card shadow-none ${
                  isPro
                    ? "border-2 border-blue-600 dark:border-blue-500"
                    : "border border-border"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    {isPro && (
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-foreground font-mono tabular-nums pt-2">
                    {tier.price}
                    <span className="text-sm font-sans font-normal text-muted-foreground">
                      {tier.period}
                    </span>
                  </div>
                  <CardDescription>{tier.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-2.5 text-sm">
                    {tier.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/pricing" className="block">
                    <Button
                      variant={isPro ? "default" : "outline"}
                      className="w-full cursor-pointer"
                    >
                      {tierId === "free"
                        ? "Start Free"
                        : `Choose ${tier.name}`}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/pricing">
            <Button
              variant="ghost"
              className="text-blue-600 dark:text-blue-400 cursor-pointer"
            >
              Compare full feature matrix
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
