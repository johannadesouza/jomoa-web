import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../config/supabase";

export interface Client {
  id: string;
  profile_id: string;
  status: string;
  onboarding_stage: string | null;
  created_at: string;
  cycle_length?: number | null;
  irregular_cycle?: boolean | null;
  no_period?: boolean | null;
  peri_menopause?: boolean | null;
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
      .single();

    if (error) {
      console.warn("No client found for user:", userId);
      return null;
    }
    return data as Client;
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
          const clientData = await fetchClient(session.user.id).catch(() => null);
          setClient(clientData ?? null);
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
          const clientData = await fetchClient(session.user.id).catch(() => null);
          setClient(clientData ?? null);
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
