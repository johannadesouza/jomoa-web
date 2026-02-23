import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { getThemeColors } from "../../shared/theme/colors";
import { useTheme } from "../../shared/context/ThemeContext";
import { OnboardingProvider } from "./OnboardingContext";
import { WelcomeScreen } from "./WelcomeScreen";
import { PathChoiceScreen } from "./PathChoiceScreen";
import { GoalsScreen } from "./GoalsScreen";
import { FrequencyScreen } from "./FrequencyScreen";
import { TrainingDaysScreen } from "./TrainingDaysScreen";
import { CycleSetupScreen } from "./CycleSetupScreen";
import { CompleteScreen } from "./CompleteScreen";

export type OnboardingStackParamList = {
  Welcome: undefined;
  PathChoice: undefined;
  Goals: undefined;
  Frequency: undefined;
  TrainingDays: undefined;
  CycleSetup: undefined;
  Complete: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <OnboardingProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="PathChoice" component={PathChoiceScreen} />
        <Stack.Screen name="Goals" component={GoalsScreen} />
        <Stack.Screen name="Frequency" component={FrequencyScreen} />
        <Stack.Screen name="TrainingDays" component={TrainingDaysScreen} />
        <Stack.Screen name="CycleSetup" component={CycleSetupScreen} />
        <Stack.Screen name="Complete" component={CompleteScreen} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}
