"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/Card";
import { toast } from "@/lib/utils/toast";
import { LogIn, UserPlus, Mail, Lock } from "lucide-react";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
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
        toast.error("Inloggning misslyckades", errorMessage);
        setLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          router.push("/coach/dashboard");
        } else if (profile?.role === "coach") {
          toast.success("Välkommen tillbaka!");
          router.push("/coach/dashboard");
        } else if (profile?.role === "client") {
          router.push("/client/dashboard");
        } else {
          router.push("/coach/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err) || "Något gick fel vid inloggning";
      setError(errorMsg);
      toast.error("Inloggning misslyckades", errorMsg);
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validering
    if (!fullName.trim()) {
      setError("Namn är obligatoriskt");
      return;
    }

    if (password.length < 6) {
      setError("Lösenordet måste vara minst 6 tecken");
      return;
    }

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte");
      return;
    }

    setLoading(true);

    try {
      // 1. Skapa auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signUpError) {
        let errorMessage = signUpError.message;
        if (signUpError.message.includes("User already registered")) {
          errorMessage = "En användare med denna e-post finns redan. Logga in istället.";
        } else if (signUpError.message.includes("Password")) {
          errorMessage = "Lösenordet är för svagt. Använd minst 6 tecken.";
        } else if (signUpError.message.includes("Email")) {
          errorMessage = "Ogiltig e-postadress";
        }
        setError(errorMessage);
        toast.error("Registrering misslyckades", errorMessage);
        setLoading(false);
        return;
      }

      if (authData.user) {
        // 2. Skapa eller uppdatera profile med role="coach"
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: authData.user.id,
            full_name: fullName.trim(),
            role: "coach",
            onboarding_stage: "not_started",
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          setError("Kunde inte skapa profil. Kontakta support.");
          toast.error("Registrering misslyckades", "Kunde inte skapa profil");
          setLoading(false);
          return;
        }

        toast.success("Konto skapat!", "Kontrollera din e-post för att bekräfta ditt konto.");
        
        // Om email confirmation krävs, visa meddelande
        if (!authData.session) {
          setError("Kontrollera din e-post för att bekräfta ditt konto innan du loggar in.");
          setMode("login");
          setPassword("");
          setConfirmPassword("");
          setFullName("");
          setLoading(false);
          return;
        }

        // Om auto-confirm är aktiverat, redirecta direkt
        router.push("/coach/dashboard");
        router.refresh();
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err) || "Något gick fel vid registrering";
      setError(errorMsg);
      toast.error("Registrering misslyckades", errorMsg);
      setLoading(false);
    }
  };

  // Visa loading medan auth checkar
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#5A6B5D]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FEFCF8] mx-auto mb-4"></div>
          <p className="text-[#FEFCF8]/80">Laddar...</p>
        </div>
      </div>
    );
  }

  // Om användaren redan är inloggad, visa ingenting (redirect sker i useEffect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#5A6B5D] p-4">
      <div className="max-w-md w-full">
        <Card variant="hero" className="border-[rgba(232,229,224,0.4)]">
          <CardHeader className="text-center pb-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-[#5A6B5D] mb-2">
                {mode === "login" ? "Välkommen tillbaka" : "Skapa konto"}
              </h1>
              <CardDescription className="text-[#5A6B5D]/70">
                {mode === "login" 
                  ? "Logga in på ditt JOMOA-konto" 
                  : "Registrera dig som coach och börja träna klienter"}
              </CardDescription>
            </div>

            {/* Toggle mellan login och signup */}
            <div className="flex gap-2 bg-[rgba(232,229,224,0.2)] rounded-[20px] p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setPassword("");
                  setConfirmPassword("");
                  setFullName("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-[16px] font-medium transition-all ${
                  mode === "login"
                    ? "bg-[#8B6F47] text-[#FEFCF8] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                    : "text-[#5A6B5D]/70 hover:text-[#5A6B5D]"
                }`}
              >
                <LogIn className="w-4 h-4" />
                Logga in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setPassword("");
                  setConfirmPassword("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-[16px] font-medium transition-all ${
                  mode === "signup"
                    ? "bg-[#8B6F47] text-[#FEFCF8] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                    : "text-[#5A6B5D]/70 hover:text-[#5A6B5D]"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Registrera
              </button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={mode === "login" ? handleLogin : handleSignUp} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-[#5A6B5D] mb-2">
                    Fullständigt namn
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5A6B5D]/40" />
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Ditt namn"
                      autoComplete="name"
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#5A6B5D] mb-2">
                  E-post
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5A6B5D]/40" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="din@epost.se"
                    autoComplete="email"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#5A6B5D] mb-2">
                  Lösenord
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5A6B5D]/40" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="••••••••"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className="pl-10"
                    minLength={mode === "signup" ? 6 : undefined}
                  />
                </div>
                {mode === "signup" && (
                  <p className="text-xs text-[#5A6B5D]/60 mt-1">Minst 6 tecken</p>
                )}
              </div>

              {mode === "signup" && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#5A6B5D] mb-2">
                    Bekräfta lösenord
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#5A6B5D]/40" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50/80 border border-red-200/50 rounded-[20px] p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FEFCF8]"></div>
                    {mode === "login" ? "Loggar in..." : "Skapar konto..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {mode === "login" ? (
                      <>
                        <LogIn className="w-4 h-4" />
                        Logga in
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Skapa konto
                      </>
                    )}
                  </span>
                )}
              </Button>

              {mode === "signup" && (
                <p className="text-xs text-center text-[#5A6B5D]/60 mt-4">
                  Genom att registrera dig accepterar du våra användarvillkor och integritetspolicy.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
