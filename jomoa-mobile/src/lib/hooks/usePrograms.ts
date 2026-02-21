import { useEffect, useState } from "react";
import { fetchTemplatePrograms, assignProgram } from "../services/programService";
import { Program } from "../services/programService";

export function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setIsLoading(true);
    const data = await fetchTemplatePrograms();
    setPrograms(data);
    setIsLoading(false);
  }

  return { programs, isLoading, refetch: load };
}

export function useProgramSelect(clientId: string | undefined, onSuccess?: () => void) {
  const [isSaving, setIsSaving] = useState(false);

  async function selectProgram(programId: string) {
    if (!clientId) return;

    setIsSaving(true);
    const { error } = await assignProgram(clientId, programId);
    setIsSaving(false);

    if (error) {
      throw error;
    }

    onSuccess?.();
  }

  return { selectProgram, isSaving };
}
