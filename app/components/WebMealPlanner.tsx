import React, { useState } from "react";
import { useColorScheme } from "react-native";
import WebIcon from "./WebIcon";

// Type definitions for Recipe data structure
interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string;
  prepTime: string;
  cookTime: string;
}

// Type definitions for MealPlan data structure
interface MealPlan {
  id: string;
  day: string;
  meals: {
    type: "breakfast" | "lunch" | "dinner";
    title: string;
    time: string;
    recipeId?: string;
  }[];
}

// Props interface for WebMealPlanner component
interface WebMealPlannerProps {
  weeklyPlan: MealPlan[]; // Array of meal plans for the week
  selectedDay: string; // Currently selected day
  setSelectedDay: (day: string) => void; // Function to update selected day
  onAddMeal: () => void; // Function to handle adding a new meal
  onEditMeal: (dayId: string, mealIndex: number) => void; // Function to edit existing meal
  onDeleteMeal: (dayId: string, mealIndex: number) => void; // Function to delete a meal
  onOpenRecipeModal: (dayId: string, mealIndex: number) => void; // Function to open recipe modal
  onViewRecipe: (recipeId: string) => void; // Function to view recipe details
  getRecipeById: (recipeId: string | undefined) => Recipe | undefined; // Function to fetch recipe by ID
  isDark: boolean; // Dark mode flag
  onSaveMealPlan: (plan: MealPlan[]) => void; // Function to save meal plan
}

// Type for meal types
type MealType = "breakfast" | "lunch" | "dinner";

