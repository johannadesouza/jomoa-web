"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/Drawer";
import { Exercise, Client, ClientGroup, ProgramAssignment, GroupProgramAssignment } from "@/lib/types/common";
import { normalizeRelation } from "@/lib/types/supabase";

// Helper: Beräkna vilken fas en specifik datum kommer att vara i
const calculatePhaseForDate = (
  periodStartDate: string | null,
  targetDate: Date
): { phase: string; phaseEnum: string | null; cycleDay: number } | null => {
  if (!periodStartDate) {
    return null;
  }

  const startDate = new Date(periodStartDate);
  startDate.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const cycleDay = diffDays + 1;

  let phase = "";
  let phaseEnum: string | null = null;
  if (cycleDay >= 1 && cycleDay <= 5) {
    phase = "Mens";
    phaseEnum = "menstruation";
  } else if (cycleDay >= 6 && cycleDay <= 13) {
    phase = "Follikulär";
    phaseEnum = "follicular";
  } else if (cycleDay >= 14 && cycleDay <= 16) {
    phase = "Ägglossning";
    phaseEnum = "ovulation";
  } else if (cycleDay >= 17 && cycleDay <= 28) {
    phase = "Luteal";
    phaseEnum = "luteal";
  } else {
    phase = "Okänd";
    phaseEnum = null;
  }

  return { phase, phaseEnum, cycleDay };
};

// Helper: Färgkodning per fas
const getPhaseColor = (phaseEnum: string | null): string => {
  switch (phaseEnum) {
    case "menstruation":
      return "bg-pink-100 border-pink-300 text-pink-900";
    case "follicular":
      return "bg-blue-100 border-blue-300 text-blue-900";
    case "ovulation":
      return "bg-yellow-100 border-yellow-300 text-yellow-900";
    case "luteal":
      return "bg-purple-100 border-purple-300 text-purple-900";
    default:
      return "bg-gray-100 border-gray-300 text-gray-900";
  }
};

// Helper: Beräkna datum för en session baserat på program start + week + day
const calculateSessionDate = (
  programStartDate: string,
  weekNumber: number,
  dayOfWeek: number
): Date => {
  const startDate = new Date(programStartDate);
  const daysToAdd = (weekNumber - 1) * 7 + (dayOfWeek - 1);
  const sessionDate = new Date(startDate);
  sessionDate.setDate(startDate.getDate() + daysToAdd);
  return sessionDate;
};

// Helper: Beräkna om passet är "tungt" baserat på övningar
const isHeavySession = (exercises: SessionExercise[]): boolean => {
  if (!exercises || exercises.length === 0) return false;
  
  // Enkel heuristik: tungt om det finns övningar med hög intensity eller många sets
  const hasHighIntensity = exercises.some(
    (ex) =>
      ex.intensity_type === "percent" &&
      ex.intensity_value &&
      ex.intensity_value >= 85
  );
  const hasManySets = exercises.some(
    (ex) => ex.sets_planned && ex.sets_planned >= 5
  );
  const hasHighRPE = exercises.some(
    (ex) =>
      ex.intensity_type === "rpe" &&
      ex.intensity_value &&
      ex.intensity_value >= 8
  );

  return hasHighIntensity || hasManySets || hasHighRPE;
};

// Helper: Generera förslag baserat på fas
const getPhaseSuggestion = (
  phaseEnum: string | null,
  isHeavy: boolean
): { message: string; type: "info" | "warning" | "success" } | null => {
  if (!phaseEnum) return null;

  if (phaseEnum === "menstruation") {
    if (isHeavy) {
      return {
        message: "Tungt pass planerat i mensfas. Överväg att minska volym eller intensitet.",
        type: "warning",
      };
    }
    return {
      message: "Pass i mensfas. Överväg lättare volym eller fokus på teknik.",
      type: "info",
    };
  }

  if (phaseEnum === "luteal") {
    if (isHeavy) {
      return {
        message: "Tungt pass planerat i lutealfas. Vissa kan uppleva lägre energi här.",
        type: "warning",
      };
    }
    return {
      message: "Pass i lutealfas. Överväg att justera volym om klienten upplever låg energi.",
      type: "info",
    };
  }

  if (phaseEnum === "follicular") {
    return {
      message: "Pass i follikulärfas. Bra tid för högre volym och intensitet.",
      type: "success",
    };
  }

  if (phaseEnum === "ovulation") {
    return {
      message: "Pass i ägglossningsfas. Ofta bra energi och prestationsförmåga.",
      type: "success",
    };
  }

  return null;
};

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

interface ProgramSession {
  id: string;
  program_id: string;
  week_id: string;
  name: string;
  day_of_week: number;
  focus: string | null;
  created_at: string;
  exercises: SessionExercise[];
}

interface ProgramBlock {
  id: string;
  program_id: string;
  name: string;
  order_index: number;
  created_at: string;
  weeks?: ProgramWeek[];
}

interface ProgramWeek {
  id: string;
  program_id: string;
  block_id: string | null;
  week_number: number;
  name: string | null;
  created_at: string;
  sessions?: ProgramSession[];
}

interface SessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  order_index: number;
  sets_planned: number | null;
  reps_planned: number | null;
  rest_seconds: number | null;
  tempo: string | null;
  intensity_type: "none" | "rpe" | "percent";
  intensity_value: number | null;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
  };
}

