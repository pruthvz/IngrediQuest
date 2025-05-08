/**
 * Home Screen Component
 *
 * This is the main screen of the application where users can:
 * - Input ingredients they have
 * - Search for recipes based on those ingredients
 * - View recipe details
 * - Save recipes to their favorites
 *
 * The component provides different layouts for web and mobile platforms
 * with responsive design and theme support.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  ActivityIndicator,
  GestureResponderEvent,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome5 } from "@expo/vector-icons";
import RecipeDetailModal from "../../src/components/RecipeDetailModal";
import { useSavedRecipes } from "../../src/context/SavedRecipesContext";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import WebLayout from "../components/WebLayout";
import WebRecipeModal from "../components/WebRecipeModal";
import WebIcon from "../components/WebIcon";
import { useUserPreferences } from "../../src/context/UserPreferencesContext";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledBlurView = styled(BlurView);

const { width } = Dimensions.get("window");

/**
 * Type Definitions
 * Define the shape of our recipe data structures
 */
interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: {
    id: number;
    amount: number;
    unit: string;
    name: string;
  }[];
  usedIngredients: {
    id: number;
    amount: number;
    unit: string;
    name: string;
  }[];
  likes: number;
}

interface RecipeDetail {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  instructions: string;
  extendedIngredients: {
    id: number;
    amount: number;
    unit: string;
    originalName: string;
  }[];
  analyzedInstructions: {
    steps: {
      number: number;
      step: string;
      ingredients: { name: string }[];
    }[];
  }[];
}

interface Ingredient {
  id: string;
  name: string;
}

import { ENV } from "../../src/config/env";

const API_KEY = ENV.SPOONACULAR_API_KEY;

