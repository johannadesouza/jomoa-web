"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { FileText, Trash2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CheckinTemplate {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  question_count?: number;
}

export default function CheckinTemplatesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<CheckinTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchTemplates();
      loadDraft();
    }
  }, [user, authLoading]);

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem("checkin_template_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Kontrollera att utkastet har något innehåll
        if (parsed.name || parsed.description || (parsed.questions && parsed.questions.length > 0)) {
          setDraft(parsed);
        }
      }
    } catch (err) {
      console.error("Error loading draft:", err);
      setDraft(null);
    }
  };

  const handleResumeDraft = () => {
    router.push("/coach/checkins/templates/new");
  };

  const handleDeleteDraft = () => {
    if (confirm("Är du säker på att du vill ta bort utkastet? Detta kan inte ångras.")) {
      localStorage.removeItem("checkin_template_draft");
      setDraft(null);
    }
  };

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

  const fetchTemplates = async () => {
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

      // Hämta templates med question count
      const { data, error: fetchError } = await supabase
        .from("checkin_templates")
        .select(`
          id,
          name,
          description,
          created_at,
          questions:checkin_questions (id)
        `)
        .eq("organization_id", organizationId)
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Formatera data med question count
      const formattedTemplates: CheckinTemplate[] = (data || []).map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        created_at: template.created_at,
        question_count: Array.isArray(template.questions) ? template.questions.length : 0,
      }));

      setTemplates(formattedTemplates);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta templates. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`Är du säker på att du vill ta bort template "${templateName}"?`)) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from("checkin_templates")
        .delete()
        .eq("id", templateId);

      if (deleteError) throw deleteError;

      // Uppdatera listan
      await fetchTemplates();
    } catch (err) {
      console.error("Error deleting template:", err);
      setError(getErrorMessage(err) || "Kunde inte ta bort template. Försök igen senare.");
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Check-in Templates</h1>
        <p className="text-gray-600">Laddar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Check-in Templates"
        subtitle="Skapa och hantera templates för check-ins"
        actions={
          <Button
            variant="link"
            onClick={() => router.push("/coach/checkins/templates/new")}
            className="text-[#8B6F47] hover:text-[#7A5F3D]"
          >
            + Skapa template
          </Button>
        }
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Sparat utkast */}
      {draft && (
        <Card className="bg-amber-50/50 border-amber-200 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-amber-700" />
                <div>
                  <CardTitle className="text-base text-amber-900">Sparat utkast</CardTitle>
                  <p className="text-sm text-amber-700/70 mt-0.5">
                    {draft.name || "Namnlös template"} • {draft.questions?.length || 0} frågor
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResumeDraft}
                  className="border-amber-300 text-amber-900 hover:bg-amber-100"
                >
                  <Clock className="h-4 w-4 mr-1.5" />
                  Återuppta
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteDraft}
                  className="border-amber-300 text-amber-900 hover:bg-amber-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {templates.length === 0 ? (
        <EmptyState
          title="Inga templates ännu"
          description="Skapa din första template för att kunna skicka check-ins till klienter."
          action={{
            label: "Skapa första template",
            onClick: () => router.push("/coach/checkins/templates/new"),
          }}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Beskrivning</TableHead>
                  <TableHead>Frågor</TableHead>
                  <TableHead>Skapad</TableHead>
                  <TableHead>Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow
                    key={template.id}
                    onClick={() => router.push(`/coach/checkins/templates/${template.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <div className="text-sm font-medium text-[#5A6B5D]">{template.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-[#5A6B5D]/70">
                        {template.description || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-[#5A6B5D]/70">{template.question_count || 0}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-[#5A6B5D]/70">
                        {new Date(template.created_at).toLocaleDateString("sv-SE")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id, template.name);
                        }}
                        className="text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Ta bort
                      </button>
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

