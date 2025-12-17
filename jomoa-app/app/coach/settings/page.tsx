"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Settings, User, Bell, CreditCard } from "lucide-react";

export default function CoachSettings() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !profile) return;

    try {
      setSaving(true);
      setSuccessMessage(null);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          language: profile.language || "sv",
        })
        .eq("id", user.id);

      if (error) throw error;

      setSuccessMessage("Profil uppdaterad!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Inställningar" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Inställningar"
        subtitle="Hantera din profil, inställningar och konto"
      />

      {/* Profil */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#5A6B5D]" />
            <CardTitle>Profil</CardTitle>
          </div>
          <CardDescription>Uppdatera din profilinformation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                Namn
              </label>
              <Input
                id="full_name"
                value={profile?.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Ditt namn"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                Email
              </label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-[#FEFCF8]/50"
              />
              <p className="text-xs text-[#5A6B5D]/70 mt-1">Email kan inte ändras här</p>
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                Språk
              </label>
              <Select
                id="language"
                value={profile?.language || "sv"}
                onChange={(e) => setProfile({ ...profile, language: e.target.value })}
              >
                <option value="sv">Svenska</option>
                <option value="en">English</option>
              </Select>
            </div>
            {successMessage && (
              <div className="p-3 bg-green-50/50 border border-green-200 rounded-card">
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? "Sparar..." : "Spara ändringar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notisinställningar */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#5A6B5D]" />
            <CardTitle>Notisinställningar</CardTitle>
          </div>
          <CardDescription>Hantera dina notiser och påminnelser</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-card">
              <p className="text-sm text-[#5A6B5D]">
                Notisinställningar kommer att vara tillgängliga i en kommande uppdatering.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan/Abonnemang */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#5A6B5D]" />
            <CardTitle>Plan & Abonnemang</CardTitle>
          </div>
          <CardDescription>Hantera din plan och abonnemang</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-card">
              <p className="text-sm text-[#5A6B5D]">
                Planhantering kommer att vara tillgänglig i en kommande uppdatering.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Konto */}
      <Card>
        <CardHeader>
          <CardTitle>Konto</CardTitle>
          <CardDescription>Hantera ditt konto och säkerhet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-card">
              <p className="text-sm text-[#5A6B5D] mb-3">
                Lösenordsändring kommer att vara tillgänglig i en kommande uppdatering.
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Logga ut
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

