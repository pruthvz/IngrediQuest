import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  Alert,
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome } from "@expo/vector-icons";
import { useSavedRecipes } from "../../src/context/SavedRecipesContext";
import RecipeDetailModal from "@/src/components/RecipeDetailModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const fetchRecipeDetails = async (recipeId: number) => {
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
        .filter(Boolean);

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

  return (
    <ScrollView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <StyledView className="p-4">
        <StyledText
          className={`text-3xl font-bold mb-6 ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        >
          Saved Recipes
        </StyledText>

        {savedRecipes.length === 0 ? (
          <StyledView className="items-center py-8">
            <FontAwesome
              name="bookmark-o"
              size={48}
              color={isDark ? "#4B5563" : "#9CA3AF"}
            />
            <StyledText
              className={`mt-4 text-lg text-center ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No saved recipes yet
            </StyledText>
          </StyledView>
        ) : (
          <StyledView className="space-y-4">
            {savedRecipes.map((recipe) => (
              <StyledView
                key={recipe.id}
                className={`rounded-lg overflow-hidden border ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <StyledTouchableOpacity
                  onPress={() => fetchRecipeDetails(recipe.id)}
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
                      <StyledView className="flex-row">
                        <StyledTouchableOpacity
                          onPress={() => removeRecipe(recipe.id)}
                          className="p-2"
                        >
                          <FontAwesome
                            name="trash-o"
                            size={20}
                            color={isDark ? "#EF4444" : "#DC2626"}
                          />
                        </StyledTouchableOpacity>
                      </StyledView>
                    </StyledView>
                  </StyledView>
                </StyledTouchableOpacity>
              </StyledView>
            ))}
          </StyledView>
        )}
      </StyledView>

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          visible={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onAddToShoppingList={() => addToShoppingList(selectedRecipe)}
        />
      )}
    </ScrollView>
  );
}
