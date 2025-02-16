import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome } from "@expo/vector-icons";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface MealPlan {
  id: string;
  day: string;
  meals: {
    type: "breakfast" | "lunch" | "dinner";
    title: string;
    time: string;
  }[];
}

const weeklyPlan: MealPlan[] = [
  {
    id: "1",
    day: "Monday",
    meals: [
      { type: "breakfast", title: "Oatmeal with Berries", time: "8:00 AM" },
      { type: "lunch", title: "Chicken Caesar Salad", time: "12:30 PM" },
      { type: "dinner", title: "Grilled Salmon", time: "7:00 PM" },
    ],
  },
  {
    id: "2",
    day: "Tuesday",
    meals: [
      { type: "breakfast", title: "Smoothie Bowl", time: "8:00 AM" },
      { type: "lunch", title: "Quinoa Buddha Bowl", time: "12:30 PM" },
      { type: "dinner", title: "Vegetable Stir-Fry", time: "7:00 PM" },
    ],
  },
  // Add more days as needed
];

const mealTypeIcons = {
  breakfast: "coffee",
  lunch: "cutlery",
  dinner: "moon-o",
};

export default function MealPlanner() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedDay, setSelectedDay] = useState(weeklyPlan[0].id);

  return (
    <ScrollView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <StyledView className="p-4">
        {/* Header */}
        <StyledView className="mb-6">
          <StyledText
            className={`text-3xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            Meal Planner
          </StyledText>
          <StyledText
            className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Plan your meals for the week
          </StyledText>
        </StyledView>

        {/* Day Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          <StyledView className="flex-row space-x-3">
            {weeklyPlan.map((day) => (
              <StyledTouchableOpacity
                key={day.id}
                onPress={() => setSelectedDay(day.id)}
                className={`px-4 py-2 rounded-full ${
                  selectedDay === day.id
                    ? "bg-primary-600"
                    : isDark
                    ? "bg-gray-800"
                    : "bg-white border border-gray-200"
                }`}
              >
                <StyledText
                  className={`${
                    selectedDay === day.id
                      ? "text-white font-semibold"
                      : isDark
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`}
                >
                  {day.day}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
        </ScrollView>

        {/* Meal Schedule */}
        {weeklyPlan
          .find((day) => day.id === selectedDay)
          ?.meals.map((meal, index) => (
            <StyledView
              key={index}
              className={`mb-4 p-4 rounded-lg border ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <StyledView className="flex-row items-center justify-between mb-2">
                <StyledView className="flex-row items-center">
                  <FontAwesome
                    name={mealTypeIcons[meal.type]}
                    size={16}
                    color={isDark ? "#E5E7EB" : "#4B5563"}
                    style={{ marginRight: 8 }}
                  />
                  <StyledText
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                  </StyledText>
                </StyledView>
                <StyledText
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {meal.time}
                </StyledText>
              </StyledView>
              <StyledText
                className={`text-lg font-semibold ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                {meal.title}
              </StyledText>
              <StyledTouchableOpacity className="mt-2">
                <StyledText className="text-primary-500 font-medium">
                  Change Recipe
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          ))}

        {/* Add Meal Button */}
        <StyledTouchableOpacity
          className={`mt-4 p-4 rounded-lg border border-dashed flex-row items-center justify-center ${
            isDark ? "border-gray-700" : "border-gray-300"
          }`}
        >
          <FontAwesome
            name="plus"
            size={16}
            color={isDark ? "#E5E7EB" : "#4B5563"}
            style={{ marginRight: 8 }}
          />
          <StyledText
            className={`font-medium ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Add New Meal
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </ScrollView>
  );
}
