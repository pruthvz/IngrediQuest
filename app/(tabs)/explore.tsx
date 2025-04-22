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

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);

const { width } = Dimensions.get("window");

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
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([]);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { saveRecipe, removeRecipe, isSaved } = useSavedRecipes();

  // Categories for filtering
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    fetchTrendingRecipes();
    fetchCategories();
  }, []);

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
