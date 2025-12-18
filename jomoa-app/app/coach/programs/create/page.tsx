"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { Exercise } from "@/lib/types/common";
import { useExercises } from "@/hooks/useExercises";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Stepper } from "@/components/ui/Stepper";
import { Skeleton } from "@/components/ui/Skeleton";

interface ProgramDraft {
  name: string;
  description: string;
  target_goal: "general_fitness" | "muscle_gain" | "fat_loss" | "strength" | "endurance" | "recomp";
  target_duration_weeks: number | null;
  start_date: string | null;
  use_cycle_aware: boolean;
  blocks: BlockDraft[];
}

interface BlockDraft {
  id: string;
  name: string;
  weeks: WeekDraft[];
}

interface WeekDraft {
  id: string;
  week_number: number;
  name: string;
  sessions: SessionDraft[];
}

interface SessionDraft {
  id: string;
  name: string;
  day_of_week: number;
  focus: string;
  exercises: ExerciseDraft[];
}

interface ExerciseDraft {
  id: string;
  exercise_id: string;
  order_index: number;
  sets_planned: number | null;
  reps_planned: number | null;
  rest_seconds: number | null;
  tempo: string | null;
  intensity_type: "none" | "rpe" | "percent";
  intensity_value: number | null;
  notes: string | null;
}

const STEPS = [
  { label: "Grundläggande", description: "Namn, mål, längd" },
  { label: "Struktur", description: "Block och veckor" },
  { label: "Pass", description: "Övningar och sets" },
  { label: "Granska", description: "Kontrollera och publicera" },
];

