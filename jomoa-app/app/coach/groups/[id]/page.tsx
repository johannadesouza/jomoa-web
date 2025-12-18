"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { normalizeRelation } from "@/lib/types/supabase";

interface ClientGroup {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface GroupMember {
  id: string;
  client_id: string;
  joined_at: string;
  client: {
    id: string;
    profile: {
      full_name: string | null;
    } | null;
  } | null;
}

interface AvailableClient {
  id: string;
  profile_id: string;
  profile: {
    id: string;
    full_name: string | null;
  } | null;
}

export default function GroupDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const groupId = params?.id as string;

  const [group, setGroup] = useState<ClientGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [availableClients, setAvailableClients] = useState<AvailableClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [addingMember, setAddingMember] = useState(false);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && groupId) {
      fetchGroup();
      fetchMembers();
      fetchAvailableClients();
    }
  }, [user, authLoading, groupId]);

  const fetchGroup = async () => {
    if (!groupId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("client_groups")
        .select("*")
        .eq("id", groupId)
        .single();

      if (fetchError) throw fetchError;
      setGroup(data as ClientGroup);
    } catch (err) {
      console.error("Error fetching group:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta gruppinformation.");
    }
  };

  const fetchMembers = async () => {
    if (!groupId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("client_group_members")
        .select(`
          id,
          client_id,
          joined_at,
          client:clients!client_group_members_client_id_fkey (
            id,
            profile:profiles!clients_profile_id_fkey (
              full_name
            )
          )
        `)
        .eq("group_id", groupId)
        .is("left_at", null)
        .order("joined_at", { ascending: false });

      if (fetchError) throw fetchError;
      
      // Normalize nested relations (Supabase returns arrays)
      interface RawMember {
        id: string;
        client_id: string;
        group_id?: string;
        joined_at: string;
        client?: {
          id: string;
          profile_id: string;
          profile?: {
            id: string;
            full_name: string | null;
            email: string | null;
          } | {
            id: string;
            full_name: string | null;
            email: string | null;
          }[] | null;
        } | {
          id: string;
          profile_id: string;
          profile?: {
            id: string;
            full_name: string | null;
            email: string | null;
          } | {
            id: string;
            full_name: string | null;
            email: string | null;
          }[] | null;
        }[] | null;
      }

      const normalizedMembers: GroupMember[] = (data || []).map((member: unknown) => {
        const m = member as RawMember;
        const client = normalizeRelation(m.client);
        const profile = client ? normalizeRelation(client.profile) : null;
        return {
          id: m.id,
          client_id: m.client_id,
          joined_at: m.joined_at,
          client: client ? {
            id: client.id,
            profile_id: (client as { profile_id?: string }).profile_id || "",
            profile: profile ? {
              id: profile.id,
              full_name: profile.full_name,
            } : null,
          } : null,
        };
      });
      setMembers(normalizedMembers);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta gruppmedlemmar.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableClients = async () => {
    if (!user?.id || !groupId) return;

    try {
      // Hämta alla klienter som coachen har
      const { data: allClients, error: clientsError } = await supabase
        .from("clients")
        .select(`
          id,
          profile:profiles!clients_profile_id_fkey (
            full_name
          )
        `)
        .eq("primary_coach_id", user.id)
        .eq("status", "active");

      if (clientsError) throw clientsError;

      // Hämta klienter som redan är medlemmar
      const { data: existingMembers } = await supabase
        .from("client_group_members")
        .select("client_id")
        .eq("group_id", groupId)
        .is("left_at", null);

      const memberIds = new Set(existingMembers?.map((m) => m.client_id) || []);

      // Filtrera bort klienter som redan är medlemmar
      const available = (allClients || []).filter(
        (client) => !memberIds.has(client.id)
      );

      // Normalize nested relations (Supabase returns arrays)
      const normalizedAvailable: AvailableClient[] = available.map((client: unknown) => {
        const c = client as { id: string; profile_id: string; profile?: unknown };
        const profile = normalizeRelation(c.profile);
        return {
          id: c.id,
          profile_id: c.profile_id,
          profile: profile ? {
            id: (profile as { id: string; full_name: string | null }).id,
            full_name: (profile as { id: string; full_name: string | null }).full_name || null,
          } : null,
        };
      });
      setAvailableClients(normalizedAvailable);
    } catch (err) {
      console.error("Error fetching available clients:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId || !groupId) {
      setError("Välj en klient att lägga till.");
      return;
    }

    setAddingMember(true);
    setError(null);

    try {
      const { error: addError } = await supabase
        .from("client_group_members")
        .insert({
          group_id: groupId,
          client_id: selectedClientId,
        });

      if (addError) throw addError;

      setSelectedClientId("");
      setShowAddMemberForm(false);
      await fetchMembers();
      await fetchAvailableClients();
    } catch (err) {
      console.error("Error adding member:", err);
      setError(getErrorMessage(err) || "Kunde inte lägga till medlem. Försök igen senare.");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string, clientId: string) => {
    if (!confirm("Är du säker på att du vill ta bort denna klient från gruppen?")) {
      return;
    }

    setRemovingMember(memberId);
    setError(null);

    try {
      const { error: removeError } = await supabase
        .from("client_group_members")
        .update({ left_at: new Date().toISOString() })
        .eq("id", memberId);

      if (removeError) throw removeError;

      await fetchMembers();
      await fetchAvailableClients();
    } catch (err) {
      console.error("Error removing member:", err);
      setError(getErrorMessage(err) || "Kunde inte ta bort medlem. Försök igen senare.");
    } finally {
      setRemovingMember(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Gruppdetaljer</h1>
        <p className="text-gray-600">Laddar...</p>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Gruppdetaljer</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
        <button
          onClick={() => router.push("/coach/groups")}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Tillbaka till grupper
        </button>
      </div>
    );
  }

  if (!group) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Grupp hittades inte</h1>
        <button
          onClick={() => router.push("/coach/groups")}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Tillbaka till grupper
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => router.push("/coach/groups")}
          className="text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          ← Tillbaka till grupper
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{group.name}</h1>
        {group.description && (
          <p className="text-sm text-gray-600">{group.description}</p>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Add Member Section */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Medlemmar</h2>
          {!showAddMemberForm && availableClients.length > 0 && (
            <button
              onClick={() => setShowAddMemberForm(true)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Lägg till klient
            </button>
          )}
        </div>

        {showAddMemberForm && (
          <form onSubmit={handleAddMember} className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-md space-y-3">
            <div>
              <label
                htmlFor="client-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Välj klient
              </label>
              <select
                id="client-select"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                required
                disabled={addingMember}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Välj klient...</option>
                {availableClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.profile?.full_name || "Namnlös klient"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={addingMember}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {addingMember ? "Lägger till..." : "Lägg till"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddMemberForm(false);
                  setSelectedClientId("");
                }}
                disabled={addingMember}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Avbryt
              </button>
            </div>
          </form>
        )}

        {/* Members List */}
        {members.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Inga medlemmar i gruppen ännu</p>
            {availableClients.length === 0 && (
              <p className="text-xs text-gray-500">
                Alla dina klienter är redan medlemmar i denna grupp, eller så har du inga klienter ännu.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {member.client?.profile?.full_name || "Namnlös klient"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Medlem sedan {new Date(member.joined_at).toLocaleDateString("sv-SE")}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveMember(member.id, member.client_id)}
                  disabled={removingMember === member.id}
                  className="text-xs text-red-600 hover:text-red-800 underline disabled:text-gray-400"
                >
                  {removingMember === member.id ? "Tar bort..." : "Ta bort"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

