"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { normalizeRelation } from "@/lib/types/supabase";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent, Chip } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CycleIndicator } from "@/components/ui/CycleIndicator";
import { calculateCyclePhase, getCycleColorClasses } from "@/lib/utils/cycleColors";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/Drawer";
import { Dumbbell, Calendar as CalendarIcon } from "lucide-react";

interface DayData {
  date: Date;
  dayOfWeek: number;
  dayName: string;
  sessions: SessionData[];
  readiness: ReadinessData | null;
  cyclePhase: "menstruation" | "follicular" | "ovulation" | "luteal" | null;
}

interface SessionData {
  id: string;
  name: string;
  day_of_week: number;
  workoutLog?: {
    id: string;
    status: string;
    date: string;
  } | null;
}

interface ReadinessData {
  sleep_quality: number | null;
  energy_level: number | null;
  stress_level: number | null;
  soreness: number | null;
}

export default function ClientCalendar() {
  const { user, loading: authLoading } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [latestPeriodStart, setLatestPeriodStart] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchClientId();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (clientId) {
      fetchLatestPeriodStart();
      fetchWeekData();
    }
  }, [clientId, currentWeek]);

  const fetchClientId = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("clients")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setClientId(data.id);
    } catch (err) {
      console.error("Error fetching client ID:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta klientinformation.");
      setLoading(false);
    }
  };

  const fetchLatestPeriodStart = async () => {
    if (!clientId) return;

    try {
      const { data, error } = await supabase
        .from("cycle_events")
        .select("date")
        .eq("client_id", clientId)
        .eq("event_type", "period_start")
        .order("date", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setLatestPeriodStart(data?.date || null);
    } catch (err) {
      console.error("Error fetching period start:", err);
      setLatestPeriodStart(null);
    }
  };

  const fetchWeekData = async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Beräkna veckans start (måndag)
      const weekStart = new Date(currentWeek);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Måndag
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);

      // Skapa array med 7 dagar
      const days: DayData[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        date.setHours(0, 0, 0, 0);

        const dayNames = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"];
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // 1-7 (måndag-söndag)

        days.push({
          date,
          dayOfWeek,
          dayName: dayNames[date.getDay()],
          sessions: [],
          readiness: null,
          cyclePhase: null,
        });
      }

      // Hämta aktivt program
      const { data: assignment } = await supabase
        .from("client_program_assignments")
        .select(`
          id,
          program_id,
          start_date,
          program:training_programs!client_program_assignments_program_id_fkey (
            id,
            name
          )
        `)
        .eq("client_id", clientId)
        .eq("is_active", true)
        .single();

      if (assignment) {
        // Normalize program data
        const program = Array.isArray(assignment.program) ? assignment.program[0] : assignment.program;

        // Hämta sessions för veckan (baserat på day_of_week)
        const dayNumbers = days.map((d) => d.dayOfWeek);
        const { data: sessionsData } = await supabase
          .from("program_sessions")
          .select(`
            id,
            name,
            day_of_week
          `)
          .eq("program_id", assignment.program_id)
          .in("day_of_week", dayNumbers);

        // Mappa sessions till dagar
        sessionsData?.forEach((session) => {
          const dayIndex = days.findIndex((d) => d.dayOfWeek === session.day_of_week);
          if (dayIndex !== -1) {
            const sessionData: SessionData = {
              id: session.id,
              name: session.name || "",
              day_of_week: session.day_of_week,
              workoutLog: null,
            };
            days[dayIndex].sessions.push(sessionData);
          }
        });

        // Hämta workout logs för veckan
        const weekStartStr = weekStart.toISOString().split("T")[0];
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const weekEndStr = weekEnd.toISOString().split("T")[0];

        const sessionIds = sessionsData?.map((s) => s.id) || [];
        if (sessionIds.length > 0) {
          const { data: logsData } = await supabase
            .from("workout_sessions_log")
            .select("*")
            .eq("client_id", clientId)
            .in("program_session_id", sessionIds)
            .gte("date", weekStartStr)
            .lte("date", weekEndStr);

          logsData?.forEach((log) => {
            const session = sessionsData?.find((s) => s.id === log.program_session_id);
            if (session) {
              const dayIndex = days.findIndex((d) => {
                const dayStr = d.date.toISOString().split("T")[0];
                return dayStr === log.date && d.dayOfWeek === session.day_of_week;
              });
              if (dayIndex !== -1) {
                const sessionIndex = days[dayIndex].sessions.findIndex((s) => s.id === session.id);
                if (sessionIndex !== -1 && days[dayIndex].sessions[sessionIndex]) {
                  const existingSession = days[dayIndex].sessions[sessionIndex];
                  days[dayIndex].sessions[sessionIndex] = {
                    ...existingSession,
                    workoutLog: {
                      id: log.id,
                      status: log.status || "",
                      date: log.date || "",
                    },
                  };
                }
              }
            }
          });
        }
      }

      // Hämta readiness för veckan
      const weekStartStr = weekStart.toISOString().split("T")[0];
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const weekEndStr = weekEnd.toISOString().split("T")[0];

      const { data: readinessData } = await supabase
        .from("daily_readiness")
        .select("*")
        .eq("client_id", clientId)
        .gte("date", weekStartStr)
        .lte("date", weekEndStr);

      readinessData?.forEach((readiness) => {
        const dayIndex = days.findIndex((d) => {
          const dayStr = d.date.toISOString().split("T")[0];
          return dayStr === readiness.date;
        });
        if (dayIndex !== -1) {
          days[dayIndex].readiness = {
            sleep_quality: readiness.sleep_quality,
            energy_level: readiness.energy_level,
            stress_level: readiness.stress_level,
            soreness: readiness.soreness,
          };
        }
      });

      // Beräkna cykelfas för varje dag
      if (latestPeriodStart) {
        days.forEach((day) => {
          const { phase } = calculateCyclePhase(latestPeriodStart, day.date);
          day.cyclePhase = phase as "menstruation" | "follicular" | "ovulation" | "luteal" | null;
        });
      }

      setWeekData(days);
    } catch (err) {
      console.error("Error fetching week data:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta kalenderdata. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const handleDayClick = (day: DayData) => {
    setSelectedDay(day);
    setDrawerOpen(true);
  };

  const formatWeekRange = () => {
    if (weekData.length === 0) return "";
    const start = weekData[0].date;
    const end = weekData[6].date;
    return `${start.toLocaleDateString("sv-SE", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
        <div className="max-w-[480px] mx-auto px-5 py-8">
          <SectionHeader title="Kalender" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error && !clientId) {
    return (
      <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
        <div className="max-w-[480px] mx-auto px-5 py-8">
          <SectionHeader title="Kalender" />
          <Card className="border-red-200 bg-red-50/50">
            <CardContent>
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
      <div className="max-w-[480px] mx-auto px-5 py-8 space-y-6">
        <SectionHeader
          title="Kalender"
          subtitle="Din vecka i översikt"
        />

        {/* Week Navigation */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                ←
              </Button>
              <div className="text-center">
                <p className="text-sm font-medium text-[#5A6B5D]">{formatWeekRange()}</p>
                <Button variant="link" size="sm" onClick={goToToday} className="text-xs">
                  Gå till idag
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                →
              </Button>
            </div>

            {/* Mobile: Cards per day */}
            <div className="md:hidden space-y-3">
              {weekData.map((day) => {
                const colors = day.cyclePhase ? getCycleColorClasses(day.cyclePhase) : null;
                const today = isToday(day.date);

                return (
                  <Card
                    key={day.date.toISOString()}
                    onClick={() => handleDayClick(day)}
                    className={`cursor-pointer transition-all ${
                      today ? "ring-2 ring-[#8B6F47]" : ""
                    } ${colors ? `border-l-4 ${colors.border}` : ""}`}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#5A6B5D]">
                            {day.dayName}
                          </p>
                          <p className="text-xs text-[#5A6B5D]/70">
                            {day.date.toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}
                          </p>
                          {today && (
                            <Chip variant="info" className="text-xs">Idag</Chip>
                          )}
                        </div>
                        {day.cyclePhase && (
                          <CycleIndicator phase={day.cyclePhase} size="sm" showLabel={false} />
                        )}
                      </div>

                      {day.sessions.length > 0 && (
                        <div className="space-y-1 mt-3">
                          {day.sessions.map((session) => (
                            <div
                              key={session.id}
                              className="flex items-center gap-2 p-2 bg-[#FEFCF8]/50 rounded-card"
                            >
                              <Dumbbell className="h-4 w-4 text-[#8B6F47]" />
                              <span className="text-xs text-[#5A6B5D] flex-1">{session.name}</span>
                              {session.workoutLog && (
                                <Chip
                                  variant={
                                    session.workoutLog.status === "genomfört"
                                      ? "success"
                                      : "warning"
                                  }
                                  className="text-xs"
                                >
                                  {session.workoutLog.status === "genomfört" ? "✓" : "→"}
                                </Chip>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {day.readiness && (
                        <div className="mt-2 pt-2 border-t border-[rgba(232,229,224,0.4)]">
                          <p className="text-xs text-[#5A6B5D]/70 mb-1">Readiness</p>
                          <div className="flex gap-2 text-xs">
                            {day.readiness.energy_level && (
                              <span className="text-[#5A6B5D]">
                                Energi: {day.readiness.energy_level}/10
                              </span>
                            )}
                            {day.readiness.sleep_quality && (
                              <span className="text-[#5A6B5D]">
                                Sömn: {day.readiness.sleep_quality}/10
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {day.sessions.length === 0 && !day.readiness && (
                        <p className="text-xs text-[#5A6B5D]/60 mt-2">Inga aktiviteter</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Desktop: 7-column grid */}
            <div className="hidden md:grid grid-cols-7 gap-2">
              {weekData.map((day) => {
                const colors = day.cyclePhase ? getCycleColorClasses(day.cyclePhase) : null;
                const today = isToday(day.date);

                return (
                  <Card
                    key={day.date.toISOString()}
                    onClick={() => handleDayClick(day)}
                    className={`cursor-pointer transition-all min-h-[120px] ${
                      today ? "ring-2 ring-[#8B6F47]" : ""
                    } ${colors ? `border-l-4 ${colors.border}` : ""}`}
                  >
                    <CardContent className="pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-xs font-medium text-[#5A6B5D]">{day.dayName}</p>
                          <p className="text-xs text-[#5A6B5D]/70">
                            {day.date.toLocaleDateString("sv-SE", { day: "numeric" })}
                          </p>
                        </div>
                        {day.cyclePhase && (
                          <CycleIndicator phase={day.cyclePhase} size="sm" showLabel={false} />
                        )}
                      </div>

                      {day.sessions.length > 0 && (
                        <div className="space-y-1">
                          {day.sessions.slice(0, 2).map((session) => (
                            <div
                              key={session.id}
                              className="text-xs text-[#5A6B5D] truncate"
                            >
                              • {session.name}
                            </div>
                          ))}
                          {day.sessions.length > 2 && (
                            <p className="text-xs text-[#5A6B5D]/60">
                              +{day.sessions.length - 2} fler
                            </p>
                          )}
                        </div>
                      )}

                      {day.readiness && (
                        <div className="mt-2 pt-2 border-t border-[rgba(232,229,224,0.4)]">
                          <div className="text-xs text-[#5A6B5D]/70">
                            E: {day.readiness.energy_level || "-"}
                          </div>
                          <div className="text-xs text-[#5A6B5D]/70">
                            S: {day.readiness.sleep_quality || "-"}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day Detail Drawer */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent side="bottom">
            <DrawerHeader>
              <DrawerTitle>
                {selectedDay?.dayName}{" "}
                {selectedDay?.date.toLocaleDateString("sv-SE", {
                  day: "numeric",
                  month: "long",
                })}
              </DrawerTitle>
              <DrawerDescription>
                {selectedDay?.cyclePhase && (
                  <CycleIndicator phase={selectedDay.cyclePhase} />
                )}
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-6 pb-6 space-y-4">
              {/* Sessions */}
              {selectedDay && selectedDay.sessions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[#5A6B5D] mb-2">Pass</h3>
                  <div className="space-y-2">
                    {selectedDay.sessions.map((session) => (
                      <Card key={session.id} className="bg-[#FEFCF8]/50">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Dumbbell className="h-4 w-4 text-[#8B6F47]" />
                              <span className="text-sm font-medium text-[#5A6B5D]">
                                {session.name}
                              </span>
                            </div>
                            {session.workoutLog && (
                              <Chip
                                variant={
                                  session.workoutLog.status === "genomfört"
                                    ? "success"
                                    : "warning"
                                }
                              >
                                {session.workoutLog.status === "genomfört"
                                  ? "Genomfört"
                                  : "Påbörjad"}
                              </Chip>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Readiness */}
              {selectedDay && selectedDay.readiness && (
                <div>
                  <h3 className="text-sm font-medium text-[#5A6B5D] mb-2">Readiness</h3>
                  <Card className="bg-[#FEFCF8]/50">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {selectedDay.readiness.energy_level && (
                          <div>
                            <p className="text-[#5A6B5D]/70">Energi</p>
                            <p className="font-medium text-[#5A6B5D]">
                              {selectedDay.readiness.energy_level}/10
                            </p>
                          </div>
                        )}
                        {selectedDay.readiness.sleep_quality && (
                          <div>
                            <p className="text-[#5A6B5D]/70">Sömn</p>
                            <p className="font-medium text-[#5A6B5D]">
                              {selectedDay.readiness.sleep_quality}/10
                            </p>
                          </div>
                        )}
                        {selectedDay.readiness.stress_level && (
                          <div>
                            <p className="text-[#5A6B5D]/70">Stress</p>
                            <p className="font-medium text-[#5A6B5D]">
                              {selectedDay.readiness.stress_level}/10
                            </p>
                          </div>
                        )}
                        {selectedDay.readiness.soreness && (
                          <div>
                            <p className="text-[#5A6B5D]/70">Ömhet</p>
                            <p className="font-medium text-[#5A6B5D]">
                              {selectedDay.readiness.soreness}/10
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedDay &&
                selectedDay.sessions.length === 0 &&
                !selectedDay.readiness && (
                  <EmptyState
                    title="Inga aktiviteter denna dag"
                    description="Det finns inga planerade pass eller loggad readiness för denna dag."
                  />
                )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

