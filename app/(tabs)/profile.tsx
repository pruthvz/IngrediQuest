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

export default function Profile() {
  const { logout, username } = useAuth();
  const { savedRecipes } = useSavedRecipes();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
      <StyledView className="p-4">
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

        {/* Settings */}
        <StyledView className="space-y-3">
          {profileItems.map((item) => {
            const Component = item.route ? Link : StyledView;
            return (
              <Component
                key={item.id}
                href={item.route || undefined}
                asChild={!!item.route}
              >
                <StyledTouchableOpacity
                  className={`flex-row items-center p-4 rounded-lg ${
                    isDark ? "bg-gray-800" : "bg-white"
                  }`}
                  disabled={!item.route}
                >
                  <StyledView
                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <FontAwesome
                      name={item.icon as any}
                      size={20}
                      color={item.color}
                    />
                  </StyledView>
                  <StyledView className="flex-1 flex-row items-center justify-between">
                    <StyledText
                      className={`text-lg ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {item.title}
                    </StyledText>
                    {item.count !== undefined && (
                      <StyledView className="bg-primary-100 px-2 py-1 rounded-full">
                        <StyledText className="text-primary-600 font-medium">
                          {item.count}
                        </StyledText>
                      </StyledView>
                    )}
                  </StyledView>
                  <FontAwesome
                    name="chevron-right"
                    size={16}
                    color={isDark ? "#6B7280" : "#9CA3AF"}
                  />
                </StyledTouchableOpacity>
              </Component>
            );
          })}
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
    </ScrollView>
  );
}
