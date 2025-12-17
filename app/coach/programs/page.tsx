"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileText, Trash2, Clock } from "lucide-react";
import { ERROR_MESSAGES, getUserFriendlyErrorMessage } from "@/lib/utils/errorMessages";

interface TrainingProgram {
  id: string;
  name: string;
  description: string | null;
  created_by_coach_id: string;
  target_goal: string;
  target_duration_weeks: number | null;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export default function CoachPrograms() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [programName, setProgramName] = useState("");
  const [draft, setDraft] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchPrograms();
      loadDraft();
    }
  }, [user, authLoading]);

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem("program_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Kontrollera att utkastet har något innehåll
        if (parsed.name || parsed.description || (parsed.blocks && parsed.blocks.length > 0)) {
          setDraft(parsed);
        }
      }
    } catch (err) {
      console.error("Error loading draft:", err);
      setDraft(null);
    }
  };

  const handleResumeDraft = () => {
    router.push("/coach/programs/create");
  };

  const handleDeleteDraft = () => {
    if (confirm("Är du säker på att du vill ta bort utkastet? Detta kan inte ångras.")) {
      localStorage.removeItem("program_draft");
      setDraft(null);
    }
  };

  const fetchPrograms = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("training_programs")
        .select("id, name, description, created_by_coach_id, target_goal, target_duration_weeks, is_template, created_at, updated_at")
        .eq("created_by_coach_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setPrograms((data || []) as TrainingProgram[]);
    } catch (err) {
      console.error("Error fetching programs:", err);
      setError(getUserFriendlyErrorMessage(err, ERROR_MESSAGES.FETCH_PROGRAM_FAILED));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!programName.trim()) {
      setError("Programmets namn är obligatoriskt.");
      return;
    }

    if (!user?.id) {
      setError("Du måste vara inloggad för att skapa program.");
      return;
    }

    setCreating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data, error: createError } = await supabase
        .from("training_programs")
        .insert({
          name: programName.trim(),
          created_by_coach_id: user.id,
          target_goal: "general_fitness", // Default value
          is_template: false,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Lyckades! Nollställ formulär och uppdatera lista
      setProgramName("");
      setShowForm(false);
      setSuccessMessage("Program skapat");

      // Dölj success-meddelandet efter 3 sekunder
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      // Uppdatera programlistan
      await fetchPrograms();
    } catch (err) {
      console.error("Error creating program:", err);
      setError(getErrorMessage(err) || "Kunde inte skapa program. Försök igen senare.");
    } finally {
      setCreating(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setProgramName("");
    setError(null);
  };

  const handleProgramClick = (programId: string) => {
    router.push(`/coach/programs/${programId}`);
  };

  if (authLoading || loading) {
    return (
      <LoadingState 
        title="Program" 
        subtitle="Hantera dina träningsprogram"
        showHeader={true}
        height="h-64"
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Program" 
        subtitle="Hantera dina träningsprogram"
        actions={
          !showForm && (
            <Button variant="link" onClick={() => router.push("/coach/programs/create")}>
              Skapa program
            </Button>
          )
        }
      />

      {successMessage && (
        <Card className="bg-green-50/50 border-green-200">
          <CardContent>
            <p className="text-sm text-green-600">{successMessage}</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <ErrorState 
          title="Kunde inte ladda program" 
          message={error}
          onRetry={fetchPrograms}
        />
      )}

      {/* Sparat utkast */}
      {draft && (
        <Card className="bg-amber-50/50 border-amber-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-amber-700" />
                <div>
                  <CardTitle className="text-base text-amber-900">Sparat utkast</CardTitle>
                  <p className="text-sm text-amber-700/70 mt-0.5">
                    {draft.name || "Namnlöst program"} • {draft.blocks?.length || 0} block
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

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Skapa nytt program</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProgram} className="space-y-4">
              <div>
                <label
                  htmlFor="program-name"
                  className="block text-sm font-medium text-[#5A6B5D] mb-1"
                >
                  Namn <span className="text-red-500">*</span>
                </label>
                <Input
                  id="program-name"
                  type="text"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  required
                  disabled={creating}
                  placeholder="Programmets namn"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={creating}>
                  {creating ? "Skapar..." : "Skapa program"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelForm} disabled={creating}>
                  Avbryt
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {programs.length === 0 ? (
        <EmptyState
          title="Inga program ännu"
          description="Ett träningsprogram innehåller pass och övningar som du kan tilldela till klienter."
          action={
            !showForm
              ? {
                  label: "Skapa ditt första program",
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
                  <TableHead>Skapad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program) => (
                  <TableRow
                    key={program.id}
                    onClick={() => handleProgramClick(program.id)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <div className="text-sm font-medium text-[#5A6B5D]">
                        {program.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-[#5A6B5D]/70">
                        {program.description || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-[#5A6B5D]/70">
                        {new Date(program.created_at).toLocaleDateString("sv-SE")}
                      </div>
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
