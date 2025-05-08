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
  StatusBar,
  SafeAreaView,
} from "react-native";
import { styled } from "nativewind";
import { useUserPreferences } from "../../src/context/UserPreferencesContext";
import WebLayout from "../components/WebLayout";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// styled components for consistent styling
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

// list of dietary options users can choose from
const DIETARY_OPTIONS = [
  { name: "Vegetarian", icon: "leaf" },
  { name: "Vegan", icon: "seedling" },
  { name: "Pescatarian", icon: "fish" },
  { name: "Gluten-Free", icon: "bread-slice" },
  { name: "Dairy-Free", icon: "cheese" },
  { name: "Keto", icon: "drumstick-bite" },
  { name: "Paleo", icon: "carrot" },
  { name: "Low-Carb", icon: "apple-alt" },
];

// list of cuisine types users can select
const CUISINE_OPTIONS = [
  { name: "Italian", icon: "pizza-slice" },
  { name: "Chinese", icon: "utensils" },
  { name: "Japanese", icon: "fish" },
  { name: "Mexican", icon: "pepper-hot" },
  { name: "Indian", icon: "mortar-pestle" },
  { name: "Thai", icon: "bowl-rice" },
  { name: "Mediterranean", icon: "leaf" },
  { name: "American", icon: "hamburger" },
  { name: "French", icon: "wine-glass-alt" },
  { name: "Korean", icon: "bowl-food" },
];

// cooking skill levels available with icons
type SkillLevelType = {
  level: "beginner" | "intermediate" | "advanced";
  icon: string;
};

