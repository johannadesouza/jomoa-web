"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle, Chip } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

interface Checkin {
  id: string;
  template_id: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  template: {
    name: string;
  } | null;
}

interface CheckinAnswer {
  id: string;
  question_id: string;
  numeric_value: number | null;
  text_value: string | null;
  question: {
    question_text: string;
    question_type: "scale_1_10" | "yes_no" | "text";
  } | null;
}

export default function ClientCheckinsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clientId = params?.id as string;

  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null);
  const [answers, setAnswers] = useState<CheckinAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && clientId) {
      fetchClientName();
      fetchCheckins();
    }
  }, [user, authLoading, clientId]);

  const fetchClientName = async () => {
    if (!clientId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("clients")
        .select(`
          profile:profiles!clients_profile_id_fkey (
            full_name
          )
        `)
        .eq("id", clientId)
        .single();

      if (fetchError) throw fetchError;

      const profile = Array.isArray(data?.profile) ? data.profile[0] : data?.profile;
      setClientName(profile?.full_name || null);
    } catch (err) {
      console.error("Error fetching client name:", err);
    }
  };

  const fetchCheckins = async () => {
    if (!clientId) {
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
          template_id,
          due_date,
          completed_at,
          created_at,
          template:checkin_templates!checkins_template_id_fkey (
            name
          )
        `)
        .eq("client_id", clientId)
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

  const fetchAnswers = async (checkinId: string) => {
    try {
      setLoadingAnswers(true);

      const { data, error: fetchError } = await supabase
        .from("checkin_answers")
        .select(`
          id,
          question_id,
          numeric_value,
          text_value,
          question:checkin_questions!checkin_answers_question_id_fkey (
            question_text,
            question_type
          )
        `)
        .eq("checkin_id", checkinId)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      setAnswers((data || []) as unknown as CheckinAnswer[]);

      // Hitta checkin i listan
      const checkin = checkins.find((c) => c.id === checkinId);
      if (checkin) {
        setSelectedCheckin(checkin);
      }
    } catch (err) {
      console.error("Error fetching answers:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta svar. Försök igen senare.");
    } finally {
      setLoadingAnswers(false);
    }
  };

  const formatAnswer = (answer: CheckinAnswer): string => {
    if (answer.question?.question_type === "scale_1_10") {
      return answer.numeric_value?.toString() || "-";
    } else if (answer.question?.question_type === "yes_no") {
      return answer.numeric_value === 1 ? "Ja" : answer.numeric_value === 0 ? "Nej" : "-";
    } else {
      return answer.text_value || "-";
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
        title={`Check-ins${clientName ? ` – ${clientName}` : ""}`}
        subtitle="Visa och hantera check-ins för denna klient"
        breadcrumbs={[
          { label: "Klienter", href: "/coach/clients" },
          { label: clientName || "Klient", href: `/coach/clients/${clientId}` },
          { label: "Check-ins" },
        ]}
      />

      {error && (
        <Card className="bg-red-50/50 border-red-200">
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-ins lista */}
        <div className="space-y-4">
          <h2 className="text-lg font-the-seasons font-semibold text-[#5A6B5D]">Check-ins historik</h2>
          {checkins.length === 0 ? (
            <EmptyState
              title="Inga check-ins ännu"
              description="Skicka en check-in till denna klient för att se svar här."
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-[rgba(232,229,224,0.4)]">
                  {checkins.map((checkin) => (
                    <div
                      key={checkin.id}
                      onClick={() => fetchAnswers(checkin.id)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedCheckin?.id === checkin.id
                          ? "bg-[#5A6B5D]/10 border-l-4 border-[#8B6F47]"
                          : "hover:bg-[#FEFCF8]/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#5A6B5D]">
                            {checkin.template?.name || "Check-in"}
                          </p>
                          <p className="text-xs text-[#5A6B5D]/70 mt-1">
                            {new Date(checkin.created_at).toLocaleDateString("sv-SE")}
                          </p>
                        </div>
                        <Chip
                          variant={checkin.completed_at ? "success" : "warning"}
                        >
                          {checkin.completed_at ? "Besvarad" : "Väntar"}
                        </Chip>
                      </div>
                      {checkin.due_date && (
                        <p className="text-xs text-[#5A6B5D]/70 mt-1">
                          Förfallodatum: {new Date(checkin.due_date).toLocaleDateString("sv-SE")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Svar */}
        <div className="space-y-4">
          <h2 className="text-lg font-the-seasons font-semibold text-[#5A6B5D]">Svar</h2>
          {!selectedCheckin ? (
            <EmptyState
              title="Välj en check-in"
              description="Klicka på en check-in i listan för att se svar."
            />
          ) : loadingAnswers ? (
            <Card>
              <CardContent>
                <Skeleton className="h-32" />
              </CardContent>
            </Card>
          ) : answers.length === 0 ? (
            <Card className="bg-yellow-50/50 border-yellow-200">
              <CardContent>
                <p className="text-yellow-800 font-medium mb-2">Inga svar ännu</p>
                <p className="text-sm text-yellow-700">
                  Klienten har inte besvarat denna check-in.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{selectedCheckin.template?.name || "Check-in"}</CardTitle>
                {selectedCheckin.completed_at && (
                  <p className="text-xs text-[#5A6B5D]/70 mt-1">
                    Besvarad: {new Date(selectedCheckin.completed_at).toLocaleDateString("sv-SE")}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {answers.map((answer, index) => (
                  <div key={answer.id} className="pb-4 border-b border-[rgba(232,229,224,0.4)] last:border-0">
                    <p className="text-sm font-medium text-[#5A6B5D] mb-2">
                      {index + 1}. {answer.question?.question_text || "Fråga"}
                    </p>
                    <div className="bg-[#FEFCF8]/50 rounded-[20px] p-3 border border-[rgba(232,229,224,0.4)]">
                      <p className="text-sm text-[#5A6B5D]">{formatAnswer(answer)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

