"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { getLocalDateString } from "@/lib/utils/date";
import { toast } from "@/lib/utils/toast";
import { ReadinessLogging } from "@/components/ui/ReadinessLogging";
import { Card } from "@/components/ui/Card";
import { useClientDashboard } from "./hooks/useClientDashboard";
import { HeroSection } from "./sections/HeroSection";
import { StatusCards } from "./sections/StatusCards";
import { OnboardingSection } from "./sections/OnboardingSection";
import { TipsSection } from "./sections/TipsSection";
import { DASHBOARD_COPY } from "./copy";
import type { ProgramSession } from "./domain/types";

export default function ClientDashboard() {
  const router = useRouter();
  const {
    clientId,
    clientName,
    assignment,
    sessions,
    readiness,
    cycleStatus,
    onboardingTasks,
    onboardingLoaded,
    loading,
    error,
    refetchReadiness,
    refetchSessions,
  } = useClientDashboard();

  const [startingSession, setStartingSession] = useState<string | null>(null);
  const [readinessDrawerOpen, setReadinessDrawerOpen] = useState(false);

  // Calculate today's session
  const today = getLocalDateString();
  const todaySession: ProgramSession | null =
    assignment && sessions.length > 0
      ? sessions.find((s) => s.workoutLog && s.workoutLog.date === today) || null
      : null;
  const nextSession: ProgramSession | null =
    assignment && sessions.length > 0
      ? sessions.find((s) => !s.workoutLog || s.workoutLog.date !== today) || null
      : null;
  const displaySession: ProgramSession | null =
    todaySession || nextSession || (sessions.length > 0 ? sessions[0] : null);
  const hasReadiness = Boolean(readiness.energy_level && readiness.sleep_quality);

  const handleStartSession = async (sessionId: string) => {
    if (!clientId) {
      toast.error("Klient-ID saknas", DASHBOARD_COPY.errors.noClientId);
      return;
    }

    setStartingSession(sessionId);

    try {
      const today = getLocalDateString();

      const { error: createError } = await supabase.from("workout_sessions_log").insert({
        client_id: clientId,
        program_session_id: sessionId,
        date: today,
        status: "påbörjad",
      });

      if (createError) {
        throw createError;
      }

      await refetchSessions();
      setStartingSession(null);
      router.push(`/client/workouts?session=${sessionId}`);
    } catch (err) {
      console.error("Error starting session:", err);
      const errorMessage = getErrorMessage(err) || DASHBOARD_COPY.errors.cannotStartSession;
      toast.error("Kunde inte starta pass", errorMessage);
      setStartingSession(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#5A6B5D]">
        <p className="text-[#FEFCF8]/70">{DASHBOARD_COPY.loading}</p>
      </div>
    );
  }

  if (error && !clientId) {
    return (
      <div className="min-h-screen bg-sage p-6">
        <div className="max-w-[480px] mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-cream">Klient – Dashboard</h1>
          <Card>
            <p className="text-sm text-accent">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
      <div className="max-w-[480px] mx-auto px-5 py-8 space-y-6">
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-4xl font-the-seasons font-bold text-[#FEFCF8] mb-3 leading-tight">
            {DASHBOARD_COPY.greeting.title(clientName)}
          </h1>
          <p className="text-sm text-[#FEFCF8]/70">{DASHBOARD_COPY.greeting.subtitle}</p>
        </div>

        {/* Hero Section */}
        <HeroSection
          displaySession={displaySession}
          todaySession={todaySession}
          hasReadiness={hasReadiness}
          onStartSession={handleStartSession}
          onLogReadiness={() => setReadinessDrawerOpen(true)}
          startingSession={startingSession}
        />

        {/* Status Cards */}
        <StatusCards
          displaySession={displaySession}
          assignment={assignment}
          readiness={readiness}
          cycleStatus={cycleStatus}
          onUpdateReadiness={() => setReadinessDrawerOpen(true)}
        />

        {/* Tips Section */}
        <TipsSection currentPhase={cycleStatus?.phaseEnum as any} />

        {/* Onboarding Section */}
        {onboardingLoaded && (
          <OnboardingSection
            tasks={onboardingTasks}
            displaySession={displaySession}
            onStartSession={handleStartSession}
            onLogReadiness={() => setReadinessDrawerOpen(true)}
          />
        )}

        {/* Error messages */}
        {error && (
          <Card>
            <p className="text-sm text-[#8B6F47]">{error}</p>
          </Card>
        )}
      </div>

      {/* Readiness Logging Drawer */}
      {clientId && (
        <ReadinessLogging
          clientId={clientId}
          open={readinessDrawerOpen}
          onOpenChange={setReadinessDrawerOpen}
          onSave={() => {
            refetchReadiness();
            toast.success(DASHBOARD_COPY.success.readinessSaved);
          }}
          initialValues={{
            sleep_quality: readiness.sleep_quality ? parseInt(readiness.sleep_quality) : null,
            energy_level: readiness.energy_level ? parseInt(readiness.energy_level) : null,
            stress_level: readiness.stress_level ? parseInt(readiness.stress_level) : null,
            soreness: readiness.soreness ? parseInt(readiness.soreness) : null,
            notes: null,
          }}
        />
      )}
    </div>
  );
}
