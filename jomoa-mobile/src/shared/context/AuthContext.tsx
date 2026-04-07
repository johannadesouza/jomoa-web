import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../config/supabase";

import type { TrainingGoal, DayOfWeek, PresentationProfile, PresentationTheme, OnboardingPath } from "../types/onboarding";
import { isDemoMode } from "../../lib/demo/demoMode";
import { useDemoPersona } from "./DemoPersonaContext";

export interface Client {
  id: string;
  profile_id: string;
  status: string;
  onboarding_stage: string | null;
  created_at: string;
  primary_goal?: TrainingGoal | null;
  training_frequency?: number | null;
  training_days?: DayOfWeek[] | null;
  cycle_length?: number | null;
  irregular_cycle?: boolean | null;
  no_period?: boolean | null;
  peri_menopause?: boolean | null;
  presentation_profile?: PresentationProfile | null;
  presentation_theme?: PresentationTheme | null;
  onboarding_path?: OnboardingPath | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  client: Client | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshClient: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const demo = useDemoPersona();

  // Portfolio/web demo: bypass Supabase auth + seed a stable client persona.
  // This makes it possible to deploy a public demo without requiring visitors
  // to create accounts or touch production data.
  useEffect(() => {
    if (!isDemoMode()) return;
    if (!demo.isReady) return;
    const persona = demo.persona;
    const demoUserId = `demo_${persona}`;
    const now = new Date().toISOString();

    setSession({} as Session);
    setUser({ id: demoUserId } as User);

    const base: Client = {
      id: `client_${demoUserId}`,
      profile_id: demoUserId,
      status: "active",
      onboarding_stage: "completed",
      created_at: now,
      primary_goal: "strength" as TrainingGoal,
      training_frequency: 3,
      training_days: ["mon", "wed", "fri"] as DayOfWeek[],
      cycle_length: 28,
      irregular_cycle: false,
      no_period: false,
      peri_menopause: false,
      presentation_profile: "default" as PresentationProfile,
      presentation_theme: "dark" as PresentationTheme,
      onboarding_path: "full" as OnboardingPath,
    };

    if (persona === "cycle_only") {
      setClient({
        ...base,
        onboarding_path: "cycle_only" as OnboardingPath,
      });
    } else if (persona === "perimenopause") {
      setClient({
        ...base,
        peri_menopause: true,
        irregular_cycle: true,
        onboarding_path: "full" as OnboardingPath,
      });
    } else {
      setClient(base);
    }

    setIsLoading(false);
  }, [demo.persona, demo.isReady]);

  const fetchClient = async (userId: string) => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("profile_id", userId)
      .maybeSingle();

    if (error) {
      // Re-throw so callers can distinguish a DB failure from "no client row yet"
      throw error;
    }
    return (data as Client) ?? null;
  };

  const refreshClient = async () => {
    if (user) {
      const clientData = await fetchClient(user.id);
      setClient(clientData);
    }
  };

  useEffect(() => {
    if (isDemoMode()) return;
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          try {
            const clientData = await fetchClient(session.user.id);
            setClient(clientData ?? null);
          } catch {
            // DB error: keep client null but do NOT redirect to onboarding —
            // RootNavigator handles session+null client as a loading/error state.
            setClient(null);
            if (__DEV__) console.error("[AuthContext] fetchClient failed during getSession");
          }
        } else {
          setClient(null);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      try {
        if (session?.user) {
          try {
            const clientData = await fetchClient(session.user.id);
            setClient(clientData ?? null);
          } catch {
            // DB error on token refresh: keep existing client to avoid navigation flash
            if (__DEV__) console.error("[AuthContext] fetchClient failed on auth state change");
          }
        } else {
          setClient(null);
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isDemoMode()) return { error: null };
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (isDemoMode()) return { error: null };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "client",
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (!isDemoMode()) {
    await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setClient(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        client,
        isLoading,
        isAuthenticated: !!session,
        signIn,
        signUp,
        signOut,
        refreshClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
