// this screen shows all recipes saved by the user
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  useColorScheme,
  Platform,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useSavedRecipes } from "../../src/context/SavedRecipesContext";
import { useShoppingList } from "../../src/context/ShoppingListContext";
import { useAuth } from "../../src/context/AuthContext";
import { useUserPreferences } from "../../src/context/UserPreferencesContext";
import { supabase } from "../../src/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import RecipeDetailModal from "../../src/components/RecipeDetailModal";
import WebLayout from "../components/WebLayout";
import WebRecipeModal from "../components/WebRecipeModal";
import WebIcon from "../components/WebIcon";

// styled components for consistent styling
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);

const { width } = Dimensions.get("window");

// defines what recipe details look like
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
  // get saved recipes and functions to manage them
  const { savedRecipes, removeRecipe } = useSavedRecipes();
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { preferences } = useUserPreferences();
  const isDark = preferences.isDarkMode;
  const isWeb = Platform.OS === "web";

  // gets full recipe details when user clicks on a recipe
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

  // get user info and shopping list functions
  const { session } = useAuth();
  const userId = session?.user?.id;
  const { shoppingLists, addList, addItemToList } = useShoppingList();

  // adds all ingredients from a recipe to shopping list
  const addIngredientsToList = async (recipeId: number, ingredients: any[]) => {
    try {
      // Get the current shopping lists
      const currentLists = [...shoppingLists];

      // Find the list we want to update
      const listIndex = currentLists.findIndex(
        (list) => list.recipeId === recipeId
      );
      if (listIndex === -1) {
        console.error(`Shopping list with ID ${recipeId} not found!`);
        return false;
      }

      // Create formatted ingredients
      const formattedIngredients = ingredients.map((ing) => ({
        id: Date.now() + Math.floor(Math.random() * 1000), // Ensure unique IDs
        originalName: ing.originalName,
        amount: ing.amount || 1,
        unit: ing.unit || "",
        checked: false,
      }));

      // Update the list with all ingredients at once
      currentLists[listIndex] = {
        ...currentLists[listIndex],
        ingredients: [
          ...currentLists[listIndex].ingredients,
          ...formattedIngredients,
        ],
      };

      // Use the addItemToList function from context to handle the updates
      // This will update both state and storage properly
      for (const ing of formattedIngredients) {
        await addItemToList(recipeId, ing.originalName, ing.amount, ing.unit);
      }

      return true;
    } catch (error) {
      console.error("Error adding ingredients to list:", error);
      return false;
    }
  };

  // adds recipe ingredients to shopping list
  const addToShoppingList = async (recipe: RecipeDetail) => {
    try {
      console.log("Adding recipe to shopping list:", recipe.title);

      // Create a new shopping list directly with all ingredients
      if (recipe.extendedIngredients && recipe.extendedIngredients.length > 0) {
        // First, check if a shopping list for this recipe already exists
        const existingList = shoppingLists.find(
          (list) => list.recipeId === recipe.id
        );

        if (existingList) {
          // If the list exists, add ingredients to it
          for (const ingredient of recipe.extendedIngredients) {
            // Check if the ingredient is already in the list
            const ingredientExists = existingList.ingredients.some(
              (item) =>
                item.originalName.toLowerCase() ===
                ingredient.originalName.toLowerCase()
            );

            // Only add if it doesn't exist already
            if (!ingredientExists) {
              await addItemToList(
                recipe.id,
                ingredient.originalName,
                ingredient.amount || 1,
                ingredient.unit || ""
              );
            }
          }
        } else {
          // If the list doesn't exist, create a new one
          const newListId = await addList(recipe.title);

          // Add each ingredient to the new list
          for (const ingredient of recipe.extendedIngredients) {
            await addItemToList(
              newListId,
              ingredient.originalName,
              ingredient.amount || 1,
              ingredient.unit || ""
            );
          }
        }

        // Show success message
        Alert.alert("Success", "Ingredients added to your shopping list");

        // Navigate to shopping list without forcing a reload
        router.push("/shopping-list");
      } else {
        console.error("No ingredients found for this recipe");
        Alert.alert("Error", "No ingredients found for this recipe");
      }
    } catch (error) {
      console.error("Error adding to shopping list:", error);
      Alert.alert("Error", "Failed to add ingredients to shopping list");
    }
  };

  // shows confirmation before deleting a saved recipe
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

  // show web version if on web platform
  if (isWeb) {
    return (
      <WebLayout title="Saved Recipes" currentTab="saved">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
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

          {/* Empty State */}
          {!isLoading && savedRecipes.length === 0 ? (
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
                name="bookmark"
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
                No saved recipes yet
              </p>
              <p>Your favorite recipes will appear here</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {savedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  style={{
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                    border: "1px solid " + (isDark ? "#374151" : "#E5E7EB"),
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      height: "180px",
                      cursor: "pointer",
                    }}
                    onClick={() => fetchRecipeDetails(recipe.id)}
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
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
                        padding: "1.5rem 1rem 0.75rem",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "1.125rem",
                          fontWeight: 600,
                          color: "white",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {recipe.title}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "0.75rem",
                        }}
                      >
                        <i className="fas fa-utensils"></i>
                        <span>Tap to view recipe details</span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem 1rem",
                    }}
                  >
                    <button
                      onClick={() => fetchRecipeDetails(recipe.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "0.375rem",
                        backgroundColor: isDark ? "#374151" : "#F3F4F6",
                        color: isDark ? "#E5E7EB" : "#4B5563",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      <i
                        className="fas fa-eye"
                        style={{ color: "#4F46E5" }}
                      ></i>
                      View Recipe
                    </button>

                    <button
                      onClick={() => confirmDelete(recipe.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "9999px",
                        backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2",
                        color: isDark ? "#FECACA" : "#B91C1C",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Web Recipe Modal */}
        {selectedRecipe && (
          <WebRecipeModal
            recipe={selectedRecipe}
            visible={!!selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
            isSaved={true}
            onAddToShoppingList={
              selectedRecipe
                ? () => addToShoppingList(selectedRecipe)
                : undefined
            }
          />
        )}
      </WebLayout>
    );
  }

  // show mobile version for mobile platforms
  return (
    <StyledSafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900 mb-12 " : "bg-gray-50 mb-12"}`}
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
