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
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome } from "@expo/vector-icons";
import RecipeDetailModal from "../../src/components/RecipeDetailModal";
import { useSavedRecipes } from "../../src/context/SavedRecipesContext";
import { LinearGradient } from "expo-linear-gradient";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

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
    <StyledSafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <ScrollView className="flex-1">
        {/* Hero Section */}
        <LinearGradient
          colors={isDark ? ["#1F2937", "#111827"] : ["#EEF2FF", "#E0E7FF"]}
          className="pt-4 pb-8"
        >
          <StyledView className="px-6">
            <StyledView className="mb-8 mt-8">
              <StyledView className="flex-row items-center mb-2">
                <FontAwesome
                  name="cutlery"
                  size={28}
                  color={isDark ? "#60A5FA" : "#3B82F6"}
                  style={{ marginRight: 12 }}
                />
                <StyledText
                  className={`text-4xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  What ingredients do you have?
                </StyledText>
              </StyledView>
              <StyledText
                className={`text-lg ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Transform your ingredients into amazing dishes
              </StyledText>
            </StyledView>

            {/* Quick Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6 -mx-2"
            >
              {["Breakfast", "Lunch", "Dinner", "Snacks", "Desserts"].map(
                (category) => (
                  <StyledTouchableOpacity
                    key={category}
                    className={`mr-3 px-4 py-2 rounded-full border ${
                      isDark
                        ? "border-gray-700 bg-gray-800/50"
                        : "border-indigo-100 bg-white"
                    }`}
                  >
                    <StyledText
                      className={isDark ? "text-gray-300" : "text-gray-600"}
                    >
                      {category}
                    </StyledText>
                  </StyledTouchableOpacity>
                )
              )}
            </ScrollView>

            {/* Ingredient Input */}
            <StyledView className="relative">
              <StyledView
                className={`absolute -top-3 left-4 px-2 z-10 ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
              >
                <StyledText
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Add Your Ingredients
                </StyledText>
              </StyledView>
              <StyledView className="flex-row items-center">
                <StyledView
                  className={`flex-1 rounded-2xl border-2 ${
                    isDark
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-white border-indigo-100"
                  }`}
                >
                  <StyledTextInput
                    className={`pl-11 pr-4 py-4 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                    placeholder="e.g. chicken, rice, tomatoes..."
                    placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                    value={inputValue}
                    onChangeText={setInputValue}
                    onSubmitEditing={addIngredient}
                  />
                  <FontAwesome
                    name="search"
                    size={16}
                    color={isDark ? "#60A5FA" : "#3B82F6"}
                    style={{ position: "absolute", left: 16, top: 18 }}
                  />
                </StyledView>
                <StyledTouchableOpacity
                  className={`ml-3 p-4 rounded-xl ${
                    isDark ? "bg-blue-500" : "bg-blue-600"
                  } shadow-lg`}
                  onPress={addIngredient}
                >
                  <FontAwesome name="plus" size={20} color="white" />
                </StyledTouchableOpacity>
              </StyledView>
            </StyledView>

            {/* Ingredients Tags */}
            {ingredients.length > 0 && (
              <StyledView className="flex-row flex-wrap gap-2 mt-4">
                {ingredients.map((ingredient) => (
                  <StyledTouchableOpacity
                    key={ingredient.id}
                    onPress={() => removeIngredient(ingredient.id)}
                    className={`flex-row items-center rounded-full px-4 py-2.5 ${
                      isDark
                        ? "bg-gray-800/80 border-gray-700"
                        : "bg-white border-indigo-100"
                    } border shadow-sm`}
                  >
                    <FontAwesome
                      name="tag"
                      size={12}
                      color={isDark ? "#60A5FA" : "#3B82F6"}
                      style={{ marginRight: 8 }}
                    />
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
          </StyledView>
        </LinearGradient>

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
          <StyledView className="m-4 p-4 bg-red-50 rounded-xl border border-red-200">
            <StyledText className="text-red-600 text-center">
              {error}
            </StyledText>
          </StyledView>
        )}

        {/* Recipe List */}
        {recipes.length > 0 && (
          <StyledView className="p-4">
            <StyledText
              className={`text-xl font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Recipes Found ({recipes.length})
            </StyledText>
            <StyledView className="space-y-4">
              {recipes.map((recipe) => (
                <StyledTouchableOpacity
                  key={recipe.id}
                  className={`rounded-xl overflow-hidden border ${
                    isDark ? "border-gray-700" : "border-gray-200"
                  }`}
                  onPress={() => handleRecipeClick(recipe)}
                >
                  <Image
                    source={{ uri: recipe.image }}
                    className="w-full h-48"
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    className="absolute bottom-0 left-0 right-0 h-24"
                  />
                  <StyledView className="absolute bottom-0 left-0 right-0 p-4">
                    <StyledView className="flex-row justify-between items-center">
                      <StyledView className="flex-1">
                        <StyledText className="text-white text-lg font-semibold mb-1">
                          {recipe.title}
                        </StyledText>
                        <StyledView className="flex-row items-center">
                          <StyledText className="text-white text-sm">
                            {recipe.usedIngredientCount} of{" "}
                            {recipe.usedIngredientCount +
                              recipe.missedIngredientCount}{" "}
                            ingredients
                          </StyledText>
                        </StyledView>
                      </StyledView>
                      <StyledTouchableOpacity
                        className="ml-2"
                        onPress={(e) => handleSavePress(e, recipe)}
                      >
                        <FontAwesome
                          name={isSaved(recipe.id) ? "bookmark" : "bookmark-o"}
                          size={24}
                          color="white"
                        />
                      </StyledTouchableOpacity>
                    </StyledView>
                  </StyledView>
                </StyledTouchableOpacity>
              ))}
            </StyledView>
          </StyledView>
        )}
      </ScrollView>

      {/* Recipe Detail Modal */}
      {selectedRecipeDetails && (
        <RecipeDetailModal
          recipe={selectedRecipeDetails}
          visible={!!selectedRecipeDetails}
          onClose={() => setSelectedRecipeDetails(null)}
        />
      )}
    </StyledSafeAreaView>
  );
}
