/**
 * Single source of truth for active program assignment.
 * Dashboard and Calendar use this to avoid duplicate fetchActiveAssignment calls.
 */
import React, { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { useActiveAssignment } from "../../lib/hooks/useActiveAssignment";
import type { ProgramAssignmentData } from "../../lib/services/programService";

interface AssignmentContextType {
  assignment: ProgramAssignmentData | null;
  isLoading: boolean;
  refetch: () => void;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export function AssignmentProvider({ children }: { children: React.ReactNode }) {
  const { client } = useAuth();
  const value = useActiveAssignment(client?.id);
  return (
    <AssignmentContext.Provider value={value}>
      {children}
    </AssignmentContext.Provider>
  );
}

export function useAssignment(): AssignmentContextType | undefined {
  return useContext(AssignmentContext);
}
