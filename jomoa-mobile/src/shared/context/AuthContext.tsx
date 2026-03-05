import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../config/supabase";

import type { TrainingGoal, DayOfWeek, PresentationProfile, PresentationTheme } from "../types/onboarding";

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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
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
    await supabase.auth.signOut();
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
