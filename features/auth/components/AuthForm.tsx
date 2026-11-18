"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
  title: string;
  subtitle: string;
  redirectUrl: string;
  alternateUrl: string;
}

export default function AuthForm({
  mode,
  title,
  subtitle,
  redirectUrl,
  alternateUrl,
}: AuthFormProps) {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [name, setName] = useState("Demo User");
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo1234");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "sign-in") {
      signIn(email, name);
    } else {
      signUp(email, name);
    }
    router.push(redirectUrl);
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-1">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Card className="border border-border bg-card shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "sign-up" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Demo User"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" className="w-full cursor-pointer">
                {mode === "sign-in" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "sign-in" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href={alternateUrl}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    href={alternateUrl}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
