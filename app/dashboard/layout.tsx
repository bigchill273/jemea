import { PlanProvider } from "@/features/dashboard/contexts/PlanContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlanProvider>{children}</PlanProvider>;
}