export default function CreateProgramPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const [draft, setDraft] = useState<ProgramDraft>({
    name: "",
    description: "",
    target_goal: "general_fitness",
    target_duration_weeks: null,
    start_date: null,
    use_cycle_aware: false,
    blocks: [],
  });

  useEffect(() => {
    if (!authLoading && user) {
      loadDraft();
    }
  }, [user, authLoading]);

  // Ladda sparad draft från localStorage
  const loadDraft = () => {
    const saved = localStorage.getItem("program_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name || parsed.description || (parsed.blocks && parsed.blocks.length > 0)) {
          setDraft(parsed);
          setDraftLoaded(true);
          // Dölj meddelandet efter 5 sekunder
          setTimeout(() => setDraftLoaded(false), 5000);
        }
      } catch (err) {
        console.error("Error loading draft:", err);
      }
    }
  };

  // Spara draft till localStorage
  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem("program_draft", JSON.stringify(draft));
    } catch (err) {
      console.error("Error saving draft:", err);
    }
  }, [draft]);

  // Autosave när draft ändras (med debounce för att undvika för många saves)
  useEffect(() => {
    if (draft.name || draft.description || draft.blocks.length > 0) {
      const timeoutId = setTimeout(() => {
        saveDraft();
      }, 1000); // Debounce 1 sekund
      
      return () => clearTimeout(timeoutId);
    }
  }, [draft, saveDraft]);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    
    switch (step) {
      case 1:
        if (!draft.name.trim()) {
          setError("Programmets namn är obligatoriskt.");
          return false;
        }
        return true;
      case 2:
        if (draft.blocks.length === 0) {
          setError("Du måste lägga till minst ett block med veckor.");
          return false;
        }
        // Kontrollera att varje block har minst en vecka
        for (const block of draft.blocks) {
          if (block.weeks.length === 0) {
            setError("Varje block måste ha minst en vecka.");
            return false;
          }
        }
        return true;
      case 3:
        // Kontrollera att varje vecka har minst ett pass
        for (const block of draft.blocks) {
          for (const week of block.weeks) {
            if (week.sessions.length === 0) {
              setError("Varje vecka måste ha minst ett pass.");
              return false;
            }
            // Kontrollera att varje pass har minst en övning
            for (const session of week.sessions) {
              if (session.exercises.length === 0) {
                setError("Varje pass måste ha minst en övning.");
                return false;
              }
            }
          }
        }
        return true;
      case 4:
        return true; // Review step, allt är redan validerat
      default:
        return true;
    }
  };

  const handlePublish = async () => {
    if (!user?.id) {
      setError("Du måste vara inloggad.");
      return;
    }

    if (!validateStep(4)) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Skapa program
      const { data: program, error: programError } = await supabase
        .from("training_programs")
        .insert({
          name: draft.name.trim(),
          description: draft.description.trim() || null,
          created_by_coach_id: user.id,
          target_goal: draft.target_goal,
          target_duration_weeks: draft.target_duration_weeks,
          is_template: false,
        })
        .select()
        .single();

      if (programError) throw programError;

      // Skapa blocks, weeks, sessions och exercises
      for (const blockDraft of draft.blocks) {
        const { data: block, error: blockError } = await supabase
          .from("program_blocks")
          .insert({
            program_id: program.id,
            name: blockDraft.name,
            order_index: draft.blocks.indexOf(blockDraft),
          })
          .select()
          .single();

        if (blockError) throw blockError;

        for (const weekDraft of blockDraft.weeks) {
          const { data: week, error: weekError } = await supabase
            .from("program_weeks")
            .insert({
              block_id: block.id,
              week_number: weekDraft.week_number,
              name: weekDraft.name || null,
            })
            .select()
            .single();

          if (weekError) throw weekError;

          for (const sessionDraft of weekDraft.sessions) {
            const { data: session, error: sessionError } = await supabase
              .from("program_sessions")
              .insert({
                program_id: program.id,
                week_id: week.id,
                name: sessionDraft.name,
                day_of_week: sessionDraft.day_of_week,
                focus: sessionDraft.focus || null,
              })
              .select()
              .single();

            if (sessionError) throw sessionError;

            for (const exerciseDraft of sessionDraft.exercises) {
              const { error: exerciseError } = await supabase
                .from("session_exercises")
                .insert({
                  session_id: session.id,
                  exercise_id: exerciseDraft.exercise_id,
                  order_index: exerciseDraft.order_index,
                  sets_planned: exerciseDraft.sets_planned,
                  reps_planned: exerciseDraft.reps_planned,
                  rest_seconds: exerciseDraft.rest_seconds,
                  tempo: exerciseDraft.tempo,
                  intensity_type: exerciseDraft.intensity_type,
                  intensity_value: exerciseDraft.intensity_value,
                  notes: exerciseDraft.notes,
                });

              if (exerciseError) throw exerciseError;
            }
          }
        }
      }

      // Rensa draft
      localStorage.removeItem("program_draft");

      // Redirect till program detail page
      router.push(`/coach/programs/${program.id}`);
    } catch (err: unknown) {
      console.error("Error publishing program:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user?.id) {
      setError("Du måste vara inloggad.");
      return;
    }

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // Spara till localStorage
      saveDraft();
      
      // Visa success-meddelande
      setSaveSuccess(true);
      
      // Dölj success-meddelandet efter 3 sekunder
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error saving draft:", err);
      setError(getErrorMessage(err) || "Kunde inte spara utkast.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Skapa program" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Skapa program" 
        subtitle="Bygg ett träningsprogram steg för steg"
      />

      {/* Stepper */}
      <Card>
        <CardContent className="pt-6">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-50/50 border-red-200">
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {saveSuccess && (
        <Card className="bg-green-50/50 border-green-200">
          <CardContent>
            <p className="text-sm text-green-600">Utkast sparades framgångsrikt!</p>
          </CardContent>
        </Card>
      )}

      {/* Draft Loaded Message */}
      {draftLoaded && (
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent>
            <p className="text-sm text-blue-600">
              ✓ Sparat utkast laddades. Du kan fortsätta där du slutade.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].label}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <Step1Basics draft={draft} setDraft={setDraft} />
          )}
          {currentStep === 2 && (
            <Step2Structure draft={draft} setDraft={setDraft} />
          )}
          {currentStep === 3 && (
            <Step3Sessions draft={draft} setDraft={setDraft} />
          )}
          {currentStep === 4 && (
            <Step4Review draft={draft} />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious} disabled={saving}>
                Tillbaka
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            {currentStep < STEPS.length ? (
              <>
                <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
                  Spara utkast
                </Button>
                <Button onClick={handleNext} disabled={saving}>
                  Nästa
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
                  Spara utkast
                </Button>
                <Button onClick={handlePublish} disabled={saving}>
                  {saving ? "Publicerar..." : "Publicera program"}
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Step 1: Program Basics
function Step1Basics({
  draft,
  setDraft,
}: {
  draft: ProgramDraft;
  setDraft: (draft: ProgramDraft) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[#5A6B5D] mb-1">
          Namn <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="T.ex. '12-veckors styrketräning'"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-[#5A6B5D] mb-1">
          Beskrivning
        </label>
        <textarea
          id="description"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          placeholder="Beskriv programmet..."
          className="w-full min-h-[100px] px-3 py-2 rounded-card border border-[rgba(232,229,224,0.4)] bg-[#FEFCF8] text-sm text-[#5A6B5D] placeholder:text-[#5A6B5D]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6F47]/50 focus-visible:border-[#8B6F47] resize-none"
        />
      </div>

      <div>
        <label htmlFor="target_goal" className="block text-sm font-medium text-[#5A6B5D] mb-1">
          Mål
        </label>
        <select
          id="target_goal"
          value={draft.target_goal}
          onChange={(e) => setDraft({ ...draft, target_goal: e.target.value as ProgramDraft["target_goal"] })}
          className="w-full px-3 py-2 rounded-card border border-[rgba(232,229,224,0.4)] bg-[#FEFCF8] text-sm text-[#5A6B5D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6F47]/50 focus-visible:border-[#8B6F47]"
        >
          <option value="general_fitness">Allmän fitness</option>
          <option value="muscle_gain">Muskeltillväxt</option>
          <option value="fat_loss">Viktnedgång</option>
          <option value="strength">Styrka</option>
          <option value="endurance">Kondition</option>
          <option value="recomp">Recomposition</option>
        </select>
      </div>

      <div>
        <label htmlFor="target_duration_weeks" className="block text-sm font-medium text-[#5A6B5D] mb-1">
          Längd (veckor)
        </label>
        <Input
          id="target_duration_weeks"
          type="number"
          min="1"
          value={draft.target_duration_weeks || ""}
          onChange={(e) => setDraft({ ...draft, target_duration_weeks: e.target.value ? parseInt(e.target.value) : null })}
          placeholder="T.ex. 12"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="use_cycle_aware"
          checked={draft.use_cycle_aware}
          onChange={(e) => setDraft({ ...draft, use_cycle_aware: e.target.checked })}
          className="w-4 h-4 rounded border-[rgba(232,229,224,0.4)] text-[#8B6F47] focus:ring-[#8B6F47]/50"
        />
        <label htmlFor="use_cycle_aware" className="text-sm text-[#5A6B5D]">
          Använd cykel-medveten planering (justera pass baserat på klientens cykelfas)
        </label>
      </div>
    </div>
  );
}

// Step 2: Structure (Blocks & Weeks)
function Step2Structure({
  draft,
  setDraft,
}: {
  draft: ProgramDraft;
  setDraft: (draft: ProgramDraft) => void;
}) {
  const addBlock = () => {
    const newBlock: BlockDraft = {
      id: `block-${Date.now()}`,
      name: `Block ${draft.blocks.length + 1}`,
      weeks: [],
    };
    setDraft({ ...draft, blocks: [...draft.blocks, newBlock] });
  };

  const updateBlock = (blockId: string, updates: Partial<BlockDraft>) => {
    setDraft({
      ...draft,
      blocks: draft.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
    });
  };

  const removeBlock = (blockId: string) => {
    setDraft({
      ...draft,
      blocks: draft.blocks.filter((b) => b.id !== blockId),
    });
  };

  const addWeek = (blockId: string) => {
    const block = draft.blocks.find((b) => b.id === blockId);
    if (!block) return;

    const newWeek: WeekDraft = {
      id: `week-${Date.now()}`,
      week_number: block.weeks.length + 1,
      name: `Vecka ${block.weeks.length + 1}`,
      sessions: [],
    };

    updateBlock(blockId, {
      weeks: [...block.weeks, newWeek],
    });
  };

  const updateWeek = (blockId: string, weekId: string, updates: Partial<WeekDraft>) => {
    const block = draft.blocks.find((b) => b.id === blockId);
    if (!block) return;

    updateBlock(blockId, {
      weeks: block.weeks.map((w) => (w.id === weekId ? { ...w, ...updates } : w)),
    });
  };

  const removeWeek = (blockId: string, weekId: string) => {
    const block = draft.blocks.find((b) => b.id === blockId);
    if (!block) return;

    updateBlock(blockId, {
      weeks: block.weeks.filter((w) => w.id !== weekId),
    });
  };

  const addSession = (blockId: string, weekId: string) => {
    const block = draft.blocks.find((b) => b.id === blockId);
    if (!block) return;
    const week = block.weeks.find((w) => w.id === weekId);
    if (!week) return;

    const newSession: SessionDraft = {
      id: `session-${Date.now()}`,
      name: `Pass ${week.sessions.length + 1}`,
      day_of_week: week.sessions.length + 1,
      focus: "",
      exercises: [],
    };

    updateWeek(blockId, weekId, {
      sessions: [...week.sessions, newSession],
    });
  };

  const updateSession = (blockId: string, weekId: string, sessionId: string, updates: Partial<SessionDraft>) => {
    const block = draft.blocks.find((b) => b.id === blockId);
    if (!block) return;
    const week = block.weeks.find((w) => w.id === weekId);
    if (!week) return;

    updateWeek(blockId, weekId, {
      sessions: week.sessions.map((s) => (s.id === sessionId ? { ...s, ...updates } : s)),
    });
  };

  const removeSession = (blockId: string, weekId: string, sessionId: string) => {
    const block = draft.blocks.find((b) => b.id === blockId);
    if (!block) return;
    const week = block.weeks.find((w) => w.id === weekId);
    if (!week) return;

    updateWeek(blockId, weekId, {
      sessions: week.sessions.filter((s) => s.id !== sessionId),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-[#5A6B5D]/70">
          Lägg till block och veckor för ditt program. Varje block kan innehålla flera veckor.
        </p>
        <Button variant="outline" onClick={addBlock}>
          + Lägg till block
        </Button>
      </div>

      {draft.blocks.length === 0 ? (
        <div className="text-center py-8 text-sm text-[#5A6B5D]/70">
          Inga block ännu. Klicka på "Lägg till block" för att börja.
        </div>
      ) : (
        <div className="space-y-4">
          {draft.blocks.map((block) => (
            <Card key={block.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Input
                    value={block.name}
                    onChange={(e) => updateBlock(block.id, { name: e.target.value })}
                    className="flex-1 max-w-xs"
                    placeholder="Block namn"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBlock(block.id)}
                  >
                    Ta bort
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-[#5A6B5D]">Veckor</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addWeek(block.id)}
                    >
                      + Lägg till vecka
                    </Button>
                  </div>

                  {block.weeks.length === 0 ? (
                    <p className="text-xs text-[#5A6B5D]/60">Inga veckor ännu.</p>
                  ) : (
                    <div className="space-y-3">
                      {block.weeks.map((week) => (
                        <Card key={week.id} className="bg-[#FEFCF8]/30">
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Input
                                value={week.name}
                                onChange={(e) => updateWeek(block.id, week.id, { name: e.target.value })}
                                className="flex-1"
                                placeholder="Vecka namn"
                              />
                              <Input
                                type="number"
                                min="1"
                                value={week.week_number}
                                onChange={(e) => updateWeek(block.id, week.id, { week_number: parseInt(e.target.value) || 1 })}
                                className="w-20"
                                placeholder="Nr"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeWeek(block.id, week.id)}
                              >
                                Ta bort
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <p className="text-xs font-medium text-[#5A6B5D]">Pass ({week.sessions.length})</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addSession(block.id, week.id)}
                                >
                                  + Lägg till pass
                                </Button>
                              </div>
                              
                              {week.sessions.length === 0 ? (
                                <p className="text-xs text-[#5A6B5D]/60">Inga pass ännu.</p>
                              ) : (
                                <div className="space-y-1">
                                  {week.sessions.map((session) => (
                                    <div key={session.id} className="flex items-center gap-2 p-2 bg-[#FEFCF8] rounded-card">
                                      <Input
                                        value={session.name}
                                        onChange={(e) => updateSession(block.id, week.id, session.id, { name: e.target.value })}
                                        className="flex-1 text-xs"
                                        placeholder="Pass namn"
                                      />
                                      <select
                                        value={session.day_of_week}
                                        onChange={(e) => updateSession(block.id, week.id, session.id, { day_of_week: parseInt(e.target.value) })}
                                        className="w-32 px-2 py-1 text-xs rounded-card border border-[rgba(232,229,224,0.4)] bg-[#FEFCF8] text-[#5A6B5D]"
                                      >
                                        <option value="1">Måndag</option>
                                        <option value="2">Tisdag</option>
                                        <option value="3">Onsdag</option>
                                        <option value="4">Torsdag</option>
                                        <option value="5">Fredag</option>
                                        <option value="6">Lördag</option>
                                        <option value="7">Söndag</option>
                                      </select>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeSession(block.id, week.id, session.id)}
                                      >
                                        Ta bort
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Step 3: Sessions (Pass builder)
function Step3Sessions({
  draft,
  setDraft,
}: {
  draft: ProgramDraft;
  setDraft: (draft: ProgramDraft) => void;
}) {
  const { exercises, loading: loadingExercises } = useExercises({
    includeCoachExercises: true,
    includeGlobalExercises: true,
  });
  const [selectedSession, setSelectedSession] = useState<{
    blockId: string;
    weekId: string;
    sessionId: string;
  } | null>(null);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  const addExerciseToSession = (exerciseId: string) => {
    if (!selectedSession) return;

    const block = draft.blocks.find((b) => b.id === selectedSession.blockId);
    if (!block) return;
    const week = block.weeks.find((w) => w.id === selectedSession.weekId);
    if (!week) return;
    const session = week.sessions.find((s) => s.id === selectedSession.sessionId);
    if (!session) return;

    const newExercise: ExerciseDraft = {
      id: `exercise-${Date.now()}`,
      exercise_id: exerciseId,
      order_index: session.exercises.length,
      sets_planned: 3,
      reps_planned: 10,
      rest_seconds: 60,
      tempo: null,
      intensity_type: "none",
      intensity_value: null,
      notes: null,
    };

    const updateBlock = (blockId: string, updates: Partial<BlockDraft>) => {
      setDraft({
        ...draft,
        blocks: draft.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
      });
    };

    const updateWeek = (blockId: string, weekId: string, updates: Partial<WeekDraft>) => {
      const block = draft.blocks.find((b) => b.id === blockId);
      if (!block) return;
      updateBlock(blockId, {
        weeks: block.weeks.map((w) => (w.id === weekId ? { ...w, ...updates } : w)),
      });
    };

    updateWeek(selectedSession.blockId, selectedSession.weekId, {
      sessions: week.sessions.map((s) =>
        s.id === selectedSession.sessionId
          ? { ...s, exercises: [...s.exercises, newExercise] }
          : s
      ),
    });

    setShowExerciseSelector(false);
  };

  const updateExercise = (
    blockId: string,
    weekId: string,
    sessionId: string,
    exerciseId: string,
    updates: Partial<ExerciseDraft>
  ) => {
    const block = draft.blocks.find((b) => b.id === blockId);
    if (!block) return;
    const week = block.weeks.find((w) => w.id === weekId);
    if (!week) return;
    const session = week.sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const updateBlock = (blockId: string, updates: Partial<BlockDraft>) => {
      setDraft({
        ...draft,
        blocks: draft.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
      });
    };

    const updateWeek = (blockId: string, weekId: string, updates: Partial<WeekDraft>) => {
      const block = draft.blocks.find((b) => b.id === blockId);
      if (!block) return;
      updateBlock(blockId, {
        weeks: block.weeks.map((w) => (w.id === weekId ? { ...w, ...updates } : w)),
      });
    };

    updateWeek(blockId, weekId, {
      sessions: week.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              exercises: s.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, ...updates } : ex
              ),
            }
          : s
      ),
    });
  };

  const removeExercise = (blockId: string, weekId: string, sessionId: string, exerciseId: string) => {
    const block = draft.blocks.find((b) => b.id === blockId);
    if (!block) return;
    const week = block.weeks.find((w) => w.id === weekId);
    if (!week) return;
    const session = week.sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const updateBlock = (blockId: string, updates: Partial<BlockDraft>) => {
      setDraft({
        ...draft,
        blocks: draft.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
      });
    };

    const updateWeek = (blockId: string, weekId: string, updates: Partial<WeekDraft>) => {
      const block = draft.blocks.find((b) => b.id === blockId);
      if (!block) return;
      updateBlock(blockId, {
        weeks: block.weeks.map((w) => (w.id === weekId ? { ...w, ...updates } : w)),
      });
    };

    updateWeek(blockId, weekId, {
      sessions: week.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, exercises: s.exercises.filter((ex) => ex.id !== exerciseId) }
          : s
      ),
    });
  };

  const getExerciseName = (exerciseId: string): string => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    return exercise?.name || "Okänd övning";
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#5A6B5D]/70">
        Lägg till övningar till varje pass. Klicka på ett pass för att lägga till övningar.
      </p>

      {draft.blocks.length === 0 ? (
        <div className="text-center py-8 text-sm text-[#5A6B5D]/70">
          Du måste först lägga till block och veckor i steg 2.
        </div>
      ) : (
        <div className="space-y-4">
          {draft.blocks.map((block) =>
            block.weeks.map((week) =>
              week.sessions.map((session) => (
                <Card key={session.id} className="bg-[#FEFCF8]/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {block.name} - {week.name} - {session.name}
                        </CardTitle>
                        <p className="text-xs text-[#5A6B5D]/70 mt-1">
                          Dag {session.day_of_week}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSession({
                            blockId: block.id,
                            weekId: week.id,
                            sessionId: session.id,
                          });
                          setShowExerciseSelector(true);
                        }}
                      >
                        + Lägg till övning
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {session.exercises.length === 0 ? (
                      <p className="text-xs text-[#5A6B5D]/60">Inga övningar ännu.</p>
                    ) : (
                      <div className="space-y-3">
                        {session.exercises.map((exercise, index) => (
                          <Card key={exercise.id} className="bg-[#FEFCF8]">
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-[#5A6B5D]">
                                    {index + 1}. {getExerciseName(exercise.exercise_id)}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    removeExercise(block.id, week.id, session.id, exercise.id)
                                  }
                                >
                                  Ta bort
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <label className="text-xs text-[#5A6B5D]/70">Sets</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={exercise.sets_planned || ""}
                                    onChange={(e) =>
                                      updateExercise(block.id, week.id, session.id, exercise.id, {
                                        sets_planned: e.target.value ? parseInt(e.target.value) : null,
                                      })
                                    }
                                    className="text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-[#5A6B5D]/70">Reps</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={exercise.reps_planned || ""}
                                    onChange={(e) =>
                                      updateExercise(block.id, week.id, session.id, exercise.id, {
                                        reps_planned: e.target.value ? parseInt(e.target.value) : null,
                                      })
                                    }
                                    className="text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-[#5A6B5D]/70">Vila (sek)</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={exercise.rest_seconds || ""}
                                    onChange={(e) =>
                                      updateExercise(block.id, week.id, session.id, exercise.id, {
                                        rest_seconds: e.target.value ? parseInt(e.target.value) : null,
                                      })
                                    }
                                    className="text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-[#5A6B5D]/70">Intensitet</label>
                                  <select
                                    value={exercise.intensity_type}
                                    onChange={(e) =>
                                      updateExercise(block.id, week.id, session.id, exercise.id, {
                                        intensity_type: e.target.value as "none" | "rpe" | "percent",
                                        intensity_value: e.target.value === "none" ? null : exercise.intensity_value,
                                      })
                                    }
                                    className="w-full px-2 py-1 text-xs rounded-card border border-[rgba(232,229,224,0.4)] bg-[#FEFCF8] text-[#5A6B5D]"
                                  >
                                    <option value="none">Ingen</option>
                                    <option value="rpe">RPE</option>
                                    <option value="percent">%</option>
                                  </select>
                                </div>
                                {exercise.intensity_type !== "none" && (
                                  <div>
                                    <label className="text-xs text-[#5A6B5D]/70">
                                      {exercise.intensity_type === "rpe" ? "RPE" : "%"}
                                    </label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max={exercise.intensity_type === "rpe" ? "10" : "100"}
                                      value={exercise.intensity_value || ""}
                                      onChange={(e) =>
                                        updateExercise(block.id, week.id, session.id, exercise.id, {
                                          intensity_value: e.target.value ? parseFloat(e.target.value) : null,
                                        })
                                      }
                                      className="text-xs"
                                    />
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )
          )}
        </div>
      )}

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Välj övning</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowExerciseSelector(false);
                    setSelectedSession(null);
                  }}
                >
                  Stäng
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
              {loadingExercises ? (
                <div className="text-center py-8 text-sm text-[#5A6B5D]/70">Laddar övningar...</div>
              ) : exercises.length === 0 ? (
                <div className="text-center py-8 text-sm text-[#5A6B5D]/70">Inga övningar tillgängliga.</div>
              ) : (
                <div className="space-y-2">
                  {exercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() => addExerciseToSession(exercise.id)}
                      className="w-full text-left p-3 bg-[#FEFCF8]/50 hover:bg-[#FEFCF8] rounded-card border border-[rgba(232,229,224,0.4)] transition-colors"
                    >
                      <p className="text-sm font-medium text-[#5A6B5D]">{exercise.name}</p>
                      {exercise.category && (
                        <p className="text-xs text-[#5A6B5D]/70 mt-0.5">
                          {exercise.category}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Step 4: Review
function Step4Review({ draft }: { draft: ProgramDraft }) {
  const totalWeeks = draft.blocks.reduce((sum, block) => sum + block.weeks.length, 0);
  const totalSessions = draft.blocks.reduce(
    (sum, block) => sum + block.weeks.reduce((weekSum, week) => weekSum + week.sessions.length, 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#5A6B5D] mb-3">Programöversikt</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#5A6B5D]/70">Namn</p>
            <p className="font-medium text-[#5A6B5D]">{draft.name || "-"}</p>
          </div>
          <div>
            <p className="text-[#5A6B5D]/70">Mål</p>
            <p className="font-medium text-[#5A6B5D]">{draft.target_goal}</p>
          </div>
          <div>
            <p className="text-[#5A6B5D]/70">Längd</p>
            <p className="font-medium text-[#5A6B5D]">
              {draft.target_duration_weeks ? `${draft.target_duration_weeks} veckor` : "-"}
            </p>
          </div>
          <div>
            <p className="text-[#5A6B5D]/70">Cykel-medveten</p>
            <p className="font-medium text-[#5A6B5D]">{draft.use_cycle_aware ? "Ja" : "Nej"}</p>
          </div>
          {draft.description && (
            <div className="col-span-2">
              <p className="text-[#5A6B5D]/70">Beskrivning</p>
              <p className="font-medium text-[#5A6B5D]">{draft.description}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-[#5A6B5D] mb-3">Statistik</h3>
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-[#FEFCF8]/50">
            <CardContent className="pt-4">
              <p className="text-2xl font-the-seasons font-bold text-[#5A6B5D]">{draft.blocks.length}</p>
              <p className="text-xs text-[#5A6B5D]/70 mt-1">Block</p>
            </CardContent>
          </Card>
          <Card className="bg-[#FEFCF8]/50">
            <CardContent className="pt-4">
              <p className="text-2xl font-the-seasons font-bold text-[#5A6B5D]">{totalWeeks}</p>
              <p className="text-xs text-[#5A6B5D]/70 mt-1">Veckor</p>
            </CardContent>
          </Card>
          <Card className="bg-[#FEFCF8]/50">
            <CardContent className="pt-4">
              <p className="text-2xl font-the-seasons font-bold text-[#5A6B5D]">{totalSessions}</p>
              <p className="text-xs text-[#5A6B5D]/70 mt-1">Pass</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-[#5A6B5D] mb-3">Struktur</h3>
        <div className="space-y-3">
          {draft.blocks.map((block) => (
            <Card key={block.id} className="bg-[#FEFCF8]/30">
              <CardHeader>
                <CardTitle className="text-base">{block.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {block.weeks.map((week) => (
                    <div key={week.id} className="p-2 bg-[#FEFCF8] rounded-card">
                      <p className="text-sm font-medium text-[#5A6B5D]">
                        {week.name} ({week.sessions.length} pass)
                      </p>
                      {week.sessions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {week.sessions.map((session) => (
                            <p key={session.id} className="text-xs text-[#5A6B5D]/70">
                              • {session.name} ({session.exercises.length} övningar)
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

