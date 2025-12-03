import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthScreen from "../app/auth/AuthScreen";

export type RootStackParamList = {
  Auth: undefined;
  // Add more routes here as needed
  // Dashboard: undefined;
  // ClientDashboard: undefined;
  // CoachDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Auth" component={AuthScreen} />
      {/* Add more screens here as needed */}
    </Stack.Navigator>
  );
}