const SKILL_LEVELS: SkillLevelType[] = [
  { level: "beginner", icon: "seedling" },
  { level: "intermediate", icon: "utensils" },
  { level: "advanced", icon: "hat-chef" },
];

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
  const updateSkillLevel = (level: SkillLevelType["level"]) => {
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
                  key={level.level}
                  onClick={() => updateSkillLevel(level.level)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "9999px",
                    backgroundColor:
                      preferences.cookingSkillLevel === level.level
                        ? "#4F46E5"
                        : isDark
                        ? "#374151"
                        : "#F3F4F6",
                    color:
                      preferences.cookingSkillLevel === level.level
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
                  {level.level}
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
                  key={option.name}
                  onClick={() => toggleDietaryPreference(option.name)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "9999px",
                    backgroundColor: preferences.dietaryPreferences.includes(
                      option.name
                    )
                      ? "#4F46E5"
                      : isDark
                      ? "#374151"
                      : "#F3F4F6",
                    color: preferences.dietaryPreferences.includes(option.name)
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
                  {option.name}
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
                  key={cuisine.name}
                  onClick={() => toggleCuisinePreference(cuisine.name)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "9999px",
                    backgroundColor: preferences.cuisinePreferences.includes(
                      cuisine.name
                    )
                      ? "#4F46E5"
                      : isDark
                      ? "#374151"
                      : "#F3F4F6",
                    color: preferences.cuisinePreferences.includes(cuisine.name)
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
                  {cuisine.name}
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
    <StyledSafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      {/* Header with gradient */}
      <LinearGradient
        colors={
          isDark
            ? ["#4F46E5", "#6366F1", "#818CF8"]
            : ["#6366F1", "#818CF8", "#A5B4FC"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-4 pb-6 px-4 rounded-b-3xl"
      >
        <StyledView className="flex-row items-center">
          <FontAwesome5 name="sliders-h" size={24} color="white" />
          <StyledText className="text-white text-xl font-bold ml-3">
            Cooking Preferences
          </StyledText>
        </StyledView>
      </LinearGradient>

      <StyledScrollView
        className="flex-1 px-4 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Skill Level */}
        <StyledView className="mb-8">
          <StyledView className="flex-row items-center mb-4">
            <FontAwesome5
              name="star"
              size={20}
              color={isDark ? "#818CF8" : "#6366F1"}
            />
            <StyledText
              className={`text-lg font-semibold ml-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Cooking Skill Level
            </StyledText>
          </StyledView>
          <StyledView className="flex-row justify-between">
            {SKILL_LEVELS.map((skillLevel) => (
              <StyledTouchableOpacity
                key={skillLevel.level}
                onPress={() => updateSkillLevel(skillLevel.level)}
                className={`flex-1 mx-1 rounded-2xl py-4 items-center ${
                  preferences.cookingSkillLevel === skillLevel.level
                    ? isDark
                      ? "bg-indigo-600"
                      : "bg-indigo-500"
                    : isDark
                    ? "bg-gray-800"
                    : "bg-white"
                }`}
                style={{
                  elevation:
                    preferences.cookingSkillLevel === skillLevel.level ? 5 : 2,
                }}
              >
                <FontAwesome5
                  name={skillLevel.icon}
                  size={24}
                  color={
                    preferences.cookingSkillLevel === skillLevel.level
                      ? "white"
                      : isDark
                      ? "#818CF8"
                      : "#6366F1"
                  }
                />
                <StyledText
                  className={`capitalize mt-2 font-medium ${
                    preferences.cookingSkillLevel === skillLevel.level
                      ? "text-white"
                      : isDark
                      ? "text-gray-200"
                      : "text-gray-900"
                  }`}
                >
                  {skillLevel.level}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
        </StyledView>

        {/* Dietary Preferences */}
        <StyledView className="mb-8">
          <StyledView className="flex-row items-center mb-4">
            <FontAwesome5
              name="leaf"
              size={20}
              color={isDark ? "#818CF8" : "#6366F1"}
            />
            <StyledText
              className={`text-lg font-semibold ml-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Dietary Preferences
            </StyledText>
          </StyledView>
          <StyledView className="flex-row flex-wrap gap-2">
            {DIETARY_OPTIONS.map(({ name, icon }) => (
              <StyledTouchableOpacity
                key={name}
                onPress={() => toggleDietaryPreference(name)}
                className={`rounded-2xl px-4 py-3 flex-row items-center ${
                  preferences.dietaryPreferences.includes(name)
                    ? isDark
                      ? "bg-indigo-600"
                      : "bg-indigo-500"
                    : isDark
                    ? "bg-gray-800"
                    : "bg-white"
                }`}
                style={{
                  elevation: preferences.dietaryPreferences.includes(name)
                    ? 5
                    : 2,
                }}
              >
                <FontAwesome5
                  name={icon}
                  size={16}
                  color={
                    preferences.dietaryPreferences.includes(name)
                      ? "white"
                      : isDark
                      ? "#818CF8"
                      : "#6366F1"
                  }
                />
                <StyledText
                  className={`ml-2 ${
                    preferences.dietaryPreferences.includes(name)
                      ? "text-white"
                      : isDark
                      ? "text-gray-200"
                      : "text-gray-900"
                  }`}
                >
                  {name}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
        </StyledView>

        {/* Cuisine Preferences */}
        <StyledView className="mb-8">
          <StyledView className="flex-row items-center mb-4">
            <FontAwesome5
              name="globe"
              size={20}
              color={isDark ? "#818CF8" : "#6366F1"}
            />
            <StyledText
              className={`text-lg font-semibold ml-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Favorite Cuisines
            </StyledText>
          </StyledView>
          <StyledView className="flex-row flex-wrap gap-2">
            {CUISINE_OPTIONS.map(({ name, icon }) => (
              <StyledTouchableOpacity
                key={name}
                onPress={() => toggleCuisinePreference(name)}
                className={`rounded-2xl px-4 py-3 flex-row items-center ${
                  preferences.cuisinePreferences.includes(name)
                    ? isDark
                      ? "bg-indigo-600"
                      : "bg-indigo-500"
                    : isDark
                    ? "bg-gray-800"
                    : "bg-white"
                }`}
                style={{
                  elevation: preferences.cuisinePreferences.includes(name)
                    ? 5
                    : 2,
                }}
              >
                <FontAwesome5
                  name={icon}
                  size={16}
                  color={
                    preferences.cuisinePreferences.includes(name)
                      ? "white"
                      : isDark
                      ? "#818CF8"
                      : "#6366F1"
                  }
                />
                <StyledText
                  className={`ml-2 ${
                    preferences.cuisinePreferences.includes(name)
                      ? "text-white"
                      : isDark
                      ? "text-gray-200"
                      : "text-gray-900"
                  }`}
                >
                  {name}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
        </StyledView>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
}
