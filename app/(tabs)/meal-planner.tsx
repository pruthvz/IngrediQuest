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

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);
const StyledTextInput = styled(TextInput);

const { width } = Dimensions.get("window");

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

// Default meal plan data (will be used if no saved data exists)
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

const mealTypeIcons = {
  breakfast: "coffee",
  lunch: "utensils",
  dinner: "moon",
};

// Storage keys
const MEAL_STORAGE_KEY = "@meal_planner_data";
const RECIPE_STORAGE_KEY = "@meal_planner_recipes";

export default function MealPlanner() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isWeb = Platform.OS === "web";
  
  // State variables
  const [weeklyPlan, setWeeklyPlan] = useState<MealPlan[]>(defaultWeeklyPlan);
  const [selectedDay, setSelectedDay] = useState(defaultWeeklyPlan[0].id);
  const [loading, setLoading] = useState(true);
  
  // Recipe state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeModalVisible, setRecipeModalVisible] = useState(false);
  const [recipeListModalVisible, setRecipeListModalVisible] = useState(false);
  const [selectedMealForRecipe, setSelectedMealForRecipe] = useState<{dayId: string, mealIndex: number}>({dayId: "", mealIndex: 0});
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>({id: "", name: "", ingredients: [], instructions: "", prepTime: "", cookTime: ""});
  const [newIngredient, setNewIngredient] = useState("");
  const [viewRecipeModalVisible, setViewRecipeModalVisible] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [recipeActionMode, setRecipeActionMode] = useState<"create" | "select">("select");
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentMeal, setCurrentMeal] = useState<{dayId: string, mealIndex: number | null, meal: {type: "breakfast" | "lunch" | "dinner", title: string, time: string, recipeId?: string}}>(
    {dayId: "", mealIndex: null, meal: {type: "breakfast", title: "", time: ""}}
  );
  
  // Load data from AsyncStorage on component mount
  useEffect(() => {
    loadData();
  }, []);
  
  // Function to load all data from AsyncStorage
  const loadData = async () => {
    try {
      await Promise.all([loadMealPlanData(), loadRecipeData()]);
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };
  
  // Function to load meal plan data from AsyncStorage
  const loadMealPlanData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(MEAL_STORAGE_KEY);
      if (jsonValue != null) {
        const data = JSON.parse(jsonValue);
        setWeeklyPlan(data);
        setSelectedDay(data[0].id);
      }
    } catch (error) {
      console.error("Error loading meal plan data:", error);
    }
  };
  
  // Function to load recipe data from AsyncStorage
  const loadRecipeData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(RECIPE_STORAGE_KEY);
      if (jsonValue != null) {
        const data = JSON.parse(jsonValue);
        setRecipes(data);
      }
    } catch (error) {
      console.error("Error loading recipe data:", error);
    }
  };
  
  // Function to save meal plan data to AsyncStorage
  const saveMealPlanData = async (data: MealPlan[]) => {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(MEAL_STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error("Error saving meal plan data:", error);
      Alert.alert("Error", "Failed to save meal plan data.");
    }
  };
  
  // Function to save recipe data to AsyncStorage
  const saveRecipeData = async (data: Recipe[]) => {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(RECIPE_STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error("Error saving recipe data:", error);
      Alert.alert("Error", "Failed to save recipe data.");
    }
  };
  
  // Function to add a new meal
  const addMeal = () => {
    setCurrentMeal({
      dayId: selectedDay,
      mealIndex: null,
      meal: { type: "breakfast", title: "", time: "" }
    });
    setModalVisible(true);
  };
  
  // Function to edit an existing meal
  const editMeal = (dayId: string, mealIndex: number) => {
    const day = weeklyPlan.find(day => day.id === dayId);
    if (day && day.meals[mealIndex]) {
      setCurrentMeal({
        dayId,
        mealIndex,
        meal: { ...day.meals[mealIndex] }
      });
      setEditModalVisible(true);
    }
  };
  
  // Function to save a new meal
  const saveNewMeal = () => {
    if (!currentMeal.meal.title || !currentMeal.meal.time) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    const updatedWeeklyPlan = [...weeklyPlan];
    const dayIndex = updatedWeeklyPlan.findIndex(day => day.id === currentMeal.dayId);
    
    if (dayIndex !== -1) {
      updatedWeeklyPlan[dayIndex].meals.push({
        type: currentMeal.meal.type,
        title: currentMeal.meal.title,
        time: currentMeal.meal.time
      });
      
      setWeeklyPlan(updatedWeeklyPlan);
      saveMealPlanData(updatedWeeklyPlan);
      setModalVisible(false);
    }
  };
  
  // Function to update an existing meal
  const updateMeal = () => {
    if (!currentMeal.meal.title || !currentMeal.meal.time) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    if (currentMeal.mealIndex === null) return;
    
    const updatedWeeklyPlan = [...weeklyPlan];
    const dayIndex = updatedWeeklyPlan.findIndex(day => day.id === currentMeal.dayId);
    
    if (dayIndex !== -1) {
      updatedWeeklyPlan[dayIndex].meals[currentMeal.mealIndex] = {
        type: currentMeal.meal.type,
        title: currentMeal.meal.title,
        time: currentMeal.meal.time
      };
      
      setWeeklyPlan(updatedWeeklyPlan);
      saveMealPlanData(updatedWeeklyPlan);
      setEditModalVisible(false);
    }
  };
  
  // Function to delete a meal
  const deleteMeal = () => {
    if (currentMeal.mealIndex === null) return;
    
    Alert.alert(
      "Delete Meal",
      "Are you sure you want to delete this meal?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            const updatedWeeklyPlan = [...weeklyPlan];
            const dayIndex = updatedWeeklyPlan.findIndex(day => day.id === currentMeal.dayId);
            
            if (dayIndex !== -1 && currentMeal.mealIndex !== null) {
              updatedWeeklyPlan[dayIndex].meals.splice(currentMeal.mealIndex, 1);
              setWeeklyPlan(updatedWeeklyPlan);
              saveMealPlanData(updatedWeeklyPlan);
              setEditModalVisible(false);
            }
          }
        }
      ]
    );
  };
  
  // Recipe management functions
  
  // Function to open recipe selection or creation flow for a meal
  const openRecipeModal = (dayId: string, mealIndex: number) => {
    setSelectedMealForRecipe({dayId, mealIndex});
    
    // Check if there are saved recipes
    if (recipes.length > 0) {
      // Open recipe list modal to select from saved recipes
      setRecipeListModalVisible(true);
    } else {
      // No saved recipes, go directly to create recipe mode
      openCreateRecipeModal();
    }
  };
  
  // Function to open create recipe modal
  const openCreateRecipeModal = () => {
    setRecipeActionMode("create");
    // Reset current recipe form
    setCurrentRecipe({id: "", name: "", ingredients: [], instructions: "", prepTime: "", cookTime: ""});
    setNewIngredient("");
    
    setRecipeModalVisible(true);
    setRecipeListModalVisible(false);
  };
  
  // Function to select a recipe from saved recipes
  const selectRecipeForMeal = (recipeId: string) => {
    // Associate recipe with the meal
    const updatedWeeklyPlan = [...weeklyPlan];
    const dayIndex = updatedWeeklyPlan.findIndex(day => day.id === selectedMealForRecipe.dayId);
    
    if (dayIndex !== -1) {
      updatedWeeklyPlan[dayIndex].meals[selectedMealForRecipe.mealIndex].recipeId = recipeId;
      setWeeklyPlan(updatedWeeklyPlan);
      saveMealPlanData(updatedWeeklyPlan);
    }
    
    setRecipeListModalVisible(false);
    Alert.alert("Success", "Recipe added to meal!");
  };
  
  // Function to add ingredient to current recipe
  const addIngredient = () => {
    if (!newIngredient.trim()) return;
    
    setCurrentRecipe({
      ...currentRecipe,
      ingredients: [...currentRecipe.ingredients, newIngredient.trim()]
    });
    
    setNewIngredient("");
  };
  
  // Function to remove ingredient from current recipe
  const removeIngredient = (index: number) => {
    const updatedIngredients = [...currentRecipe.ingredients];
    updatedIngredients.splice(index, 1);
    
    setCurrentRecipe({
      ...currentRecipe,
      ingredients: updatedIngredients
    });
  };
  
  // Function to save a new recipe and associate it with a meal
  const saveRecipe = () => {
    if (!currentRecipe.name || !currentRecipe.instructions || currentRecipe.ingredients.length === 0) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    
    // Generate a unique ID for the recipe
    const recipeId = Date.now().toString();
    const newRecipe = {
      ...currentRecipe,
      id: recipeId
    };
    
    // Add recipe to recipes list
    const updatedRecipes = [...recipes, newRecipe];
    setRecipes(updatedRecipes);
    saveRecipeData(updatedRecipes);
    
    // Associate recipe with the meal
    const updatedWeeklyPlan = [...weeklyPlan];
    const dayIndex = updatedWeeklyPlan.findIndex(day => day.id === selectedMealForRecipe.dayId);
    
    if (dayIndex !== -1) {
      updatedWeeklyPlan[dayIndex].meals[selectedMealForRecipe.mealIndex].recipeId = recipeId;
      setWeeklyPlan(updatedWeeklyPlan);
      saveMealPlanData(updatedWeeklyPlan);
    }
    
    setRecipeModalVisible(false);
    Alert.alert("Success", "Recipe added successfully!");
  };
  
  // Function to view a recipe
  const viewRecipe = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setViewRecipeModalVisible(true);
  };
  
  // Function to get a recipe by ID
  const getRecipeById = (recipeId: string | undefined): Recipe | undefined => {
    if (!recipeId) return undefined;
    return recipes.find(recipe => recipe.id === recipeId);
  };

  // Render loading indicator while data is being fetched
  if (loading) {
    return (
      <StyledView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <StyledText className="mt-4 text-lg">Loading meal plan...</StyledText>
      </StyledView>
    );
  }

  // Web version of the meal planner
  if (isWeb) {
    const selectedDayPlan = weeklyPlan.find((day) => day.id === selectedDay);
    
    return (
      <WebLayout title="Meal Planner" currentTab="meal-planner">
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Week Selector */}
          <div style={{ 
            display: 'flex',
            overflowX: 'auto',
            gap: '0.5rem',
            padding: '0.5rem 0',
            marginBottom: '0.5rem'
          }}>
            {weeklyPlan.map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.5rem',
                  backgroundColor: selectedDay === day.id 
                    ? '#4F46E5' 
                    : isDark ? '#1F2937' : '#F9FAFB',
                  color: selectedDay === day.id 
                    ? 'white' 
                    : isDark ? '#E5E7EB' : '#4B5563',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  minWidth: '100px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {day.day}
              </button>
            ))}
          </div>
          
          {/* Selected Day Meals */}
          <div style={{ 
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
          }}>
            <div style={{ 
              padding: '1rem',
              borderBottom: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ 
                fontSize: '1.25rem',
                fontWeight: 600,
                color: isDark ? '#F9FAFB' : '#111827',
                margin: 0,
              }}>
                {selectedDayPlan?.day || 'Day'} Meal Plan
              </h2>
              <button
                onClick={() => addMeal()}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <WebIcon name="plus" />
                Add Meal
              </button>
            </div>
            
            <div style={{ padding: '1rem' }}>
              {selectedDayPlan?.meals.map((meal, index) => {
                const recipe = meal.recipeId ? getRecipeById(meal.recipeId) : undefined;
                
                return (
                  <div 
                    key={`${selectedDayPlan.id}-${index}`}
                    style={{
                      padding: '1rem',
                      marginBottom: '1rem',
                      borderRadius: '0.5rem',
                      backgroundColor: isDark ? '#111827' : '#F9FAFB',
                      border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                    }}
                  >
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem',
                    }}>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '9999px',
                          backgroundColor: '#4F46E5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}>
                          <WebIcon name={mealTypeIcons[meal.type]} />
                        </div>
                        <div>
                          <h3 style={{ 
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            color: isDark ? '#F9FAFB' : '#111827',
                            margin: 0,
                          }}>
                            {meal.title}
                          </h3>
                          <p style={{ 
                            fontSize: '0.875rem',
                            color: isDark ? '#9CA3AF' : '#6B7280',
                            margin: '0.25rem 0 0 0',
                          }}>
                            {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} • {meal.time}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => editMeal(selectedDayPlan.id, index)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '0.375rem',
                            backgroundColor: isDark ? '#374151' : '#E5E7EB',
                            color: isDark ? '#E5E7EB' : '#4B5563',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <WebIcon name="pencil-alt" />
                        </button>
                        <button
                          onClick={() => openRecipeModal(selectedDayPlan.id, index)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '0.375rem',
                            backgroundColor: isDark ? '#374151' : '#E5E7EB',
                            color: isDark ? '#E5E7EB' : '#4B5563',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <WebIcon name="book" />
                        </button>
                      </div>
                    </div>
                    
                    {recipe && (
                      <div style={{ 
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        backgroundColor: isDark ? '#374151' : '#E5E7EB',
                      }}>
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem',
                        }}>
                          <h4 style={{ 
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: isDark ? '#F9FAFB' : '#111827',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}>
                            <WebIcon name="utensils" />
                            {recipe.name}
                          </h4>
                          <button
                            onClick={() => viewRecipe(recipe.id)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              backgroundColor: '#4F46E5',
                              color: 'white',
                              border: 'none',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            View Recipe
                          </button>
                        </div>
                        <div style={{ 
                          display: 'flex',
                          gap: '1rem',
                          fontSize: '0.75rem',
                          color: isDark ? '#9CA3AF' : '#6B7280',
                        }}>
                          <div>
                            <i className="fas fa-clock"></i> Prep: {recipe.prepTime}
                          </div>
                          <div>
                            <i className="fas fa-fire"></i> Cook: {recipe.cookTime}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {selectedDayPlan?.meals.length === 0 && (
                <div style={{ 
                  padding: '2rem',
                  textAlign: 'center',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                }}>
                  <WebIcon name="calendar-day" size={32} style={{ marginBottom: '1rem' }} />
                  <p style={{ fontSize: '1rem', fontWeight: 500 }}>No meals planned for this day</p>
                  <button
                    onClick={() => addMeal()}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      backgroundColor: '#4F46E5',
                      color: 'white',
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      marginTop: '1rem',
                    }}
                  >
                    Add a meal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* We'll need to handle modals differently for web, but keeping the native ones for now */}
      </WebLayout>
    );
  }
  
  // Mobile version
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
                      const day = weeklyPlan.find(d => d.id === selectedDay);
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
                      {weeklyPlan.find(d => d.id === selectedDay)?.meals[index].recipeId ? "View Recipe" : "Add Recipe"}
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

      {/* Recipe List Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={recipeListModalVisible}
        onRequestClose={() => setRecipeListModalVisible(false)}
      >
        <StyledView className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <StyledView 
            className={`w-11/12 p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              maxHeight: '80%'
            }}
          >
            <StyledView className="flex-row justify-between items-center mb-4">
              <StyledText className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Select a Recipe
              </StyledText>
              <StyledTouchableOpacity onPress={() => setRecipeListModalVisible(false)}>
                <FontAwesome5 name="times" size={20} color={isDark ? '#E5E7EB' : '#4B5563'} />
              </StyledTouchableOpacity>
            </StyledView>
            
            <StyledScrollView 
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: Dimensions.get('window').height * 0.5 }}
            >
              {recipes.length > 0 ? (
                recipes.map((recipe) => (
                  <StyledTouchableOpacity 
                    key={recipe.id}
                    className={`p-4 mb-3 rounded-xl border ${isDark ? 
                      'bg-gray-700 border-gray-600' : 
                      'bg-white border-gray-200'}`}
                    onPress={() => selectRecipeForMeal(recipe.id)}
                  >
                    <StyledText className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {recipe.name}
                    </StyledText>
                    <StyledView className="flex-row items-center">
                      <FontAwesome5 
                        name="list" 
                        size={12} 
                        color={isDark ? '#9CA3AF' : '#6B7280'} 
                        style={{ marginRight: 6 }}
                      />
                      <StyledText className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {recipe.ingredients.length} ingredients
                      </StyledText>
                    </StyledView>
                  </StyledTouchableOpacity>
                ))
              ) : (
                <StyledView className="py-8 items-center">
                  <StyledText className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No recipes found. Create your first recipe!
                  </StyledText>
                </StyledView>
              )}
            </StyledScrollView>
            
            <StyledView className="mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}">
              <StyledTouchableOpacity 
                className="py-3 rounded-lg bg-blue-500"
                onPress={openCreateRecipeModal}
              >
                <StyledView className="flex-row justify-center items-center">
                  <FontAwesome5 
                    name="plus" 
                    size={14} 
                    color="#fff" 
                    style={{ marginRight: 8 }}
                  />
                  <StyledText className="text-center font-medium text-white">
                    Create New Recipe
                  </StyledText>
                </StyledView>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </StyledView>
      </Modal>
      
      {/* Add Recipe Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={recipeModalVisible}
        onRequestClose={() => setRecipeModalVisible(false)}
      >
        <StyledView className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <StyledView 
            className={`w-11/12 p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              maxHeight: '90%'
            }}
          >
            <StyledScrollView showsVerticalScrollIndicator={false}>
              <StyledView className="flex-row justify-between items-center mb-4">
                <StyledText className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Create New Recipe
                </StyledText>
                <StyledTouchableOpacity onPress={() => setRecipeModalVisible(false)}>
                  <FontAwesome5 name="times" size={20} color={isDark ? '#E5E7EB' : '#4B5563'} />
                </StyledTouchableOpacity>
              </StyledView>
              
              {/* Recipe Name Input */}
              <StyledView className="mb-4">
                <StyledText className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Recipe Name*
                </StyledText>
                <StyledTextInput
                  className={`border p-3 rounded-lg ${isDark ? 
                    'bg-gray-700 border-gray-600 text-white' : 
                    'bg-white border-gray-300 text-gray-800'}`}
                  placeholder="Enter recipe name"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                  value={currentRecipe.name}
                  onChangeText={(text) => setCurrentRecipe({
                    ...currentRecipe,
                    name: text
                  })}
                />
              </StyledView>
              
              {/* Ingredients Section */}
              <StyledView className="mb-4">
                <StyledText className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Ingredients*
                </StyledText>
                
                {/* Ingredients List */}
                {currentRecipe.ingredients.length > 0 && (
                  <StyledView className={`mb-3 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {currentRecipe.ingredients.map((ingredient, idx) => (
                      <StyledView key={idx} className="flex-row justify-between items-center mb-2">
                        <StyledText className={isDark ? 'text-white' : 'text-gray-800'}>
                          • {ingredient}
                        </StyledText>
                        <StyledTouchableOpacity onPress={() => removeIngredient(idx)}>
                          <FontAwesome5 name="times" size={14} color={isDark ? '#E5E7EB' : '#4B5563'} />
                        </StyledTouchableOpacity>
                      </StyledView>
                    ))}
                  </StyledView>
                )}
                
                {/* Add Ingredient Input */}
                <StyledView className="flex-row space-x-2">
                  <StyledTextInput
                    className={`flex-1 border p-3 rounded-lg ${isDark ? 
                      'bg-gray-700 border-gray-600 text-white' : 
                      'bg-white border-gray-300 text-gray-800'}`}
                    placeholder="Add an ingredient"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                    value={newIngredient}
                    onChangeText={setNewIngredient}
                  />
                  <StyledTouchableOpacity 
                    className="py-3 px-4 rounded-lg bg-blue-500 justify-center"
                    onPress={addIngredient}
                  >
                    <FontAwesome5 name="plus" size={14} color="#fff" />
                  </StyledTouchableOpacity>
                </StyledView>
              </StyledView>
              
              {/* Instructions Input */}
              <StyledView className="mb-4">
                <StyledText className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Instructions*
                </StyledText>
                <StyledTextInput
                  className={`border p-3 rounded-lg ${isDark ? 
                    'bg-gray-700 border-gray-600 text-white' : 
                    'bg-white border-gray-300 text-gray-800'}`}
                  placeholder="Enter cooking instructions"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                  value={currentRecipe.instructions}
                  onChangeText={(text) => setCurrentRecipe({
                    ...currentRecipe,
                    instructions: text
                  })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{ height: 100 }}
                />
              </StyledView>
              
              {/* Prep Time Input */}
              <StyledView className="mb-4">
                <StyledText className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Prep Time
                </StyledText>
                <StyledTextInput
                  className={`border p-3 rounded-lg ${isDark ? 
                    'bg-gray-700 border-gray-600 text-white' : 
                    'bg-white border-gray-300 text-gray-800'}`}
                  placeholder="e.g. 15 minutes"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                  value={currentRecipe.prepTime}
                  onChangeText={(text) => setCurrentRecipe({
                    ...currentRecipe,
                    prepTime: text
                  })}
                />
              </StyledView>
              
              {/* Cook Time Input */}
              <StyledView className="mb-6">
                <StyledText className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Cook Time
                </StyledText>
                <StyledTextInput
                  className={`border p-3 rounded-lg ${isDark ? 
                    'bg-gray-700 border-gray-600 text-white' : 
                    'bg-white border-gray-300 text-gray-800'}`}
                  placeholder="e.g. 30 minutes"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                  value={currentRecipe.cookTime}
                  onChangeText={(text) => setCurrentRecipe({
                    ...currentRecipe,
                    cookTime: text
                  })}
                />
              </StyledView>
              
              {/* Action Buttons */}
              <StyledView className="flex-row space-x-3 mb-4">
                <StyledTouchableOpacity 
                  className={`flex-1 py-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                  onPress={() => setRecipeModalVisible(false)}
                >
                  <StyledText 
                    className={`text-center font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}
                  >
                    Cancel
                  </StyledText>
                </StyledTouchableOpacity>
                <StyledTouchableOpacity 
                  className="flex-1 py-3 rounded-lg bg-blue-500"
                  onPress={saveRecipe}
                >
                  <StyledText className="text-center font-medium text-white">
                    Save Recipe
                  </StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            </StyledScrollView>
          </StyledView>
        </StyledView>
      </Modal>

      {/* View Recipe Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={viewRecipeModalVisible}
        onRequestClose={() => setViewRecipeModalVisible(false)}
      >
        <StyledView className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <StyledView 
            className={`w-11/12 p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              maxHeight: '90%'
            }}
          >
            {selectedRecipeId && (
              <StyledScrollView showsVerticalScrollIndicator={false}>
                {(() => {
                  const recipe = getRecipeById(selectedRecipeId);
                  if (!recipe) return (
                    <StyledText className={`text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Recipe not found
                    </StyledText>
                  );
                  
                  return (
                    <>
                      <StyledView className="flex-row justify-between items-center mb-4">
                        <StyledText className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {recipe.name}
                        </StyledText>
                        <StyledTouchableOpacity onPress={() => setViewRecipeModalVisible(false)}>
                          <FontAwesome5 name="times" size={20} color={isDark ? '#E5E7EB' : '#4B5563'} />
                        </StyledTouchableOpacity>
                      </StyledView>
                      
                      {/* Time Information */}
                      {(recipe.prepTime || recipe.cookTime) && (
                        <StyledView className="flex-row mb-6">
                          {recipe.prepTime && (
                            <StyledView className={`mr-4 p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              <StyledText className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                PREP TIME
                              </StyledText>
                              <StyledText className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {recipe.prepTime}
                              </StyledText>
                            </StyledView>
                          )}
                          {recipe.cookTime && (
                            <StyledView className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              <StyledText className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                COOK TIME
                              </StyledText>
                              <StyledText className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {recipe.cookTime}
                              </StyledText>
                            </StyledView>
                          )}
                        </StyledView>
                      )}
                      
                      {/* Ingredients */}
                      <StyledView className="mb-6">
                        <StyledText className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Ingredients
                        </StyledText>
                        <StyledView className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          {recipe.ingredients.map((ingredient, idx) => (
                            <StyledText 
                              key={idx} 
                              className={`mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}
                            >
                              • {ingredient}
                            </StyledText>
                          ))}
                        </StyledView>
                      </StyledView>
                      
                      {/* Instructions */}
                      <StyledView className="mb-6">
                        <StyledText className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Instructions
                        </StyledText>
                        <StyledView className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <StyledText className={isDark ? 'text-white' : 'text-gray-800'}>
                            {recipe.instructions}
                          </StyledText>
                        </StyledView>
                      </StyledView>
                      
                      {/* Close Button */}
                      <StyledTouchableOpacity 
                        className={`py-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                        onPress={() => setViewRecipeModalVisible(false)}
                      >
                        <StyledText 
                          className={`text-center font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}
                        >
                          Close
                        </StyledText>
                      </StyledTouchableOpacity>
                    </>
                  );
                })()}
              </StyledScrollView>
            )}
          </StyledView>
        </StyledView>
      </Modal>

      {/* Add New Meal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <StyledView className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <StyledView 
            className={`w-11/12 p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <StyledText className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Add New Meal
            </StyledText>
            
            {/* Meal Type Selector */}
            <StyledView className="mb-4">
              <StyledText className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Meal Type
              </StyledText>
              <StyledView className="flex-row space-x-2">
                {['breakfast', 'lunch', 'dinner'].map((type) => (
                  <StyledTouchableOpacity 
                    key={type}
                    className={`py-2 px-3 rounded-lg ${currentMeal.meal.type === type ? 
                      (isDark ? 'bg-blue-600' : 'bg-blue-500') : 
                      (isDark ? 'bg-gray-700' : 'bg-gray-200')}`}
                    onPress={() => setCurrentMeal({
                      ...currentMeal,
                      meal: { ...currentMeal.meal, type: type as "breakfast" | "lunch" | "dinner" }
                    })}
                  >
                    <StyledText 
                      className={`text-sm font-medium ${currentMeal.meal.type === type ? 
                        'text-white' : 
                        (isDark ? 'text-gray-300' : 'text-gray-600')}`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </StyledText>
                  </StyledTouchableOpacity>
                ))}
              </StyledView>
            </StyledView>
            
            {/* Meal Title Input */}
            <StyledView className="mb-4">
              <StyledText className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Meal Title
              </StyledText>
              <StyledTextInput
                className={`border p-3 rounded-lg ${isDark ? 
                  'bg-gray-700 border-gray-600 text-white' : 
                  'bg-white border-gray-300 text-gray-800'}`}
                placeholder="Enter meal title"
                placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                value={currentMeal.meal.title}
                onChangeText={(text) => setCurrentMeal({
                  ...currentMeal,
                  meal: { ...currentMeal.meal, title: text }
                })}
              />
            </StyledView>
            
            {/* Meal Time Input */}
            <StyledView className="mb-6">
              <StyledText className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Time
              </StyledText>
              <StyledTextInput
                className={`border p-3 rounded-lg ${isDark ? 
                  'bg-gray-700 border-gray-600 text-white' : 
                  'bg-white border-gray-300 text-gray-800'}`}
                placeholder="Enter time (e.g. 8:00 AM)"
                placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                value={currentMeal.meal.time}
                onChangeText={(text) => setCurrentMeal({
                  ...currentMeal,
                  meal: { ...currentMeal.meal, time: text }
                })}
              />
            </StyledView>
            
            {/* Action Buttons */}
            <StyledView className="flex-row space-x-3">
              <StyledTouchableOpacity 
                className={`flex-1 py-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                onPress={() => setModalVisible(false)}
              >
                <StyledText 
                  className={`text-center font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}
                >
                  Cancel
                </StyledText>
              </StyledTouchableOpacity>
              <StyledTouchableOpacity 
                className="flex-1 py-3 rounded-lg bg-blue-500"
                onPress={saveNewMeal}
              >
                <StyledText className="text-center font-medium text-white">
                  Save
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </StyledView>
      </Modal>

      {/* Edit Meal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <StyledView className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <StyledView 
            className={`w-11/12 p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <StyledText className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Edit Meal
            </StyledText>
            
            {/* Meal Type Selector */}
            <StyledView className="mb-4">
              <StyledText className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Meal Type
              </StyledText>
              <StyledView className="flex-row space-x-2">
                {['breakfast', 'lunch', 'dinner'].map((type) => (
                  <StyledTouchableOpacity 
                    key={type}
                    className={`py-2 px-3 rounded-lg ${currentMeal.meal.type === type ? 
                      (isDark ? 'bg-blue-600' : 'bg-blue-500') : 
                      (isDark ? 'bg-gray-700' : 'bg-gray-200')}`}
                    onPress={() => setCurrentMeal({
                      ...currentMeal,
                      meal: { ...currentMeal.meal, type: type as "breakfast" | "lunch" | "dinner" }
                    })}
                  >
                    <StyledText 
                      className={`text-sm font-medium ${currentMeal.meal.type === type ? 
                        'text-white' : 
                        (isDark ? 'text-gray-300' : 'text-gray-600')}`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </StyledText>
                  </StyledTouchableOpacity>
                ))}
              </StyledView>
            </StyledView>
            
            {/* Meal Title Input */}
            <StyledView className="mb-4">
              <StyledText className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Meal Title
              </StyledText>
              <StyledTextInput
                className={`border p-3 rounded-lg ${isDark ? 
                  'bg-gray-700 border-gray-600 text-white' : 
                  'bg-white border-gray-300 text-gray-800'}`}
                placeholder="Enter meal title"
                placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                value={currentMeal.meal.title}
                onChangeText={(text) => setCurrentMeal({
                  ...currentMeal,
                  meal: { ...currentMeal.meal, title: text }
                })}
              />
            </StyledView>
            
            {/* Meal Time Input */}
            <StyledView className="mb-6">
              <StyledText className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Time
              </StyledText>
              <StyledTextInput
                className={`border p-3 rounded-lg ${isDark ? 
                  'bg-gray-700 border-gray-600 text-white' : 
                  'bg-white border-gray-300 text-gray-800'}`}
                placeholder="Enter time (e.g. 8:00 AM)"
                placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                value={currentMeal.meal.time}
                onChangeText={(text) => setCurrentMeal({
                  ...currentMeal,
                  meal: { ...currentMeal.meal, time: text }
                })}
              />
            </StyledView>
            
            {/* Action Buttons */}
            <StyledView className="flex-row space-x-3 mb-3">
              <StyledTouchableOpacity 
                className={`flex-1 py-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                onPress={() => setEditModalVisible(false)}
              >
                <StyledText 
                  className={`text-center font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}
                >
                  Cancel
                </StyledText>
              </StyledTouchableOpacity>
              <StyledTouchableOpacity 
                className="flex-1 py-3 rounded-lg bg-blue-500"
                onPress={updateMeal}
              >
                <StyledText className="text-center font-medium text-white">
                  Update
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>
            
            {/* Delete Button */}
            <StyledTouchableOpacity 
              className={`py-3 rounded-lg ${isDark ? 'bg-red-800' : 'bg-red-500'}`}
              onPress={deleteMeal}
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
