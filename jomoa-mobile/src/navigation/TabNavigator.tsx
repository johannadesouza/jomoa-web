import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, YStack } from "tamagui";

import { themeColors } from "../shared/theme/colors";
import { DashboardScreen } from "../features/dashboard/DashboardScreen";
import { WorkoutsScreen } from "../features/workouts/WorkoutsScreen";
import { CalendarScreen } from "../features/calendar/CalendarScreen";
import { InsightsScreen } from "../features/insights/InsightsScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";

export type TabParamList = {
  DashboardTab: undefined;
  WorkoutsTab: undefined;
  CalendarTab: undefined;
  InsightsTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

interface TabIconProps {
  label: string;
  icon: string;
  focused: boolean;
}

function TabIcon({ label, icon, focused }: TabIconProps) {
  return (
    <YStack alignItems="center" gap="$1">
      <Text fontSize="$xl">{icon}</Text>
      <Text
        fontSize="$xs"
        color={focused ? "$accent" : "$textSecondary"}
        fontWeight={focused ? "600" : "400"}
      >
        {label}
      </Text>
    </YStack>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: themeColors.card,
          borderTopColor: themeColors.borderSoft,
          borderTopWidth: 1,
          height: 80,
          paddingTop: 8,
          paddingBottom: 24,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Hem" icon="🏠" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="WorkoutsTab"
        component={WorkoutsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Träning" icon="💪" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Kalender" icon="📅" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="InsightsTab"
        component={InsightsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Insikter" icon="📊" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Inställningar" icon="⚙️" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
