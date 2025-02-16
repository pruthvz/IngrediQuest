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
  const { logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
              John Doe
            </StyledText>
            <StyledText
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              john.doe@example.com
            </StyledText>
          </StyledView>

          <StyledView className="flex-row justify-around mt-6">
            <StyledView className="items-center">
              <StyledText
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                28
              </StyledText>
              <StyledText
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Saved Recipes
              </StyledText>
            </StyledView>
            <StyledView className="items-center">
              <StyledText
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                12
              </StyledText>
              <StyledText
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Meal Plans
              </StyledText>
            </StyledView>
          </StyledView>
        </StyledView>

        {/* Settings */}
        <StyledView className="space-y-3">
          {settingsItems.map((item) => (
            <StyledTouchableOpacity
              key={item.id}
              className={`flex-row items-center p-4 rounded-lg ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
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
              <StyledText
                className={`flex-1 text-lg ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                {item.title}
              </StyledText>
              <FontAwesome
                name="chevron-right"
                size={16}
                color={isDark ? "#6B7280" : "#9CA3AF"}
              />
            </StyledTouchableOpacity>
          ))}
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
