"use client";

import { useEffect, useState, useCallback } from "react";
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

export default function EditCheckinTemplatePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (templateId && user) {
      // Försök ladda utkast först, annars ladda från databas
      const savedDraft = localStorage.getItem(`checkin_template_draft_${templateId}`);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed.name || parsed.description || (parsed.questions && parsed.questions.length > 0)) {
            setName(parsed.name || "");
            setDescription(parsed.description || "");
            setQuestions(parsed.questions || []);
            setLoading(false);
            return; // Använd utkast istället för att ladda från databas
          }
        } catch (err) {
          console.error("Error loading draft:", err);
        }
      }
      fetchTemplate();
    }
  }, [templateId, user]);

  // Spara draft till localStorage
  const saveDraft = useCallback(() => {
    try {
      const draftData = {
        name,
        description,
        questions,
        templateId, // Spara templateId för att veta att det är ett edit-utkast
      };
      localStorage.setItem(`checkin_template_draft_${templateId}`, JSON.stringify(draftData));
    } catch (err) {
      console.error("Error saving draft:", err);
    }
  }, [name, description, questions, templateId]);

  // Autosave när draft ändras (med debounce)
  useEffect(() => {
    if (name || description || questions.length > 0) {
      const timeoutId = setTimeout(() => {
        saveDraft();
      }, 1000); // Debounce 1 sekund
      
      return () => clearTimeout(timeoutId);
    }
  }, [name, description, questions, saveDraft]);

  const fetchTemplate = async () => {
    if (!templateId || !user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Hämta template
      const { data: template, error: templateError } = await supabase
        .from("checkin_templates")
        .select("*")
        .eq("id", templateId)
        .eq("coach_id", user.id)
        .single();

      if (templateError) throw templateError;

      setName(template.name);
      setDescription(template.description || "");

      // Hämta questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("checkin_questions")
        .select("*")
        .eq("template_id", templateId)
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
    } catch (err) {
      console.error("Error fetching template:", err);
      setError(getErrorMessage(err) || "Kunde inte hämta template. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `temp-${Date.now()}`,
        question_text: "",
        question_type: "scale_1_10",
        order_index: questions.length,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const questionToRemove = questions[index];
    setQuestions(questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order_index: i })));

    // Om det är en befintlig question (inte temp-id), ta bort från databas
    if (questionToRemove.id && !questionToRemove.id.startsWith("temp-")) {
      supabase
        .from("checkin_questions")
        .delete()
        .eq("id", questionToRemove.id)
        .then(({ error }) => {
          if (error) {
            console.error("Error deleting question:", error);
          }
        });
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Template namn är obligatoriskt.");
      return;
    }

    if (questions.length === 0) {
      setError("Du måste lägga till minst en fråga.");
      return;
    }

    // Validera att alla frågor har text
    for (const question of questions) {
      if (!question.question_text.trim()) {
        setError("Alla frågor måste ha en frågetext.");
        return;
      }
    }

    if (!user?.id) {
      setError("Du måste vara inloggad.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Uppdatera template
      const { error: templateError } = await supabase
        .from("checkin_templates")
        .update({
          name: name.trim(),
          description: description.trim() || null,
        })
        .eq("id", templateId);

      if (templateError) throw templateError;

      // Ta bort alla befintliga questions (de som inte är i den nya listan)
      const existingQuestionIds = questions
        .filter((q) => q.id && !q.id.startsWith("temp-"))
        .map((q) => q.id);

      if (existingQuestionIds.length > 0) {
        const { data: allExistingQuestions } = await supabase
          .from("checkin_questions")
          .select("id")
          .eq("template_id", templateId);

        const toDelete = (allExistingQuestions || [])
          .map((q) => q.id)
          .filter((id) => !existingQuestionIds.includes(id));

        if (toDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from("checkin_questions")
            .delete()
            .in("id", toDelete);

          if (deleteError) throw deleteError;
        }
      } else {
        // Ta bort alla om inga befintliga finns
        const { error: deleteError } = await supabase
          .from("checkin_questions")
          .delete()
          .eq("template_id", templateId);

        if (deleteError) throw deleteError;
      }

      // Uppdatera eller skapa questions
      for (const question of questions) {
        if (question.id.startsWith("temp-")) {
          // Ny question - skapa
          const { error: createError } = await supabase
            .from("checkin_questions")
            .insert({
              template_id: templateId,
              question_text: question.question_text.trim(),
              question_type: question.question_type,
              order_index: question.order_index,
            });

          if (createError) throw createError;
        } else {
          // Befintlig question - uppdatera
          const { error: updateError } = await supabase
            .from("checkin_questions")
            .update({
              question_text: question.question_text.trim(),
              question_type: question.question_type,
              order_index: question.order_index,
            })
            .eq("id", question.id);

          if (updateError) throw updateError;
        }
      }

      // Rensa draft
      localStorage.removeItem(`checkin_template_draft_${templateId}`);

      // Redirect till template list
      router.push("/coach/checkins/templates");
    } catch (err) {
      console.error("Error saving template:", err);
      setError(getErrorMessage(err) || "Kunde inte spara template. Försök igen senare.");
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

  if (authLoading || loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Redigera Check-in Template</h1>
        <p className="text-gray-600">Laddar...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Redigera Check-in Template</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-sm text-green-600">Utkast sparades framgångsrikt!</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Template namn <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="t.ex. Veckovärdering"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Beskrivning
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Beskrivning av template (valfritt)"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Frågor <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addQuestion}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Lägg till fråga
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
              <p className="text-sm text-gray-600">Inga frågor ännu</p>
              <button
                type="button"
                onClick={addQuestion}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Lägg till första frågan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Fråga {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Ta bort
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frågetext <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={question.question_text}
                        onChange={(e) => updateQuestion(index, "question_text", e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="t.ex. Hur mår du idag?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frågetyp <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={question.question_type}
                        onChange={(e) =>
                          updateQuestion(index, "question_type", e.target.value as Question["question_type"])
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="scale_1_10">Skala 1-10</option>
                        <option value="yes_no">Ja/Nej</option>
                        <option value="text">Text</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            Spara utkast
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Sparar..." : "Spara ändringar"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/coach/checkins/templates")}
            disabled={saving}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            Avbryt
          </button>
        </div>
      </form>
    </div>
  );
}

