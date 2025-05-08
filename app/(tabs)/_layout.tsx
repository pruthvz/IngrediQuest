import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUserPreferences } from "../../src/context/UserPreferencesContext";

export default function TabLayout() {
  const { preferences } = useUserPreferences();
  const isDark = preferences.isDarkMode;
  const { isAuthenticated } = useAuth();
  const isWeb = Platform.OS === "web";

  // my bottom navbar on the mobile native devices.
  // styling for the navbar when the button is clicked
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? "#3B82F6" : "#2563EB",
        tabBarInactiveTintColor: isDark ? "#6B7280" : "#9CA3AF",
        tabBarStyle: isWeb
          ? { display: "none" }
          : {
              backgroundColor: isDark ? "#111827" : "#FFFFFF",
              borderTopColor: isDark ? "#1F2937" : "#E5E7EB",
              height: 80,
              paddingBottom: 8,
              paddingTop: 8,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 10,
              position: "absolute",
              borderTopWidth: 0,
            },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 name="home" size={22} color={color} solid={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5
              name="compass"
              size={22}
              color={color}
              solid={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: "Shopping",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5
              name="shopping-basket"
              size={22}
              color={color}
              solid={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5
              name="bookmark"
              size={22}
              color={color}
              solid={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 name="user" size={22} color={color} solid={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="preferences"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="meal-planner"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
