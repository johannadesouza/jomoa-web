import { StatusBar } from "expo-status-bar";
import { useFonts } from "@expo-google-fonts/cormorant/useFonts";
import {
  Cormorant_400Regular,
  Cormorant_600SemiBold,
} from "@expo-google-fonts/cormorant";
import { ActivityIndicator, View } from "react-native";
import { initSentry, wrapWithSentry } from "./src/lib/sentry";

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? "";
initSentry(SENTRY_DSN);
import { TamaguiProvider, Theme } from "tamagui";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { useEffect } from "react";
import tamaguiConfig from "./tamagui.config";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { ErrorBoundary } from "./src/shared/ui/ErrorBoundary";
import { AuthProvider } from "./src/shared/context/AuthContext";
import { AppNowProvider } from "./src/shared/context/AppNowContext";
import { FeatureFlagsProvider } from "./src/shared/context/FeatureFlagsContext";
import { ScenarioProvider } from "./src/shared/context/ScenarioContext";
import { AssignmentProvider } from "./src/shared/context/AssignmentContext";
import { CycleProvider } from "./src/shared/context/CycleContext";
import { ThemeProvider, useTheme } from "./src/shared/context/ThemeContext";
import { getThemeColors } from "./src/shared/theme/colors";
import { useAuth } from "./src/shared/context/AuthContext";
import { DemoPersonaProvider } from "./src/shared/context/DemoPersonaContext";
import {
  requestNotificationPermissions,
  scheduleDailyCheckin,
  isDailyCheckinScheduled,
} from "./src/lib/services/notificationService";

function LoadingScreen() {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}

function NotificationSetup() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    async function setup() {
      const granted = await requestNotificationPermissions();
      if (!granted) return;

      // Schemalägg bara om ingen notis redan finns — undviker reset vid varje öppning
      const alreadyScheduled = await isDailyCheckinScheduled();
      if (!alreadyScheduled) {
        await scheduleDailyCheckin(7, 30);
      }
    }

    setup();
  }, [isAuthenticated]);

  return null;
}

function AppContent() {
  const { theme } = useTheme();
  return (
    <ErrorBoundary>
      <Theme name={theme}>
        <SafeAreaProvider>
          <FeatureFlagsProvider>
            <DemoPersonaProvider>
              <AuthProvider>
                <AppNowProvider>
                  <ScenarioProvider>
                    <NotificationSetup />
                    <AssignmentProvider>
                      <CycleProvider>
                        <NavigationContainer>
                          <StatusBar style={theme === "dark" ? "light" : "dark"} />
                          <RootNavigator />
                        </NavigationContainer>
                      </CycleProvider>
                    </AssignmentProvider>
                  </ScenarioProvider>
                </AppNowProvider>
              </AuthProvider>
            </DemoPersonaProvider>
          </FeatureFlagsProvider>
        </SafeAreaProvider>
      </Theme>
    </ErrorBoundary>
  );
}

function App() {
  const [fontsLoaded] = useFonts({
    Cormorant_400Regular,
    Cormorant_600SemiBold,
  });

  return (
    <ThemeProvider>
      {!fontsLoaded ? (
        <LoadingScreen />
      ) : (
        <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
          <AppContent />
        </TamaguiProvider>
      )}
    </ThemeProvider>
  );
}

export default wrapWithSentry(App);
