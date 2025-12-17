"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { normalizeRelation } from "@/lib/types/supabase";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Chip } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Checkin {
  id: string;
  client_id: string;
  template_id: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  client: {
    profile: {
      full_name: string | null;
    } | null;
  } | null;
  template: {
    name: string;
  } | null;
}

export default function CoachCheckinsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSendForm, setShowSendForm] = useState(false);
  const [sending, setSending] = useState(false);

  // Form state
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [clients, setClients] = useState<Array<{ id: string; profile: { full_name: string | null } | null }>>([]);
  const [templates, setTemplates] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchCheckins();
      fetchClients();
      fetchTemplates();
    }
  }, [user, authLoading]);

  const getOrCreateDefaultOrganization = async (): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      const { data: existingOrg, error: fetchError } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_profile_id", user.id)
        .limit(1)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (existingOrg) {
        return existingOrg.id;
      }

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

  const fetchCheckins = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("checkins")
        .select(`
          id,
          client_id,
          template_id,
          due_date,
          completed_at,
          created_at,
          client:clients!checkins_client_id_fkey (
            profile:profiles!clients_profile_id_fkey (
              full_name
            )
          ),
          template:checkin_templates!checkins_template_id_fkey (
            name
          )
        `)
        .eq("created_by_coach_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setCheckins((data || []) as unknown as Checkin[]);
    } catch (err) {
      console.error("Error fetching checkins:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta check-ins. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    if (!user?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("clients")
        .select(`
          id,
          profile:profiles!clients_profile_id_fkey (
            full_name
          )
        `)
        .eq("primary_coach_id", user.id)
        .eq("status", "active");

      if (fetchError) throw fetchError;

      setClients((data || []) as unknown as Array<{ id: string; profile: { full_name: string | null } | null }>);
    } catch (err) {
      console.error("Error fetching clients:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  const fetchTemplates = async () => {
    if (!user?.id) return;

    try {
      const organizationId = await getOrCreateDefaultOrganization();
      if (!organizationId) return;

      const { data, error: fetchError } = await supabase
        .from("checkin_templates")
        .select("id, name")
        .eq("organization_id", organizationId)
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setTemplates((data || []) as Array<{ id: string; name: string }>);
    } catch (err) {
      console.error("Error fetching templates:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  const handleSendCheckin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId || !selectedTemplateId) {
      setError("Välj klient och template.");
      return;
    }

    if (!user?.id) {
      setError("Du måste vara inloggad.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const { error: createError } = await supabase
        .from("checkins")
        .insert({
          client_id: selectedClientId,
          template_id: selectedTemplateId,
          created_by_coach_id: user.id,
          due_date: dueDate || null,
        });

      if (createError) throw createError;

      // Reset form
      setSelectedClientId("");
      setSelectedTemplateId("");
      setDueDate("");
      setShowSendForm(false);

      // Refresh list
      await fetchCheckins();
    } catch (err) {
      console.error("Error sending checkin:", err);
      setError(getErrorMessage(err) || "Kunde inte skicka check-in. Försök igen senare.");
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Check-ins" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Check-ins"
        subtitle="Hantera och skicka check-ins till dina klienter"
        actions={
          !showSendForm && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/coach/checkins/templates")}
                className="text-sm text-[#8B6F47] hover:text-[#7A5F3D] underline"
              >
                Hantera templates
              </button>
              <button
                onClick={() => setShowSendForm(true)}
                className="text-sm text-[#8B6F47] hover:text-[#7A5F3D] underline"
              >
                Skicka check-in
              </button>
            </div>
          )
        }
      />

      {error && (
        <Card className="bg-red-50/50 border-red-200">
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {showSendForm && (
        <Card>
          <CardHeader>
            <CardTitle>Skicka check-in</CardTitle>
            <CardDescription>Skicka en check-in till en klient</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendCheckin} className="space-y-4">
              <div>
                <label htmlFor="client" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                  Klient <span className="text-red-500">*</span>
                </label>
                <Select
                  id="client"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  required
                >
                  <option value="">-- Välj klient --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.profile?.full_name || "Namnlös klient"}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="template" className="block text-sm font-medium text-[#5A6B5D]">
                    Template <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push("/coach/checkins/templates/new")}
                    className="text-xs text-[#8B6F47] hover:text-[#7A5F3D] underline"
                  >
                    + Skapa ny template
                  </button>
                </div>
                <Select
                  id="template"
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  required
                >
                  <option value="">-- Välj template --</option>
                  {templates.length === 0 ? (
                    <option value="" disabled>
                      Inga templates - skapa en först
                    </option>
                  ) : (
                    templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))
                  )}
                </Select>
                {templates.length === 0 && (
                  <p className="text-xs text-[#5A6B5D]/70 mt-1">
                    Du behöver skapa en template först.{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/coach/checkins/templates/new")}
                      className="text-[#8B6F47] hover:text-[#7A5F3D] underline"
                    >
                      Skapa template →
                    </button>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-[#5A6B5D] mb-1">
                  Förfallodatum (valfritt)
                </label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={sending}>
                  {sending ? "Skickar..." : "Skicka check-in"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSendForm(false);
                    setSelectedClientId("");
                    setSelectedTemplateId("");
                    setDueDate("");
                    setError(null);
                  }}
                  disabled={sending}
                >
                  Avbryt
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {checkins.length === 0 ? (
        <EmptyState
          title="Inga check-ins ännu"
          description="Skicka din första check-in till en klient för att komma igång."
          action={
            !showSendForm
              ? {
                  label: "Skicka första check-in",
                  onClick: () => setShowSendForm(true),
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
                  <TableHead>Klient</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Förfallodatum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Skapad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkins.map((checkin) => (
                  <TableRow
                    key={checkin.id}
                    onClick={() => router.push(`/coach/clients/${checkin.client_id}/checkins`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="text-[#5A6B5D]">
                      {checkin.client?.profile?.full_name || "Namnlös klient"}
                    </TableCell>
                    <TableCell className="text-[#5A6B5D]/70">
                      {checkin.template?.name || "-"}
                    </TableCell>
                    <TableCell className="text-[#5A6B5D]/70">
                      {checkin.due_date
                        ? new Date(checkin.due_date).toLocaleDateString("sv-SE")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Chip variant={checkin.completed_at ? "success" : "warning"}>
                        {checkin.completed_at ? "Besvarad" : "Väntar"}
                      </Chip>
                    </TableCell>
                    <TableCell className="text-[#5A6B5D]/70">
                      {new Date(checkin.created_at).toLocaleDateString("sv-SE")}
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

