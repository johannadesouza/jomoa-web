"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/utils/normalizeSupabase";

interface Question {
  id: string;
  question_text: string;
  question_type: "scale_1_10" | "yes_no" | "text";
  order_index: number;
}

export default function NewCheckinTemplatePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      loadDraft();
    }
  }, [user, authLoading]);

  // Ladda sparad draft från localStorage
  const loadDraft = () => {
    const saved = localStorage.getItem("checkin_template_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name || parsed.description || (parsed.questions && parsed.questions.length > 0)) {
          setName(parsed.name || "");
          setDescription(parsed.description || "");
          setQuestions(parsed.questions || []);
          setDraftLoaded(true);
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
      const draftData = {
        name,
        description,
        questions,
      };
      localStorage.setItem("checkin_template_draft", JSON.stringify(draftData));
    } catch (err) {
      console.error("Error saving draft:", err);
    }
  }, [name, description, questions]);

  // Autosave när draft ändras (med debounce)
  useEffect(() => {
    if (name || description || questions.length > 0) {
      const timeoutId = setTimeout(() => {
        saveDraft();
      }, 1000); // Debounce 1 sekund
      
      return () => clearTimeout(timeoutId);
    }
  }, [name, description, questions, saveDraft]);

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
    setQuestions(questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order_index: i })));
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
      const organizationId = await getOrCreateDefaultOrganization();
      if (!organizationId) {
        throw new Error("Kunde inte hämta eller skapa organisation.");
      }

      // Skapa template
      const { data: template, error: templateError } = await supabase
        .from("checkin_templates")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          organization_id: organizationId,
          coach_id: user.id,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Skapa questions
      const questionsToInsert = questions.map((q) => ({
        template_id: template.id,
        question_text: q.question_text.trim(),
        question_type: q.question_type,
        order_index: q.order_index,
      }));

      const { error: questionsError } = await supabase
        .from("checkin_questions")
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      // Rensa draft
      localStorage.removeItem("checkin_template_draft");

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

  if (authLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Skapa Check-in Template</h1>
        <p className="text-gray-600">Laddar...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Skapa Check-in Template</h1>

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

      {draftLoaded && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-600">
            ✓ Sparat utkast laddades. Du kan fortsätta där du slutade.
          </p>
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
            {saving ? "Sparar..." : "Spara template"}
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

