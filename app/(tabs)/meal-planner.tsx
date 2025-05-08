/**
 * MealPlanner Component
 *
 * A comprehensive meal planning interface that allows users to:
 * - View and manage their weekly meal schedule
 * - Add, edit, and delete meals
 * - Associate recipes with meals
 * - Save meal plans to local storage
 * - Switch between different days of the week
 *
 * The component supports both web and mobile platforms with different UI layouts
 * and includes features like dark mode support and loading states.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WebLayout from "../components/WebLayout";
import WebIcon from "../components/WebIcon";
import { useAuth } from "../../src/context/AuthContext";
import WebMealModal from "../components/WebMealModal";
import WebMealPlanner from "../components/WebMealPlanner";
import { useUserPreferences } from "../../src/context/UserPreferencesContext";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);
const StyledTextInput = styled(TextInput);

const { width } = Dimensions.get("window");

// Type definitions for data structures
interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string;
  prepTime: string;
  cookTime: string;
}

interface MealPlan {
  id: string;
  day: string;
  meals: {
    type: "breakfast" | "lunch" | "dinner";
    title: string;
    time: string;
    recipeId?: string; // Optional reference to a recipe
  }[];
}

// Default meal plan data structure
const defaultWeeklyPlan: MealPlan[] = [
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
  {
    id: "3",
    day: "Wednesday",
    meals: [
      { type: "breakfast", title: "Avocado Toast", time: "8:00 AM" },
      { type: "lunch", title: "Lentil Soup", time: "12:30 PM" },
      { type: "dinner", title: "Baked Chicken", time: "7:00 PM" },
    ],
  },
  {
    id: "4",
    day: "Thursday",
    meals: [
      { type: "breakfast", title: "Protein Pancakes", time: "8:00 AM" },
      { type: "lunch", title: "Mediterranean Salad", time: "12:30 PM" },
      { type: "dinner", title: "Pasta Primavera", time: "7:00 PM" },
    ],
  },
  {
    id: "5",
    day: "Friday",
    meals: [
      { type: "breakfast", title: "Yogurt Parfait", time: "8:00 AM" },
      { type: "lunch", title: "Turkey Wrap", time: "12:30 PM" },
      { type: "dinner", title: "Grilled Vegetables", time: "7:00 PM" },
    ],
  },
  {
    id: "6",
    day: "Saturday",
    meals: [
      { type: "breakfast", title: "Eggs Benedict", time: "9:00 AM" },
      { type: "lunch", title: "Caprese Sandwich", time: "1:00 PM" },
      { type: "dinner", title: "Steak & Potatoes", time: "7:30 PM" },
    ],
  },
  {
    id: "7",
    day: "Sunday",
    meals: [
      { type: "breakfast", title: "French Toast", time: "9:00 AM" },
      { type: "lunch", title: "Cobb Salad", time: "1:00 PM" },
      { type: "dinner", title: "Roast Chicken", time: "7:00 PM" },
    ],
  },
];

// Icons mapping for different meal types
const mealTypeIcons = {
  breakfast: "coffee",
  lunch: "utensils",
  dinner: "moon",
};

// Storage keys for persistent data
const MEAL_STORAGE_KEY = "@meal_planner_data";
const RECIPE_STORAGE_KEY = "@meal_planner_recipes";

export default function MealPlanner() {
  // Context and theme hooks
  const { preferences } = useUserPreferences();
  const isDark = preferences.isDarkMode;
  const isWeb = Platform.OS === "web";
  const { isAuthenticated } = useAuth();

  // State management for meal planning
  const [weeklyPlan, setWeeklyPlan] = useState<MealPlan[]>(defaultWeeklyPlan);
  const [selectedDay, setSelectedDay] = useState(defaultWeeklyPlan[0].id);
  const [loading, setLoading] = useState(true);

  // Recipe management state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeModalVisible, setRecipeModalVisible] = useState(false);
  const [recipeListModalVisible, setRecipeListModalVisible] = useState(false);
  const [selectedMealForRecipe, setSelectedMealForRecipe] = useState<{
    dayId: string;
    mealIndex: number;
  }>({ dayId: "", mealIndex: 0 });
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>({
    id: "",
    name: "",
    ingredients: [],
    instructions: "",
    prepTime: "",
    cookTime: "",
  });
  const [newIngredient, setNewIngredient] = useState("");
  const [viewRecipeModalVisible, setViewRecipeModalVisible] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [recipeActionMode, setRecipeActionMode] = useState<"create" | "select">(
    "select"
  );

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentMeal, setCurrentMeal] = useState<{
    dayId: string;
    mealIndex: number | null;
    meal: {
      type: "breakfast" | "lunch" | "dinner";
      title: string;
      time: string;
      recipeId?: string;
    };
  }>({
    dayId: "",
    mealIndex: null,
    meal: { type: "breakfast", title: "", time: "" },
  });

  // Load data when component mounts or auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      // Clear data when logged out
      setWeeklyPlan(defaultWeeklyPlan);
      setRecipes([]);
      if (isWeb) {
        localStorage.removeItem(MEAL_STORAGE_KEY);
        localStorage.removeItem(RECIPE_STORAGE_KEY);
      }
    }
  }, [isAuthenticated]);

  /**
   * Loads all necessary data from storage
   * Includes both meal plan and recipe data
   */
  const loadData = async () => {
    try {
      await Promise.all([loadMealPlanData(), loadRecipeData()]);
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  /**
   * Loads meal plan data from storage
   * Handles both web and mobile platforms
   */
  const loadMealPlanData = async () => {
    try {
      let jsonValue;
      if (isWeb) {
        jsonValue = localStorage.getItem(MEAL_STORAGE_KEY);
      } else {
        jsonValue = await AsyncStorage.getItem(MEAL_STORAGE_KEY);
      }
      if (jsonValue != null) {
        const data = JSON.parse(jsonValue);
        setWeeklyPlan(data);
        setSelectedDay(data[0].id);
      }
    } catch (error) {
      console.error("Error loading meal plan data:", error);
    }
  };

  /**
   * Loads recipe data from storage
   * Handles both web and mobile platforms
   */
  const loadRecipeData = async () => {
    try {
      let jsonValue;
      if (isWeb) {
        jsonValue = localStorage.getItem(RECIPE_STORAGE_KEY);
      } else {
        jsonValue = await AsyncStorage.getItem(RECIPE_STORAGE_KEY);
      }
      if (jsonValue != null) {
        const data = JSON.parse(jsonValue);
        setRecipes(data);
      }
    } catch (error) {
      console.error("Error loading recipe data:", error);
    }
  };

  /**
   * Saves meal plan data to storage
   * @param data The meal plan data to save
   */
  const saveMealPlanData = async (data: MealPlan[]) => {
    try {
      const jsonValue = JSON.stringify(data);
      if (isWeb) {
        localStorage.setItem(MEAL_STORAGE_KEY, jsonValue);
      } else {
        await AsyncStorage.setItem(MEAL_STORAGE_KEY, jsonValue);
      }
    } catch (error) {
      console.error("Error saving meal plan data:", error);
      Alert.alert("Error", "Failed to save meal plan data.");
    }
  };

  /**
   * Saves recipe data to storage
   * @param data The recipe data to save
   */
  const saveRecipeData = async (data: Recipe[]) => {
    try {
      const jsonValue = JSON.stringify(data);
      if (isWeb) {
        localStorage.setItem(RECIPE_STORAGE_KEY, jsonValue);
      } else {
        await AsyncStorage.setItem(RECIPE_STORAGE_KEY, jsonValue);
      }
    } catch (error) {
      console.error("Error saving recipe data:", error);
      Alert.alert("Error", "Failed to save recipe data.");
    }
  };

  /**
   * Initiates the process of adding a new meal
   * Opens the meal creation modal
   */
  const addMeal = () => {
    setCurrentMeal({
      dayId: selectedDay,
      mealIndex: null,
      meal: { type: "breakfast", title: "", time: "" },
    });
    setModalVisible(true);
  };

  /**
   * Initiates the process of editing an existing meal
   * @param dayId The ID of the day containing the meal
   * @param mealIndex The index of the meal in the day's meals array
   */
  const editMeal = (dayId: string, mealIndex: number) => {
    const day = weeklyPlan.find((day) => day.id === dayId);
    if (day && day.meals[mealIndex]) {
      setCurrentMeal({
        dayId,
        mealIndex,
        meal: { ...day.meals[mealIndex] },
      });
      setEditModalVisible(true);
    }
  };

  /**
   * Saves a newly created meal to the meal plan
   * @param meal The meal object to save
   */
  const saveNewMeal = (meal: {
    type: "breakfast" | "lunch" | "dinner";
    title: string;
    time: string;
  }) => {
    const updatedWeeklyPlan = [...weeklyPlan];
    const dayIndex = updatedWeeklyPlan.findIndex(
      (day) => day.id === selectedDay
    );

    if (dayIndex !== -1) {
      updatedWeeklyPlan[dayIndex].meals.push(meal);
      setWeeklyPlan(updatedWeeklyPlan);
      saveMealPlanData(updatedWeeklyPlan);
      setModalVisible(false);
    }
  };

  /**
   * Updates an existing meal in the meal plan
   * @param meal The updated meal object
   */
  const updateMeal = (meal: {
    type: "breakfast" | "lunch" | "dinner";
    title: string;
    time: string;
  }) => {
    if (currentMeal.mealIndex === null) return;

    const updatedWeeklyPlan = [...weeklyPlan];
    const dayIndex = updatedWeeklyPlan.findIndex(
      (day) => day.id === currentMeal.dayId
    );

    if (dayIndex !== -1) {
      updatedWeeklyPlan[dayIndex].meals[currentMeal.mealIndex] = {
        ...meal,
        recipeId: currentMeal.meal.recipeId,
      };

      setWeeklyPlan(updatedWeeklyPlan);
      saveMealPlanData(updatedWeeklyPlan);
      setEditModalVisible(false);
    }
  };

  /**
   * Deletes a meal from the meal plan
   */
  const deleteMeal = () => {
    if (currentMeal.mealIndex === null) return;

    const updatedWeeklyPlan = [...weeklyPlan];
    const dayIndex = updatedWeeklyPlan.findIndex(
      (day) => day.id === currentMeal.dayId
    );

    if (dayIndex !== -1) {
      updatedWeeklyPlan[dayIndex].meals.splice(currentMeal.mealIndex, 1);
      setWeeklyPlan(updatedWeeklyPlan);
      saveMealPlanData(updatedWeeklyPlan);
      setEditModalVisible(false);
    }
  };

  // Recipe management functions

  /**
   * Opens the recipe selection or creation flow for a meal
   * @param dayId The ID of the day
   * @param mealIndex The index of the meal
   */
  const openRecipeModal = (dayId: string, mealIndex: number) => {
    setSelectedMealForRecipe({ dayId, mealIndex });

    // Check if there are saved recipes
    if (recipes.length > 0) {
      // Open recipe list modal to select from saved recipes
      setRecipeListModalVisible(true);
    } else {
      // No saved recipes, go directly to create recipe mode
      openCreateRecipeModal();
    }
  };

  /**
   * Opens the create recipe modal
   * Resets the current recipe form
   */
  const openCreateRecipeModal = () => {
    setRecipeActionMode("create");
    // Reset current recipe form
    setCurrentRecipe({
      id: "",
      name: "",
      ingredients: [],
      instructions: "",
      prepTime: "",
      cookTime: "",
    });
    setNewIngredient("");

    setRecipeModalVisible(true);
    setRecipeListModalVisible(false);
  };

  /**
   * Associates a recipe with a meal
   * @param recipeId The ID of the recipe to associate
   */
  const selectRecipeForMeal = (recipeId: string) => {
    // Associate recipe with the meal
    const updatedWeeklyPlan = [...weeklyPlan];
    const dayIndex = updatedWeeklyPlan.findIndex(
      (day) => day.id === selectedMealForRecipe.dayId
    );

    if (dayIndex !== -1) {
      updatedWeeklyPlan[dayIndex].meals[
        selectedMealForRecipe.mealIndex
      ].recipeId = recipeId;
      setWeeklyPlan(updatedWeeklyPlan);
      saveMealPlanData(updatedWeeklyPlan);
    }

    setRecipeListModalVisible(false);
    Alert.alert("Success", "Recipe added to meal!");
  };

  /**
   * Adds a new ingredient to the current recipe
   */
  const addIngredient = () => {
    if (!newIngredient.trim()) return;

    setCurrentRecipe({
      ...currentRecipe,
      ingredients: [...currentRecipe.ingredients, newIngredient.trim()],
    });

    setNewIngredient("");
  };

  /**
   * Removes an ingredient from the current recipe
   * @param index The index of the ingredient to remove
   */
  const removeIngredient = (index: number) => {
    const updatedIngredients = [...currentRecipe.ingredients];
    updatedIngredients.splice(index, 1);

    setCurrentRecipe({
      ...currentRecipe,
      ingredients: updatedIngredients,
    });
  };

  /**
   * Saves a new recipe and associates it with a meal
   */
  const saveRecipe = () => {
    if (
      !currentRecipe.name ||
      !currentRecipe.instructions ||
      currentRecipe.ingredients.length === 0
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Generate a unique ID for the recipe
    const recipeId = Date.now().toString();
    const newRecipe = {
      ...currentRecipe,
      id: recipeId,
    };

    // Add recipe to recipes list
    const updatedRecipes = [...recipes, newRecipe];
    setRecipes(updatedRecipes);
    saveRecipeData(updatedRecipes);

    // Associate recipe with the meal
    const updatedWeeklyPlan = [...weeklyPlan];
    const dayIndex = updatedWeeklyPlan.findIndex(
      (day) => day.id === selectedMealForRecipe.dayId
    );

    if (dayIndex !== -1) {
      updatedWeeklyPlan[dayIndex].meals[
        selectedMealForRecipe.mealIndex
      ].recipeId = recipeId;
      setWeeklyPlan(updatedWeeklyPlan);
      saveMealPlanData(updatedWeeklyPlan);
    }

    setRecipeModalVisible(false);
    Alert.alert("Success", "Recipe added successfully!");
  };

  /**
   * Opens the recipe viewing modal
   * @param recipeId The ID of the recipe to view
   */
  const viewRecipe = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setViewRecipeModalVisible(true);
  };

  /**
   * Retrieves a recipe by its ID
   * @param recipeId The ID of the recipe to retrieve
   * @returns The recipe object or undefined if not found
   */
  const getRecipeById = (recipeId: string | undefined): Recipe | undefined => {
    if (!recipeId) return undefined;
    return recipes.find((recipe) => recipe.id === recipeId);
  };

  // Platform-specific rendering
  if (isWeb) {
    return (
      <WebLayout title="Meal Planner" currentTab="meal-planner">
        <WebMealPlanner
          weeklyPlan={weeklyPlan}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          onAddMeal={addMeal}
          onEditMeal={(dayId, mealIndex) => {
            const day = weeklyPlan.find((d) => d.id === dayId);
            if (day && day.meals[mealIndex]) {
              setCurrentMeal({
                dayId,
                mealIndex,
                meal: { ...day.meals[mealIndex] },
              });
              setEditModalVisible(true);
            }
          }}
          onDeleteMeal={(dayId, mealIndex) => {
            setCurrentMeal({
              dayId,
              mealIndex,
              meal: weeklyPlan.find((d) => d.id === dayId)?.meals[
                mealIndex
              ] || {
                type: "breakfast",
                title: "",
                time: "",
              },
            });
            deleteMeal();
          }}
          onOpenRecipeModal={openRecipeModal}
          onViewRecipe={viewRecipe}
          getRecipeById={getRecipeById}
          isDark={isDark}
          onSaveMealPlan={(plan) => {
            setWeeklyPlan(plan);
            saveMealPlanData(plan);
          }}
        />

        {/* Web Add Meal Modal */}
        <WebMealModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={saveNewMeal}
          isDark={isDark}
        />

        {/* Web Edit Meal Modal */}
        <WebMealModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          onSave={updateMeal}
          initialMeal={currentMeal.meal}
          isDark={isDark}
        />
      </WebLayout>
    );
  }

  // Show loading indicator while data is being fetched
  if (loading) {
    return (
      <StyledView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <StyledText className="mt-4 text-lg">Loading meal plan...</StyledText>
      </StyledView>
    );
  }

  // Mobile layout implementation
  return (
    <StyledSafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StyledScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section - Gradient Header */}
        <StyledView className="relative">
          <LinearGradient
            colors={
              isDark
                ? ["#1E40AF", "#3B82F6", "#60A5FA"]
                : ["#3B82F6", "#60A5FA", "#93C5FD"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="pt-8 pb-16 rounded-b-3xl"
          >
            <StyledView className="absolute inset-0" style={{ opacity: 0.1 }}>
              {[...Array(20)].map((_, i) => (
                <StyledView
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: Math.random() * 100 + 20,
                    height: Math.random() * 100 + 20,
                    left: Math.random() * width,
                    top: Math.random() * 300,
                    opacity: Math.random() * 0.5,
                  }}
                />
              ))}
            </StyledView>

            <StyledView className="px-6">
              <StyledView className="flex-row items-center justify-between">
                <StyledView>
                  <StyledView className="flex-row items-center mb-2">
                    <StyledView className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-4">
                      <FontAwesome5
                        name="calendar-alt"
                        size={20}
                        color="#fff"
                      />
                    </StyledView>
                    <StyledText className="text-white text-lg font-semibold">
                      Meal Planner
                    </StyledText>
                  </StyledView>
                </StyledView>

                <StyledTouchableOpacity
                  className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                  onPress={addMeal}
                >
                  <FontAwesome5 name="plus" size={18} color="#fff" />
                </StyledTouchableOpacity>
              </StyledView>

              <StyledView className="mt-10 mb-5">
                <StyledText className="text-white text-4xl font-bold mb-3">
                  Weekly Plan
                </StyledText>
                <StyledText className="text-white/80 text-lg mb-5">
                  Organize your meals for better nutrition
                </StyledText>
              </StyledView>
            </StyledView>
          </LinearGradient>

          {/* Day Selector - Floating Card */}
          <StyledView
            className={`mx-4 p-2 rounded-2xl shadow-lg ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
            style={{
              marginTop: -20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="py-2"
            >
              <StyledView className="flex-row space-x-2 px-2">
                {weeklyPlan.map((day) => (
                  <StyledTouchableOpacity
                    key={day.id}
                    onPress={() => setSelectedDay(day.id)}
                    className={`px-4 py-3 rounded-xl ${
                      selectedDay === day.id
                        ? "bg-primary-600"
                        : isDark
                        ? "bg-gray-700"
                        : "bg-gray-100"
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
          </StyledView>
        </StyledView>

        {/* Meal Schedule */}
        <StyledView className="px-4 mt-6">
          <StyledText
            className={`text-xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            Today's Meals
          </StyledText>

          {weeklyPlan
            .find((day) => day.id === selectedDay)
            ?.meals.map((meal, index) => (
              <StyledView
                key={index}
                className={`mb-4 p-4 rounded-xl border shadow-sm ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-100"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <StyledView className="flex-row items-center justify-between mb-2">
                  <StyledView className="flex-row items-center">
                    <StyledView
                      className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                        meal.type === "breakfast"
                          ? "bg-amber-100"
                          : meal.type === "lunch"
                          ? "bg-green-100"
                          : "bg-indigo-100"
                      }`}
                    >
                      <FontAwesome5
                        name={mealTypeIcons[meal.type]}
                        size={16}
                        color={
                          meal.type === "breakfast"
                            ? "#D97706"
                            : meal.type === "lunch"
                            ? "#059669"
                            : "#4F46E5"
                        }
                      />
                    </StyledView>
                    <StyledView>
                      <StyledText
                        className={`text-sm font-medium ${
                          isDark ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                      </StyledText>
                      <StyledText
                        className={`text-lg font-semibold ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {meal.title}
                      </StyledText>
                    </StyledView>
                  </StyledView>

                  <StyledView>
                    <StyledText
                      className={`text-sm py-1 px-3 rounded-full ${
                        isDark
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {meal.time}
                    </StyledText>
                  </StyledView>
                </StyledView>
                <StyledView className="mt-2 flex-row space-x-2">
                  <StyledTouchableOpacity
                    className={`flex-row items-center py-2 px-3 rounded-lg ${
                      isDark ? "bg-gray-700" : "bg-gray-100"
                    }`}
                    onPress={() => editMeal(selectedDay, index)}
                  >
                    <FontAwesome5
                      name="edit"
                      size={12}
                      color={isDark ? "#D1D5DB" : "#4B5563"}
                      style={{ marginRight: 6 }}
                    />
                    <StyledText
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Change
                    </StyledText>
                  </StyledTouchableOpacity>
                  <StyledTouchableOpacity
                    className={`flex-row items-center py-2 px-3 rounded-lg ${
                      isDark ? "bg-gray-700" : "bg-gray-100"
                    }`}
                    onPress={() => {
                      const day = weeklyPlan.find((d) => d.id === selectedDay);
                      if (day) {
                        const mealRecipeId = day.meals[index].recipeId;
                        if (mealRecipeId) {
                          // View existing recipe
                          viewRecipe(mealRecipeId);
                        } else {
                          // Add new recipe
                          openRecipeModal(selectedDay, index);
                        }
                      }
                    }}
                  >
                    <FontAwesome5
                      name="utensils"
                      size={12}
                      color={isDark ? "#D1D5DB" : "#4B5563"}
                      style={{ marginRight: 6 }}
                    />
                    <StyledText
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {weeklyPlan.find((d) => d.id === selectedDay)?.meals[
                        index
                      ].recipeId
                        ? "View Recipe"
                        : "Add Recipe"}
                    </StyledText>
                  </StyledTouchableOpacity>
                </StyledView>
              </StyledView>
            ))}

          {/* Add Meal Button */}
          <StyledTouchableOpacity
            className={`mt-4 mb-8 p-4 rounded-xl border border-dashed flex-row items-center justify-center ${
              isDark ? "border-gray-700" : "border-gray-300"
            }`}
            onPress={addMeal}
          >
            <FontAwesome5
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
      </StyledScrollView>

      {/* Mobile Add Meal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <StyledView
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <StyledView
            className={`w-11/12 p-6 rounded-2xl ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <StyledText
              className={`text-xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Add New Meal
            </StyledText>

            {/* Meal Type Selector */}
            <StyledView className="mb-4">
              <StyledText
                className={`text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Meal Type
              </StyledText>
              <StyledView className="flex-row space-x-2">
                {["breakfast", "lunch", "dinner"].map((type) => (
                  <StyledTouchableOpacity
                    key={type}
                    className={`py-2 px-3 rounded-lg ${
                      currentMeal.meal.type === type
                        ? isDark
                          ? "bg-blue-600"
                          : "bg-blue-500"
                        : isDark
                        ? "bg-gray-700"
                        : "bg-gray-200"
                    }`}
                    onPress={() =>
                      setCurrentMeal({
                        ...currentMeal,
                        meal: {
                          ...currentMeal.meal,
                          type: type as "breakfast" | "lunch" | "dinner",
                        },
                      })
                    }
                  >
                    <StyledText
                      className={`text-sm font-medium ${
                        currentMeal.meal.type === type
                          ? "text-white"
                          : isDark
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </StyledText>
                  </StyledTouchableOpacity>
                ))}
              </StyledView>
            </StyledView>

            {/* Meal Title Input */}
            <StyledView className="mb-4">
              <StyledText
                className={`text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Meal Title
              </StyledText>
              <StyledTextInput
                className={`border p-3 rounded-lg ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
                placeholder="Enter meal title"
                placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
                value={currentMeal.meal.title}
                onChangeText={(text) =>
                  setCurrentMeal({
                    ...currentMeal,
                    meal: { ...currentMeal.meal, title: text },
                  })
                }
              />
            </StyledView>

            {/* Meal Time Input */}
            <StyledView className="mb-6">
              <StyledText
                className={`text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Time
              </StyledText>
              <StyledTextInput
                className={`border p-3 rounded-lg ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
                placeholder="Enter time (e.g. 8:00 AM)"
                placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
                value={currentMeal.meal.time}
                onChangeText={(text) =>
                  setCurrentMeal({
                    ...currentMeal,
                    meal: { ...currentMeal.meal, time: text },
                  })
                }
              />
            </StyledView>

            {/* Action Buttons */}
            <StyledView className="flex-row space-x-3">
              <StyledTouchableOpacity
                className={`flex-1 py-3 rounded-lg ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
                onPress={() => setModalVisible(false)}
              >
                <StyledText
                  className={`text-center font-medium ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  Cancel
                </StyledText>
              </StyledTouchableOpacity>
              <StyledTouchableOpacity
                className="flex-1 py-3 rounded-lg bg-blue-500"
                onPress={() => {
                  saveNewMeal(currentMeal.meal);
                }}
              >
                <StyledText className="text-center font-medium text-white">
                  Save
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </StyledView>
      </Modal>

      {/* Mobile Edit Meal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <StyledView
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <StyledView
            className={`w-11/12 p-6 rounded-2xl ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <StyledText
              className={`text-xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Edit Meal
            </StyledText>

            {/* Meal Type Selector */}
            <StyledView className="mb-4">
              <StyledText
                className={`text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Meal Type
              </StyledText>
              <StyledView className="flex-row space-x-2">
                {["breakfast", "lunch", "dinner"].map((type) => (
                  <StyledTouchableOpacity
                    key={type}
                    className={`py-2 px-3 rounded-lg ${
                      currentMeal.meal.type === type
                        ? isDark
                          ? "bg-blue-600"
                          : "bg-blue-500"
                        : isDark
                        ? "bg-gray-700"
                        : "bg-gray-200"
                    }`}
                    onPress={() =>
                      setCurrentMeal({
                        ...currentMeal,
                        meal: {
                          ...currentMeal.meal,
                          type: type as "breakfast" | "lunch" | "dinner",
                        },
                      })
                    }
                  >
                    <StyledText
                      className={`text-sm font-medium ${
                        currentMeal.meal.type === type
                          ? "text-white"
                          : isDark
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </StyledText>
                  </StyledTouchableOpacity>
                ))}
              </StyledView>
            </StyledView>

            {/* Meal Title Input */}
            <StyledView className="mb-4">
              <StyledText
                className={`text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Meal Title
              </StyledText>
              <StyledTextInput
                className={`border p-3 rounded-lg ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
                placeholder="Enter meal title"
                placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
                value={currentMeal.meal.title}
                onChangeText={(text) =>
                  setCurrentMeal({
                    ...currentMeal,
                    meal: { ...currentMeal.meal, title: text },
                  })
                }
              />
            </StyledView>

            {/* Meal Time Input */}
            <StyledView className="mb-6">
              <StyledText
                className={`text-sm font-medium mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Time
              </StyledText>
              <StyledTextInput
                className={`border p-3 rounded-lg ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
                placeholder="Enter time (e.g. 8:00 AM)"
                placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
                value={currentMeal.meal.time}
                onChangeText={(text) =>
                  setCurrentMeal({
                    ...currentMeal,
                    meal: { ...currentMeal.meal, time: text },
                  })
                }
              />
            </StyledView>

            {/* Action Buttons */}
            <StyledView className="flex-row space-x-3 mb-3">
              <StyledTouchableOpacity
                className={`flex-1 py-3 rounded-lg ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
                onPress={() => setEditModalVisible(false)}
              >
                <StyledText
                  className={`text-center font-medium ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  Cancel
                </StyledText>
              </StyledTouchableOpacity>
              <StyledTouchableOpacity
                className="flex-1 py-3 rounded-lg bg-blue-500"
                onPress={() => {
                  updateMeal(currentMeal.meal);
                }}
              >
                <StyledText className="text-center font-medium text-white">
                  Update
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>

            {/* Delete Button */}
            <StyledTouchableOpacity
              className={`py-3 rounded-lg ${
                isDark ? "bg-red-800" : "bg-red-500"
              }`}
              onPress={() => {
                deleteMeal();
              }}
            >
              <StyledText className="text-center font-medium text-white">
                Delete Meal
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </Modal>
    </StyledSafeAreaView>
  );
}
