import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { OnboardingData, OnboardingPath } from "../../shared/types/onboarding";

function getTotalSteps(path: OnboardingPath | null): number {
  if (path === "cycle_only") return 3;
  if (path === "training_only") return 5;
  if (path === "both") return 6;
  return 5;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  resetData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
}

const initialData: OnboardingData = {
  presentationProfile: null,
  presentationTheme: null,
  onboardingPath: null,
  primaryGoal: null,
  secondaryGoals: [],
  trainingLevel: null,
  trainingFrequency: null,
  sessionDuration: null,
  equipmentAccess: null,
  stressLevel: null,
  travelsOften: null,
  trainingDays: [],
  canMoveSessions: null,
  planStyle: null,
  selectedProgramId: null,
  wantsCycleTracking: null,
  lastPeriodStart: null,
  cycleLength: null,
  irregularCycle: null,
  noPeriod: null,
  periMenopause: null,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = useMemo(() => getTotalSteps(data.onboardingPath), [data.onboardingPath]);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetData = useCallback(() => {
    setData(initialData);
    setCurrentStep(0);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        data,
        updateData,
        resetData,
        currentStep,
        setCurrentStep,
        totalSteps,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
