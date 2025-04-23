import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  Alert,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSavedRecipes } from "../../src/context/SavedRecipesContext";
import RecipeDetailModal from "@/src/components/RecipeDetailModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);

const { width } = Dimensions.get("window");

interface RecipeDetail {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  extendedIngredients: {
    id: number;
    originalName: string;
    amount: number;
    unit: string;
  }[];
  analyzedInstructions: {
    steps: {
      number: number;
      step: string;
      ingredients: { name: string }[];
    }[];
  }[];
}

export default function SavedRecipes() {
  const { savedRecipes, removeRecipe } = useSavedRecipes();
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const fetchRecipeDetails = async (recipeId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`
      );
      const data = await response.json();
      const recipe = data.meals[0];

      // Transform TheMealDB data to match our RecipeDetail interface
      const ingredients = Array.from({ length: 20 })
        .map((_, i) => {
          const ingredient = recipe[`strIngredient${i + 1}`];
          const measure = recipe[`strMeasure${i + 1}`];
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
        .filter(
          (
            item
          ): item is {
            id: number;
            originalName: string;
            amount: number;
            unit: string;
          } => item !== null
        );

      // Transform the instructions into steps
      const steps = recipe.strInstructions
        .split(/\r\n|\n|\r/)
        .filter((step: string) => step.trim())
        .map((step: string, index: number) => ({
          number: index + 1,
          step: step.trim(),
          ingredients: [],
        }));

      setSelectedRecipe({
        id: recipeId,
        title: recipe.strMeal,
        image: recipe.strMealThumb,
        servings: 4, // Default value as TheMealDB doesn't provide this
        readyInMinutes: 30, // Default value as TheMealDB doesn't provide this
        cuisines: [recipe.strArea],
        dishTypes: [recipe.strCategory],
        diets: [],
        extendedIngredients: ingredients,
        analyzedInstructions: [{ steps }],
      });
    } catch (err) {
      console.error("Error fetching recipe details:", err);
      Alert.alert("Error", "Failed to load recipe details");
    } finally {
      setIsLoading(false);
    }
  };

  const addToShoppingList = async (recipe: RecipeDetail) => {
    try {
      // First, get the existing shopping list
      const existingListStr = await AsyncStorage.getItem("shoppingList");
      console.log("Existing list:", existingListStr); // For debugging

      let currentList = [];
      if (existingListStr) {
        currentList = JSON.parse(existingListStr);
      }

      // Check if recipe is already in the list
      const recipeExists = currentList.some(
        (item: { recipeId: number }) => item.recipeId === recipe.id
      );

      if (!recipeExists) {
        // Create new shopping list item
        const newItem = {
          recipeId: recipe.id,
          recipeName: recipe.title,
          ingredients: recipe.extendedIngredients.map((ing) => ({
            id: ing.id,
            originalName: ing.originalName,
            amount: ing.amount,
            unit: ing.unit,
            checked: false,
          })),
        };

        // Add to current list
        const updatedList = [...currentList, newItem];

        console.log("Saving updated list:", updatedList); // For debugging

        // Save to AsyncStorage
        await AsyncStorage.setItem("shoppingList", JSON.stringify(updatedList));

        Alert.alert("Success", "Ingredients added to your shopping list");
      } else {
        Alert.alert(
          "Already Added",
          "This recipe's ingredients are already in your shopping list"
        );
      }
    } catch (error) {
      console.error("Error adding to shopping list:", error);
      Alert.alert("Error", "Failed to add ingredients to shopping list");
    }
  };

  const confirmDelete = (id: number) => {
    Alert.alert(
      "Remove Recipe",
      "Are you sure you want to remove this recipe from your saved list?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeRecipe(id),
        },
      ]
    );
  };

  return (
    <StyledSafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StyledScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with gradient */}
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
              <StyledView className="flex-row items-center justify-between mb-2">
                <StyledView>
                  <StyledText className="text-white text-2xl font-bold">
                    Saved Recipes
                  </StyledText>
                  <StyledText className="text-white/80 text-base">
                    Your favorite dishes saved for later
                  </StyledText>
                </StyledView>

                <StyledTouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                  <FontAwesome5 name="bookmark" size={16} color="#fff" />
                </StyledTouchableOpacity>
              </StyledView>
            </StyledView>
          </LinearGradient>
        </StyledView>

        {/* Content Section */}
        <StyledView className="px-5 pt-2 pb-10 -mt-10">
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
                Loading recipe details...
              </StyledText>
            </StyledView>
          ) : savedRecipes.length === 0 ? (
            <StyledView
              className={`p-8 rounded-xl shadow-md items-center justify-center ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <FontAwesome5
                name="bookmark"
                size={48}
                color={isDark ? "#818CF8" : "#6366F1"}
              />
              <StyledText
                className={`mt-4 text-xl font-semibold text-center ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                No saved recipes yet
              </StyledText>
              <StyledText
                className={`mt-2 text-center ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Your favorite recipes will appear here
              </StyledText>
            </StyledView>
          ) : (
            <StyledView className="mt-2 space-y-4">
              {savedRecipes.map((recipe) => (
                <StyledView
                  key={recipe.id}
                  className={`rounded-xl overflow-hidden shadow-lg ${
                    isDark ? "bg-gray-800" : "bg-white"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  <StyledTouchableOpacity
                    onPress={() => fetchRecipeDetails(recipe.id)}
                    activeOpacity={0.9}
                  >
                    <StyledView className="relative">
                      <Image
                        source={{ uri: recipe.image }}
                        className="w-full h-48"
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.7)"]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        className="absolute inset-0"
                      />
                      <StyledView className="absolute bottom-0 left-0 right-0 p-3">
                        <StyledText className="text-white text-lg font-bold">
                          {recipe.title}
                        </StyledText>
                        <StyledView className="flex-row items-center mt-1">
                          <FontAwesome5
                            name="utensils"
                            size={12}
                            color="rgba(255,255,255,0.8)"
                          />
                          <StyledText className="text-white/80 text-xs ml-1">
                            Tap to view recipe details
                          </StyledText>
                        </StyledView>
                      </StyledView>
                    </StyledView>
                  </StyledTouchableOpacity>

                  <StyledView className="p-3 flex-row justify-between items-center">
                    <StyledTouchableOpacity
                      className={`flex-row items-center px-3 py-2 rounded-lg ${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      }`}
                      onPress={() => fetchRecipeDetails(recipe.id)}
                    >
                      <FontAwesome5
                        name="eye"
                        size={12}
                        color={isDark ? "#A5B4FC" : "#6366F1"}
                      />
                      <StyledText
                        className={`ml-2 ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        } text-sm font-medium`}
                      >
                        View Recipe
                      </StyledText>
                    </StyledTouchableOpacity>

                    <StyledTouchableOpacity
                      className="p-2 rounded-full"
                      onPress={() => confirmDelete(recipe.id)}
                    >
                      <FontAwesome5
                        name="trash-alt"
                        size={16}
                        color={isDark ? "#EF4444" : "#DC2626"}
                      />
                    </StyledTouchableOpacity>
                  </StyledView>
                </StyledView>
              ))}
            </StyledView>
          )}
        </StyledView>
      </StyledScrollView>

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          visible={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onAddToShoppingList={() => addToShoppingList(selectedRecipe)}
        />
      )}
    </StyledSafeAreaView>
  );
}
