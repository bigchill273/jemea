import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import SupabaseProvider from "@/providers/SupabaseProvider";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Jeme'a — Team Kanban & Sprint Workspace",
  description:
    "Coordinate your crew with Jeme'a: boards, checklists, custom labels, templates, comments, and keyboard-first workflows in light and dark mode.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider>
          <AuthProvider>
            <SupabaseProvider>{children}</SupabaseProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
