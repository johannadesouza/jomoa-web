import React, { createContext, useContext, useState, useCallback } from "react";
import { OnboardingData, TrainingGoal, DayOfWeek } from "../../shared/types/onboarding";

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  resetData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
}

const initialData: OnboardingData = {
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
  const totalSteps = 5;

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
