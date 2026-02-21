import { StatusBar } from "expo-status-bar";
import { TamaguiProvider, Theme } from "tamagui";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import tamaguiConfig from "./tamagui.config";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/shared/context/AuthContext";

export default function App() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <Theme name="dark">
        <SafeAreaProvider>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar style="light" />
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </SafeAreaProvider>
      </Theme>
    </TamaguiProvider>
  );
}