// WebMealPlanner component for displaying and managing meal plans
export default function WebMealPlanner({
  weeklyPlan,
  selectedDay,
  setSelectedDay,
  onAddMeal,
  onEditMeal,
  onDeleteMeal,
  onOpenRecipeModal,
  onViewRecipe,
  getRecipeById,
  isDark,
  onSaveMealPlan,
}: WebMealPlannerProps) {
  // Get the meal plan for the selected day
  const selectedDayPlan = weeklyPlan.find((day) => day.id === selectedDay);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      {/* Week Day Selector */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "0.5rem",
          padding: "0.5rem 0",
          marginBottom: "0.5rem",
        }}
      >
        {weeklyPlan.map((day) => (
          <button
            key={day.id}
            onClick={() => setSelectedDay(day.id)}
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "0.5rem",
              backgroundColor:
                selectedDay === day.id
                  ? "#4F46E5"
                  : isDark
                  ? "#1F2937"
                  : "#F9FAFB",
              color:
                selectedDay === day.id
                  ? "white"
                  : isDark
                  ? "#E5E7EB"
                  : "#4B5563",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              minWidth: "100px",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {day.day}
          </button>
        ))}
      </div>

      {/* Main Content Area for Selected Day's Meals */}
      <div
        style={{
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          borderRadius: "0.75rem",
          overflow: "hidden",
          border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
        }}
      >
        {/* Header Section with Title and Actions */}
        <div
          style={{
            padding: "1rem",
            borderBottom: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 600,
                color: isDark ? "#f0f0f0" : "#111827",
                margin: 0,
              }}
            >
              Weekly Meal Plan
            </h1>
            <div style={{ display: "flex", gap: "1rem" }}>
              {/* Random Meal Plan Generator Button */}
              <button
                onClick={() => {
                  // Default meals for random generation
                  const mealTypes: MealType[] = [
                    "breakfast",
                    "lunch",
                    "dinner",
                  ];
                  const defaultMeals: Record<MealType, string[]> = {
                    breakfast: [
                      "Oatmeal with Berries",
                      "Avocado Toast",
                      "Pancakes",
                      "Smoothie Bowl",
                      "Eggs Benedict",
                      "French Toast",
                      "Yogurt Parfait",
                    ],
                    lunch: [
                      "Chicken Caesar Salad",
                      "Quinoa Buddha Bowl",
                      "Tuna Sandwich",
                      "Greek Salad",
                      "Vegetable Soup",
                      "Turkey Wrap",
                      "Pasta Salad",
                    ],
                    dinner: [
                      "Grilled Salmon",
                      "Chicken Stir-Fry",
                      "Beef Tacos",
                      "Vegetable Curry",
                      "Pasta Primavera",
                      "Baked Chicken",
                      "Shrimp Scampi",
                    ],
                  };

                  // Helper function to get random time for meal type
                  const getRandomTime = (mealType: MealType): string => {
                    switch (mealType) {
                      case "breakfast":
                        return "8:00 AM";
                      case "lunch":
                        return "12:30 PM";
                      case "dinner":
                        return "7:00 PM";
                      default:
                        return "12:00 PM";
                    }
                  };

                  // Helper function to get random meal from list
                  const getRandomMeal = (type: MealType): string => {
                    const meals = defaultMeals[type];
                    return meals[Math.floor(Math.random() * meals.length)];
                  };

                  // Generate new weekly plan with random meals
                  const newWeeklyPlan = weeklyPlan.map((day) => ({
                    ...day,
                    meals: mealTypes.map((type) => ({
                      type,
                      title: getRandomMeal(type),
                      time: getRandomTime(type),
                    })),
                  }));

                  // Update the meal plan
                  onSaveMealPlan(newWeeklyPlan);
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#4F46E5",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                <WebIcon name="random" />
                Deal Random Meal Plan
              </button>
              {/* Add Meal Button */}
              <button
                onClick={onAddMeal}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.5rem",
                  backgroundColor: isDark ? "#374151" : "#E5E7EB",
                  color: isDark ? "#E5E7EB" : "#4B5563",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                <WebIcon name="plus" />
                Add Meal
              </button>
            </div>
          </div>
        </div>

        {/* Meals List Section */}
        <div style={{ padding: "1rem" }}>
          {selectedDayPlan?.meals.map((meal, index) => {
            const recipe = meal.recipeId
              ? getRecipeById(meal.recipeId)
              : undefined;

            return (
              <div
                key={`${selectedDayPlan.id}-${index}`}
                style={{
                  padding: "1rem",
                  marginBottom: "1rem",
                  borderRadius: "0.5rem",
                  backgroundColor: isDark ? "#111827" : "#F9FAFB",
                  border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                }}
              >
                {/* Individual Meal Card */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.75rem",
                  }}
                >
                  {/* Meal Info Section */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    {/* Meal Type Icon */}
                    <div
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "9999px",
                        backgroundColor: "#4F46E5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      <WebIcon
                        name={
                          meal.type === "breakfast"
                            ? "coffee"
                            : meal.type === "lunch"
                            ? "utensils"
                            : "moon"
                        }
                      />
                    </div>
                    {/* Meal Title and Time */}
                    <div>
                      <h3
                        style={{
                          fontSize: "1.125rem",
                          fontWeight: 600,
                          color: isDark ? "#F9FAFB" : "#111827",
                          margin: 0,
                        }}
                      >
                        {meal.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: isDark ? "#9CA3AF" : "#6B7280",
                          margin: "0.25rem 0 0 0",
                        }}
                      >
                        {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}{" "}
                        • {meal.time}
                      </p>
                    </div>
                  </div>

                  {/* Meal Action Buttons */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {/* Edit Button */}
                    <button
                      onClick={() => onEditMeal(selectedDayPlan.id, index)}
                      style={{
                        padding: "0.5rem",
                        borderRadius: "0.375rem",
                        backgroundColor: isDark ? "#374151" : "#E5E7EB",
                        color: isDark ? "#E5E7EB" : "#4B5563",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <WebIcon name="pencil-alt" />
                    </button>
                    {/* Recipe Button */}
                    <button
                      onClick={() =>
                        onOpenRecipeModal(selectedDayPlan.id, index)
                      }
                      style={{
                        padding: "0.5rem",
                        borderRadius: "0.375rem",
                        backgroundColor: isDark ? "#374151" : "#E5E7EB",
                        color: isDark ? "#E5E7EB" : "#4B5563",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <WebIcon name="book" />
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => onDeleteMeal(selectedDayPlan.id, index)}
                      style={{
                        padding: "0.5rem",
                        borderRadius: "0.375rem",
                        backgroundColor: isDark ? "#991B1B" : "#FEE2E2",
                        color: isDark ? "#FCA5A5" : "#DC2626",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <WebIcon name="trash" />
                    </button>
                  </div>
                </div>

                {/* Recipe Details Section (if recipe exists) */}
                {recipe && (
                  <div
                    style={{
                      padding: "0.75rem",
                      borderRadius: "0.375rem",
                      backgroundColor: isDark ? "#374151" : "#E5E7EB",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: isDark ? "#F9FAFB" : "#111827",
                          margin: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <WebIcon name="utensils" />
                        {recipe.name}
                      </h4>
                      <button
                        onClick={() => onViewRecipe(recipe.id)}
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.25rem",
                          backgroundColor: "#4F46E5",
                          color: "white",
                          border: "none",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        View Recipe
                      </button>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        fontSize: "0.75rem",
                        color: isDark ? "#9CA3AF" : "#6B7280",
                      }}
                    >
                      <div>
                        <WebIcon name="clock" /> Prep: {recipe.prepTime}
                      </div>
                      <div>
                        <WebIcon name="fire" /> Cook: {recipe.cookTime}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty State */}
          {selectedDayPlan?.meals.length === 0 && (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: isDark ? "#9CA3AF" : "#6B7280",
              }}
            >
              <WebIcon
                name="calendar-day"
                size={32}
                style={{ marginBottom: "1rem" }}
              />
              <p style={{ fontSize: "1rem", fontWeight: 500 }}>
                No meals planned for this day
              </p>
              <button
                onClick={onAddMeal}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#4F46E5",
                  color: "white",
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  marginTop: "1rem",
                }}
              >
                Add a meal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
