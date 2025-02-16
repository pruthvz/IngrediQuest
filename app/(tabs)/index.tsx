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
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome } from "@expo/vector-icons";
import RecipeDetailModal from "../../src/components/RecipeDetailModal";
import { useSavedRecipes } from "../../src/context/SavedRecipesContext";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

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

const API_KEY = "37e38b7192da4d57ae3271c5733db4ad";

export default function HomeScreen() {
  const [inputValue, setInputValue] = React.useState("");
  const [ingredients, setIngredients] = React.useState<Ingredient[]>([]);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedRecipeDetails, setSelectedRecipeDetails] =
    useState<RecipeDetail | null>(null);
  const { saveRecipe, removeRecipe, isSaved } = useSavedRecipes();

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

  const removeIngredient = (id: string) => {
    const updatedIngredients = ingredients.filter((ing) => ing.id !== id);
    setIngredients(updatedIngredients);
    if (updatedIngredients.length > 0) {
      searchRecipesWithIngredients(updatedIngredients);
    } else {
      setRecipes([]);
    }
  };

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

  const fetchRecipeDetails = async (recipeId: number) => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`
      );
      const data = await response.json();
      setSelectedRecipeDetails(data);
    } catch (err) {
      console.error("Failed to fetch recipe details:", err);
    }
  };

  const handleRecipeClick = async (recipe: Recipe) => {
    await fetchRecipeDetails(recipe.id);
  };

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

  return (
    <>
      <ScrollView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <StyledView className="p-4">
          {/* Header */}
          <StyledView className="mb-6">
            <StyledText
              className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              What can I cook?
            </StyledText>
            <StyledText
              className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              Add ingredients to find matching recipes
            </StyledText>
          </StyledView>

          {/* Ingredient Input */}
          <StyledView className="flex-row items-center mb-4">
            <StyledTextInput
              className={`flex-1 rounded-lg px-4 py-3 mr-2 ${
                isDark
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              } border`}
              placeholder="Add an ingredient..."
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={addIngredient}
            />
            <StyledTouchableOpacity
              className="bg-primary-600 px-4 py-3 rounded-lg"
              onPress={addIngredient}
            >
              <FontAwesome name="plus" size={20} color="white" />
            </StyledTouchableOpacity>
          </StyledView>

          {/* Ingredients Tags */}
          {ingredients.length > 0 && (
            <StyledView className="flex-row flex-wrap gap-2 mb-6">
              {ingredients.map((ingredient) => (
                <StyledTouchableOpacity
                  key={ingredient.id}
                  onPress={() => removeIngredient(ingredient.id)}
                  className={`flex-row items-center rounded-full px-3 py-2 ${
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <StyledText
                    className={`mr-2 ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {ingredient.name}
                  </StyledText>
                  <FontAwesome
                    name="times-circle"
                    size={16}
                    color={isDark ? "#9CA3AF" : "#4B5563"}
                  />
                </StyledTouchableOpacity>
              ))}
            </StyledView>
          )}

          {/* Loading State */}
          {isLoading && (
            <StyledView className="items-center py-8">
              <ActivityIndicator size="large" color="#3B82F6" />
              <StyledText
                className={`mt-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}
              >
                Finding recipes...
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

          {/* Recipe List */}
          {!isLoading && !error && (
            <StyledView className="space-y-4">
              {recipes.length === 0 ? (
                <StyledView className="items-center py-8">
                  <FontAwesome
                    name="cutlery"
                    size={48}
                    color={isDark ? "#4B5563" : "#9CA3AF"}
                  />
                  <StyledText
                    className={`mt-4 text-lg text-center ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {ingredients.length === 0
                      ? "Add ingredients to see matching recipes"
                      : "No recipes found with these ingredients"}
                  </StyledText>
                </StyledView>
              ) : (
                recipes.map((recipe) => (
                  <StyledTouchableOpacity
                    key={recipe.id}
                    className={`rounded-lg overflow-hidden border ${
                      isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                    onPress={() => handleRecipeClick(recipe)}
                  >
                    <Image
                      source={{ uri: recipe.image }}
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
                          {recipe.title}
                        </StyledText>
                        <StyledTouchableOpacity
                          onPress={(e) => handleSavePress(e, recipe)}
                          className="p-2"
                        >
                          <FontAwesome
                            name={
                              isSaved(recipe.id) ? "bookmark" : "bookmark-o"
                            }
                            size={24}
                            color={isDark ? "#3B82F6" : "#2563eb"}
                          />
                        </StyledTouchableOpacity>
                      </StyledView>
                      <StyledView className="flex-row flex-wrap gap-2">
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
                            {recipe.usedIngredientCount} ingredients matched
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
                            {recipe.missedIngredientCount} missing
                          </StyledText>
                        </StyledView>
                      </StyledView>
                    </StyledView>
                  </StyledTouchableOpacity>
                ))
              )}
            </StyledView>
          )}
        </StyledView>
      </ScrollView>

      <RecipeDetailModal
        recipe={selectedRecipeDetails}
        visible={!!selectedRecipeDetails}
        onClose={() => setSelectedRecipeDetails(null)}
      />
    </>
  );
}
