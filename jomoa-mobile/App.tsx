import { StatusBar } from "expo-status-bar";
import { useFonts } from "@expo-google-fonts/cormorant/useFonts";
import {
  Cormorant_400Regular,
  Cormorant_600SemiBold,
} from "@expo-google-fonts/cormorant";
import { ActivityIndicator, View } from "react-native";
import { TamaguiProvider, Theme } from "tamagui";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import tamaguiConfig from "./tamagui.config";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/shared/context/AuthContext";
import { AssignmentProvider } from "./src/shared/context/AssignmentContext";
import { CycleProvider } from "./src/shared/context/CycleContext";
import { ThemeProvider, useTheme } from "./src/shared/context/ThemeContext";

function AppContent() {
  const { theme } = useTheme();
  return (
    <Theme name={theme}>
      <SafeAreaProvider>
        <AuthProvider>
          <AssignmentProvider>
          <CycleProvider>
          <NavigationContainer>
            <StatusBar style={theme === "dark" ? "light" : "dark"} />
            <RootNavigator />
          </NavigationContainer>
          </CycleProvider>
          </AssignmentProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </Theme>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Cormorant_400Regular,
    Cormorant_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#141012" }}>
        <ActivityIndicator size="large" color="#D96D46" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <AppContent />
      </TamaguiProvider>
    </ThemeProvider>
  );
}
