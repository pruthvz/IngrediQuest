import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { useSavedRecipes } from "../../src/context/SavedRecipesContext";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { useUserPreferences } from "../../src/context/UserPreferencesContext";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface SettingItem {
  id: string;
  title: string;
  icon: string;
  color: string;
}

const settingsItems: SettingItem[] = [
  {
    id: "1",
    title: "Dietary Preferences",
    icon: "leaf",
    color: "#10B981", // green
  },
  {
    id: "2",
    title: "Allergies & Restrictions",
    icon: "exclamation-circle",
    color: "#F59E0B", // yellow
  },
  {
    id: "3",
    title: "Saved Recipes",
    icon: "heart",
    color: "#EF4444", // red
  },
  {
    id: "4",
    title: "Cooking Skill Level",
    icon: "star",
    color: "#6366F1", // indigo
  },
  {
    id: "5",
    title: "Notification Settings",
    icon: "bell",
    color: "#8B5CF6", // purple
  },
];

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  isDark: boolean;
}

const SettingItem = ({
  icon,
  title,
  subtitle,
  onPress,
  isDark,
}: SettingItemProps) => (
  <StyledTouchableOpacity
    onPress={onPress}
    className={`flex-row items-center p-4 border-b ${
      isDark ? "border-gray-800" : "border-gray-200"
    }`}
  >
    <StyledView
      className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
        isDark ? "bg-gray-800" : "bg-gray-100"
      }`}
    >
      <FontAwesome
        name={icon}
        size={20}
        color={isDark ? "#9CA3AF" : "#4B5563"}
      />
    </StyledView>
    <StyledView className="flex-1">
      <StyledText
        className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
      >
        {title}
      </StyledText>
      {subtitle && (
        <StyledText
          className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {subtitle}
        </StyledText>
      )}
    </StyledView>
    <FontAwesome
      name="chevron-right"
      size={16}
      color={isDark ? "#6B7280" : "#9CA3AF"}
    />
  </StyledTouchableOpacity>
);

export default function ProfileScreen() {
  const { logout, username } = useAuth();
  const { savedRecipes } = useSavedRecipes();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { preferences } = useUserPreferences();

  const profileItems = [
    {
      id: "1",
      title: "Saved Recipes",
      icon: "bookmark",
      color: "#EF4444",
      count: savedRecipes.length,
      route: "/(tabs)/saved",
    },
    {
      id: "2",
      title: "Shopping List",
      icon: "shopping-basket",
      color: "#F59E0B",
      route: "/(tabs)/shopping-list",
    },
    {
      id: "3",
      title: "Dietary Preferences",
      icon: "leaf",
      color: "#10B981",
      route: null,
    },
    {
      id: "4",
      title: "Allergies & Restrictions",
      icon: "exclamation-circle",
      color: "#6366F1",
      route: null,
    },
    {
      id: "5",
      title: "Notification Settings",
      icon: "bell",
      color: "#8B5CF6",
      route: null,
    },
  ];

  return (
    <ScrollView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <StyledView className="p-4 mt-10">
        {/* Profile Header */}
        <StyledView
          className={`p-6 rounded-xl mb-6 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <StyledView className="items-center">
            <Image
              source={{ uri: "https://i.pravatar.cc/150" }}
              className="w-24 h-24 rounded-full mb-4"
            />
            <StyledText
              className={`text-xl font-bold mb-1 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {username || "User"}
            </StyledText>
          </StyledView>

          <StyledView className="flex-row justify-around mt-6">
            <Link href="/(tabs)/saved" asChild>
              <StyledTouchableOpacity className="items-center">
                <StyledText
                  className={`text-lg font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {savedRecipes.length}
                </StyledText>
                <StyledText
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Saved Recipes
                </StyledText>
              </StyledTouchableOpacity>
            </Link>
            <Link href="/(tabs)/shopping-list" asChild>
              <StyledTouchableOpacity className="items-center">
                <FontAwesome
                  name="shopping-basket"
                  size={24}
                  color={isDark ? "#3B82F6" : "#2563eb"}
                />
                <StyledText
                  className={`text-sm mt-1 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Shopping List
                </StyledText>
              </StyledTouchableOpacity>
            </Link>
          </StyledView>
        </StyledView>

        {/* Settings Sections */}
        <StyledView
          className={`rounded-t-3xl ${isDark ? "bg-gray-900" : "bg-white"}`}
        >
          {/* Cooking Preferences */}
          <StyledView className="mb-4">
            <StyledText
              className={`px-4 py-2 text-sm font-semibold ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              COOKING PREFERENCES
            </StyledText>
            <SettingItem
              icon="sliders"
              title="Dietary Preferences"
              subtitle={preferences.dietaryPreferences.join(", ") || "Not set"}
              onPress={() => router.push("/preferences")}
              isDark={isDark}
            />
            <SettingItem
              icon="calendar"
              title="Meal Planner"
              subtitle="Plan your weekly meals"
              onPress={() => router.push("/meal-planner")}
              isDark={isDark}
            />
          </StyledView>

          {/* Lists */}
          <StyledView className="mb-4">
            <StyledText
              className={`px-4 py-2 text-sm font-semibold ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              YOUR LISTS
            </StyledText>
            <SettingItem
              icon="bookmark"
              title="Saved Recipes"
              onPress={() => router.push("/saved")}
              isDark={isDark}
            />
            <SettingItem
              icon="shopping-basket"
              title="Shopping List"
              onPress={() => router.push("/shopping-list")}
              isDark={isDark}
            />
          </StyledView>

          {/* Account Settings */}
          <StyledView className="mb-4">
            <StyledText
              className={`px-4 py-2 text-sm font-semibold ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              ACCOUNT
            </StyledText>
            <SettingItem
              icon="user"
              title="Account Settings"
              onPress={() => {}}
              isDark={isDark}
            />
            <SettingItem
              icon="bell"
              title="Notifications"
              onPress={() => {}}
              isDark={isDark}
            />
            <SettingItem
              icon="gear"
              title="App Settings"
              onPress={() => {}}
              isDark={isDark}
            />
          </StyledView>

          {/* Logout Button */}
          <StyledTouchableOpacity
            className="mt-6 p-4 rounded-lg bg-red-500"
            onPress={logout}
          >
            <StyledView className="flex-row items-center justify-center">
              <FontAwesome
                name="sign-out"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <StyledText className="text-white text-lg font-semibold">
                Logout
              </StyledText>
            </StyledView>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </ScrollView>
  );
}
