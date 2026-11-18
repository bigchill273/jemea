"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, LogOut, User as UserIcon } from "lucide-react";

export type PlanTier = "free" | "pro_user" | "enterprise_user";

export interface LocalUser {
  id: string;
  firstName: string | null;
  fullName: string | null;
  emailAddresses: Array<{ emailAddress: string }>;
}

const DEFAULT_USER: LocalUser = {
  id: "user_demo_1",
  firstName: "Demo",
  fullName: "Demo User",
  emailAddresses: [{ emailAddress: "demo@example.com" }],
};

interface AuthContextValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: LocalUser | null;
  plan: PlanTier;
  signIn: (email?: string, name?: string) => void;
  signUp: (email?: string, name?: string) => void;
  signOut: () => void;
  setPlan: (plan: PlanTier) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "trello_demo_auth";
const USER_STORAGE_KEY = "trello_demo_user";
const PLAN_STORAGE_KEY = "trello_demo_plan";
const AUTH_EVENT = "trello-local-auth-change";

interface StoredSnapshot {
  authState: string | null;
  user: LocalUser;
  plan: PlanTier;
}

const SERVER_SNAPSHOT = JSON.stringify({
  authState: null,
  user: DEFAULT_USER,
  plan: "free",
} satisfies StoredSnapshot);

function getClientSnapshotString(): string {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  try {
    const authState = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const savedUserRaw = window.localStorage.getItem(USER_STORAGE_KEY);
    const user: LocalUser = savedUserRaw
      ? (JSON.parse(savedUserRaw) as LocalUser)
      : DEFAULT_USER;
    const savedPlan = window.localStorage.getItem(PLAN_STORAGE_KEY);
    const plan: PlanTier =
      savedPlan === "pro_user" || savedPlan === "enterprise_user"
        ? savedPlan
        : "free";
    return JSON.stringify({ authState, user, plan } satisfies StoredSnapshot);
  } catch {
    return SERVER_SNAPSHOT;
  }
}

function subscribeAuthStore(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(AUTH_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(AUTH_EVENT, handler);
  };
}

function notifyAuthStore(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const snapshotRaw = useSyncExternalStore(
    subscribeAuthStore,
    getClientSnapshotString,
    () => SERVER_SNAPSHOT
  );

  const snapshot = JSON.parse(snapshotRaw) as StoredSnapshot;
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/boards");

  const isSignedIn =
    isHydrated &&
    (snapshot.authState === "signed_in" ||
      (snapshot.authState !== "signed_out" && isProtectedRoute));

  const user = isSignedIn ? snapshot.user : null;

  const authenticate = useCallback((email?: string, name?: string) => {
    const cleanEmail = email?.trim() || "demo@example.com";
    const cleanName = name?.trim() || cleanEmail.split("@")[0] || "Demo";
    const firstName = cleanName.split(" ")[0];
    const nextUser: LocalUser = {
      id: "user_demo_1",
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      fullName: cleanName,
      emailAddresses: [{ emailAddress: cleanEmail }],
    };

    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, "signed_in");
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } catch {}

    notifyAuthStore();
  }, []);

  const signOut = useCallback(() => {
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, "signed_out");
    } catch {}
    notifyAuthStore();
  }, []);

  const setPlan = useCallback((nextPlan: PlanTier) => {
    try {
      window.localStorage.setItem(PLAN_STORAGE_KEY, nextPlan);
    } catch {}
    notifyAuthStore();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoaded: isHydrated,
        isSignedIn,
        user,
        plan: snapshot.plan,
        signIn: authenticate,
        signUp: authenticate,
        signOut,
        setPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}

export function useUser() {
  const { isLoaded, isSignedIn, user } = useAuth();
  return { isLoaded, isSignedIn, user };
}

export function UserButton() {
  const { user, plan, signOut, isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isSignedIn || !user) {
    return (
      <Link
        href="/sign-in"
        className="inline-flex items-center justify-center rounded-full w-8 h-8 bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
      >
        <UserIcon className="w-4 h-4" />
      </Link>
    );
  }

  const initials = (
    user.firstName?.[0] ||
    user.emailAddresses[0]?.emailAddress[0] ||
    "D"
  ).toUpperCase();
  const planLabel =
    plan === "enterprise_user"
      ? "Enterprise"
      : plan === "pro_user"
      ? "Pro"
      : "Free";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Account menu"
        className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.fullName || user.firstName || "Demo User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.emailAddresses[0]?.emailAddress}
            </p>
            <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              {planLabel} Plan
            </span>
          </div>

          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <CreditCard className="w-4 h-4 text-gray-500" />
            Manage Plan
          </Link>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
              router.push("/");
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
