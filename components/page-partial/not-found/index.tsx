import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Home, ArrowLeft, Compass, Zap } from "lucide-react";

export default function NotFoundPagePartial() {
  return (
    <div className="min-h-screen bg-background text-foreground workspace-backdrop">
      <Navbar />

      <main className="max-w-[1440px] mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6">
            <div className="text-8xl sm:text-9xl font-bold font-mono text-muted-foreground/25 select-none">
              404
            </div>
          </div>
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Page not found
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              The page you are looking for does not exist or has moved.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button asChild size="lg">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          <Card className="max-w-xl mx-auto shadow-none">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold text-foreground mb-4">
                Quick links
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                    <Compass className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm text-foreground">
                      Dashboard
                    </div>
                    <div className="text-xs text-muted-foreground">
                      View boards and stats
                    </div>
                  </div>
                </Link>

                <Link
                  href="/pricing"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm text-foreground">
                      Pricing
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Compare plan features
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
