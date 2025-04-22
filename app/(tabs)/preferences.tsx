import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Switch,
} from "react-native";
import { styled } from "nativewind";
import { useUserPreferences } from "../../src/context/UserPreferencesContext";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Low-Carb",
];

const CUISINE_OPTIONS = [
  "Italian",
  "Chinese",
  "Japanese",
  "Mexican",
  "Indian",
  "Thai",
  "Mediterranean",
  "American",
  "French",
  "Korean",
];

const SKILL_LEVELS = ["beginner", "intermediate", "advanced"] as const;

export default function PreferencesScreen() {
  const { preferences, updatePreferences } = useUserPreferences();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const toggleDietaryPreference = (preference: string) => {
    const current = preferences.dietaryPreferences;
    const updated = current.includes(preference)
      ? current.filter((p) => p !== preference)
      : [...current, preference];
    updatePreferences({ dietaryPreferences: updated });
  };

  const toggleCuisinePreference = (cuisine: string) => {
    const current = preferences.cuisinePreferences;
    const updated = current.includes(cuisine)
      ? current.filter((c) => c !== cuisine)
      : [...current, cuisine];
    updatePreferences({ cuisinePreferences: updated });
  };

  const updateSkillLevel = (level: (typeof SKILL_LEVELS)[number]) => {
    updatePreferences({ cookingSkillLevel: level });
  };

  return (
    <StyledScrollView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <StyledView className="p-4">
        {/* Header */}
        <StyledText
          className={`text-2xl font-bold mb-6 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Cooking Preferences
        </StyledText>

        {/* Skill Level */}
        <StyledView className="mb-8">
          <StyledText
            className={`text-lg font-semibold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Cooking Skill Level
          </StyledText>
          <StyledView className="flex-row flex-wrap gap-2">
            {SKILL_LEVELS.map((level) => (
              <StyledTouchableOpacity
                key={level}
                onPress={() => updateSkillLevel(level)}
                className={`rounded-full px-4 py-2 ${
                  preferences.cookingSkillLevel === level
                    ? isDark
                      ? "bg-blue-600"
                      : "bg-blue-500"
                    : isDark
                    ? "bg-gray-800"
                    : "bg-white"
                }`}
              >
                <StyledText
                  className={`capitalize ${
                    preferences.cookingSkillLevel === level
                      ? "text-white"
                      : isDark
                      ? "text-gray-200"
                      : "text-gray-900"
                  }`}
                >
                  {level}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
        </StyledView>

        {/* Dietary Preferences */}
        <StyledView className="mb-8">
          <StyledText
            className={`text-lg font-semibold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Dietary Preferences
          </StyledText>
          <StyledView className="flex-row flex-wrap gap-2">
            {DIETARY_OPTIONS.map((option) => (
              <StyledTouchableOpacity
                key={option}
                onPress={() => toggleDietaryPreference(option)}
                className={`rounded-full px-4 py-2 ${
                  preferences.dietaryPreferences.includes(option)
                    ? isDark
                      ? "bg-blue-600"
                      : "bg-blue-500"
                    : isDark
                    ? "bg-gray-800"
                    : "bg-white"
                }`}
              >
                <StyledText
                  className={
                    preferences.dietaryPreferences.includes(option)
                      ? "text-white"
                      : isDark
                      ? "text-gray-200"
                      : "text-gray-900"
                  }
                >
                  {option}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
        </StyledView>

        {/* Cuisine Preferences */}
        <StyledView className="mb-8">
          <StyledText
            className={`text-lg font-semibold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Favorite Cuisines
          </StyledText>
          <StyledView className="flex-row flex-wrap gap-2">
            {CUISINE_OPTIONS.map((cuisine) => (
              <StyledTouchableOpacity
                key={cuisine}
                onPress={() => toggleCuisinePreference(cuisine)}
                className={`rounded-full px-4 py-2 ${
                  preferences.cuisinePreferences.includes(cuisine)
                    ? isDark
                      ? "bg-blue-600"
                      : "bg-blue-500"
                    : isDark
                    ? "bg-gray-800"
                    : "bg-white"
                }`}
              >
                <StyledText
                  className={
                    preferences.cuisinePreferences.includes(cuisine)
                      ? "text-white"
                      : isDark
                      ? "text-gray-200"
                      : "text-gray-900"
                  }
                >
                  {cuisine}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledScrollView>
  );
}
