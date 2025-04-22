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

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledBlurView = styled(BlurView);

const { width } = Dimensions.get("window");

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
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section - Modern Gradient with Pattern Overlay */}
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

      {/* Recipe Detail Modal */}
      {selectedRecipeDetails && (
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
