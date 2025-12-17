"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";

interface Question {
  id: string;
  question_text: string;
  question_type: "scale_1_10" | "yes_no" | "text";
  order_index: number;
}

interface Checkin {
  id: string;
  template_id: string;
  due_date: string | null;
  completed_at: string | null;
  template: {
    name: string;
    description: string | null;
  } | null;
}

export default function ClientCheckinPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const checkinId = params?.id as string;

  const [checkin, setCheckin] = useState<Checkin | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchClientId();
    }
  }, [user?.id]);

  useEffect(() => {
    if (checkinId && clientId) {
      fetchCheckin();
    }
  }, [checkinId, clientId]);

  const fetchClientId = async () => {
    if (!user?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("clients")
        .select("id")
        .eq("profile_id", user.id)
        .eq("status", "active")
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          setClientId(null);
          return;
        }
        throw fetchError;
      }

      setClientId(data?.id || null);
    } catch (err) {
      console.error("Error fetching client ID:", err);
    }
  };

  const fetchCheckin = async () => {
    if (!checkinId || !clientId) return;

    try {
      setLoading(true);
      setError(null);

      // Hämta check-in
      const { data: checkinData, error: checkinError } = await supabase
        .from("checkins")
        .select(`
          id,
          template_id,
          due_date,
          completed_at,
          template:checkin_templates!checkins_template_id_fkey (
            name,
            description
          )
        `)
        .eq("id", checkinId)
        .eq("client_id", clientId)
        .single();

      if (checkinError) throw checkinError;

      // Fix: Supabase returnerar relationer som array, men vi behöver objekt
      const formattedCheckin: Checkin = {
        id: checkinData.id,
        template_id: checkinData.template_id,
        due_date: checkinData.due_date,
        completed_at: checkinData.completed_at,
        template: Array.isArray(checkinData.template) 
          ? checkinData.template[0] || null
          : checkinData.template || null,
      };

      setCheckin(formattedCheckin);

      // Om redan besvarad, visa svar
      if (formattedCheckin.completed_at) {
        setSuccess(true);
      }

      // Hämta questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("checkin_questions")
        .select("*")
        .eq("template_id", formattedCheckin.template_id)
        .order("order_index", { ascending: true });

      if (questionsError) throw questionsError;

      setQuestions(
        (questionsData || []).map((q) => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type as Question["question_type"],
          order_index: q.order_index,
        }))
      );

      // Hämta befintliga svar om check-in är besvarad
      if (checkinData.completed_at) {
        const { data: answersData, error: answersError } = await supabase
          .from("checkin_answers")
          .select("*")
          .eq("checkin_id", checkinId);

        if (!answersError && answersData) {
          const answersMap: Record<string, string> = {};
          answersData.forEach((answer) => {
            if (answer.numeric_value !== null) {
              answersMap[answer.question_id] = answer.numeric_value.toString();
            } else if (answer.text_value) {
              answersMap[answer.question_id] = answer.text_value;
            }
          });
          setAnswers(answersMap);
        }
      }
    } catch (err) {
      console.error("Error fetching checkin:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta check-in. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkinId || !clientId) {
      setError("Check-in information saknas.");
      return;
    }

    // Validera att alla frågor är besvarade
    for (const question of questions) {
      if (!answers[question.id] || answers[question.id].trim() === "") {
        setError("Alla frågor måste besvaras.");
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      // Skapa answers
      const answersToInsert = questions.map((question) => {
        const answerValue = answers[question.id];

        if (question.question_type === "scale_1_10") {
          return {
            checkin_id: checkinId,
            question_id: question.id,
            numeric_value: parseFloat(answerValue),
            text_value: null,
          };
        } else if (question.question_type === "yes_no") {
          return {
            checkin_id: checkinId,
            question_id: question.id,
            numeric_value: answerValue === "yes" ? 1 : 0,
            text_value: null,
          };
        } else {
          return {
            checkin_id: checkinId,
            question_id: question.id,
            numeric_value: null,
            text_value: answerValue.trim(),
          };
        }
      });

      const { error: answersError } = await supabase
        .from("checkin_answers")
        .insert(answersToInsert);

      if (answersError) throw answersError;

      // Uppdatera check-in completed_at
      const { error: updateError } = await supabase
        .from("checkins")
        .update({
          completed_at: new Date().toISOString(),
        })
        .eq("id", checkinId);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        router.push("/client/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error submitting checkin:", err);
      setError(getErrorMessage(err) || "Kunde inte spara svar. Försök igen senare.");
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Check-in</h1>
        <p className="text-gray-600">Laddar...</p>
      </div>
    );
  }

  if (!checkin) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Check-in</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">Check-in hittades inte.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Check-in</h1>
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <p className="text-lg font-medium text-green-900 mb-2">Tack för ditt svar!</p>
          <p className="text-sm text-green-700">Du omdirigeras till dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{checkin.template?.name || "Check-in"}</h1>

      {checkin.template?.description && (
        <p className="text-sm text-gray-600 mb-6">{checkin.template.description}</p>
      )}

      {checkin.due_date && (
        <p className="text-sm text-gray-600 mb-6">
          Förfallodatum: {new Date(checkin.due_date).toLocaleDateString("sv-SE")}
        </p>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              {index + 1}. {question.question_text} <span className="text-red-500">*</span>
            </label>

            {question.question_type === "scale_1_10" && (
              <div>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  required
                  disabled={!!checkin.completed_at}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="1-10"
                />
                <p className="text-xs text-gray-500 mt-1">Ange ett värde mellan 1 och 10</p>
              </div>
            )}

            {question.question_type === "yes_no" && (
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value="yes"
                    checked={answers[question.id] === "yes"}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    required
                    disabled={!!checkin.completed_at}
                    className="mr-2 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-700">Ja</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value="no"
                    checked={answers[question.id] === "no"}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    required
                    disabled={!!checkin.completed_at}
                    className="mr-2 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-700">Nej</span>
                </label>
              </div>
            )}

            {question.question_type === "text" && (
              <textarea
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                required
                disabled={!!checkin.completed_at}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Skriv ditt svar här..."
              />
            )}
          </div>
        ))}

        {!checkin.completed_at && (
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Sparar..." : "Skicka svar"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/client/dashboard")}
              disabled={submitting}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Avbryt
            </button>
          </div>
        )}

        {checkin.completed_at && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-800">
              Denna check-in är redan besvarad. Besvarad:{" "}
              {new Date(checkin.completed_at).toLocaleDateString("sv-SE")}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

