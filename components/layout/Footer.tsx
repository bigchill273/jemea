import Link from "next/link";
import { JemeaLogo } from "../common/JemeaLogo";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-sidebar text-foreground py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <JemeaLogo size="sm" />
            <p className="text-sm text-muted-foreground">
              The collaborative Kanban workspace built for your crew.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-foreground">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-foreground">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/sign-in" className="hover:text-foreground">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-foreground">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Workspace</h3>
            <p className="text-sm text-muted-foreground">
              Press <kbd className="px-1.5 py-0.5 text-xs font-mono border border-border rounded bg-muted">?</kbd> anytime inside the workspace for keyboard shortcuts.
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Jeme&apos;a. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
