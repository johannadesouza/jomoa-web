"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ERROR_MESSAGES, getUserFriendlyErrorMessage } from "@/lib/utils/errorMessages";

interface ClientGroup {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count?: number;
}

interface GroupWithCount {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count: number;
}

export default function CoachGroups() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<ClientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      fetchGroups();
    }
  }, [user, authLoading]);

  const getOrCreateDefaultOrganization = async (): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      // Försök hitta befintlig organisation för coachen
      const { data: existingOrg, error: fetchError } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_profile_id", user.id)
        .limit(1)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 = no rows returned, vilket är okej
        throw fetchError;
      }

      if (existingOrg) {
        return existingOrg.id;
      }

      // Skapa default organisation om ingen finns
      const { data: newOrg, error: createError } = await supabase
        .from("organizations")
        .insert({
          name: "Min organisation",
          owner_profile_id: user.id,
        })
        .select()
        .single();

      if (createError) throw createError;
      return newOrg.id;
    } catch (err) {
      console.error("Error getting/creating organization:", err);
      return null;
    }
  };

  const fetchGroups = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const organizationId = await getOrCreateDefaultOrganization();
      if (!organizationId) {
        throw new Error("Kunde inte hämta eller skapa organisation.");
      }

      const { data, error: fetchError } = await supabase
        .from("client_groups")
        .select(`
          id,
          name,
          description,
          created_at,
          members:client_group_members(count)
        `)
        .eq("organization_id", organizationId)
        .eq("created_by_coach_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      interface RawGroup {
        id: string;
        name: string;
        description: string | null;
        created_at: string;
        members?: Array<{ count: number }> | null;
      }

      const groupsWithCount: GroupWithCount[] = (data || []).map((group: RawGroup) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        created_at: group.created_at,
        member_count: Array.isArray(group.members) && group.members.length > 0 ? group.members[0].count : 0,
      }));

      setGroups(groupsWithCount);
      } catch (err) {
      console.error("Error fetching groups:", err);
      setError(getUserFriendlyErrorMessage(err, ERROR_MESSAGES.FETCH_FAILED));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      setError(ERROR_MESSAGES.REQUIRED_FIELD);
      return;
    }

    if (!user?.id) {
      setError("Du måste vara inloggad för att skapa grupper.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const organizationId = await getOrCreateDefaultOrganization();
      if (!organizationId) {
        throw new Error("Kunde inte hämta eller skapa organisation.");
      }

      const { error: createError } = await supabase
        .from("client_groups")
        .insert({
          name: groupName.trim(),
          description: groupDescription.trim() || null,
          organization_id: organizationId,
          created_by_coach_id: user.id,
        });

      if (createError) throw createError;

      setGroupName("");
      setGroupDescription("");
      setShowForm(false);
      await fetchGroups();
      } catch (err) {
        console.error("Error creating group:", err);
        setError(getUserFriendlyErrorMessage(err, ERROR_MESSAGES.CREATE_FAILED));
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <LoadingState 
        title="Grupper" 
        subtitle="Organisera klienter i grupper och tilldela program"
        showHeader={true}
        height="h-64"
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Grupper"
        subtitle="Organisera klienter i grupper och tilldela program"
        actions={
          !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-[#8B6F47] hover:text-[#7A5F3D] underline"
            >
              Skapa grupp
            </button>
          )
        }
      />

      {error && (
        <ErrorState 
          title="Ett fel uppstod" 
          message={error}
          onRetry={() => {
            setError(null);
            if (!showForm) {
              fetchGroups();
            }
          }}
        />
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Skapa ny grupp</CardTitle>
            <CardDescription>Organisera klienter i grupper</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label
                  htmlFor="group-name"
                  className="block text-sm font-medium text-[#5A6B5D] mb-1"
                >
                  Gruppnamn <span className="text-red-500">*</span>
                </label>
                <Input
                  id="group-name"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                  disabled={creating}
                  placeholder="t.ex. Hyrox-gruppen"
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor="group-description"
                  className="block text-sm font-medium text-[#5A6B5D] mb-1"
                >
                  Beskrivning (valfritt)
                </label>
                <textarea
                  id="group-description"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  disabled={creating}
                  rows={3}
                  className="w-full rounded-[20px] border border-[rgba(232,229,224,0.4)] bg-[#FEFCF8] px-3 py-2 text-sm text-[#5A6B5D] placeholder:text-[#5A6B5D]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6F47]/50 focus-visible:border-[#8B6F47] disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Beskriv gruppens syfte..."
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={creating}>
                  {creating ? "Skapar..." : "Skapa grupp"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setGroupName("");
                    setGroupDescription("");
                    setError(null);
                  }}
                  disabled={creating}
                >
                  Avbryt
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {groups.length === 0 ? (
        <EmptyState
          title="Inga grupper ännu"
          description="Skapa grupper för att organisera dina klienter och tilldela program till flera klienter samtidigt."
          action={
            !showForm
              ? {
                  label: "Skapa din första grupp",
                  onClick: () => setShowForm(true),
                }
              : undefined
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Beskrivning</TableHead>
                  <TableHead>Medlemmar</TableHead>
                  <TableHead>Skapad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow
                    key={group.id}
                    onClick={() => router.push(`/coach/groups/${group.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="text-[#5A6B5D] font-medium">
                      {group.name}
                    </TableCell>
                    <TableCell className="text-[#5A6B5D]/70">
                      {group.description || "-"}
                    </TableCell>
                    <TableCell className="text-[#5A6B5D]">
                      {group.member_count || 0} medlemmar
                    </TableCell>
                    <TableCell className="text-[#5A6B5D]/70">
                      {new Date(group.created_at).toLocaleDateString("sv-SE")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

