"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Redirect om användaren redan är inloggad (baserat på roll)
  useEffect(() => {
    if (!authLoading && user) {
      const redirectBasedOnRole = async () => {
        if (!user?.id) return;

        try {
          // Hämta användarens profile för att få rollen
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            // Fallback till coach om vi inte kan hämta rollen
            router.push("/coach/dashboard");
            return;
          }

          // Redirecta baserat på roll
          if (profile?.role === "coach") {
            router.push("/coach/dashboard");
          } else if (profile?.role === "client") {
            router.push("/client/dashboard");
          } else {
            // Fallback om rollen är okänd
            router.push("/coach/dashboard");
          }
        } catch (err) {
          console.error("Error redirecting:", err);
          router.push("/coach/dashboard");
        }
      };

      redirectBasedOnRole();
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        // Översätt felmeddelanden till svenska
        let errorMessage = signInError.message;
        if (signInError.message.includes("Invalid login credentials")) {
          errorMessage = "Fel e-post eller lösenord";
        } else if (signInError.message.includes("Email not confirmed")) {
          errorMessage = "E-postadressen är inte bekräftad. Kontrollera din inkorg.";
        } else if (signInError.message.includes("User not found")) {
          errorMessage = "Användaren finns inte";
        } else if (signInError.message.includes("Too many requests")) {
          errorMessage = "För många försök. Vänta en stund och försök igen.";
        }
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Hämta användarens roll och redirecta till rätt område
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // Fallback till coach om vi inte kan hämta rollen
          router.push("/coach/dashboard");
        } else if (profile?.role === "coach") {
          router.push("/coach/dashboard");
        } else if (profile?.role === "client") {
          router.push("/client/dashboard");
        } else {
          // Fallback om rollen är okänd
          router.push("/coach/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      setError(getErrorMessage(err) || "Något gick fel vid inloggning");
      setLoading(false);
    }
  };

  // Visa loading medan auth checkar
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    );
  }

  // Om användaren redan är inloggad, visa ingenting (redirect sker i useEffect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Logga in</h1>
          <p className="text-sm text-gray-600 mb-6">Välkommen till JOMOA</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-post
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="din@epost.se"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Lösenord
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Loggar in..." : "Logga in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
