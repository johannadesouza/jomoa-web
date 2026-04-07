import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useThemeColors } from "../../shared/theme/useThemeColors";
import { useTheme } from "../../shared/context/ThemeContext";
import { ThemePreviewProvider } from "../../shared/context/ThemePreviewContext";
import { OnboardingProvider, useOnboarding } from "./OnboardingContext";
import { WelcomeScreen } from "./WelcomeScreen";
import { GenderScreen } from "./GenderScreen";
import { ThemeScreen } from "./ThemeScreen";
import { CycleQuestionScreen } from "./CycleQuestionScreen";
import { PathChoiceScreen } from "./PathChoiceScreen";
import { GoalsScreen } from "./GoalsScreen";
import { FrequencyScreen } from "./FrequencyScreen";
import { CycleSetupScreen } from "./CycleSetupScreen";
import { CompleteScreen } from "./CompleteScreen";

export type OnboardingStackParamList = {
  Welcome: undefined;
  Gender: undefined;
  Theme: undefined;
  CycleQuestion: undefined;
  PathChoice: undefined;
  Goals: undefined;
  Frequency: undefined;
  CycleSetup: undefined;
  Complete: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

function OnboardingStack() {
  const { theme } = useTheme();
  const colors = useThemeColors();
  const { data } = useOnboarding();
  return (
    <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Gender" component={GenderScreen} />
        <Stack.Screen name="Theme" component={ThemeScreen} />
        <Stack.Screen name="CycleQuestion" component={CycleQuestionScreen} />
        <Stack.Screen name="PathChoice" component={PathChoiceScreen} />
        <Stack.Screen name="Goals" component={GoalsScreen} />
        <Stack.Screen name="Frequency" component={FrequencyScreen} />
        <Stack.Screen name="CycleSetup" component={CycleSetupScreen} />
        <Stack.Screen name="Complete" component={CompleteScreen} />
      </Stack.Navigator>
  );
}

export function OnboardingNavigator() {
  return (
    <OnboardingProvider>
      <OnboardingStackWithPreview />
    </OnboardingProvider>
  );
}

function OnboardingStackWithPreview() {
  const { data } = useOnboarding();
  return (
    <ThemePreviewProvider value={data.presentationTheme ?? null}>
      <OnboardingStack />
    </ThemePreviewProvider>
  );
}
