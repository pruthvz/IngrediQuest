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
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome } from "@expo/vector-icons";
import { useSavedRecipes } from "@/src/context/SavedRecipesContext";
import RecipeDetailModal from "@/src/components/RecipeDetailModal";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

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

  useEffect(() => {
    fetchTrendingRecipes();
  }, []);

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

  const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
    <StyledTouchableOpacity
      className={`rounded-lg overflow-hidden border mb-4 ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
      onPress={() => handleRecipePress(recipe)}
    >
      <Image
        source={{ uri: recipe.strMealThumb }}
        className="w-full h-48"
        resizeMode="cover"
      />
      <StyledView className="p-4">
        <StyledView className="flex-row justify-between items-start">
          <StyledText
            className={`text-lg font-semibold flex-1 mr-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            {recipe.strMeal}
          </StyledText>
          <StyledTouchableOpacity
            onPress={() => handleSaveRecipe(recipe)}
            className="p-2"
          >
            <FontAwesome
              name={isSaved(Number(recipe.idMeal)) ? "bookmark" : "bookmark-o"}
              size={24}
              color={isDark ? "#3B82F6" : "#2563eb"}
            />
          </StyledTouchableOpacity>
        </StyledView>
        <StyledView className="flex-row flex-wrap gap-2 mt-2">
          <StyledView
            className={`rounded-full px-2 py-1 ${
              isDark ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <StyledText
              className={`text-sm ${
                isDark ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {recipe.strCategory}
            </StyledText>
          </StyledView>
          <StyledView
            className={`rounded-full px-2 py-1 ${
              isDark ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <StyledText
              className={`text-sm ${
                isDark ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {recipe.strArea}
            </StyledText>
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledTouchableOpacity>
  );

  return (
    <ScrollView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <StyledView className="p-4">
        {/* Search Bar */}
        <StyledView className="mb-6">
          <StyledTextInput
            className={`rounded-lg px-4 py-3 ${
              isDark
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-gray-900 border-gray-300"
            } border`}
            placeholder="Search recipes..."
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              searchRecipes(text);
            }}
          />
        </StyledView>

        {/* Loading State */}
        {isLoading && (
          <StyledView className="items-center py-8">
            <ActivityIndicator size="large" color="#3B82F6" />
            <StyledText
              className={`mt-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              Loading recipes...
            </StyledText>
          </StyledView>
        )}

        {/* Error State */}
        {error && (
          <StyledView className="items-center py-8">
            <FontAwesome
              name="exclamation-circle"
              size={48}
              color={isDark ? "#EF4444" : "#DC2626"}
            />
            <StyledText
              className={`mt-4 text-lg text-center ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {error}
            </StyledText>
          </StyledView>
        )}

        {/* Search Results */}
        {searchQuery && !isLoading && (
          <>
            <StyledText
              className={`text-xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Search Results
            </StyledText>
            {searchResults.length > 0 ? (
              searchResults.map((recipe) => (
                <RecipeCard key={recipe.idMeal} recipe={recipe} />
              ))
            ) : (
              <StyledText
                className={`text-center py-4 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No recipes found
              </StyledText>
            )}
          </>
        )}

        {/* Trending Recipes */}
        {!searchQuery && (
          <>
            <StyledText
              className={`text-xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Trending Now
            </StyledText>
            {trendingRecipes.map((recipe) => (
              <RecipeCard key={recipe.idMeal} recipe={recipe} />
            ))}
          </>
        )}
      </StyledView>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={
          selectedRecipe
            ? {
                id: Number(selectedRecipe.idMeal),
                title: selectedRecipe.strMeal,
                image: selectedRecipe.strMealThumb,
                instructions: selectedRecipe.strInstructions,
                extendedIngredients: Array.from({ length: 20 })
                  .map((_, i) => {
                    const ingredient = selectedRecipe[`strIngredient${i + 1}`];
                    const measure = selectedRecipe[`strMeasure${i + 1}`];
                    if (ingredient && ingredient.trim()) {
                      return {
                        id: i,
                        originalName: ingredient,
                        amount: 1,
                        unit: measure || "",
                      };
                    }
                    return null;
                  })
                  .filter(Boolean),
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
                servings: 4,
                readyInMinutes: 30,
                cuisines: [selectedRecipe.strArea],
                dishTypes: [selectedRecipe.strCategory],
                diets: [],
              }
            : null
        }
        visible={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </ScrollView>
  );
}
