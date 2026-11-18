"use client";

import { createContext, useContext, useMemo } from "react";

export type MockSupabaseClient = Record<string, never>;

type SupabaseContext = {
  supabase: MockSupabaseClient | null;
  isLoaded: boolean;
};

const Context = createContext<SupabaseContext>({
  supabase: null,
  isLoaded: false,
});

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = useMemo<MockSupabaseClient>(() => ({}), []);

  return (
    <Context.Provider value={{ supabase, isLoaded: true }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase needs to be inside the provider");
  }

  return context;
};