export default function HomeScreen() {
  // State management for form inputs and data
  const [inputValue, setInputValue] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Theme and platform-specific hooks
  const { preferences } = useUserPreferences();
  const isDark = preferences.isDarkMode;
  const isWeb = Platform.OS === "web";

  // Recipe management state
  const [selectedRecipeDetails, setSelectedRecipeDetails] =
    useState<RecipeDetail | null>(null);
  const { saveRecipe, removeRecipe, isSaved } = useSavedRecipes();
  const [webModalVisible, setWebModalVisible] = useState(false);

  /**
   * Adds a new ingredient to the list and triggers a recipe search
   * Validates for duplicates and empty inputs
   */
  const addIngredient = () => {
    if (
      inputValue.trim() &&
      !ingredients.some(
        (ing) => ing.name.toLowerCase() === inputValue.trim().toLowerCase()
      )
    ) {
      setIngredients([
        ...ingredients,
        { id: Date.now().toString(), name: inputValue.trim() },
      ]);
      setInputValue("");
      searchRecipesWithIngredients([
        ...ingredients,
        { id: Date.now().toString(), name: inputValue.trim() },
      ]);
    }
  };

  /**
   * Removes an ingredient from the list and updates recipe search
   * @param id - The ID of the ingredient to remove
   */
  const removeIngredient = (id: string) => {
    const updatedIngredients = ingredients.filter((ing) => ing.id !== id);
    setIngredients(updatedIngredients);
    if (updatedIngredients.length > 0) {
      searchRecipesWithIngredients(updatedIngredients);
    } else {
      setRecipes([]);
    }
  };

  /**
   * Performs API call to search for recipes based on ingredients
   * @param ingredientsList - List of ingredients to search with
   */
  const searchRecipesWithIngredients = async (
    ingredientsList: Ingredient[]
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const ingredients = ingredientsList.map((ing) => ing.name).join(",");
      const response = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${API_KEY}&ingredients=${ingredients}&number=10&ranking=2&ignorePantry=true`
      );
      const data = await response.json();

      if (data.length > 0) {
        setRecipes(data);
      } else {
        setRecipes([]);
        setError(`No recipes found with these ingredients`);
      }
    } catch (err) {
      setError("Failed to fetch recipes. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles clicking on a recipe to view its details
   * Fetches full recipe information from the API
   * @param recipe - The recipe to get details for
   */
  const handleRecipeClick = async (recipe: Recipe) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${API_KEY}`
      );
      const data = await response.json();
      setSelectedRecipeDetails(data);

      if (isWeb) {
        setWebModalVisible(true);
      }
    } catch (err) {
      console.error("Error fetching recipe details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles saving/unsaving a recipe to favorites
   * @param e - Event object
   * @param recipe - Recipe to save/unsave
   */
  const handleSavePress = (e: GestureResponderEvent, recipe: Recipe) => {
    e.stopPropagation(); // Prevent triggering the recipe click
    if (isSaved(recipe.id)) {
      removeRecipe(recipe.id);
    } else {
      saveRecipe({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        usedIngredientCount: recipe.usedIngredientCount,
        missedIngredientCount: recipe.missedIngredientCount,
      });
    }
  };

  // Web-specific rendering with enhanced UI features
  if (isWeb) {
    return (
      <WebLayout title="Home" currentTab="home">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Search Bar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
              padding: "1.5rem",
              borderRadius: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: isDark ? "#F9FAFB" : "#111827",
                marginBottom: "0.5rem",
              }}
            >
              What's in your kitchen?
            </h2>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addIngredient()}
                placeholder="Enter an ingredient..."
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: "1px solid " + (isDark ? "#374151" : "#E5E7EB"),
                  backgroundColor: isDark ? "#111827" : "#FFFFFF",
                  color: isDark ? "#F9FAFB" : "#111827",
                  fontSize: "0.95rem",
                }}
              />
              <button
                onClick={addIngredient}
                style={{
                  padding: "0.75rem 1.25rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#4F46E5",
                  color: "white",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Add
              </button>
            </div>

            {/* Ingredient Tags */}
            {ingredients.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap" as const,
                  gap: "0.5rem",
                  marginTop: "0.5rem",
                }}
              >
                {ingredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      backgroundColor: isDark ? "#374151" : "#E5E7EB",
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      color: isDark ? "#F9FAFB" : "#111827",
                    }}
                  >
                    {ingredient.name}
                    <button
                      onClick={() => removeIngredient(ingredient.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        padding: "0.25rem",
                        color: isDark ? "#9CA3AF" : "#6B7280",
                      }}
                    >
                      <WebIcon name="times" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "2rem",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  width: "2rem",
                  height: "2rem",
                  border: "3px solid " + (isDark ? "#374151" : "#E5E7EB"),
                  borderRadius: "50%",
                  borderTopColor: "#4F46E5",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
            </div>
          )}

          {/* Recipe Results */}
          {!isLoading && recipes.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  color: isDark ? "#F9FAFB" : "#111827",
                }}
              >
                Recipes with your ingredients
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "1rem",
                }}
              >
                {recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    onClick={() => handleRecipeClick(recipe)}
                    style={{
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                      border: "1px solid " + (isDark ? "#374151" : "#E5E7EB"),
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                      cursor: "pointer",
                      transition: "transform 0.2s ease-in-out",
                      // Hover effect will be handled with CSS
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        height: "160px",
                      }}
                    >
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSaved(recipe.id)) {
                            removeRecipe(recipe.id);
                          } else {
                            saveRecipe(recipe);
                          }
                        }}
                        style={{
                          position: "absolute",
                          top: "0.75rem",
                          right: "0.75rem",
                          width: "2rem",
                          height: "2rem",
                          borderRadius: "9999px",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <i
                          className={`fas fa-bookmark ${
                            isSaved(recipe.id)
                              ? "text-yellow-400"
                              : "text-white"
                          }`}
                        ></i>
                      </button>
                    </div>
                    <div style={{ padding: "1rem" }}>
                      <h4
                        style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: isDark ? "#F9FAFB" : "#111827",
                        }}
                      >
                        {recipe.title}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <div
                            style={{
                              padding: "0.25rem 0.5rem",
                              borderRadius: "0.375rem",
                              backgroundColor: isDark
                                ? "rgba(16, 185, 129, 0.2)"
                                : "rgba(16, 185, 129, 0.1)",
                              color: isDark ? "#34D399" : "#059669",
                              fontSize: "0.75rem",
                            }}
                          >
                            {recipe.usedIngredientCount} used
                          </div>

                          {recipe.missedIngredientCount > 0 && (
                            <div
                              style={{
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.375rem",
                                backgroundColor: isDark
                                  ? "rgba(245, 158, 11, 0.2)"
                                  : "rgba(245, 158, 11, 0.1)",
                                color: isDark ? "#FBBF24" : "#D97706",
                                fontSize: "0.75rem",
                              }}
                            >
                              {recipe.missedIngredientCount} missing
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            color: isDark ? "#9CA3AF" : "#6B7280",
                            fontSize: "0.875rem",
                          }}
                        >
                          <i
                            className="fas fa-heart"
                            style={{ color: "#EF4444", marginRight: "0.25rem" }}
                          ></i>
                          {recipe.likes}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty States */}
          {!isLoading && recipes.length === 0 && ingredients.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem 0",
                color: isDark ? "#9CA3AF" : "#6B7280",
              }}
            >
              <WebIcon
                name="search"
                size={40}
                style={{ marginBottom: "1rem" }}
              />
              <p style={{ fontSize: "1.125rem", fontWeight: 500 }}>
                No recipes found. Try different ingredients!
              </p>
            </div>
          )}

          {!isLoading && ingredients.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem 0",
                color: isDark ? "#9CA3AF" : "#6B7280",
              }}
            >
              <WebIcon
                name="utensils"
                size={40}
                style={{ marginBottom: "1rem" }}
              />
              <p
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 500,
                  marginBottom: "0.5rem",
                }}
              >
                Add ingredients to discover recipes
              </p>
              <p>We'll help you cook with what you have</p>
            </div>
          )}
        </div>

        {/* Web Recipe Modal */}
        {selectedRecipeDetails && (
          <WebRecipeModal
            recipe={selectedRecipeDetails}
            visible={!!selectedRecipeDetails}
            onClose={() => setSelectedRecipeDetails(null)}
            isSaved={isSaved(selectedRecipeDetails.id)}
            onSaveToggle={() => {
              if (isSaved(selectedRecipeDetails.id)) {
                removeRecipe(selectedRecipeDetails.id);
              } else {
                saveRecipe({
                  id: selectedRecipeDetails.id,
                  title: selectedRecipeDetails.title,
                  image: selectedRecipeDetails.image,
                  usedIngredientCount: 0,
                  missedIngredientCount: 0,
                });
              }
            }}
          />
        )}
      </WebLayout>
    );
  }

  /**
   * Renders the recipe modal for web platform
   * Handles recipe details display and save functionality
   */
  const renderWebRecipeModal = () => {
    if (!isWeb || !selectedRecipeDetails) return null;

    return (
      <WebRecipeModal
        recipe={selectedRecipeDetails}
        visible={webModalVisible}
        onClose={() => {
          setWebModalVisible(false);
          setTimeout(() => setSelectedRecipeDetails(null), 300);
        }}
        isSaved={isSaved(selectedRecipeDetails.id)}
        onSaveToggle={() => {
          if (isSaved(selectedRecipeDetails.id)) {
            removeRecipe(selectedRecipeDetails.id);
          } else {
            saveRecipe({
              id: selectedRecipeDetails.id,
              title: selectedRecipeDetails.title,
              image: selectedRecipeDetails.image,
              usedIngredientCount: 0,
              missedIngredientCount: 0,
            });
          }
        }}
      />
    );
  };

  /**
   * Renders the main content shared between web and mobile
   * Includes search bar, ingredient list, and recipe cards
   */
  const renderMainContent = () => (
    <StyledView className={`p-4 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <StyledView
        className={`mb-6 p-4 rounded-xl ${isDark ? "bg-gray-800" : "bg-white"}`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <StyledText
          className={`text-xl font-bold mb-4 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          What's in your kitchen?
        </StyledText>
        <StyledView className="flex-row items-center">
          <StyledTextInput
            className={`flex-1 px-4 py-2 rounded-lg mr-2 ${
              isDark
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-gray-100 text-gray-900 border-gray-200"
            } border`}
            placeholder="Enter an ingredient"
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={addIngredient}
          />
          <StyledTouchableOpacity
            className={`px-4 py-2 rounded-lg ${
              isDark ? "bg-indigo-600" : "bg-indigo-500"
            }`}
            onPress={addIngredient}
          >
            <StyledText className="text-white font-medium">Add</StyledText>
          </StyledTouchableOpacity>
        </StyledView>

        {ingredients.length > 0 && (
          <StyledView className="mt-4 flex-row flex-wrap">
            {ingredients.map((ingredient) => (
              <StyledView
                key={ingredient.id}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full flex-row items-center ${
                  isDark ? "bg-indigo-900/50" : "bg-indigo-100"
                }`}
              >
                <StyledText
                  className={`${
                    isDark ? "text-indigo-200" : "text-indigo-700"
                  } mr-1`}
                >
                  {ingredient.name}
                </StyledText>
                <StyledTouchableOpacity
                  onPress={() => removeIngredient(ingredient.id)}
                >
                  <FontAwesome5
                    name="times-circle"
                    size={16}
                    color={isDark ? "#A5B4FC" : "#4F46E5"}
                  />
                </StyledTouchableOpacity>
              </StyledView>
            ))}
          </StyledView>
        )}
      </StyledView>

      {isLoading ? (
        <StyledView className="items-center justify-center py-10">
          <ActivityIndicator
            size="large"
            color={isDark ? "#6366F1" : "#4F46E5"}
          />
          <StyledText
            className={`mt-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Finding recipes...
          </StyledText>
        </StyledView>
      ) : error ? (
        <StyledView
          className={`p-5 rounded-xl my-4 ${
            isDark ? "bg-red-900/20" : "bg-red-50"
          }`}
        >
          <StyledText
            className={`text-center ${
              isDark ? "text-red-300" : "text-red-500"
            }`}
          >
            {error}
          </StyledText>
        </StyledView>
      ) : recipes.length > 0 ? (
        <>
          <StyledText
            className={`text-lg font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Recipes For You
          </StyledText>
          <StyledView className="space-y-5">
            {recipes.map((recipe) => (
              <StyledTouchableOpacity
                key={recipe.id}
                className={`rounded-xl overflow-hidden ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
                onPress={() => handleRecipeClick(recipe)}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 10,
                  elevation: 5,
                }}
              >
                <StyledView className="relative h-48">
                  <Image
                    source={{ uri: recipe.image }}
                    className="w-full h-full"
                    style={{ resizeMode: "cover" }}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    className="absolute bottom-0 left-0 right-0 h-24"
                  />
                  <StyledView className="absolute bottom-0 p-4">
                    <StyledText className="text-white text-xl font-bold mb-1">
                      {recipe.title}
                    </StyledText>
                    <StyledView className="flex-row items-center">
                      <FontAwesome5
                        name="check-circle"
                        size={14}
                        color="#60A5FA"
                        style={{ marginRight: 4 }}
                      />
                      <StyledText className="text-gray-200 text-sm">
                        {recipe.usedIngredientCount} ingredients matched
                      </StyledText>
                    </StyledView>
                  </StyledView>

                  <StyledTouchableOpacity
                    className="absolute top-3 right-3 w-9 h-9 rounded-full justify-center items-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
                    onPress={(e) => handleSavePress(e, recipe)}
                  >
                    <FontAwesome5
                      name={isSaved(recipe.id) ? "bookmark" : "bookmark"}
                      solid={isSaved(recipe.id)}
                      size={16}
                      color={isSaved(recipe.id) ? "#FCD34D" : "#FFFFFF"}
                    />
                  </StyledTouchableOpacity>
                </StyledView>

                <StyledView className="p-4">
                  <StyledView className="flex-row items-center justify-between">
                    <StyledView className="flex-row items-center">
                      <StyledView
                        className={`px-2 py-1 rounded-md ${
                          isDark ? "bg-blue-900/30" : "bg-blue-100"
                        }`}
                      >
                        <StyledText
                          className={isDark ? "text-blue-300" : "text-blue-700"}
                        >
                          {recipe.usedIngredientCount +
                            recipe.missedIngredientCount}{" "}
                          ingredients
                        </StyledText>
                      </StyledView>

                      {recipe.missedIngredientCount > 0 && (
                        <StyledView
                          className={`ml-2 px-2 py-1 rounded-md ${
                            isDark ? "bg-amber-900/30" : "bg-amber-100"
                          }`}
                        >
                          <StyledText
                            className={
                              isDark ? "text-amber-300" : "text-amber-700"
                            }
                          >
                            {recipe.missedIngredientCount} missing
                          </StyledText>
                        </StyledView>
                      )}
                    </StyledView>

                    <StyledView className="flex-row items-center">
                      <FontAwesome5
                        name="heart"
                        solid
                        size={14}
                        color={isDark ? "#F87171" : "#EF4444"}
                        style={{ marginRight: 4 }}
                      />
                      <StyledText
                        className={isDark ? "text-gray-400" : "text-gray-500"}
                      >
                        {recipe.likes}
                      </StyledText>
                    </StyledView>
                  </StyledView>
                </StyledView>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
        </>
      ) : ingredients.length > 0 ? (
        <StyledView className="items-center justify-center py-10">
          <FontAwesome5
            name="search"
            size={40}
            color={isDark ? "#4B5563" : "#9CA3AF"}
          />
          <StyledText
            className={`mt-4 text-center ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No recipes found. Try different ingredients!
          </StyledText>
        </StyledView>
      ) : (
        <StyledView className="items-center justify-center py-10">
          <FontAwesome5
            name="utensils"
            size={40}
            color={isDark ? "#4B5563" : "#9CA3AF"}
          />
          <StyledText
            className={`mt-4 text-lg text-center font-medium ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Add ingredients to discover recipes
          </StyledText>
          <StyledText
            className={`mt-2 text-center ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            We'll help you cook with what you have
          </StyledText>
        </StyledView>
      )}
    </StyledView>
  );

  // Mobile-specific rendering with native components
  return (
    <StyledSafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <ScrollView
        className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
        contentContainerStyle={{ flexGrow: 1 }}
      >
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
                      <FontAwesome5 name="utensils" size={20} color="#fff" />
                    </StyledView>
                    <StyledText className="text-white text-lg font-semibold">
                      IngredientQuest
                    </StyledText>
                  </StyledView>
                </StyledView>

                <StyledTouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                  <FontAwesome5 name="bell" size={18} color="#fff" />
                </StyledTouchableOpacity>
              </StyledView>

              <StyledView className="mt-10 mb-5">
                <StyledText className="text-white text-4xl font-bold mb-3">
                  What's in your kitchen?
                </StyledText>
                <StyledText className="text-white/80 text-lg mb-5">
                  Turn your ingredients into culinary magic
                </StyledText>
              </StyledView>
            </StyledView>
          </LinearGradient>

          {/* Floating Ingredient Input Card */}
          <StyledView
            className={`mx-5 p-5 rounded-3xl shadow-lg -mt-10 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.1,
              shadowRadius: 15,
              elevation: 5,
            }}
          >
            <StyledView className="flex-row items-center">
              <StyledTextInput
                className={`flex-1 p-4 rounded-xl text-base ${
                  isDark
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-100 text-gray-800 border-gray-200"
                } border`}
                placeholder="Add ingredients..."
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                value={inputValue}
                onChangeText={setInputValue}
                onSubmitEditing={addIngredient}
              />
              <StyledTouchableOpacity
                className="ml-3 p-4 rounded-xl bg-blue-500"
                onPress={addIngredient}
              >
                <FontAwesome5 name="plus" size={18} color="#FFFFFF" />
              </StyledTouchableOpacity>
            </StyledView>

            {/* Ingredient Tags */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-4 -mx-1"
            >
              {ingredients.map((ingredient) => (
                <StyledTouchableOpacity
                  key={ingredient.id}
                  className={`mr-2 px-4 py-2 rounded-full flex-row items-center ${
                    isDark ? "bg-blue-900/50" : "bg-blue-100"
                  }`}
                  onPress={() => removeIngredient(ingredient.id)}
                >
                  <StyledText
                    className={isDark ? "text-blue-200" : "text-blue-700"}
                  >
                    {ingredient.name}
                  </StyledText>
                  <StyledView className="ml-2 h-5 w-5 rounded-full bg-white/25 items-center justify-center">
                    <FontAwesome5
                      name="times"
                      size={10}
                      color={isDark ? "#93C5FD" : "#2563EB"}
                    />
                  </StyledView>
                </StyledTouchableOpacity>
              ))}
            </ScrollView>
          </StyledView>
        </StyledView>

        {/* Quick Categories - Modern Pills */}
        <StyledView className="mt-8 mb-5 px-5">
          <StyledText
            className={`text-lg font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Popular Categories
          </StyledText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-2"
          >
            {[
              { name: "Breakfast", icon: "coffee" },
              { name: "Lunch", icon: "hamburger" },
              { name: "Dinner", icon: "utensils" },
              { name: "Snacks", icon: "cookie-bite" },
              { name: "Desserts", icon: "ice-cream" },
            ].map((category) => (
              <StyledTouchableOpacity
                key={category.name}
                className={`mr-3 py-3 px-5 rounded-xl border ${
                  isDark
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-200 bg-white"
                } flex-row items-center`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <StyledView
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    isDark ? "bg-blue-900/30" : "bg-blue-100"
                  }`}
                >
                  <FontAwesome5
                    name={category.icon}
                    size={14}
                    color={isDark ? "#60A5FA" : "#3B82F6"}
                  />
                </StyledView>
                <StyledText
                  className={`ml-2 font-medium ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  {category.name}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </ScrollView>
        </StyledView>

        {/* Display Recipes - Cards with Shadows */}
        <StyledView className="px-5 pb-10">
          {isLoading ? (
            <StyledView className="items-center justify-center py-10">
              <ActivityIndicator
                size="large"
                color={isDark ? "#60A5FA" : "#3B82F6"}
              />
              <StyledText
                className={`mt-4 text-center ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Finding delicious recipes...
              </StyledText>
            </StyledView>
          ) : error ? (
            <StyledView
              className={`p-5 rounded-xl my-4 ${
                isDark ? "bg-red-900/20" : "bg-red-50"
              }`}
            >
              <StyledText
                className={`text-center ${
                  isDark ? "text-red-300" : "text-red-500"
                }`}
              >
                {error}
              </StyledText>
            </StyledView>
          ) : recipes.length > 0 ? (
            <>
              <StyledText
                className={`text-lg font-bold mb-4 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Recipes For You
              </StyledText>
              <StyledView className="space-y-5">
                {recipes.map((recipe) => (
                  <StyledTouchableOpacity
                    key={recipe.id}
                    className={`rounded-xl overflow-hidden ${
                      isDark ? "bg-gray-800" : "bg-white"
                    }`}
                    onPress={() => handleRecipeClick(recipe)}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 5 },
                      shadowOpacity: isDark ? 0.3 : 0.1,
                      shadowRadius: 10,
                      elevation: 5,
                    }}
                  >
                    <StyledView className="relative h-48">
                      <Image
                        source={{ uri: recipe.image }}
                        className="w-full h-full"
                        style={{ resizeMode: "cover" }}
                      />
                      <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.7)"]}
                        className="absolute bottom-0 left-0 right-0 h-24"
                      />
                      <StyledView className="absolute bottom-0 p-4">
                        <StyledText className="text-white text-xl font-bold mb-1">
                          {recipe.title}
                        </StyledText>
                        <StyledView className="flex-row items-center">
                          <FontAwesome5
                            name="check-circle"
                            size={14}
                            color="#60A5FA"
                            style={{ marginRight: 4 }}
                          />
                          <StyledText className="text-gray-200 text-sm">
                            {recipe.usedIngredientCount} ingredients matched
                          </StyledText>
                        </StyledView>
                      </StyledView>

                      <StyledTouchableOpacity
                        className="absolute top-3 right-3 w-9 h-9 rounded-full justify-center items-center"
                        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
                        onPress={(e) => handleSavePress(e, recipe)}
                      >
                        <FontAwesome5
                          name={isSaved(recipe.id) ? "bookmark" : "bookmark"}
                          solid={isSaved(recipe.id)}
                          size={16}
                          color={isSaved(recipe.id) ? "#FCD34D" : "#FFFFFF"}
                        />
                      </StyledTouchableOpacity>
                    </StyledView>

                    <StyledView className="p-4">
                      <StyledView className="flex-row items-center justify-between">
                        <StyledView className="flex-row items-center">
                          <StyledView
                            className={`px-2 py-1 rounded-md ${
                              isDark ? "bg-blue-900/30" : "bg-blue-100"
                            }`}
                          >
                            <StyledText
                              className={
                                isDark ? "text-blue-300" : "text-blue-700"
                              }
                            >
                              {recipe.usedIngredientCount +
                                recipe.missedIngredientCount}{" "}
                              ingredients
                            </StyledText>
                          </StyledView>

                          {recipe.missedIngredientCount > 0 && (
                            <StyledView
                              className={`ml-2 px-2 py-1 rounded-md ${
                                isDark ? "bg-amber-900/30" : "bg-amber-100"
                              }`}
                            >
                              <StyledText
                                className={
                                  isDark ? "text-amber-300" : "text-amber-700"
                                }
                              >
                                {recipe.missedIngredientCount} missing
                              </StyledText>
                            </StyledView>
                          )}
                        </StyledView>

                        <StyledView className="flex-row items-center">
                          <FontAwesome5
                            name="heart"
                            solid
                            size={14}
                            color={isDark ? "#F87171" : "#EF4444"}
                            style={{ marginRight: 4 }}
                          />
                          <StyledText
                            className={
                              isDark ? "text-gray-400" : "text-gray-500"
                            }
                          >
                            {recipe.likes}
                          </StyledText>
                        </StyledView>
                      </StyledView>
                    </StyledView>
                  </StyledTouchableOpacity>
                ))}
              </StyledView>
            </>
          ) : ingredients.length > 0 ? (
            <StyledView className="items-center justify-center py-10">
              <FontAwesome5
                name="search"
                size={40}
                color={isDark ? "#4B5563" : "#9CA3AF"}
              />
              <StyledText
                className={`mt-4 text-center ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No recipes found. Try different ingredients!
              </StyledText>
            </StyledView>
          ) : (
            <StyledView className="items-center justify-center py-10">
              <FontAwesome5
                name="utensils"
                size={40}
                color={isDark ? "#4B5563" : "#9CA3AF"}
              />
              <StyledText
                className={`mt-4 text-lg text-center font-medium ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Add ingredients to discover recipes
              </StyledText>
              <StyledText
                className={`mt-2 text-center ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                We'll help you cook with what you have
              </StyledText>
            </StyledView>
          )}
        </StyledView>
      </ScrollView>

      {/* Recipe Detail Modal - Mobile Only */}
      {!isWeb && selectedRecipeDetails && (
        <RecipeDetailModal
          recipe={selectedRecipeDetails}
          visible={!!selectedRecipeDetails}
          onClose={() => setSelectedRecipeDetails(null)}
          isSaved={isSaved(selectedRecipeDetails.id)}
          onSaveToggle={() => {
            if (isSaved(selectedRecipeDetails.id)) {
              removeRecipe(selectedRecipeDetails.id);
            } else {
              saveRecipe({
                id: selectedRecipeDetails.id,
                title: selectedRecipeDetails.title,
                image: selectedRecipeDetails.image,
                usedIngredientCount: 0,
                missedIngredientCount: 0,
              });
            }
          }}
        />
      )}
    </StyledSafeAreaView>
  );
}
