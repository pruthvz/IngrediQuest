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
import { LinearGradient } from "expo-linear-gradient";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);

interface Recipe {
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

interface Props {
  recipe: Recipe | null;
  visible: boolean;
  onClose: () => void;
  onAddToShoppingList?: () => void;
  isSaved?: boolean;
  onSaveToggle?: () => void;
}

export default function RecipeDetailModal({
  recipe,
  visible,
  onClose,
  onAddToShoppingList,
  isSaved: propIsSaved,
  onSaveToggle,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const {
    isSaved: contextIsSaved,
    saveRecipe,
    removeRecipe,
  } = useSavedRecipes();

  // Use props if provided, otherwise fall back to context
  const recipeIsSaved =
    propIsSaved !== undefined
      ? propIsSaved
      : recipe
      ? contextIsSaved(recipe.id)
      : false;

  const handleSaveToggle = () => {
    if (onSaveToggle) {
      onSaveToggle();
    } else if (recipe) {
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

  if (!recipe) return null;

  const steps = recipe.analyzedInstructions[0]?.steps || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StyledView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <StyledView className="relative">
          <Image
            source={{ uri: recipe.image }}
            className="w-full h-72"
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "transparent"]}
            className="absolute top-0 left-0 right-0 h-32"
          />

          <StyledView className="absolute top-12 right-4 z-10 flex-row">
            {onAddToShoppingList && (
              <StyledTouchableOpacity
                className="bg-black/30 rounded-full p-3 mr-3"
                onPress={onAddToShoppingList}
              >
                <FontAwesome5 name="shopping-basket" size={20} color="white" />
              </StyledTouchableOpacity>
            )}
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
            <StyledText
              className={`text-2xl font-bold mb-3 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              {recipe.title}
            </StyledText>

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
                    <StyledView
                      className={`w-3 h-3 rounded-full mr-3 ${
                        isDark ? "bg-blue-400" : "bg-blue-500"
                      }`}
                    />
                    <StyledText
                      className={`flex-1 ${
                        isDark ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {item.originalName}
                    </StyledText>
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
