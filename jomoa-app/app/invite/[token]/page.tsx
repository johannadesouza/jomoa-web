"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

interface Invite {
  id: string;
  email: string;
  invited_by_profile_id: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  invited_by: {
    full_name: string | null;
  } | null;
}

export default function InviteAcceptancePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingUp, setSigningUp] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (token) {
      fetchInvite();
    }
  }, [token]);

  const fetchInvite = async () => {
    if (!token) {
      setError("Ogiltig inbjudningslänk.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("invites")
        .select(`
          id,
          email,
          invited_by_profile_id,
          role,
          token,
          expires_at,
          accepted_at,
          invited_by:profiles!invites_invited_by_profile_id_fkey (
            full_name
          )
        `)
        .eq("token", token)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          setError("Inbjudningslänken hittades inte.");
        } else {
          throw fetchError;
        }
        setLoading(false);
        return;
      }

      // Kontrollera om invite är expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError("Inbjudningslänken har gått ut.");
        setLoading(false);
        return;
      }

      // Kontrollera om invite redan är accepterad
      if (data.accepted_at) {
        setError("Denna inbjudan har redan använts.");
        setLoading(false);
        return;
      }

      // Normalize nested relations (Supabase returns arrays)
      const normalizedInvite = {
        ...data,
        invited_by: Array.isArray(data.invited_by) ? data.invited_by[0] : data.invited_by,
      };
      setInvite(normalizedInvite as unknown as Invite);
      setName(""); // Pre-fyll inte namn, låt användaren ange det
    } catch (err) {
      console.error("Error fetching invite:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta inbjudningsinformation.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Namn är obligatoriskt.");
      return;
    }

    if (!password) {
      setError("Lösenord är obligatoriskt.");
      return;
    }

    if (password.length < 6) {
      setError("Lösenordet måste vara minst 6 tecken.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      return;
    }

    if (!invite || !token) {
      setError("Inbjudningsinformation saknas.");
      return;
    }

    setSigningUp(true);
    setError(null);

    try {
      // 1. Skapa auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invite.email,
        password: password,
      });

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          setError("Det finns redan ett konto med denna email. Logga in istället.");
        } else {
          throw signUpError;
        }
        setSigningUp(false);
        return;
      }

      if (!authData.user) {
        throw new Error("Kunde inte skapa användare.");
      }

      // 2. Uppdatera profile med namn
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: name.trim(),
        })
        .eq("id", authData.user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        // Fortsätt ändå, namn kan uppdateras senare
      }

      // 3. Använd API route för att acceptera invite och skapa client (använder service role för att bypassa RLS)
      const response = await fetch("/api/invite/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          user_id: authData.user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte acceptera inbjudan");
      }

      // 4. Lyckades! Redirect till client dashboard
      setSuccessMessage("Konto skapat! Du loggas in nu...");
      setTimeout(() => {
        router.push("/client/dashboard");
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error("Error signing up:", err);
      setError(getErrorMessage(err) || "Kunde inte skapa konto. Försök igen senare.");
      setSigningUp(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!invite || !token || !user) {
      setError("Inbjudningsinformation saknas.");
      return;
    }

    setSigningUp(true);
    setError(null);

    try {
      // Använd API route för att acceptera invite (använder service role för att bypassa RLS)
      const response = await fetch("/api/invite/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte acceptera inbjudan");
      }

      // Lyckades! Redirect till client dashboard
      router.push("/client/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Error accepting invite:", err);
      setError(getErrorMessage(err) || "Kunde inte acceptera inbjudan. Försök igen senare.");
      setSigningUp(false);
    }
  };

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#5A6B5D]">
        <div className="max-w-md w-full px-5">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-4 w-full mb-6" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#5A6B5D]">
        <div className="max-w-md w-full px-5">
          <Card className="bg-red-50/50 border-red-200">
            <CardHeader>
              <CardTitle className="text-[#5A6B5D]">Inbjudan ogiltig</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#5A6B5D]/70 mb-6">{error}</p>
              <Button
                onClick={() => router.push("/login")}
                variant="outline"
                className="w-full"
              >
                Gå till inloggning
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!invite) {
    return null;
  }

  // Om användaren redan är inloggad, visa "Acceptera inbjudan"-knapp
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#5A6B5D]">
        <div className="max-w-md w-full px-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#5A6B5D]">Acceptera inbjudan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-[#5A6B5D]/70">
                Du har blivit inbjuden av{" "}
                <span className="font-medium text-[#5A6B5D]">
                  {invite.invited_by?.full_name || "en coach"}
                </span>{" "}
                att bli klient.
              </p>

              {error && (
                <Card className="bg-red-50/50 border-red-200">
                  <CardContent className="pt-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={handleAcceptInvite}
                disabled={signingUp}
                className="w-full"
              >
                {signingUp ? "Accepterar..." : "Acceptera inbjudan"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Om användaren inte är inloggad, visa signup-formulär
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#5A6B5D] py-12">
      <div className="max-w-md w-full px-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#5A6B5D]">Skapa ditt konto</CardTitle>
            <p className="text-sm text-[#5A6B5D]/70 mt-2">
              Du har blivit inbjuden av{" "}
              <span className="font-medium text-[#5A6B5D]">
                {invite.invited_by?.full_name || "en coach"}
              </span>
              . Skapa ditt konto för att komma igång.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Card className="bg-red-50/50 border-red-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-red-600">{error}</p>
                </CardContent>
              </Card>
            )}

            {successMessage && (
              <Card className="bg-green-50/50 border-green-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-green-600">{successMessage}</p>
                </CardContent>
              </Card>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                  E-post
                </label>
                <Input
                  id="email"
                  type="email"
                  value={invite.email}
                  disabled
                  className="bg-[#FEFCF8]/50 text-[#5A6B5D]/70 cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                  Namn <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={signingUp}
                  placeholder="Ditt namn"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                  Lösenord <span className="text-red-500">*</span>
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={signingUp}
                  placeholder="Minst 6 tecken"
                  minLength={6}
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-[#5A6B5D] mb-1"
                >
                  Bekräfta lösenord <span className="text-red-500">*</span>
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={signingUp}
                  placeholder="Bekräfta lösenord"
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                disabled={signingUp}
                className="w-full"
              >
                {signingUp ? "Skapar konto..." : "Skapa konto"}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-[rgba(232,229,224,0.4)]">
              <p className="text-sm text-[#5A6B5D]/70">
                Redan ett konto?{" "}
                <Button
                  onClick={() => router.push("/login")}
                  variant="link"
                  className="text-[#8B6F47] hover:text-[#7A5F3D] p-0 h-auto"
                >
                  Logga in
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

