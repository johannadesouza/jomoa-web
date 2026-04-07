import React from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useThemeColors } from "../shared/theme/useThemeColors";
import { useAuth } from "../shared/context/AuthContext";
import { useTheme } from "../shared/context/ThemeContext";
import { LoginScreen } from "../features/auth/LoginScreen";
import { RegisterScreen } from "../features/auth/RegisterScreen";
import { TabNavigator } from "./TabNavigator";
import { WorkoutSessionScreen } from "../features/workouts/WorkoutSessionScreen";
import { WorkoutSummaryScreen } from "../features/workouts/WorkoutSummaryScreen";
import { WorkoutPreviewScreen } from "../features/workouts/WorkoutPreviewScreen";
import { ProgramSelectScreen } from "../features/programs/ProgramSelectScreen";
import { ProgramListScreen } from "../features/programs/ProgramListScreen";
import { ProgramDetailScreen } from "../features/programs/ProgramDetailScreen";
import { OnboardingNavigator } from "../features/onboarding";
import { CycleScreen, CycleInsightsScreen } from "../features/cycle";
import { ReadinessScreen } from "../features/readiness";
import { CalendarScreen, DayDetailScreen } from "../features/calendar";
import { SettingsScreen } from "../features/settings";
import { MeasurementsScreen } from "../features/log/MeasurementsScreen";
import { ProfileScreen } from "../features/profile/ProfileScreen";
import { ArticleDetailScreen } from "../features/learn/ArticleDetailScreen";
import { PhaseDetailScreen } from "../features/learn/PhaseDetailScreen";
import { ScenarioScreen } from "../features/settings/ScenarioScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Main: { screen?: "HomeTab" | "TrainTab" | "JourneyTab" | "NutritionTab" | "LearnTab" } | undefined;
  WorkoutSession: { sessionId: string; isStandalone?: boolean; applyAdjustment?: boolean };
  WorkoutPreview: { sessionId: string; isStandalone?: boolean };
  WorkoutSummary: { sessionName: string; totalSets: number; totalVolume: number; adaptationApplied?: boolean };
  ProgramSelect: undefined;
  ProgramList: undefined;
  ProgramDetail: { programId: string };
  Cycle: undefined;
  Readiness: undefined;
  Calendar: undefined;
  DayDetail: { date: string; mode?: "cykel" | "träning" | "kost" | "övrigt" };
  Settings: undefined;
  CycleInsights: { initialSegment?: string } | undefined;
  Measurements: undefined;
  Profile: undefined;
  ArticleDetail: { slug: string; title?: string };
  PhaseDetail: { phaseId: string; phaseName?: string };
  Scenario: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { theme } = useTheme();
  const themeColors = useThemeColors();
  const { isAuthenticated, isLoading, client } = useAuth();

  // #region agent log
  fetch('http://127.0.0.1:7348/ingest/41ec0831-5954-48fc-a855-14be2128bf09',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a405e1'},body:JSON.stringify({sessionId:'a405e1',runId:'pre-fix',hypothesisId:'H1',location:'RootNavigator.tsx:render',message:'RootNavigator state',data:{isLoading,isAuthenticated,clientStage:client?.onboarding_stage??null,clientPath:client?.onboarding_path??null,clientPresent:!!client},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  // client === null: either new user with no clients row (→ onboarding) OR
  // DB error on fetchClient (AuthContext logs the error but keeps client=null).
  // Both cases correctly route to Onboarding; new users complete it and get a
  // clients row; DB-error users will retry on next token refresh.
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
              name="WorkoutPreview"
              component={WorkoutPreviewScreen}
              options={{
                headerShown: true,
                headerTitle: "Förhandsgranska pass",
                headerBackTitle: "Tillbaka",
                headerStyle: { backgroundColor: themeColors.background },
                headerTintColor: themeColors.textPrimary,
                headerTitleStyle: { fontWeight: "600" },
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
            <Stack.Screen
              name="Calendar"
              component={CalendarScreen}
              options={{
                headerShown: true,
                headerTitle: "Kalender",
                headerBackTitle: "Tillbaka",
                headerStyle: { backgroundColor: themeColors.background },
                headerTintColor: themeColors.textPrimary,
                headerTitleStyle: { fontWeight: "600" },
              }}
            />
            <Stack.Screen
              name="DayDetail"
              component={DayDetailScreen}
              options={({ route }) => {
                const dateStr = route.params?.date;
                const d = dateStr ? new Date(dateStr + "T12:00:00") : new Date();
                const dayName = ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"][d.getDay()];
                const dateDisplay = `${d.getDate()}/${d.getMonth() + 1}`;
                return {
                  headerShown: true,
                  headerTitle: dateStr ? `${dayName} ${dateDisplay}` : "Okänd dag",
                  headerBackTitle: "Tillbaka",
                  headerStyle: { backgroundColor: themeColors.background },
                  headerTintColor: themeColors.textPrimary,
                  headerTitleStyle: { fontWeight: "600" },
                };
              }}
            />
            <Stack.Screen
              name="CycleInsights"
              component={CycleInsightsScreen}
              options={{
                headerShown: true,
                headerTitle: "Cykelinsikter",
                headerBackTitle: "Tillbaka",
                headerStyle: { backgroundColor: themeColors.background },
                headerTintColor: themeColors.textPrimary,
                headerTitleStyle: { fontWeight: "600" },
              }}
            />
            <Stack.Screen
              name="Measurements"
              component={MeasurementsScreen}
              options={{
                headerShown: true,
                headerTitle: "Mätningar",
                headerBackTitle: "Tillbaka",
                headerStyle: { backgroundColor: themeColors.background },
                headerTintColor: themeColors.textPrimary,
                headerTitleStyle: { fontWeight: "600" },
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                headerShown: true,
                headerTitle: "Inställningar",
                headerBackTitle: "Tillbaka",
                headerStyle: { backgroundColor: themeColors.background },
                headerTintColor: themeColors.textPrimary,
                headerTitleStyle: { fontWeight: "600" },
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: true,
                headerTitle: "Min resa",
                headerBackTitle: "Tillbaka",
                headerStyle: { backgroundColor: themeColors.background },
                headerTintColor: themeColors.textPrimary,
                headerTitleStyle: { fontWeight: "600" },
              }}
            />
            <Stack.Screen
              name="ArticleDetail"
              component={ArticleDetailScreen}
              options={({ route }) => ({
                headerShown: true,
                headerTitle: route.params?.title ?? "Artikel",
                headerBackTitle: "Tillbaka",
                headerStyle: { backgroundColor: themeColors.background },
                headerTintColor: themeColors.textPrimary,
                headerTitleStyle: { fontWeight: "600" },
              })}
            />
            <Stack.Screen
              name="PhaseDetail"
              component={PhaseDetailScreen}
              options={({ route }) => ({
                headerShown: true,
                headerTitle: route.params?.phaseName ?? "Fas",
                headerBackTitle: "Tillbaka",
                headerStyle: { backgroundColor: themeColors.background },
                headerTintColor: themeColors.textPrimary,
                headerTitleStyle: { fontWeight: "600" },
              })}
            />
            {__DEV__ && (
              <Stack.Screen
                name="Scenario"
                component={ScenarioScreen}
                options={{
                  headerShown: true,
                  headerTitle: "Scenario (dev)",
                  headerBackTitle: "Tillbaka",
                  headerStyle: { backgroundColor: themeColors.background },
                  headerTintColor: themeColors.textPrimary,
                }}
              />
            )}
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

