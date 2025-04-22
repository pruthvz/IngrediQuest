import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isAuthenticated } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? "#3B82F6" : "#2563EB",
        tabBarInactiveTintColor: isDark ? "#6B7280" : "#9CA3AF",
        tabBarStyle: {
          backgroundColor: isDark ? "#111827" : "#FFFFFF",
          borderTopColor: isDark ? "#1F2937" : "#E5E7EB",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="search" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: "Shopping",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="shopping-basket" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="bookmark" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={24} color={color} />
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