export default function ProgramDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const programId = params?.id as string;

  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [blocks, setBlocks] = useState<ProgramBlock[]>([]);
  const [weeks, setWeeks] = useState<ProgramWeek[]>([]);
  const [sessions, setSessions] = useState<ProgramSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Block management
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [creatingBlock, setCreatingBlock] = useState(false);
  const [blockName, setBlockName] = useState("");
  
  // Week management
  const [showWeekForm, setShowWeekForm] = useState(false);
  const [creatingWeek, setCreatingWeek] = useState(false);
  const [weekName, setWeekName] = useState("");
  const [weekNumber, setWeekNumber] = useState(1);
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");
  
  // Session management
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [selectedWeekId, setSelectedWeekId] = useState<string>("");
  const [sessionDayOfWeek, setSessionDayOfWeek] = useState(1);
  
  // Exercise management
  const [addingExerciseToSession, setAddingExerciseToSession] = useState<string | null>(null);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [exerciseSets, setExerciseSets] = useState<string>("3");
  const [exerciseReps, setExerciseReps] = useState<string>("10");
  const [exerciseRest, setExerciseRest] = useState<string>("60");
  const [exerciseTempo, setExerciseTempo] = useState<string>("");
  const [exerciseIntensityType, setExerciseIntensityType] = useState<"none" | "rpe" | "percent">("none");
  const [exerciseIntensityValue, setExerciseIntensityValue] = useState<string>("");
  const [exerciseNotes, setExerciseNotes] = useState<string>("");
  
  // Program assignment state
  const [clients, setClients] = useState<Client[]>([]);
  const [groups, setGroups] = useState<ClientGroup[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [assignmentType, setAssignmentType] = useState<"client" | "group">("client");
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [assigningProgram, setAssigningProgram] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [activeAssignments, setActiveAssignments] = useState<ProgramAssignment[]>([]);
  const [activeGroupAssignments, setActiveGroupAssignments] = useState<GroupProgramAssignment[]>([]);
  
  // Cycle-aware data per assignment
  const [assignmentCycleData, setAssignmentCycleData] = useState<
    Map<
      string,
      {
        periodStart: string | null;
        manualPhase: string | null;
      }
    >
  >(new Map());
  
  // Cycle detail drawer
  const [cycleDrawerOpen, setCycleDrawerOpen] = useState(false);
  const [selectedCycleInfo, setSelectedCycleInfo] = useState<{
    phase: string;
    phaseEnum: string | null;
    cycleDay: number;
    clientId: string;
    clientName: string;
    periodStart: string | null;
    suggestion: { message: string; type: "info" | "warning" | "success" } | null;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && user && programId) {
      fetchProgram();
      fetchBlocks();
      fetchWeeks();
      fetchSessions();
      fetchClients();
      fetchGroups();
      fetchActiveAssignments();
      fetchActiveGroupAssignments();
    }
  }, [user, authLoading, programId]);

  // Hämta cycle-data för alla aktiva assignments
  useEffect(() => {
    if (activeAssignments.length > 0) {
      fetchAssignmentCycleData();
    }
  }, [activeAssignments]);

  // Migrera befintliga sessions om de saknar week_id eller om det inte finns några blocks/weeks
  useEffect(() => {
    if (programId && blocks.length === 0 && weeks.length === 0 && sessions.length > 0) {
      migrateExistingSessions();
    }
  }, [programId, blocks.length, weeks.length, sessions.length]);

  const migrateExistingSessions = async () => {
    if (!programId) return;

    try {
      // Skapa default block
      const { data: defaultBlock, error: blockError } = await supabase
        .from("program_blocks")
        .insert({
          program_id: programId,
          name: "Block 1",
          order_index: 0,
        })
        .select()
        .single();

      if (blockError && !blockError.message.includes("duplicate")) {
        throw blockError;
      }

      const blockId = defaultBlock?.id || (await supabase.from("program_blocks").select("id").eq("program_id", programId).single()).data?.id;

      // Skapa default week
      const { data: defaultWeek, error: weekError } = await supabase
        .from("program_weeks")
        .insert({
          program_id: programId,
          block_id: blockId || null,
          week_number: 1,
          name: "Vecka 1",
        })
        .select()
        .single();

      if (weekError && !weekError.message.includes("duplicate")) {
        throw weekError;
      }

      const weekId = defaultWeek?.id || (await supabase.from("program_weeks").select("id").eq("program_id", programId).eq("week_number", 1).single()).data?.id;

      // Uppdatera alla sessions som saknar week_id
      if (weekId) {
        const { error: updateError } = await supabase
          .from("program_sessions")
          .update({ week_id: weekId })
          .eq("program_id", programId)
          .is("week_id", null);

        if (updateError) {
          console.error("Error updating sessions:", updateError);
        } else {
          // Uppdatera data
          await fetchBlocks();
          await fetchWeeks();
          await fetchSessions();
        }
      }
    } catch (err) {
      console.error("Error migrating sessions:", err);
      // Tyst fel - migration är inte kritisk
    }
  };

  const fetchProgram = async () => {
    if (!user?.id || !programId) {
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("training_programs")
        .select("id, created_by_coach_id, name, description, target_goal, target_duration_weeks, is_template, use_cycle_aware, created_at, updated_at")
        .eq("id", programId)
        .eq("created_by_coach_id", user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        throw new Error("Programmet hittades inte");
      }

      const normalizedProgram: TrainingProgram = {
        id: data.id,
        created_by_coach_id: data.created_by_coach_id,
        name: data.name,
        description: data.description,
        target_goal: data.target_goal,
        target_duration_weeks: data.target_duration_weeks,
        is_template: data.is_template || false,
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at,
      };
      setProgram(normalizedProgram);
    } catch (err) {
      console.error("Error fetching program:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta program. Försök igen senare.");
    }
  };

  const fetchBlocks = async () => {
    if (!programId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("program_blocks")
        .select("id, program_id, name, order_index, created_at")
        .eq("program_id", programId)
        .order("order_index", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const normalizedBlocks: ProgramBlock[] = (data || []).map((block) => ({
        id: block.id,
        program_id: block.program_id,
        name: block.name,
        order_index: block.order_index,
        created_at: block.created_at,
      }));
      setBlocks(normalizedBlocks);
    } catch (err) {
      console.error("Error fetching blocks:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta block. Försök igen senare.");
    }
  };

  const fetchWeeks = async () => {
    if (!programId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("program_weeks")
        .select("id, program_id, block_id, week_number, name, created_at")
        .eq("program_id", programId)
        .order("week_number", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const normalizedWeeks: ProgramWeek[] = (data || []).map((week) => ({
        id: week.id,
        program_id: week.program_id,
        block_id: week.block_id,
        week_number: week.week_number,
        name: week.name,
        created_at: week.created_at,
      }));
      setWeeks(normalizedWeeks);
    } catch (err) {
      console.error("Error fetching weeks:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta veckor. Försök igen senare.");
    }
  };

  const fetchSessions = async () => {
    if (!user?.id || !programId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Hämta pass med övningar
      const { data, error: fetchError } = await supabase
        .from("program_sessions")
        .select(`
          id,
          program_id,
          week_id,
          name,
          day_of_week,
          focus,
          created_at,
          exercises:session_exercises (
            id,
            session_id,
            exercise_id,
            order_index,
            sets_planned,
            reps_planned,
            rest_seconds,
            tempo,
            intensity_type,
            intensity_value,
            notes,
            exercise:exercises!session_exercises_exercise_id_fkey (
              id,
              name
            )
          )
        `)
        .eq("program_id", programId)
        .order("day_of_week", { ascending: true })
        .order("created_at", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      // Normalize nested relations (Supabase returns arrays)
      const normalizedSessions: ProgramSession[] = (data || []).map((session) => {
        const normalizedSession: ProgramSession = {
          id: session.id,
          program_id: session.program_id,
          week_id: session.week_id,
          name: session.name,
          day_of_week: session.day_of_week,
          focus: session.focus,
          created_at: session.created_at,
          exercises: (session.exercises || []).map((exercise) => {
            const normalizedExercise: SessionExercise = {
              id: exercise.id,
              session_id: exercise.session_id,
              exercise_id: exercise.exercise_id,
              order_index: exercise.order_index,
              sets_planned: exercise.sets_planned,
              reps_planned: exercise.reps_planned,
              rest_seconds: exercise.rest_seconds,
              tempo: exercise.tempo,
              intensity_type: exercise.intensity_type,
              intensity_value: exercise.intensity_value,
              notes: exercise.notes,
              exercise: normalizeRelation(exercise.exercise) || { id: "", name: "" },
            };
            return normalizedExercise;
          }),
        };
        return normalizedSession;
      });
      setSessions(normalizedSessions);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Kunde inte hämta pass. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableExercises = async () => {
    if (!user?.id) return;

    try {
      // Hämta globala övningar och coachens egna övningar
      const { data: globalExercises } = await supabase
        .from("exercises")
        .select("id, name, is_global, created_by_profile_id, created_at")
        .eq("is_global", true)
        .order("name", { ascending: true });

      const { data: coachExercises } = await supabase
        .from("exercises")
        .select("id, name, is_global, created_by_profile_id, created_at")
        .eq("created_by_profile_id", user.id)
        .order("name", { ascending: true });

      const allExercises = [
        ...(globalExercises || []),
        ...(coachExercises || []),
      ];

      // Ta bort dubbletter och normalisera
      const uniqueExercises: Exercise[] = allExercises
        .filter(
          (exercise, index, self) => index === self.findIndex((e) => e.id === exercise.id)
        )
        .map((exercise) => ({
          id: exercise.id,
          name: exercise.name || "",
          description: null,
          category: null,
          equipment: null,
          is_global: exercise.is_global || false,
          created_by_profile_id: exercise.created_by_profile_id || null,
          created_at: exercise.created_at || new Date().toISOString(),
        }));

      setAvailableExercises(uniqueExercises);
    } catch (err) {
      console.error("Error fetching exercises:", err);
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!blockName.trim()) {
      setError("Blockets namn är obligatoriskt.");
      return;
    }

    if (!programId) {
      setError("Programmet hittades inte.");
      return;
    }

    setCreatingBlock(true);
    setError(null);

    try {
      const nextOrderIndex = blocks.length;

      const { error: createError } = await supabase
        .from("program_blocks")
        .insert({
          program_id: programId,
          name: blockName.trim(),
          order_index: nextOrderIndex,
        });

      if (createError) {
        throw createError;
      }

      setBlockName("");
      setShowBlockForm(false);
      await fetchBlocks();
    } catch (err) {
      console.error("Error creating block:", err);
      setError(getErrorMessage(err) || "Kunde inte skapa block. Försök igen senare.");
    } finally {
      setCreatingBlock(false);
    }
  };

  const handleCreateWeek = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!weekName.trim()) {
      setError("Veckans namn är obligatoriskt.");
      return;
    }

    if (!programId) {
      setError("Programmet hittades inte.");
      return;
    }

    setCreatingWeek(true);
    setError(null);

    try {
      const { error: createError } = await supabase
        .from("program_weeks")
        .insert({
          program_id: programId,
          block_id: selectedBlockId || null,
          week_number: weekNumber,
          name: weekName.trim(),
        });

      if (createError) {
        throw createError;
      }

      setWeekName("");
      setWeekNumber(1);
      setSelectedBlockId("");
      setShowWeekForm(false);
      await fetchWeeks();
    } catch (err) {
      console.error("Error creating week:", err);
      setError(getErrorMessage(err) || "Kunde inte skapa vecka. Försök igen senare.");
    } finally {
      setCreatingWeek(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionName.trim()) {
      setError("Passets namn är obligatoriskt.");
      return;
    }

    if (!selectedWeekId) {
      setError("Välj en vecka för passet.");
      return;
    }

    if (!user?.id || !programId) {
      setError("Du måste vara inloggad för att skapa pass.");
      return;
    }

    setCreatingSession(true);
    setError(null);

    try {
      // Skapa passet
      const { data, error: createError } = await supabase
        .from("program_sessions")
        .insert({
          program_id: programId,
          week_id: selectedWeekId,
          name: sessionName.trim(),
          day_of_week: sessionDayOfWeek,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Lyckades! Nollställ formulär och uppdatera lista
      setSessionName("");
      setSelectedWeekId("");
      setSessionDayOfWeek(1);
      setShowSessionForm(false);

      // Uppdatera passlistan
      await fetchSessions();
    } catch (err) {
      console.error("Error creating session:", err);
      setError(getErrorMessage(err) || "Kunde inte skapa pass. Försök igen senare.");
    } finally {
      setCreatingSession(false);
    }
  };

  const handleAddExercise = async (sessionId: string) => {
    if (!selectedExerciseId) {
      setError("Välj en övning.");
      return;
    }

    setAddingExerciseToSession(sessionId);
    setError(null);

    try {
      // Hämta nuvarande övningar i passet för att sätta rätt order_index
      const session = sessions.find((s) => s.id === sessionId);
      const nextOrderIndex = session?.exercises?.length || 0;

      const insertData: {
        session_id: string;
        exercise_id: string;
        order_index: number;
        sets_planned: number | null;
        reps_planned: number | null;
        rest_seconds: number | null;
        tempo: string | null;
        intensity_type: "none" | "rpe" | "percent";
        intensity_value: number | null;
        notes: string | null;
      } = {
        session_id: sessionId,
        exercise_id: selectedExerciseId,
        order_index: nextOrderIndex,
        sets_planned: exerciseSets ? parseInt(exerciseSets) : null,
        reps_planned: exerciseReps ? parseInt(exerciseReps) : null,
        rest_seconds: exerciseRest ? parseInt(exerciseRest) : null,
        tempo: exerciseTempo.trim() || null,
        intensity_type: exerciseIntensityType,
        intensity_value: exerciseIntensityValue && exerciseIntensityValue.trim() ? parseFloat(exerciseIntensityValue) : null,
        notes: exerciseNotes.trim() || null,
      };

      const { error: addError } = await supabase
        .from("session_exercises")
        .insert(insertData);

      if (addError) {
        throw addError;
      }

      // Nollställ val och uppdatera lista
      setSelectedExerciseId("");
      setExerciseSets("3");
      setExerciseReps("10");
      setExerciseRest("60");
      setExerciseTempo("");
      setExerciseIntensityType("none");
      setExerciseIntensityValue("");
      setExerciseNotes("");
      setAddingExerciseToSession(null);
      await fetchSessions();
    } catch (err) {
      console.error("Error adding exercise:", err);
      setError(getErrorMessage(err) || "Kunde inte lägga till övning. Försök igen senare.");
      setAddingExerciseToSession(null);
    }
  };

  const handleStartAddExercise = async (sessionId: string) => {
    setAddingExerciseToSession(sessionId);
    setSelectedExerciseId("");
    setExerciseSets("3");
    setExerciseReps("10");
    setExerciseRest("60");
    setExerciseTempo("");
    setExerciseIntensityType("none");
    setExerciseIntensityValue("");
    setExerciseNotes("");
    await fetchAvailableExercises();
  };

  const handleCancelAddExercise = () => {
    setAddingExerciseToSession(null);
    setSelectedExerciseId("");
  };

  const fetchClients = async () => {
    if (!user?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("clients")
        .select(`
          id,
          profile_id,
          primary_coach_id,
          created_at,
          profile:profiles!clients_profile_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq("primary_coach_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const normalizedClients: Client[] = (data || []).map((client) => {
        const profile = normalizeRelation(client.profile);
        return {
          id: client.id,
          profile_id: client.profile_id,
          primary_coach_id: client.primary_coach_id,
          created_at: client.created_at,
          profile: profile ? {
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email || null,
          } : null,
        };
      });
      setClients(normalizedClients);
    } catch (err) {
      console.error("Error fetching clients:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  const fetchGroups = async () => {
    if (!user?.id) return;

    try {
      // Hämta organisation för coachen
      const { data: orgData } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_profile_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!orgData) return;

      const { data, error: fetchError } = await supabase
        .from("client_groups")
        .select(`
          id,
          name,
          description,
          created_at
        `)
        .eq("organization_id", orgData.id)
        .eq("created_by_coach_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const normalizedGroups: ClientGroup[] = (data || []).map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        organization_id: orgData.id,
        created_by_coach_id: user.id,
        created_at: group.created_at || new Date().toISOString(),
      }));
      setGroups(normalizedGroups);
    } catch (err) {
      console.error("Error fetching groups:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  const fetchActiveAssignments = async () => {
    if (!programId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("client_program_assignments")
        .select(`
          id,
          client_id,
          program_id,
          start_date,
          is_active,
          created_at,
          client:clients!client_program_assignments_client_id_fkey (
            id,
            profile:profiles!clients_profile_id_fkey (
              id,
              full_name,
              email
            )
          )
        `)
        .eq("program_id", programId)
        .eq("is_active", true);

      if (fetchError) {
        throw fetchError;
      }

      const normalizedAssignments: ProgramAssignment[] = (data || []).map((assignment) => {
        const client = normalizeRelation(assignment.client);
        const profile = client ? normalizeRelation(client.profile) : null;
        return {
          id: assignment.id,
          client_id: assignment.client_id,
          program_id: assignment.program_id,
          start_date: assignment.start_date,
          is_active: assignment.is_active,
          created_at: assignment.created_at || new Date().toISOString(),
          client: client ? {
            id: client.id,
            profile_id: profile?.id || "",
            primary_coach_id: "",
            created_at: "",
            profile: profile ? {
              id: profile.id,
              full_name: profile.full_name,
              email: profile.email || null,
            } : null,
          } : undefined,
        };
      });
      setActiveAssignments(normalizedAssignments);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  const fetchActiveGroupAssignments = async () => {
    if (!programId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("group_program_assignments")
        .select(`
          id,
          group_id,
          program_id,
          start_date,
          created_at,
          group:client_groups!group_program_assignments_group_id_fkey (
            id,
            name,
            description,
            created_at
          )
        `)
        .eq("program_id", programId);

      if (fetchError) {
        throw fetchError;
      }

      const normalizedGroupAssignments: GroupProgramAssignment[] = (data || []).map((assignment) => {
        const group = normalizeRelation(assignment.group);
        return {
          id: assignment.id,
          group_id: assignment.group_id,
          program_id: assignment.program_id,
          start_date: assignment.start_date,
          is_active: true,
          created_at: assignment.created_at || new Date().toISOString(),
          group: group ? {
            id: group.id,
            name: group.name,
            description: group.description || null,
            organization_id: "",
            created_by_coach_id: "",
            created_at: group.created_at || new Date().toISOString(),
          } : undefined,
        };
      });
      setActiveGroupAssignments(normalizedGroupAssignments);
    } catch (err) {
      console.error("Error fetching active group assignments:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  // Hämta cycle-data (period start + manuell fas) för alla assignments
  const fetchAssignmentCycleData = async () => {
    if (activeAssignments.length === 0) return;

    const clientIds = activeAssignments.map((a) => a.client_id);
    const cycleDataMap = new Map<string, { periodStart: string | null; manualPhase: string | null }>();

    try {
      // Hämta senaste period start för varje klient
      const { data: periodStarts } = await supabase
        .from("cycle_events")
        .select("client_id, date")
        .eq("event_type", "period_start")
        .in("client_id", clientIds)
        .order("date", { ascending: false });

      // Gruppera per klient och ta senaste
      const latestPeriodStartByClient = new Map<string, string>();
      periodStarts?.forEach((event) => {
        if (!latestPeriodStartByClient.has(event.client_id)) {
          latestPeriodStartByClient.set(event.client_id, event.date);
        }
      });

      // Hämta manuella fas-justeringar för idag
      const today = new Date().toISOString().split("T")[0];
      const { data: manualPhases } = await supabase
        .from("cycle_phases")
        .select("client_id, phase")
        .in("client_id", clientIds)
        .eq("date", today)
        .in("source", ["client", "coach"]);

      const manualPhaseByClient = new Map<string, string>();
      manualPhases?.forEach((phase) => {
        manualPhaseByClient.set(phase.client_id, phase.phase);
      });

      // Kombinera data
      clientIds.forEach((clientId) => {
        cycleDataMap.set(clientId, {
          periodStart: latestPeriodStartByClient.get(clientId) || null,
          manualPhase: manualPhaseByClient.get(clientId) || null,
        });
      });

      setAssignmentCycleData(cycleDataMap);
    } catch (err) {
      console.error("Error fetching cycle data:", err);
      // Tyst fel - det är okej om detta misslyckas
    }
  };

  const handleAssignProgram = async (e: React.FormEvent) => {
    e.preventDefault();

    if (assignmentType === "client" && !selectedClientId) {
      setError("Välj en klient.");
      return;
    }

    if (assignmentType === "group" && !selectedGroupId) {
      setError("Välj en grupp.");
      return;
    }

    if (!programId) {
      setError("Programmet hittades inte.");
      return;
    }

    setAssigningProgram(true);
    setError(null);

    try {
      if (assignmentType === "client") {
        // Tilldela till enskild klient
        // Om klienten redan har ett aktivt program, markera det som inaktiv
        const { data: existingAssignments } = await supabase
          .from("client_program_assignments")
          .select("id")
          .eq("client_id", selectedClientId)
          .eq("is_active", true);

        if (existingAssignments && existingAssignments.length > 0) {
          const { error: updateError } = await supabase
            .from("client_program_assignments")
            .update({ is_active: false })
            .in("id", existingAssignments.map((a) => a.id));

          if (updateError) throw updateError;
        }

        const { error: assignError } = await supabase
          .from("client_program_assignments")
          .insert({
            client_id: selectedClientId,
            program_id: programId,
            start_date: startDate,
            is_active: true,
          });

        if (assignError) throw assignError;

        await fetchActiveAssignments();
      } else {
        // Tilldela till grupp
        // Skapa group assignment
        const { error: groupAssignError } = await supabase
          .from("group_program_assignments")
          .insert({
            group_id: selectedGroupId,
            program_id: programId,
            start_date: startDate,
          });

        if (groupAssignError) throw groupAssignError;

        // Hämta alla medlemmar i gruppen
        const { data: members, error: membersError } = await supabase
          .from("client_group_members")
          .select("client_id")
          .eq("group_id", selectedGroupId)
          .is("left_at", null);

        if (membersError) throw membersError;

        // Skapa client assignments för alla medlemmar
        if (members && members.length > 0) {
          const clientAssignments = members.map((member) => ({
            client_id: member.client_id,
            program_id: programId,
            start_date: startDate,
            is_active: true,
          }));

          // Markera befintliga aktiva assignments som inaktiva för dessa klienter
          const clientIds = members.map((m) => m.client_id);
          const { data: existingAssignments } = await supabase
            .from("client_program_assignments")
            .select("id")
            .in("client_id", clientIds)
            .eq("is_active", true);

          if (existingAssignments && existingAssignments.length > 0) {
            const { error: updateError } = await supabase
              .from("client_program_assignments")
              .update({ is_active: false })
              .in("id", existingAssignments.map((a) => a.id));

            if (updateError) throw updateError;
          }

          // Skapa nya assignments
          const { error: bulkAssignError } = await supabase
            .from("client_program_assignments")
            .insert(clientAssignments);

          if (bulkAssignError) throw bulkAssignError;
        }

        await fetchActiveGroupAssignments();
        await fetchActiveAssignments();
      }

      // Lyckades! Nollställ formulär
      setSelectedClientId("");
      setSelectedGroupId("");
      setStartDate(new Date().toISOString().split("T")[0]);
      setShowAssignForm(false);
    } catch (err) {
      console.error("Error assigning program:", err);
      setError(getErrorMessage(err) || "Kunde inte tilldela program. Försök igen senare.");
    } finally {
      setAssigningProgram(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Programdetaljer</h1>
        <p className="text-gray-600">Laddar program...</p>
      </div>
    );
  }

  if (error && !program) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Programdetaljer</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
        <button
          onClick={() => router.push("/coach/programs")}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Tillbaka till program
        </button>
      </div>
    );
  }

  if (!program) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Programdetaljer</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-2">Programmet hittades inte</p>
          <button
            onClick={() => router.push("/coach/programs")}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Tillbaka till program
          </button>
        </div>
      </div>
    );
  }

  // Organisera data: weeks per block, sessions per week
  const weeksByBlock = new Map<string, ProgramWeek[]>();
  const sessionsByWeek = new Map<string, ProgramSession[]>();
  
  // Lägg till weeks utan block (direkt under program)
  const weeksWithoutBlock = weeks.filter(w => !w.block_id);
  if (weeksWithoutBlock.length > 0) {
    weeksByBlock.set("no-block", weeksWithoutBlock);
  }
  
  // Lägg till weeks per block
  blocks.forEach(block => {
    const blockWeeks = weeks.filter(w => w.block_id === block.id);
    if (blockWeeks.length > 0) {
      weeksByBlock.set(block.id, blockWeeks);
    }
  });
  
  // Lägg till sessions per week
  sessions.forEach(session => {
    if (!sessionsByWeek.has(session.week_id)) {
      sessionsByWeek.set(session.week_id, []);
    }
    sessionsByWeek.get(session.week_id)!.push(session);
  });

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => router.push("/coach/programs")}
          className="text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          ← Tillbaka till program
        </button>
      </div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">{program.name}</h1>
        {!showBlockForm && !showWeekForm && !showSessionForm && !showAssignForm && (
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => setShowSessionForm(true)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Skapa pass
            </button>
            <button
              onClick={() => setShowWeekForm(true)}
              className="text-gray-600 hover:text-gray-800 underline"
            >
              Skapa vecka
            </button>
            <button
              onClick={() => setShowBlockForm(true)}
              className="text-gray-600 hover:text-gray-800 underline"
            >
              Skapa block
            </button>
            <button
              onClick={() => setShowAssignForm(true)}
              className="text-gray-600 hover:text-gray-800 underline"
            >
              Tilldela till klient
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Aktiva tilldelningar */}
      {(activeAssignments.length > 0 || activeGroupAssignments.length > 0) && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-green-900 mb-2">
            Aktiva tilldelningar
          </h2>
          <div className="space-y-2">
            {activeAssignments.map((assignment) => (
              <div key={assignment.id} className="text-sm text-green-800">
                <span className="font-medium">
                  {assignment.client?.profile?.full_name || "Okänd klient"}
                </span>
                {" - Start: "}
                {new Date(assignment.start_date).toLocaleDateString("sv-SE")}
              </div>
            ))}
            {activeGroupAssignments.map((assignment) => (
              <div key={assignment.id} className="text-sm text-green-800">
                <span className="font-medium">
                  Grupp: {assignment.group?.name || "Okänd grupp"}
                </span>
                {" - Start: "}
                {new Date(assignment.start_date).toLocaleDateString("sv-SE")}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tilldela program-formulär */}
      {showAssignForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Tilldela program</h2>
          <form onSubmit={handleAssignProgram} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tilldela till
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="client"
                    checked={assignmentType === "client"}
                    onChange={(e) => setAssignmentType(e.target.value as "client" | "group")}
                    disabled={assigningProgram}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Enskild klient</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="group"
                    checked={assignmentType === "group"}
                    onChange={(e) => setAssignmentType(e.target.value as "client" | "group")}
                    disabled={assigningProgram}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Grupp</span>
                </label>
              </div>
            </div>

            {assignmentType === "client" ? (
              <div>
                <label
                  htmlFor="client-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Klient <span className="text-red-500">*</span>
                </label>
                <select
                  id="client-select"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  required
                  disabled={assigningProgram}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">-- Välj klient --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.profile?.full_name || "Namnlös klient"}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="group-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Grupp <span className="text-red-500">*</span>
                </label>
                <select
                  id="group-select"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  required
                  disabled={assigningProgram}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">-- Välj grupp --</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label
                htmlFor="start-date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Startdatum <span className="text-red-500">*</span>
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                disabled={assigningProgram}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={assigningProgram}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {assigningProgram ? "Tilldelar..." : "Tilldela program"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAssignForm(false);
                  setSelectedClientId("");
                  setSelectedGroupId("");
                  setAssignmentType("client");
                  setStartDate(new Date().toISOString().split("T")[0]);
                  setError(null);
                }}
                disabled={assigningProgram}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Skapa block-formulär */}
      {showBlockForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Skapa nytt block</h2>
          <form onSubmit={handleCreateBlock} className="space-y-4">
            <div>
              <label
                htmlFor="block-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Namn <span className="text-red-500">*</span>
              </label>
              <input
                id="block-name"
                type="text"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                required
                disabled={creatingBlock}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Block 1"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creatingBlock}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {creatingBlock ? "Skapar..." : "Skapa block"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBlockForm(false);
                  setBlockName("");
                  setError(null);
                }}
                disabled={creatingBlock}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Skapa vecka-formulär */}
      {showWeekForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Skapa ny vecka</h2>
          <form onSubmit={handleCreateWeek} className="space-y-4">
            <div>
              <label
                htmlFor="week-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Namn <span className="text-red-500">*</span>
              </label>
              <input
                id="week-name"
                type="text"
                value={weekName}
                onChange={(e) => setWeekName(e.target.value)}
                required
                disabled={creatingWeek}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Vecka 1"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="week-number"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Veckonummer <span className="text-red-500">*</span>
              </label>
              <input
                id="week-number"
                type="number"
                min="1"
                value={weekNumber}
                onChange={(e) => setWeekNumber(parseInt(e.target.value) || 1)}
                required
                disabled={creatingWeek}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="week-block"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Block (valfritt)
              </label>
              <select
                id="week-block"
                value={selectedBlockId}
                onChange={(e) => setSelectedBlockId(e.target.value)}
                disabled={creatingWeek}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Ingen block (direkt under program) --</option>
                {blocks.map((block) => (
                  <option key={block.id} value={block.id}>
                    {block.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creatingWeek}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {creatingWeek ? "Skapar..." : "Skapa vecka"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowWeekForm(false);
                  setWeekName("");
                  setWeekNumber(1);
                  setSelectedBlockId("");
                  setError(null);
                }}
                disabled={creatingWeek}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      {showSessionForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Skapa nytt pass</h2>
          <form onSubmit={handleCreateSession} className="space-y-4">
            <div>
              <label
                htmlFor="session-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Namn <span className="text-red-500">*</span>
              </label>
              <input
                id="session-name"
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                required
                disabled={creatingSession}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Pass A"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="session-week"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Vecka <span className="text-red-500">*</span>
              </label>
              <select
                id="session-week"
                value={selectedWeekId}
                onChange={(e) => setSelectedWeekId(e.target.value)}
                required
                disabled={creatingSession}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Välj vecka --</option>
                {weeks.map((week) => (
                  <option key={week.id} value={week.id}>
                    {week.name || `Vecka ${week.week_number}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="session-day"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Veckodag <span className="text-red-500">*</span>
              </label>
              <select
                id="session-day"
                value={sessionDayOfWeek}
                onChange={(e) => setSessionDayOfWeek(parseInt(e.target.value))}
                required
                disabled={creatingSession}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value={1}>Måndag</option>
                <option value={2}>Tisdag</option>
                <option value={3}>Onsdag</option>
                <option value={4}>Torsdag</option>
                <option value={5}>Fredag</option>
                <option value={6}>Lördag</option>
                <option value={7}>Söndag</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creatingSession}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {creatingSession ? "Skapar..." : "Skapa pass"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSessionForm(false);
                  setSessionName("");
                  setSelectedWeekId("");
                  setSessionDayOfWeek(1);
                  setError(null);
                }}
                disabled={creatingSession}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cycle-aware info */}
      {activeAssignments.length > 0 && assignmentCycleData.size > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Cykel-färgkodning:</span> Passen är färgkodade baserat på första tilldelade klientens cykelfas. 
            {activeAssignments.length > 1 && (
              <span className="ml-1">(Programmet är tilldelat till {activeAssignments.length} klienter)</span>
            )}
          </p>
        </div>
      )}

      {/* Programstruktur: Blocks → Weeks → Sessions */}
      {blocks.length === 0 && weeks.length === 0 && sessions.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 font-medium mb-2">Ingen programstruktur ännu</p>
          <p className="text-sm text-gray-500 mb-4">
            Skapa block och veckor för att organisera ditt program, eller skapa en vecka direkt för att börja lägga till pass.
          </p>
          <p className="text-sm font-medium text-gray-700 mb-3">Vad gör jag nu?</p>
          <div className="flex gap-3 justify-center">
            {!showBlockForm && !showWeekForm && !showSessionForm && (
              <>
                <button
                  onClick={() => setShowBlockForm(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                >
                  Skapa block
                </button>
                <button
                  onClick={() => setShowWeekForm(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                  Skapa vecka
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Blocks med weeks */}
          {Array.from(weeksByBlock.entries()).map(([blockId, blockWeeks]) => {
            const block = blockId !== "no-block" ? blocks.find(b => b.id === blockId) : null;
            return (
              <div key={blockId} className="bg-white border border-gray-200 rounded-lg p-6">
                {block && (
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{block.name}</h2>
                )}
                {!block && (
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Veckor (direkt under program)</h2>
                )}
                
                <div className="space-y-4 ml-4">
                  {blockWeeks.map((week) => {
                    const weekSessions = sessionsByWeek.get(week.id) || [];
                    return (
                      <div key={week.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">
                          {week.name || `Vecka ${week.week_number}`}
                        </h3>
                        
                        {weekSessions.length === 0 ? (
                          <div className="bg-white border border-gray-200 rounded-md p-4 text-center">
                            <p className="text-sm text-gray-600 mb-2">Inga pass i denna vecka ännu</p>
                            {!showSessionForm && (
                              <button
                                onClick={() => {
                                  setSelectedWeekId(week.id);
                                  setShowSessionForm(true);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                Lägg till pass
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {weekSessions
                              .sort((a, b) => a.day_of_week - b.day_of_week)
                              .map((session) => {
                                // Beräkna fas för denna session (baserat på första assignment)
                                let sessionPhaseInfo: {
                                  phase: string;
                                  phaseEnum: string | null;
                                  cycleDay: number;
                                  suggestion: { message: string; type: "info" | "warning" | "success" } | null;
                                } | null = null;

                                if (activeAssignments.length > 0) {
                                  const firstAssignment = activeAssignments[0];
                                  const cycleData = assignmentCycleData.get(firstAssignment.client_id);
                                  
                                  if (cycleData?.periodStart) {
                                    // Beräkna datum för denna session
                                    const sessionDate = calculateSessionDate(
                                      firstAssignment.start_date,
                                      week.week_number,
                                      session.day_of_week
                                    );
                                    
                                    // Beräkna fas
                                    const phaseInfo = calculatePhaseForDate(cycleData.periodStart, sessionDate);
                                    
                                    if (phaseInfo) {
                                      // Använd manuell fas endast om sessionen är idag, annars använd beräknad
                                      const today = new Date();
                                      today.setHours(0, 0, 0, 0);
                                      const isToday = sessionDate.getTime() === today.getTime();
                                      
                                      const finalPhase = isToday && cycleData.manualPhase && cycleData.manualPhase !== "unknown"
                                        ? cycleData.manualPhase
                                        : phaseInfo.phaseEnum;

                                      const phaseMap: Record<string, { name: string; enum: string }> = {
                                        menstruation: { name: "Mens", enum: "menstruation" },
                                        follicular: { name: "Follikulär", enum: "follicular" },
                                        ovulation: { name: "Ägglossning", enum: "ovulation" },
                                        luteal: { name: "Luteal", enum: "luteal" },
                                      };

                                      const finalPhaseInfo = phaseMap[finalPhase || ""] || phaseInfo;
                                      
                                      const isHeavy = isHeavySession(session.exercises || []);
                                      const suggestion = getPhaseSuggestion(finalPhaseInfo?.enum || null, isHeavy);

                                      sessionPhaseInfo = {
                                        phase: finalPhaseInfo?.name || phaseInfo.phase,
                                        phaseEnum: finalPhaseInfo?.enum || phaseInfo.phaseEnum,
                                        cycleDay: phaseInfo.cycleDay,
                                        suggestion,
                                      };
                                    }
                                  }
                                }

                                return (
                                <div
                                  key={session.id}
                                  className={`bg-white border-2 rounded-md p-4 ${
                                    sessionPhaseInfo
                                      ? getPhaseColor(sessionPhaseInfo.phaseEnum)
                                      : "border-gray-200"
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-base font-semibold text-gray-900">
                                          {session.name}
                                        </h4>
                                        {sessionPhaseInfo && (
                                          <button
                                            onClick={() => {
                                              const firstAssignment = activeAssignments[0];
                                              const cycleData = assignmentCycleData.get(firstAssignment?.client_id);
                                              const client = clients.find((c) => c.id === firstAssignment?.client_id);
                                              setSelectedCycleInfo({
                                                phase: sessionPhaseInfo.phase,
                                                phaseEnum: sessionPhaseInfo.phaseEnum,
                                                cycleDay: sessionPhaseInfo.cycleDay,
                                                clientId: firstAssignment?.client_id || "",
                                                clientName: client?.profile?.full_name || "Okänd klient",
                                                periodStart: cycleData?.periodStart || null,
                                                suggestion: sessionPhaseInfo.suggestion,
                                              });
                                              setCycleDrawerOpen(true);
                                            }}
                                            className="text-xs px-2 py-0.5 bg-white/70 rounded-full font-medium hover:bg-white cursor-pointer transition-colors"
                                            title="Klicka för mer information"
                                          >
                                            {sessionPhaseInfo.phase}
                                          </button>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {["", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"][session.day_of_week]}
                                      </p>
                                      {session.focus && (
                                        <p className="text-sm text-gray-600 mt-1">{session.focus}</p>
                                      )}
                                      {sessionPhaseInfo?.suggestion && (
                                        <div
                                          className={`mt-2 p-2 rounded-md text-xs ${
                                            sessionPhaseInfo.suggestion.type === "warning"
                                              ? "bg-orange-50 border border-orange-200 text-orange-800"
                                              : sessionPhaseInfo.suggestion.type === "success"
                                              ? "bg-green-50 border border-green-200 text-green-800"
                                              : "bg-blue-50 border border-blue-200 text-blue-800"
                                          }`}
                                        >
                                          {sessionPhaseInfo.suggestion.message}
                                        </div>
                                      )}
                                    </div>
                                    {addingExerciseToSession !== session.id && (
                                      <button
                                        onClick={() => handleStartAddExercise(session.id)}
                                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                      >
                                        Lägg till övning
                                      </button>
                                    )}
                                  </div>

                                  {addingExerciseToSession === session.id && (
                                    <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-md space-y-3">
                                      <div>
                                        <label
                                          htmlFor={`exercise-select-${session.id}`}
                                          className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                          Välj övning
                                        </label>
                                        <select
                                          id={`exercise-select-${session.id}`}
                                          value={selectedExerciseId}
                                          onChange={(e) => setSelectedExerciseId(e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                          <option value="">-- Välj övning --</option>
                                          {availableExercises.map((exercise) => (
                                            <option key={exercise.id} value={exercise.id}>
                                              {exercise.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      <div className="grid grid-cols-3 gap-3">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">Sets</label>
                                          <input
                                            type="number"
                                            min="1"
                                            value={exerciseSets}
                                            onChange={(e) => setExerciseSets(e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                                            placeholder="3"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">Reps</label>
                                          <input
                                            type="number"
                                            min="1"
                                            value={exerciseReps}
                                            onChange={(e) => setExerciseReps(e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                                            placeholder="10"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">Vila (s)</label>
                                          <input
                                            type="number"
                                            min="0"
                                            value={exerciseRest}
                                            onChange={(e) => setExerciseRest(e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                                            placeholder="60"
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Tempo (valfritt)</label>
                                        <input
                                          type="text"
                                          value={exerciseTempo}
                                          onChange={(e) => setExerciseTempo(e.target.value)}
                                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                                          placeholder="t.ex. 2-0-1-0"
                                        />
                                      </div>

                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">Intensitetstyp</label>
                                          <select
                                            value={exerciseIntensityType}
                                            onChange={(e) => setExerciseIntensityType(e.target.value as "none" | "rpe" | "percent")}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                                          >
                                            <option value="none">Ingen</option>
                                            <option value="rpe">RPE</option>
                                            <option value="percent">% av 1RM</option>
                                          </select>
                                        </div>
                                        {exerciseIntensityType !== "none" && (
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              {exerciseIntensityType === "rpe" ? "RPE-värde" : "% av 1RM"}
                                            </label>
                                            <input
                                              type="number"
                                              min="0"
                                              max={exerciseIntensityType === "rpe" ? "10" : "100"}
                                              step={exerciseIntensityType === "rpe" ? "0.5" : "1"}
                                              value={exerciseIntensityValue}
                                              onChange={(e) => setExerciseIntensityValue(e.target.value)}
                                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                                              placeholder={exerciseIntensityType === "rpe" ? "7" : "75"}
                                            />
                                          </div>
                                        )}
                                      </div>

                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Coach-anteckningar (valfritt)</label>
                                        <textarea
                                          value={exerciseNotes}
                                          onChange={(e) => setExerciseNotes(e.target.value)}
                                          rows={2}
                                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                                          placeholder="Tekniska tips, cues, etc."
                                        />
                                      </div>

                                      <div className="flex gap-3">
                                        <button
                                          onClick={() => handleAddExercise(session.id)}
                                          disabled={!selectedExerciseId || addingExerciseToSession !== session.id}
                                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                          Lägg till
                                        </button>
                                        <button
                                          onClick={handleCancelAddExercise}
                                          className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                        >
                                          Avbryt
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {session.exercises && Array.isArray(session.exercises) && session.exercises.length > 0 ? (
                                    <div className="space-y-2">
                                      {session.exercises
                                        .sort((a, b) => a.order_index - b.order_index)
                                        .map((exercise) => (
                                          <div
                                            key={exercise.id}
                                            className="p-3 bg-gray-50 rounded-md"
                                          >
                                            <p className="text-sm font-medium text-gray-900">
                                              {exercise.exercise?.name || "Okänd övning"}
                                            </p>
                                            <div className="text-xs text-gray-600 mt-1 space-y-1">
                                              {exercise.sets_planned && exercise.reps_planned && (
                                                <div>
                                                  {exercise.sets_planned} x {exercise.reps_planned}
                                                  {exercise.rest_seconds && ` • ${exercise.rest_seconds}s vila`}
                                                </div>
                                              )}
                                              {exercise.tempo && (
                                                <div>Tempo: {exercise.tempo}</div>
                                              )}
                                              {exercise.intensity_type !== "none" && exercise.intensity_value && (
                                                <div>
                                                  {exercise.intensity_type === "rpe" 
                                                    ? `RPE: ${exercise.intensity_value}`
                                                    : `${exercise.intensity_value}% av 1RM`}
                                                </div>
                                              )}
                                              {exercise.notes && (
                                                <div className="text-gray-500 italic mt-1">{exercise.notes}</div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                                      <p className="text-sm text-gray-600 font-medium mb-1">Inga övningar i detta pass ännu</p>
                                      <p className="text-xs text-gray-500 mb-3">
                                        Lägg till övningar för att klienten ska veta vad som ska tränas.
                                      </p>
                                      {!addingExerciseToSession && (
                                        <button
                                          onClick={() => handleStartAddExercise(session.id)}
                                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                                        >
                                          Lägg till övning
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cycle Detail Drawer */}
      <Drawer open={cycleDrawerOpen} onOpenChange={setCycleDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Cykelinformation</DrawerTitle>
            <DrawerDescription>
              Cykeldata för {selectedCycleInfo?.clientName || "klient"}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-6 space-y-4">
            {selectedCycleInfo && (
              <>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[#5A6B5D]/70 mb-1">Cykelfas</p>
                    <p className="text-lg font-semibold text-[#5A6B5D]">
                      {selectedCycleInfo.phase}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5A6B5D]/70 mb-1">Cykeldag</p>
                    <p className="text-base text-[#5A6B5D]">
                      Dag {selectedCycleInfo.cycleDay}
                    </p>
                  </div>
                  {selectedCycleInfo.periodStart && (
                    <div>
                      <p className="text-sm text-[#5A6B5D]/70 mb-1">Senaste mensstart</p>
                      <p className="text-base text-[#5A6B5D]">
                        {new Date(selectedCycleInfo.periodStart).toLocaleDateString("sv-SE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                  {selectedCycleInfo.suggestion && (
                    <div
                      className={`p-3 rounded-card text-sm ${
                        selectedCycleInfo.suggestion.type === "warning"
                          ? "bg-orange-50 border border-orange-200 text-orange-800"
                          : selectedCycleInfo.suggestion.type === "success"
                          ? "bg-green-50 border border-green-200 text-green-800"
                          : "bg-blue-50 border border-blue-200 text-blue-800"
                      }`}
                    >
                      <p className="font-medium mb-1">Rekommendation</p>
                      <p>{selectedCycleInfo.suggestion.message}</p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-[rgba(232,229,224,0.4)]">
                  <button
                    onClick={() => {
                      if (selectedCycleInfo.clientId) {
                        router.push(`/coach/clients/${selectedCycleInfo.clientId}`);
                      }
                    }}
                    className="w-full px-4 py-2 text-sm font-medium text-[#8B6F47] border border-[rgba(232,229,224,0.4)] rounded-card hover:bg-[#FEFCF8]/80 transition-colors"
                  >
                    Visa klientprofil →
                  </button>
                </div>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
