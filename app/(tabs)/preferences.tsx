// this screen lets users set their cooking preferences and settings
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Switch,
  Platform,
} from "react-native";
import { styled } from "nativewind";
import { useUserPreferences } from "../../src/context/UserPreferencesContext";
import WebLayout from "../components/WebLayout";

// styled components for consistent styling
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

// list of dietary options users can choose from
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

// list of cuisine types users can select
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

// cooking skill levels available
const SKILL_LEVELS = ["beginner", "intermediate", "advanced"] as const;

export default function PreferencesScreen() {
  // get user preferences from context
  const { preferences, updatePreferences } = useUserPreferences();
  const colorScheme = useColorScheme();
  const isDark = preferences.isDarkMode;
  const isWeb = Platform.OS === "web";

  // handles toggling dietary preferences on/off
  const toggleDietaryPreference = (preference: string) => {
    const current = preferences.dietaryPreferences;
    const updated = current.includes(preference)
      ? current.filter((p) => p !== preference)
      : [...current, preference];
    updatePreferences({ dietaryPreferences: updated });
  };

  // handles toggling cuisine preferences on/off
  const toggleCuisinePreference = (cuisine: string) => {
    const current = preferences.cuisinePreferences;
    const updated = current.includes(cuisine)
      ? current.filter((c) => c !== cuisine)
      : [...current, cuisine];
    updatePreferences({ cuisinePreferences: updated });
  };

  // updates the user's cooking skill level
  const updateSkillLevel = (level: (typeof SKILL_LEVELS)[number]) => {
    updatePreferences({ cookingSkillLevel: level });
  };

  // show web version if on web platform
  if (isWeb) {
    return (
      <WebLayout title="Preferences" currentTab="preferences">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Skill Level */}
          <div style={{ marginBottom: "2rem" }}>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: isDark ? "#F9FAFB" : "#111827",
              }}
            >
              Cooking Skill Level
            </h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap" as const,
                gap: "0.5rem",
              }}
            >
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => updateSkillLevel(level)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "9999px",
                    backgroundColor:
                      preferences.cookingSkillLevel === level
                        ? "#4F46E5"
                        : isDark
                        ? "#374151"
                        : "#F3F4F6",
                    color:
                      preferences.cookingSkillLevel === level
                        ? "white"
                        : isDark
                        ? "#E5E7EB"
                        : "#4B5563",
                    border: "none",
                    cursor: "pointer",
                    textTransform: "capitalize" as const,
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Preferences */}
          <div style={{ marginBottom: "2rem" }}>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: isDark ? "#F9FAFB" : "#111827",
              }}
            >
              Dietary Preferences
            </h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap" as const,
                gap: "0.5rem",
              }}
            >
              {DIETARY_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleDietaryPreference(option)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "9999px",
                    backgroundColor: preferences.dietaryPreferences.includes(
                      option
                    )
                      ? "#4F46E5"
                      : isDark
                      ? "#374151"
                      : "#F3F4F6",
                    color: preferences.dietaryPreferences.includes(option)
                      ? "white"
                      : isDark
                      ? "#E5E7EB"
                      : "#4B5563",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisine Preferences */}
          <div style={{ marginBottom: "2rem" }}>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: isDark ? "#F9FAFB" : "#111827",
              }}
            >
              Favorite Cuisines
            </h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap" as const,
                gap: "0.5rem",
              }}
            >
              {CUISINE_OPTIONS.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => toggleCuisinePreference(cuisine)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "9999px",
                    backgroundColor: preferences.cuisinePreferences.includes(
                      cuisine
                    )
                      ? "#4F46E5"
                      : isDark
                      ? "#374151"
                      : "#F3F4F6",
                    color: preferences.cuisinePreferences.includes(cuisine)
                      ? "white"
                      : isDark
                      ? "#E5E7EB"
                      : "#4B5563",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  }}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
        </div>
      </WebLayout>
    );
  }

  // show mobile version for mobile platforms
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
