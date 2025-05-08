/**
 * Explore Screen Component
 *
 * This screen allows users to:
 * - Search for recipes by name
 * - Browse recipes by category
 * - View trending recipes
 * - Save favorite recipes
 * - View detailed recipe information
 *
 * Features responsive design for both web and mobile platforms
 * with dark/light theme support.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  useColorScheme,
  ActivityIndicator,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSavedRecipes } from "@/src/context/SavedRecipesContext";
import RecipeDetailModal from "@/src/components/RecipeDetailModal";
import { LinearGradient } from "expo-linear-gradient";
import WebLayout from "../components/WebLayout";
import WebRecipeModal from "../components/WebRecipeModal";
import WebIcon from "../components/WebIcon";
import { useUserPreferences } from "../../src/context/UserPreferencesContext";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);

const { width } = Dimensions.get("window");

/**
 * Type Definitions
 * Define the structure of recipe data from the MealDB API
 */
interface Recipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
}

interface RecipeDetail extends Recipe {
  strInstructions: string;
  strIngredient1?: string;
  strIngredient2?: string;
  // ... up to strIngredient20
  strMeasure1?: string;
  strMeasure2?: string;
  // ... up to strMeasure20
}

export default function ExploreScreen() {
  // Search and data state management
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([]);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Theme and platform-specific hooks
  const { preferences } = useUserPreferences();
  const isDark = preferences.isDarkMode;
  const isWeb = Platform.OS === "web";

  // Recipe management hooks
  const { saveRecipe, removeRecipe, isSaved } = useSavedRecipes();

  // Category management
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  /**
   * Initial data fetching on component mount
   * Gets trending recipes and available categories
   */
  useEffect(() => {
    fetchTrendingRecipes();
    fetchCategories();
  }, []);

  /**
   * Fetches available recipe categories from the API
   */
  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/categories.php"
      );
      const data = await response.json();
      if (data.categories) {
        setCategories(data.categories.map((cat: any) => cat.strCategory));
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  /**
   * Fetches a selection of random recipes to display as trending
   * Makes multiple API calls to build a diverse selection
   */
  const fetchTrendingRecipes = async () => {
    setIsLoading(true);
    try {
      // Fetch 10 random recipes for trending section
      const response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/random.php"
      );
      const data = await response.json();

      // Since we need multiple recipes, let's make multiple requests
      const recipes = await Promise.all(
        Array(10)
          .fill(0)
          .map(async () => {
            const res = await fetch(
              "https://www.themealdb.com/api/json/v1/1/random.php"
            );
            const data = await res.json();
            return data.meals[0];
          })
      );

      setTrendingRecipes(recipes);
    } catch (err) {
      console.error("Error fetching trending recipes:", err);
      setError("Failed to fetch trending recipes");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Searches recipes by name using the API
   * @param query - Search term to look up
   */
  const searchRecipes = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
      );
      const data = await response.json();
      setSearchResults(data.meals || []);
    } catch (err) {
      console.error("Error searching recipes:", err);
      setError("Failed to search recipes");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches recipes filtered by category
   * @param category - Category to filter by
   */
  const fetchRecipesByCategory = async (category: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
      );
      const data = await response.json();
      setSearchResults(data.meals || []);
      setSelectedCategory(category);
    } catch (err) {
      console.error("Error fetching category recipes:", err);
      setError(`Failed to fetch ${category} recipes`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles selecting a recipe to view details
   * Fetches complete recipe information
   * @param recipe - Basic recipe info to get details for
   */
  const handleRecipePress = async (recipe: Recipe) => {
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.idMeal}`
      );
      const data = await response.json();
      setSelectedRecipe(data.meals[0]);
    } catch (err) {
      console.error("Error fetching recipe details:", err);
    }
  };

  /**
   * Toggles saving/unsaving a recipe to favorites
   * @param recipe - Recipe to save or remove
   */
  const handleSaveRecipe = (recipe: Recipe) => {
    if (isSaved(Number(recipe.idMeal))) {
      removeRecipe(Number(recipe.idMeal));
    } else {
      saveRecipe({
        id: Number(recipe.idMeal),
        title: recipe.strMeal,
        image: recipe.strMealThumb,
      });
    }
  };

  // Web-specific rendering with enhanced UI features
  if (isWeb) {
    return (
      <WebLayout title="Explore Recipes" currentTab="explore">
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
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
              }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) {
                    searchRecipes(e.target.value);
                  } else {
                    setSearchResults([]);
                  }
                }}
                placeholder="Search for recipes..."
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
                onClick={() => searchRecipes(searchQuery)}
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
                <WebIcon name="search" />
              </button>
            </div>

            {/* Category Pills */}
            {categories.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap" as const,
                  gap: "0.5rem",
                  marginTop: "0.5rem",
                }}
              >
                <button
                  onClick={() => setSelectedCategory("")}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "9999px",
                    backgroundColor:
                      selectedCategory === ""
                        ? "#4F46E5"
                        : isDark
                        ? "#374151"
                        : "#F3F4F6",
                    color:
                      selectedCategory === ""
                        ? "white"
                        : isDark
                        ? "#E5E7EB"
                        : "#4B5563",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      fetchRecipesByCategory(category);
                    }}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "9999px",
                      backgroundColor:
                        selectedCategory === category
                          ? "#4F46E5"
                          : isDark
                          ? "#374151"
                          : "#F3F4F6",
                      color:
                        selectedCategory === category
                          ? "white"
                          : isDark
                          ? "#E5E7EB"
                          : "#4B5563",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    {category}
                  </button>
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

          {/* Search Results */}
          {!isLoading && searchResults.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  color: isDark ? "#F9FAFB" : "#111827",
                }}
              >
                Search Results
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "1rem",
                }}
              >
                {searchResults.map((recipe) => (
                  <div
                    key={recipe.idMeal}
                    onClick={() => handleRecipePress(recipe)}
                    style={{
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                      border: "1px solid " + (isDark ? "#374151" : "#E5E7EB"),
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                      cursor: "pointer",
                      transition: "transform 0.2s ease-in-out",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        height: "160px",
                      }}
                    >
                      <img
                        src={recipe.strMealThumb}
                        alt={recipe.strMeal}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveRecipe(recipe);
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
                            isSaved(Number(recipe.idMeal))
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
                        {recipe.strMeal}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.375rem",
                            backgroundColor: isDark
                              ? "rgba(79, 70, 229, 0.2)"
                              : "rgba(79, 70, 229, 0.1)",
                            color: isDark ? "#818CF8" : "#4F46E5",
                            fontSize: "0.75rem",
                          }}
                        >
                          {recipe.strCategory}
                        </div>

                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: isDark ? "#9CA3AF" : "#6B7280",
                          }}
                        >
                          {recipe.strArea}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Recipes */}
          {!isLoading &&
            trendingRecipes.length > 0 &&
            searchResults.length === 0 && (
              <div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                    color: isDark ? "#F9FAFB" : "#111827",
                  }}
                >
                  Trending Recipes
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {trendingRecipes.map((recipe) => (
                    <div
                      key={recipe.idMeal}
                      onClick={() => handleRecipePress(recipe)}
                      style={{
                        borderRadius: "0.75rem",
                        overflow: "hidden",
                        backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                        border: "1px solid " + (isDark ? "#374151" : "#E5E7EB"),
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        cursor: "pointer",
                        transition: "transform 0.2s ease-in-out",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          height: "160px",
                        }}
                      >
                        <img
                          src={recipe.strMealThumb}
                          alt={recipe.strMeal}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveRecipe(recipe);
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
                              isSaved(Number(recipe.idMeal))
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
                          {recipe.strMeal}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              padding: "0.25rem 0.5rem",
                              borderRadius: "0.375rem",
                              backgroundColor: isDark
                                ? "rgba(79, 70, 229, 0.2)"
                                : "rgba(79, 70, 229, 0.1)",
                              color: isDark ? "#818CF8" : "#4F46E5",
                              fontSize: "0.75rem",
                            }}
                          >
                            {recipe.strCategory}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              fontSize: "0.75rem",
                              color: isDark ? "#9CA3AF" : "#6B7280",
                            }}
                          >
                            <i
                              className="fas fa-fire"
                              style={{ color: "#EF4444" }}
                            ></i>
                            Trending
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Empty States */}
          {!isLoading && searchQuery && searchResults.length === 0 && (
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
                No recipes found for "{searchQuery}"
              </p>
              <p>Try a different search term</p>
            </div>
          )}
        </div>

        {/* Web Recipe Modal */}
        {selectedRecipe && (
          <WebRecipeModal
            recipe={{
              id: Number(selectedRecipe.idMeal),
              title: selectedRecipe.strMeal,
              image: selectedRecipe.strMealThumb,
              servings: 4,
              readyInMinutes: 30,
              cuisines: [selectedRecipe.strArea || "International"],
              dishTypes: [selectedRecipe.strCategory || "Main Course"],
              diets: [],
              extendedIngredients: Array.from({ length: 20 })
                .map((_, i) => {
                  const ingredientKey = `strIngredient${
                    i + 1
                  }` as keyof RecipeDetail;
                  const measureKey = `strMeasure${i + 1}` as keyof RecipeDetail;

                  const ingredient = selectedRecipe[ingredientKey];
                  const measure = selectedRecipe[measureKey];

                  if (
                    ingredient &&
                    typeof ingredient === "string" &&
                    ingredient.trim()
                  ) {
                    return {
                      id: i,
                      originalName: ingredient,
                      amount: 1,
                      unit: typeof measure === "string" ? measure : "",
                    };
                  }
                  return null;
                })
                .filter(Boolean) as any[],
              analyzedInstructions: [
                {
                  steps: selectedRecipe.strInstructions
                    .split(/\r\n|\n|\r/)
                    .filter((step) => step.trim())
                    .map((step, index) => ({
                      number: index + 1,
                      step: step.trim(),
                      ingredients: [],
                    })),
                },
              ],
            }}
            visible={!!selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
            isSaved={
              selectedRecipe ? isSaved(Number(selectedRecipe.idMeal)) : false
            }
            onSaveToggle={() => {
              if (selectedRecipe) {
                handleSaveRecipe(selectedRecipe);
              }
            }}
          />
        )}
      </WebLayout>
    );
  }

  // Mobile rendering
  return (
    <StyledSafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StyledScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with search bar */}
        <StyledView className="relative">
          <LinearGradient
            colors={
              isDark
                ? ["#4F46E5", "#6366F1", "#818CF8"]
                : ["#6366F1", "#818CF8", "#A5B4FC"]
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
                    width: Math.random() * 80 + 20,
                    height: Math.random() * 80 + 20,
                    left: Math.random() * width,
                    top: Math.random() * 200,
                    opacity: Math.random() * 0.5,
                  }}
                />
              ))}
            </StyledView>

            <StyledView className="px-5">
              <StyledView className="flex-row items-center justify-between mb-6">
                <StyledView>
                  <StyledText className="text-white text-2xl font-bold">
                    Explore
                  </StyledText>
                  <StyledText className="text-white/80 text-base">
                    Discover new recipes
                  </StyledText>
                </StyledView>

                <StyledTouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                  <FontAwesome5 name="filter" size={16} color="#fff" />
                </StyledTouchableOpacity>
              </StyledView>

              {/* Search bar */}
              <StyledView
                className={`rounded-xl overflow-hidden flex-row items-center bg-white/20 px-4 py-3`}
              >
                <FontAwesome5 name="search" size={16} color="white" />
                <StyledTextInput
                  className="flex-1 ml-3 text-white"
                  placeholder="Search recipes..."
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    searchRecipes(text);
                    setSelectedCategory("");
                  }}
                />
              </StyledView>
            </StyledView>
          </LinearGradient>

          {/* Categories Carousel */}
          <StyledView
            className={`mx-5 -mt-8 py-3 px-4 rounded-2xl shadow-lg ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <StyledScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-1"
            >
              <StyledTouchableOpacity
                className={`mr-2 px-4 py-2 rounded-full ${
                  selectedCategory === ""
                    ? isDark
                      ? "bg-indigo-900"
                      : "bg-indigo-500"
                    : isDark
                    ? "bg-gray-700"
                    : "bg-gray-100"
                }`}
                onPress={() => {
                  setSelectedCategory("");
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                <StyledText
                  className={`${
                    selectedCategory === ""
                      ? "text-white"
                      : isDark
                      ? "text-gray-300"
                      : "text-gray-800"
                  } font-medium`}
                >
                  All
                </StyledText>
              </StyledTouchableOpacity>

              {categories.slice(0, 10).map((category) => (
                <StyledTouchableOpacity
                  key={category}
                  className={`mr-2 px-4 py-2 rounded-full ${
                    selectedCategory === category
                      ? isDark
                        ? "bg-indigo-900"
                        : "bg-indigo-500"
                      : isDark
                      ? "bg-gray-700"
                      : "bg-gray-100"
                  }`}
                  onPress={() => {
                    fetchRecipesByCategory(category);
                    setSearchQuery("");
                  }}
                >
                  <StyledText
                    className={`${
                      selectedCategory === category
                        ? "text-white"
                        : isDark
                        ? "text-gray-300"
                        : "text-gray-800"
                    } font-medium`}
                  >
                    {category}
                  </StyledText>
                </StyledTouchableOpacity>
              ))}
            </StyledScrollView>
          </StyledView>
        </StyledView>

        {/* Content Section */}
        <StyledView className="px-5 pt-6 pb-10">
          {/* Loading State */}
          {isLoading ? (
            <StyledView className="items-center justify-center py-10">
              <ActivityIndicator
                size="large"
                color={isDark ? "#818CF8" : "#6366F1"}
              />
              <StyledText
                className={`mt-4 text-center ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Discovering recipes...
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
          ) : searchQuery || selectedCategory ? (
            // Search/Category Results
            <>
              <StyledText
                className={`text-lg font-bold mb-4 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : `${selectedCategory} Recipes`}
              </StyledText>

              {searchResults.length > 0 ? (
                <StyledView className="space-y-5">
                  {searchResults.map((recipe) => (
                    <StyledTouchableOpacity
                      key={recipe.idMeal}
                      className={`rounded-xl overflow-hidden ${
                        isDark ? "bg-gray-800" : "bg-white"
                      }`}
                      onPress={() => handleRecipePress(recipe)}
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
                          source={{ uri: recipe.strMealThumb }}
                          className="w-full h-full"
                          style={{ resizeMode: "cover" }}
                        />
                        <LinearGradient
                          colors={["transparent", "rgba(0,0,0,0.7)"]}
                          className="absolute bottom-0 left-0 right-0 h-24"
                        />
                        <StyledView className="absolute bottom-0 p-4">
                          <StyledText className="text-white text-xl font-bold mb-1">
                            {recipe.strMeal}
                          </StyledText>
                          <StyledView className="flex-row items-center">
                            <FontAwesome5
                              name="map-marker-alt"
                              size={12}
                              color="#818CF8"
                              style={{ marginRight: 4 }}
                            />
                            <StyledText className="text-gray-200 text-sm">
                              {recipe.strArea || "International"}
                            </StyledText>
                          </StyledView>
                        </StyledView>

                        <StyledTouchableOpacity
                          className="absolute top-3 right-3 w-9 h-9 rounded-full justify-center items-center"
                          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
                          onPress={() => handleSaveRecipe(recipe)}
                        >
                          <FontAwesome5
                            name="bookmark"
                            solid={isSaved(Number(recipe.idMeal))}
                            size={16}
                            color={
                              isSaved(Number(recipe.idMeal))
                                ? "#FCD34D"
                                : "#FFFFFF"
                            }
                          />
                        </StyledTouchableOpacity>
                      </StyledView>

                      <StyledView className="p-4">
                        <StyledView className="flex-row items-center justify-between">
                          <StyledView className="flex-row items-center">
                            <StyledView
                              className={`px-3 py-1 rounded-md ${
                                isDark ? "bg-indigo-900/30" : "bg-indigo-100"
                              }`}
                            >
                              <StyledText
                                className={
                                  isDark ? "text-indigo-300" : "text-indigo-700"
                                }
                              >
                                {recipe.strCategory}
                              </StyledText>
                            </StyledView>
                          </StyledView>
                        </StyledView>
                      </StyledView>
                    </StyledTouchableOpacity>
                  ))}
                </StyledView>
              ) : (
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
                    No recipes found. Try another search term.
                  </StyledText>
                </StyledView>
              )}
            </>
          ) : (
            // Trending Recipes
            <>
              <StyledText
                className={`text-lg font-bold mb-4 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Trending Recipes
              </StyledText>

              <StyledView className="space-y-5">
                {trendingRecipes.map((recipe) => (
                  <StyledTouchableOpacity
                    key={recipe.idMeal}
                    className={`rounded-xl overflow-hidden ${
                      isDark ? "bg-gray-800" : "bg-white"
                    }`}
                    onPress={() => handleRecipePress(recipe)}
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
                        source={{ uri: recipe.strMealThumb }}
                        className="w-full h-full"
                        style={{ resizeMode: "cover" }}
                      />
                      <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.7)"]}
                        className="absolute bottom-0 left-0 right-0 h-24"
                      />
                      <StyledView className="absolute bottom-0 p-4">
                        <StyledText className="text-white text-xl font-bold mb-1">
                          {recipe.strMeal}
                        </StyledText>
                        <StyledView className="flex-row items-center">
                          <FontAwesome5
                            name="map-marker-alt"
                            size={12}
                            color="#818CF8"
                            style={{ marginRight: 4 }}
                          />
                          <StyledText className="text-gray-200 text-sm">
                            {recipe.strArea || "International"}
                          </StyledText>
                        </StyledView>
                      </StyledView>

                      <StyledTouchableOpacity
                        className="absolute top-3 right-3 w-9 h-9 rounded-full justify-center items-center"
                        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
                        onPress={() => handleSaveRecipe(recipe)}
                      >
                        <FontAwesome5
                          name="bookmark"
                          solid={isSaved(Number(recipe.idMeal))}
                          size={16}
                          color={
                            isSaved(Number(recipe.idMeal))
                              ? "#FCD34D"
                              : "#FFFFFF"
                          }
                        />
                      </StyledTouchableOpacity>
                    </StyledView>

                    <StyledView className="p-4">
                      <StyledView className="flex-row items-center justify-between">
                        <StyledView className="flex-row items-center">
                          <StyledView
                            className={`px-3 py-1 rounded-md ${
                              isDark ? "bg-indigo-900/30" : "bg-indigo-100"
                            }`}
                          >
                            <StyledText
                              className={
                                isDark ? "text-indigo-300" : "text-indigo-700"
                              }
                            >
                              {recipe.strCategory}
                            </StyledText>
                          </StyledView>
                        </StyledView>

                        <StyledView className="flex-row items-center">
                          <FontAwesome5
                            name="fire"
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
                            Trending
                          </StyledText>
                        </StyledView>
                      </StyledView>
                    </StyledView>
                  </StyledTouchableOpacity>
                ))}
              </StyledView>
            </>
          )}
        </StyledView>
      </StyledScrollView>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={
          selectedRecipe
            ? {
                id: Number(selectedRecipe.idMeal),
                title: selectedRecipe.strMeal,
                image: selectedRecipe.strMealThumb,
                servings: 4,
                readyInMinutes: 30,
                cuisines: [selectedRecipe.strArea || "International"],
                dishTypes: [selectedRecipe.strCategory || "Main Course"],
                diets: [],
                extendedIngredients: Array.from({ length: 20 })
                  .map((_, i) => {
                    const ingredientKey = `strIngredient${
                      i + 1
                    }` as keyof RecipeDetail;
                    const measureKey = `strMeasure${
                      i + 1
                    }` as keyof RecipeDetail;

                    const ingredient = selectedRecipe[ingredientKey];
                    const measure = selectedRecipe[measureKey];

                    if (
                      ingredient &&
                      typeof ingredient === "string" &&
                      ingredient.trim()
                    ) {
                      return {
                        id: i,
                        originalName: ingredient,
                        amount: 1,
                        unit: typeof measure === "string" ? measure : "",
                      };
                    }
                    return null;
                  })
                  .filter(Boolean) as any[],
                analyzedInstructions: [
                  {
                    steps: selectedRecipe.strInstructions
                      .split(/\r\n|\n|\r/)
                      .filter((step) => step.trim())
                      .map((step, index) => ({
                        number: index + 1,
                        step: step.trim(),
                        ingredients: [],
                      })),
                  },
                ],
              }
            : null
        }
        visible={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        isSaved={
          selectedRecipe ? isSaved(Number(selectedRecipe.idMeal)) : false
        }
        onSaveToggle={() => {
          if (selectedRecipe) {
            handleSaveRecipe(selectedRecipe);
          }
        }}
      />
    </StyledSafeAreaView>
  );
}
