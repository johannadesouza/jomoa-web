"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { normalizeRelation } from "@/lib/types/supabase";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Chip } from "@/components/ui/Card";
import { Search, Filter } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { ERROR_MESSAGES, getUserFriendlyErrorMessage } from "@/lib/utils/errorMessages";

interface Client {
  id: string;
  profile_id: string | null;
  primary_coach_id: string | null;
  date_of_birth: string | null;
  gender: string;
  status: string;
  notes: string | null;
  created_at: string;
  profile: {
    full_name: string | null;
    id: string;
  } | null;
  latestWorkoutLog?: {
    id: string;
    date: string;
    status: string;
    session: {
      name: string;
    } | null;
  } | null;
  latestReadiness?: {
    id: string;
    date: string;
    sleep_quality: number | null;
    energy_level: number | null;
    stress_level: number | null;
    soreness: number | null;
  } | null;
  latestPeriodStart?: string | null;
  activeProgram?: {
    id: string;
    name: string;
  } | null;
}

// Beräkna cykelstatus baserat på senaste mensstart
const calculateCycleStatus = (periodStartDate: string | null) => {
  if (!periodStartDate) {
    return null;
  }

  const startDate = new Date(periodStartDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const cycleDay = diffDays + 1; // Dag 1 är mensstart-dagen

  let phase = "";
  if (cycleDay >= 1 && cycleDay <= 5) {
    phase = "Mens";
  } else if (cycleDay >= 6 && cycleDay <= 13) {
    phase = "Follikulär";
  } else if (cycleDay >= 14 && cycleDay <= 16) {
    phase = "Ägglossning";
  } else if (cycleDay >= 17 && cycleDay <= 28) {
    phase = "Luteal";
  } else {
    phase = "Okänd / behöver ny mensstart";
  }

  return {
    cycleDay,
    phase,
  };
};

export default function CoachClients() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Direct client creation state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [newClient, setNewClient] = useState({
    email: "",
    name: "",
    date_of_birth: "",
    gender: "other",
  });
  const [createdClientPassword, setCreatedClientPassword] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchClients();
    }
  }, [user, authLoading]);

  const fetchClients = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Hämta klienter där primary_coach_id matchar den inloggade coachen
      // Joina med profiles för att få klienternas namn
      const { data, error: fetchError } = await supabase
        .from("clients")
        .select(`
          id,
          profile_id,
          primary_coach_id,
          date_of_birth,
          gender,
          status,
          notes,
          created_at,
          profile:profiles!clients_profile_id_fkey (
            full_name,
            id
          )
        `)
        .eq("primary_coach_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Normalize nested relations (Supabase returns arrays)
      const clientsData: Client[] = (data || []).map((client) => {
        const profile = normalizeRelation(client.profile);
        return {
          id: client.id,
          profile_id: client.profile_id,
          primary_coach_id: client.primary_coach_id,
          date_of_birth: client.date_of_birth || null,
          gender: client.gender || "",
          status: client.status,
          notes: client.notes || null,
          created_at: client.created_at,
          profile: profile ? {
            id: profile.id,
            full_name: profile.full_name,
          } : null,
          activeProgram: null, // Will be set later
        };
      });

      // Hämta senaste workout log per klient
      if (clientsData.length > 0) {
        const clientIds = clientsData.map((c) => c.id);

        // Hämta alla workout logs för dessa klienter, sorterade efter datum (nyast först)
        const { data: workoutLogsData } = await supabase
          .from("workout_sessions_log")
          .select(`
            id,
            client_id,
            date,
            status,
            session:program_sessions!workout_sessions_log_program_session_id_fkey (
              name
            )
          `)
          .in("client_id", clientIds)
          .order("date", { ascending: false })
          .order("created_at", { ascending: false });

        // Gruppera logs per klient och ta den senaste
        const logsByClient = new Map<string, any>();
        workoutLogsData?.forEach((log) => {
          if (!logsByClient.has(log.client_id)) {
            logsByClient.set(log.client_id, log);
          }
        });

        // Koppla senaste logg till varje klient
        clientsData.forEach((client) => {
          client.latestWorkoutLog = logsByClient.get(client.id) || null;
        });

        // Hämta senaste readiness per klient
        const { data: readinessData } = await supabase
          .from("daily_readiness")
          .select("*")
          .in("client_id", clientIds)
          .order("date", { ascending: false })
          .order("created_at", { ascending: false });

        // Gruppera readiness per klient och ta den senaste
        const readinessByClient = new Map<string, any>();
        readinessData?.forEach((readiness) => {
          if (!readinessByClient.has(readiness.client_id)) {
            readinessByClient.set(readiness.client_id, readiness);
          }
        });

        // Koppla senaste readiness till varje klient
        clientsData.forEach((client) => {
          client.latestReadiness = readinessByClient.get(client.id) || null;
        });

        // Hämta senaste mensstart per klient
        const { data: periodStartData } = await supabase
          .from("cycle_events")
          .select("client_id, date")
          .eq("event_type", "period_start")
          .in("client_id", clientIds)
          .order("date", { ascending: false })
          .order("created_at", { ascending: false });

        // Gruppera mensstart per klient och ta den senaste
        const periodStartByClient = new Map<string, string>();
        periodStartData?.forEach((event) => {
          if (!periodStartByClient.has(event.client_id)) {
            periodStartByClient.set(event.client_id, event.date);
          }
        });

        // Koppla senaste mensstart till varje klient
        clientsData.forEach((client) => {
          client.latestPeriodStart = periodStartByClient.get(client.id) || null;
        });

        // Hämta aktiva program per klient
        const { data: activeProgramsData } = await supabase
          .from("client_program_assignments")
          .select(`
            client_id,
            program:training_programs!client_program_assignments_program_id_fkey (
              id,
              name
            )
          `)
          .in("client_id", clientIds)
          .eq("is_active", true);

        const programsByClient = new Map<string, any>();
        activeProgramsData?.forEach((assignment) => {
          if (!programsByClient.has(assignment.client_id)) {
            programsByClient.set(assignment.client_id, assignment.program);
          }
        });

        // Koppla aktivt program till varje klient
        clientsData.forEach((client) => {
          client.activeProgram = programsByClient.get(client.id) || null;
        });
      }

      setClients(clientsData);
      setFilteredClients(clientsData);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError(getUserFriendlyErrorMessage(err, ERROR_MESSAGES.FETCH_CLIENT_FAILED));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <LoadingState 
        title="Klienter" 
        subtitle="Hantera dina klienter"
        showHeader={true}
        height="h-64"
      />
    );
  }

  if (error) {
    return (
      <div>
        <SectionHeader title="Klienter" subtitle="Hantera dina klienter" />
        <ErrorState 
          title="Kunde inte ladda klienter" 
          message={error}
          onRetry={fetchClients}
        />
      </div>
    );
  }

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

  const generateInviteToken = (): string => {
    // Generera en säker token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newClient.email.trim() || !newClient.name.trim()) {
      setError(ERROR_MESSAGES.REQUIRED_FIELD);
      return;
    }

    if (!user?.id) {
      setError("Du måste vara inloggad för att skapa klient.");
      return;
    }

    // Validera email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newClient.email.trim())) {
      setError(ERROR_MESSAGES.INVALID_EMAIL);
      return;
    }

    setCreatingClient(true);
    setError(null);
    setSuccessMessage(null);
    setCreatedClientPassword(null);

    try {
      const response = await fetch("/api/clients/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newClient.email.trim().toLowerCase(),
          name: newClient.name.trim(),
          date_of_birth: newClient.date_of_birth || null,
          gender: newClient.gender,
          coach_id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte skapa klient.");
      }

      setCreatedClientPassword(data.tempPassword);
      setSuccessMessage("Klient skapad! Glöm inte att skicka lösenordet till klienten.");
      
      // Uppdatera klientlistan
      await fetchClients();

      // Dölj meddelandet efter 10 sekunder
      setTimeout(() => {
        setSuccessMessage(null);
      }, 10000);
    } catch (err) {
      console.error("Error creating client:", err);
      setError(getUserFriendlyErrorMessage(err, ERROR_MESSAGES.CREATE_FAILED));
    } finally {
      setCreatingClient(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteEmail.trim()) {
      setError(ERROR_MESSAGES.REQUIRED_FIELD);
      return;
    }

    if (!user?.id) {
      setError("Du måste vara inloggad för att skicka inbjudan.");
      return;
    }

    // Validera email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      setError(ERROR_MESSAGES.INVALID_EMAIL);
      return;
    }

    setSendingInvite(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const organizationId = await getOrCreateDefaultOrganization();
      if (!organizationId) {
        throw new Error("Kunde inte hämta eller skapa organisation.");
      }

      const token = generateInviteToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 dagar

      const { error: inviteError } = await supabase
        .from("invites")
        .insert({
          email: inviteEmail.trim().toLowerCase(),
          invited_by_profile_id: user.id,
          role: "client",
          organization_id: organizationId,
          token: token,
          expires_at: expiresAt.toISOString(),
        });

      if (inviteError) throw inviteError;

      // Generera invite-länk
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const link = `${baseUrl}/invite/${token}`;
      setInviteLink(link);
      setSuccessMessage("Inbjudan skapad!");
      setInviteEmail("");

      // Dölj meddelandet efter 5 sekunder
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error("Error sending invite:", err);
      setError(getUserFriendlyErrorMessage(err, ERROR_MESSAGES.INVITE_FAILED));
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div>
      <SectionHeader 
        title="Klienter" 
        subtitle="Hantera dina klienter"
        actions={
          !showInviteForm ? (
            <button
              onClick={() => setShowInviteForm(true)}
              className="text-sm text-[#8B6F47] hover:text-[#7A5F3D] underline"
            >
              Skicka inbjudan
            </button>
          ) : undefined
        }
      />

      {successMessage && (
        <Card className="mb-4 bg-green-50/50 border-green-200">
          <CardContent>
            <p className="text-sm text-green-600">{successMessage}</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-4 bg-red-50/50 border-red-200">
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Sök och Filter */}
      {clients.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5A6B5D]/70" />
                <Input
                  type="text"
                  placeholder="Sök efter klient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#5A6B5D]/70" />
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="min-w-[150px]"
                >
                  <option value="all">Alla statusar</option>
                  <option value="active">Aktiva</option>
                  <option value="paused">Pausade</option>
                  <option value="archived">Arkiverade</option>
                </Select>
              </div>
            </div>
            {searchQuery || statusFilter !== "all" ? (
              <div className="mt-3 text-sm text-[#5A6B5D]/70">
                Visar {filteredClients.length} av {clients.length} klienter
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Skapa klient</CardTitle>
            <p className="text-sm text-[#5A6B5D]/70 mt-2">
              Skapa ett konto direkt för din klient. Klienten får ett temporärt lösenord som de kan ändra vid första inloggningen.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label
                  htmlFor="client-email"
                  className="block text-sm font-medium text-[#5A6B5D] mb-1"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  id="client-email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  required
                  disabled={creatingClient}
                  placeholder="klient@example.com"
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor="client-name"
                  className="block text-sm font-medium text-[#5A6B5D] mb-1"
                >
                  Namn <span className="text-red-500">*</span>
                </label>
                <Input
                  id="client-name"
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  required
                  disabled={creatingClient}
                  placeholder="Klientens fullständiga namn"
                />
              </div>

              <div>
                <label
                  htmlFor="client-date-of-birth"
                  className="block text-sm font-medium text-[#5A6B5D] mb-1"
                >
                  Födelsedatum
                </label>
                <Input
                  id="client-date-of-birth"
                  type="date"
                  value={newClient.date_of_birth}
                  onChange={(e) => setNewClient({ ...newClient, date_of_birth: e.target.value })}
                  disabled={creatingClient}
                />
              </div>

              <div>
                <label
                  htmlFor="client-gender"
                  className="block text-sm font-medium text-[#5A6B5D] mb-1"
                >
                  Kön
                </label>
                <select
                  id="client-gender"
                  value={newClient.gender}
                  onChange={(e) => setNewClient({ ...newClient, gender: e.target.value })}
                  disabled={creatingClient}
                  className="w-full px-3 py-2 rounded-card border border-[rgba(232,229,224,0.4)] bg-[#FEFCF8] text-sm text-[#5A6B5D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6F47]/50 focus-visible:border-[#8B6F47]"
                >
                  <option value="other">Annat/Ospecificerat</option>
                  <option value="female">Kvinna</option>
                  <option value="male">Man</option>
                </select>
              </div>

              {createdClientPassword && (
                <Card className="bg-green-50/50 border-green-200">
                  <CardContent className="pt-4">
                    <p className="text-sm font-medium text-[#5A6B5D] mb-2">
                      Klient skapad! Temporärt lösenord:
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={createdClientPassword}
                        readOnly
                        className="flex-1 font-mono"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(createdClientPassword);
                          setSuccessMessage("Lösenord kopierat!");
                          setTimeout(() => setSuccessMessage(null), 2000);
                        }}
                      >
                        Kopiera
                      </Button>
                    </div>
                    <p className="text-xs text-[#5A6B5D]/70 mt-2">
                      Skicka detta lösenord till klienten via säker kanal. De kan ändra det vid första inloggningen.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={creatingClient}
                >
                  {creatingClient ? "Skapar..." : "Skapa klient"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewClient({ email: "", name: "", date_of_birth: "", gender: "other" });
                    setCreatedClientPassword(null);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  disabled={creatingClient}
                >
                  Avbryt
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showInviteForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Skicka inbjudan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label
                  htmlFor="invite-email"
                  className="block text-sm font-medium text-[#5A6B5D] mb-1"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  disabled={sendingInvite}
                  placeholder="klient@example.com"
                  autoFocus
                />
              </div>

              {inviteLink && (
                <Card className="bg-blue-50/50 border-blue-200">
                  <CardContent>
                    <p className="text-sm font-medium text-[#5A6B5D] mb-2">
                      Inbjudningslänk:
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={inviteLink}
                        readOnly
                        className="flex-1 font-mono"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(inviteLink);
                          setSuccessMessage("Länk kopierad!");
                          setTimeout(() => setSuccessMessage(null), 2000);
                        }}
                      >
                        Kopiera
                      </Button>
                    </div>
                    <p className="text-xs text-[#5A6B5D]/70 mt-2">
                      Kopiera denna länk och skicka till klienten via email eller meddelande.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={sendingInvite}
                >
                  {sendingInvite ? "Skapar..." : "Skapa inbjudan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteEmail("");
                    setInviteLink(null);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  disabled={sendingInvite}
                >
                  Avbryt
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {clients.length === 0 ? (
        <EmptyState
          title="Inga klienter ännu"
          description="Du behöver skapa klienter för att kunna tilldela program och följa deras träning. Skicka en inbjudan till din första klient."
          action={
            !showInviteForm && !showCreateForm
              ? {
                  label: "Skapa din första klient",
                  onClick: () => setShowCreateForm(true),
                }
              : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Namn</TableHead>
                <TableHead>Aktivt program</TableHead>
                <TableHead>Senaste pass</TableHead>
                <TableHead>Readiness</TableHead>
                <TableHead>Cykel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <EmptyState
                      title="Inga klienter matchar sökningen"
                      description="Försök ändra sökord eller filter."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  onClick={() => router.push(`/coach/clients/${client.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <div className="text-sm font-medium text-[#5A6B5D]">
                      {client.profile?.full_name || "Namnlös klient"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.activeProgram ? (
                      <div className="text-sm font-medium text-[#5A6B5D]">
                        {client.activeProgram.name}
                      </div>
                    ) : (
                      <div className="text-sm text-[#5A6B5D]/70 italic">Inget program</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.latestWorkoutLog ? (
                      <div>
                        <div className="text-sm font-medium text-[#5A6B5D]">
                          {client.latestWorkoutLog.session?.name || "Pass"}
                        </div>
                        <div className="text-xs text-[#5A6B5D]/70 mt-1 flex items-center gap-2">
                          <Chip
                            variant={
                              client.latestWorkoutLog.status === "genomfört"
                                ? "success"
                                : client.latestWorkoutLog.status === "påbörjad"
                                ? "warning"
                                : "default"
                            }
                          >
                            {client.latestWorkoutLog.status === "genomfört"
                              ? "Genomfört"
                              : client.latestWorkoutLog.status === "påbörjad"
                              ? "Påbörjad"
                              : client.latestWorkoutLog.status}
                          </Chip>
                          {new Date(client.latestWorkoutLog.date).toLocaleDateString("sv-SE")}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-[#5A6B5D]/70 italic">
                        Ingen träningslogg ännu
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.latestReadiness ? (
                      <div className="text-sm">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-xs text-[#5A6B5D]/70">Energi:</span>
                            <span className="ml-1 text-xs font-medium text-[#5A6B5D]">
                              {client.latestReadiness.energy_level || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-[#5A6B5D]/70">Sömn:</span>
                            <span className="ml-1 text-xs font-medium text-[#5A6B5D]">
                              {client.latestReadiness.sleep_quality || "-"}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-[#5A6B5D]/60 mt-1">
                          {new Date(client.latestReadiness.date).toLocaleDateString("sv-SE")}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-[#5A6B5D]/70 italic">
                        Ingen readiness ännu
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const cycleStatus = calculateCycleStatus(client.latestPeriodStart ?? null);
                      return cycleStatus ? (
                        <div className="text-sm">
                          <div className="font-medium text-[#5A6B5D]">
                            Dag {cycleStatus.cycleDay}
                          </div>
                          <div className="text-xs text-[#5A6B5D]/70 mt-1">
                            {cycleStatus.phase}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-[#5A6B5D]/70 italic">
                          Ingen cykeldata ännu
                        </div>
                      );
                    })()}
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
