import { useEffect, useState, useCallback } from "react";
import {
  fetchAllProgramsWithAssignment,
  fetchProgramWithStructure,
  archiveAndSwitchProgram,
} from "../services/programService";
import type {
  ProgramWithStructure,
  ProgramWithStatus,
  ProgramAssignment,
  ProgramStatus,
  ProgramWeek,
  ProgramSession,
} from "../domain/program";

export interface UseActiveProgramResult {
  programs: ProgramWithStatus[];
  activeAssignment: ProgramAssignment | null;
  structure: ProgramWithStructure | null;
  weeks: ProgramWeek[];
  sessions: ProgramSession[];
  progressionPercent: number;
  status: ProgramStatus;
  isLoading: boolean;
  error: string | null;
  isSwitching: boolean;
  switchProgram: (clientId: string, programId: string) => Promise<{ error: Error | null }>;
  refetch: () => Promise<void>;
}

export function useActiveProgram(clientId: string | undefined): UseActiveProgramResult {
  const [programs, setPrograms] = useState<ProgramWithStatus[]>([]);
  const [activeAssignment, setActiveAssignment] = useState<ProgramAssignment | null>(null);
  const [structure, setStructure] = useState<ProgramWithStructure | null>(null);
  const [progressionPercent, setProgressionPercent] = useState(0);
  const [status, setStatus] = useState<ProgramStatus>("not_started");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  const load = useCallback(async () => {
    if (!clientId) {
      setPrograms([]);
      setActiveAssignment(null);
      setStructure(null);
      setProgressionPercent(0);
      setStatus("not_started");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { programs: programsWithStatus, activeAssignment: assignment } =
        await fetchAllProgramsWithAssignment(clientId);

      setPrograms(programsWithStatus);
      setActiveAssignment(assignment);

      if (assignment) {
        const prog = programsWithStatus.find((p) => p.id === assignment.program_id);
        setProgressionPercent(prog?.progressionPercent ?? 0);
        setStatus(prog?.status ?? "active");
        const struct = await fetchProgramWithStructure(assignment.program_id);
        setStructure(struct);
      } else {
        setStructure(null);
        setProgressionPercent(0);
        setStatus("not_started");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte ladda program");
      setPrograms([]);
      setActiveAssignment(null);
      setStructure(null);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  const switchProgram = async (
    cId: string,
    programId: string
  ): Promise<{ error: Error | null }> => {
    setIsSwitching(true);
    try {
      const { error: err } = await archiveAndSwitchProgram(cId, programId);
      if (!err && clientId === cId) {
        await load();
      }
      return { error: err };
    } finally {
      setIsSwitching(false);
    }
  };

  return {
    programs,
    activeAssignment,
    structure,
    weeks: structure?.weeks ?? [],
    sessions: structure?.sessions ?? [],
    progressionPercent,
    status,
    isLoading,
    error,
    isSwitching,
    switchProgram,
    refetch: load,
  };
}
