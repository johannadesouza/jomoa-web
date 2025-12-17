"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { toast } from "@/lib/utils/toast";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ClientSettings() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !profile) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profil uppdaterad!");
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
      <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
        <div className="max-w-[480px] mx-auto px-5 py-8">
          <SectionHeader title="Inställningar" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
      <div className="max-w-[480px] mx-auto px-5 py-8 space-y-6">
        <SectionHeader 
          title="Inställningar" 
          subtitle="Hantera din profil och inställningar"
        />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
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
                  <label className="block text-sm font-medium text-[#5A6B5D] mb-1">
                    Email
                  </label>
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="bg-[#FEFCF8]/50"
                  />
                  <p className="text-xs text-[#5A6B5D]/70 mt-1">Email kan inte ändras här</p>
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? "Sparar..." : "Spara ändringar"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Konto</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleSignOut}>
                Logga ut
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


