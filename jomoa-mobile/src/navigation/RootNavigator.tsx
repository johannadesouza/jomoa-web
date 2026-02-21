import React from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { themeColors } from "../shared/theme/colors";
import { useAuth } from "../shared/context/AuthContext";
import { LoginScreen } from "../features/auth/LoginScreen";
import { RegisterScreen } from "../features/auth/RegisterScreen";
import { TabNavigator } from "./TabNavigator";
import { WorkoutSessionScreen } from "../features/workouts/WorkoutSessionScreen";
import { WorkoutSummaryScreen } from "../features/workouts/WorkoutSummaryScreen";
import { ProgramSelectScreen } from "../features/programs/ProgramSelectScreen";
import { ProgramListScreen } from "../features/programs/ProgramListScreen";
import { ProgramDetailScreen } from "../features/programs/ProgramDetailScreen";
import { OnboardingNavigator } from "../features/onboarding";
import { CycleScreen } from "../features/cycle";
import { ReadinessScreen } from "../features/readiness";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Main: { screen?: "DashboardTab" | "WorkoutsTab" | "CalendarTab" | "InsightsTab" | "SettingsTab" } | undefined;
  WorkoutSession: { sessionId: string };
  WorkoutSummary: { sessionName: string; totalSets: number; totalVolume: number };
  ProgramSelect: undefined;
  ProgramList: undefined;
  ProgramDetail: { programId: string };
  Cycle: undefined;
  Readiness: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isLoading, client } = useAuth();

  const needsOnboarding = client?.onboarding_stage !== "completed";

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: themeColors.background,
        }}
      >
        <ActivityIndicator size="large" color={themeColors.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: themeColors.background },
        animation: "slide_from_right",
      }}
    >
      {isAuthenticated ? (
        needsOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="WorkoutSession"
              component={WorkoutSessionScreen}
              options={{
                presentation: "card",
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="WorkoutSummary"
              component={WorkoutSummaryScreen}
              options={{
                headerShown: true,
                headerTitle: "Pass klart",
                headerBackTitle: "",
                headerLeft: () => null,
                headerStyle: { backgroundColor: themeColors.background },
                headerTintColor: themeColors.textPrimary,
                headerTitleStyle: { fontWeight: "600" },
              }}
            />
            <Stack.Screen
              name="ProgramSelect"
              component={ProgramSelectScreen}
              options={{
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="ProgramList"
              component={ProgramListScreen}
              options={{
                headerShown: true,
                headerTitle: "Mina program",
                headerBackTitle: "Tillbaka",
                headerStyle: { backgroundColor: themeColors.background },
                headerTintColor: themeColors.textPrimary,
                headerTitleStyle: { fontWeight: "600" },
              }}
            />
            <Stack.Screen
              name="ProgramDetail"
              component={ProgramDetailScreen}
              options={{
                headerShown: true,
                headerTitle: "Program",
                headerBackTitle: "Tillbaka",
                headerStyle: { backgroundColor: themeColors.background },
                headerTintColor: themeColors.textPrimary,
                headerTitleStyle: { fontWeight: "600" },
              }}
            />
            <Stack.Screen
              name="Readiness"
              component={ReadinessScreen}
              options={{
                headerShown: true,
                headerTitle: "Hur mår du idag?",
                headerBackTitle: "Tillbaka",
                headerStyle: { backgroundColor: themeColors.background },
                headerTintColor: themeColors.textPrimary,
                headerTitleStyle: { fontWeight: "600" },
              }}
            />
            <Stack.Screen
              name="Cycle"
              component={CycleScreen}
              options={{
                headerShown: true,
                headerTitle: "Menscykel",
                headerBackTitle: "Tillbaka",
                headerStyle: { backgroundColor: themeColors.background },
                headerTintColor: themeColors.textPrimary,
                headerTitleStyle: { fontWeight: "600" },
              }}
            />
          </>
        )
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

