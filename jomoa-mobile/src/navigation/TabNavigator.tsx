import React from "react";
import { View, Pressable, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Text, YStack } from "tamagui";

import { getThemeColors } from "../shared/theme/colors";
import { useTheme } from "../shared/context/ThemeContext";
import { DashboardScreen } from "../features/dashboard/DashboardScreen";
import { TrainScreen } from "../features/train/TrainScreen";
import { LogScreen } from "../features/log/LogScreen";
import { InsightsScreen } from "../features/insights/InsightsScreen";
import { LearnScreen } from "../features/learn/LearnScreen";

export type TabParamList = {
  HomeTab: undefined;
  TrainTab: undefined;
  LogTab: undefined;
  InsightsTab: undefined;
  LearnTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const CENTER_INDEX = 2; // Hem is the 3rd tab (0: Träna, 1: Logga, 2: Hem, 3: Insikter, 4: Lär dig)
const CENTER_PILL_SIZE = 56;
const CENTER_PILL_RISE = 16;

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

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const barStyle = {
    backgroundColor: colors.card,
    borderTopColor: colors.borderSoft,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  };

  const centerPillStyle = {
    width: CENTER_PILL_SIZE,
    height: CENTER_PILL_SIZE,
    borderRadius: CENTER_PILL_SIZE / 2,
    backgroundColor: colors.accent,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  };

  return (
    <View
      style={[
        styles.barContainer,
        barStyle,
        { paddingBottom: Platform.OS === "ios" ? 28 : 20, paddingTop: 12, minHeight: 72 },
      ]}
    >
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const isCenter = index === CENTER_INDEX;
          const { options } = descriptors[route.key];
          const icon = options.tabBarIcon?.({ focused: isFocused, color: "", size: 0 });

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isCenter) {
            return (
              <View key={route.key} style={styles.centerSlot}>
                <Pressable
                  onPress={onPress}
                  style={[
                    centerPillStyle,
                    { position: "absolute", bottom: CENTER_PILL_RISE },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel ?? "Hem"}
                >
                  <YStack alignItems="center" gap={4}>
                    <Text fontSize="$xl">🏠</Text>
                    <Text fontSize="$xs" color="#FFFBF8" fontWeight="600">
                      Hem
                    </Text>
                  </YStack>
                </Pressable>
              </View>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? route.name}
            >
              {icon}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    borderTopWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    flex: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  centerSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    minHeight: CENTER_PILL_SIZE + CENTER_PILL_RISE,
  },
});

export function TabNavigator() {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="TrainTab"
        component={TrainScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Träna" icon="💪" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="LogTab"
        component={LogScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Logga" icon="📝" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="HomeTab"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Hem" icon="🏠" focused={focused} />
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
        name="LearnTab"
        component={LearnScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Lär dig" icon="📚" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
