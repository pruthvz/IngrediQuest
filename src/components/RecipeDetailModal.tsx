// a modal that shows all the details of a recipe
// includes image, ingredients, instructions, and cooking info
// lets users save recipes and add them to shopping list
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  useColorScheme,
  Dimensions,
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSavedRecipes } from "@/src/context/SavedRecipesContext";
import { useUserPreferences } from "@/src/context/UserPreferencesContext";
import { LinearGradient } from "expo-linear-gradient";

// styled components for better looking ui
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);

// shape of our recipe data - everything we need to show a recipe
interface Recipe {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  // list of ingredients with amounts
  extendedIngredients: {
    id: number;
    amount: number;
    unit: string;
    originalName: string;
  }[];
  // step by step cooking instructions
  analyzedInstructions: {
    steps: {
      number: number;
      step: string;
      ingredients: { name: string }[];
    }[];
  }[];
}

// what props our modal needs to work
interface Props {
  recipe: Recipe | null; // the recipe to display
  visible: boolean; // if modal should show
  onClose: () => void; // what to do when closing
  onAddToShoppingList?: () => void; // optional shopping list function
  isSaved?: boolean; // if recipe is saved (optional)
  onSaveToggle?: () => void; // optional save toggle function
}

export default function RecipeDetailModal({
  recipe,
  visible,
  onClose,
  onAddToShoppingList,
  isSaved: propIsSaved,
  onSaveToggle,
}: Props) {
  // get user preferences for dark mode
  const { preferences } = useUserPreferences();
  const isDark = preferences.isDarkMode;

  // get save recipe functions from context
  const {
    isSaved: contextIsSaved,
    saveRecipe,
    removeRecipe,
  } = useSavedRecipes();

  // figure out if recipe is saved - check props first, then context
  const recipeIsSaved =
    propIsSaved !== undefined
      ? propIsSaved
      : recipe
      ? contextIsSaved(recipe.id)
      : false;

  // handle saving or removing recipe from saved list
  const handleSaveToggle = () => {
    if (onSaveToggle) {
      // use prop function if provided
      onSaveToggle();
    } else if (recipe) {
      // otherwise use context functions
      recipeIsSaved
        ? removeRecipe(recipe.id)
        : saveRecipe({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            usedIngredientCount: 0,
            missedIngredientCount: 0,
          });
    }
  };

  // don't render anything if no recipe
  if (!recipe) return null;

  // get cooking steps or empty array if none
  const steps = recipe.analyzedInstructions[0]?.steps || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StyledView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        {/* recipe header with image and gradient */}
        <StyledView className="relative">
          <Image
            source={{ uri: recipe.image }}
            className="w-full h-72"
            resizeMode="cover"
          />
          {/* dark gradient at top of image for better text visibility */}
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "transparent"]}
            className="absolute top-0 left-0 right-0 h-32"
          />

          {/* floating action buttons */}
          <StyledView className="absolute top-12 right-4 z-10 flex-row">
            {/* shopping list button - only show if function provided */}
            {onAddToShoppingList && (
              <StyledTouchableOpacity
                className="bg-black/30 rounded-full p-3 mr-3"
                onPress={onAddToShoppingList}
              >
                <FontAwesome5 name="shopping-basket" size={20} color="white" />
              </StyledTouchableOpacity>
            )}
            {/* save recipe button */}
            <StyledTouchableOpacity
              className="bg-black/30 rounded-full p-3 mr-3"
              onPress={handleSaveToggle}
            >
              <FontAwesome5
                name="bookmark"
                solid={recipeIsSaved}
                size={20}
                color={recipeIsSaved ? "#FCD34D" : "white"}
              />
            </StyledTouchableOpacity>
            {/* close modal button */}
            <StyledTouchableOpacity
              className="bg-black/30 rounded-full p-3"
              onPress={onClose}
            >
              <FontAwesome5 name="times" size={20} color="white" />
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>

        <StyledScrollView showsVerticalScrollIndicator={false}>
          <StyledView className="p-5">
            {/* recipe title */}
            <StyledText
              className={`text-2xl font-bold mb-3 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              {recipe.title}
            </StyledText>

            {/* cooking time and servings info */}
            <StyledView className="flex-row mb-6 items-center">
              {recipe.readyInMinutes && (
                <StyledView className="flex-row items-center mr-5">
                  <FontAwesome5
                    name="clock"
                    size={14}
                    color={isDark ? "#60A5FA" : "#3B82F6"}
                  />
                  <StyledText
                    className={`ml-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {recipe.readyInMinutes} min
                  </StyledText>
                </StyledView>
              )}

              {recipe.servings && (
                <StyledView className="flex-row items-center">
                  <FontAwesome5
                    name="users"
                    size={14}
                    color={isDark ? "#60A5FA" : "#3B82F6"}
                  />
                  <StyledText
                    className={`ml-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {recipe.servings}{" "}
                    {recipe.servings === 1 ? "serving" : "servings"}
                  </StyledText>
                </StyledView>
              )}
            </StyledView>

            {/* recipe type tags */}
            <StyledView className="flex-row flex-wrap gap-2 mb-6">
              {recipe.dishTypes?.map((type, index) => (
                <StyledView
                  key={index}
                  className={`rounded-full px-3 py-1 ${
                    isDark ? "bg-gray-800" : "bg-gray-200"
                  }`}
                >
                  <StyledText
                    className={`text-sm ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {type}
                  </StyledText>
                </StyledView>
              ))}
            </StyledView>

            {/* ingredients section */}
            <StyledView className="mb-8">
              <StyledView className="flex-row items-center mb-4">
                <StyledView
                  className={`w-6 h-6 rounded-full items-center justify-center ${
                    isDark ? "bg-blue-900/30" : "bg-blue-100"
                  }`}
                >
                  <FontAwesome5
                    name="list"
                    size={12}
                    color={isDark ? "#60A5FA" : "#3B82F6"}
                  />
                </StyledView>
                <StyledText
                  className={`ml-2 text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  Ingredients
                </StyledText>
              </StyledView>

              {/* ingredients list with amounts */}
              <StyledView
                className={`rounded-2xl p-4 ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                {recipe.extendedIngredients.map((item, index) => (
                  <StyledView
                    key={index}
                    className={`flex-row items-center py-3 ${
                      index < recipe.extendedIngredients.length - 1
                        ? `border-b ${
                            isDark ? "border-gray-700" : "border-gray-100"
                          }`
                        : ""
                    }`}
                  >
                    {/* bullet point */}
                    <StyledView
                      className={`w-3 h-3 rounded-full mr-3 ${
                        isDark ? "bg-blue-400" : "bg-blue-500"
                      }`}
                    />
                    {/* ingredient name */}
                    <StyledText
                      className={`flex-1 ${
                        isDark ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {item.originalName}
                    </StyledText>
                    {/* amount and unit */}
                    <StyledText
                      className={`${
                        isDark ? "text-gray-400" : "text-gray-600"
                      } font-medium`}
                    >
                      {item.amount} {item.unit}
                    </StyledText>
                  </StyledView>
                ))}
              </StyledView>
            </StyledView>

            {/* cooking instructions section */}
            <StyledView className="mb-5">
              <StyledView className="flex-row items-center mb-4">
                <StyledView
                  className={`w-6 h-6 rounded-full items-center justify-center ${
                    isDark ? "bg-green-900/30" : "bg-green-100"
                  }`}
                >
                  <FontAwesome5
                    name="utensils"
                    size={12}
                    color={isDark ? "#10B981" : "#059669"}
                  />
                </StyledView>
                <StyledText
                  className={`ml-2 text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  Instructions
                </StyledText>
              </StyledView>

              {/* numbered steps */}
              <StyledView className="space-y-4">
                {steps.map((step) => (
                  <StyledView
                    key={step.number}
                    className={`rounded-2xl p-4 ${
                      isDark ? "bg-gray-800" : "bg-white"
                    }`}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isDark ? 0.2 : 0.05,
                      shadowRadius: 6,
                      elevation: 2,
                    }}
                  >
                    <StyledView className="flex-row">
                      {/* step number */}
                      <StyledView
                        className={`w-8 h-8 rounded-full ${
                          isDark ? "bg-green-900/30" : "bg-green-100"
                        } items-center justify-center mr-3 mt-1`}
                      >
                        <StyledText
                          className={`font-bold ${
                            isDark ? "text-green-300" : "text-green-600"
                          }`}
                        >
                          {step.number}
                        </StyledText>
                      </StyledView>
                      {/* step instructions */}
                      <StyledText
                        className={`flex-1 ${
                          isDark ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        {step.step}
                      </StyledText>
                    </StyledView>
                  </StyledView>
                ))}
              </StyledView>
            </StyledView>
          </StyledView>
        </StyledScrollView>
      </StyledView>
    </Modal>
  );
}
