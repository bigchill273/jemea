"use client";

import { createContext } from "react";
import { useAuth } from "@/providers/AuthProvider";

interface PlanContextType {
  isFreeUser: boolean;
  hasProPlan: boolean;
  hasEnterprisePlan: boolean;
}

export const PlanContext = createContext<PlanContextType | undefined>(undefined);

interface PlanProviderProps {
  children: React.ReactNode;
  hasProPlan?: boolean;
  hasEnterprisePlan?: boolean;
}

export function PlanProvider({
  children,
  hasProPlan: initialProPlan = false,
  hasEnterprisePlan: initialEnterprisePlan = false,
}: PlanProviderProps) {
  const { plan } = useAuth();
  const hasProPlan = plan === "pro_user" || initialProPlan;
  const hasEnterprisePlan = plan === "enterprise_user" || initialEnterprisePlan;

  return (
    <PlanContext.Provider
      value={{
        hasProPlan,
        hasEnterprisePlan,
        isFreeUser: !hasProPlan && !hasEnterprisePlan,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}
