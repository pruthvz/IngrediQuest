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
import { FontAwesome } from "@expo/vector-icons";
import { useSavedRecipes } from "@/src/context/SavedRecipesContext";

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
}

export default function RecipeDetailModal({
  recipe,
  visible,
  onClose,
  onAddToShoppingList,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isSaved, saveRecipe, removeRecipe } = useSavedRecipes();

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
        <StyledScrollView>
          <Image
            source={{ uri: recipe.image }}
            className="w-full h-64"
            resizeMode="cover"
          />

          <StyledView className="absolute top-12 right-4 z-10 flex-row">
            {onAddToShoppingList && (
              <StyledTouchableOpacity
                className="bg-black/30 rounded-full p-2 mr-2"
                onPress={onAddToShoppingList}
              >
                <FontAwesome name="shopping-cart" size={24} color="white" />
              </StyledTouchableOpacity>
            )}
            <StyledTouchableOpacity
              className="bg-black/30 rounded-full p-2 mr-2"
              onPress={() =>
                isSaved(recipe.id)
                  ? removeRecipe(recipe.id)
                  : saveRecipe({
                      id: recipe.id,
                      title: recipe.title,
                      image: recipe.image,
                    })
              }
            >
              <FontAwesome
                name={isSaved(recipe.id) ? "bookmark" : "bookmark-o"}
                size={24}
                color="white"
              />
            </StyledTouchableOpacity>
            <StyledTouchableOpacity
              className="bg-black/30 rounded-full p-2"
              onPress={onClose}
            >
              <FontAwesome name="close" size={24} color="white" />
            </StyledTouchableOpacity>
          </StyledView>

          <StyledView className="p-4">
            <StyledText
              className={`text-2xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              {recipe.title}
            </StyledText>

            <StyledView className="flex-row flex-wrap gap-2 mb-4">
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

            <StyledView className="mb-6">
              <StyledText
                className={`text-xl font-semibold mb-3 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Ingredients
              </StyledText>
              <StyledView
                className={`rounded-lg p-4 ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
              >
                {recipe.extendedIngredients.map((item, index) => (
                  <StyledView
                    key={index}
                    className="flex-row items-center py-2 border-b border-gray-200 last:border-b-0"
                  >
                    <FontAwesome
                      name="circle"
                      size={8}
                      color={isDark ? "#9CA3AF" : "#4B5563"}
                      style={{ marginRight: 8 }}
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
                      }`}
                    >
                      {item.amount} {item.unit}
                    </StyledText>
                  </StyledView>
                ))}
              </StyledView>
            </StyledView>

            <StyledView>
              <StyledText
                className={`text-xl font-semibold mb-3 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Instructions
              </StyledText>
              <StyledView className="space-y-4">
                {steps.map((step) => (
                  <StyledView
                    key={step.number}
                    className={`rounded-lg p-4 ${
                      isDark ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <StyledView className="flex-row">
                      <StyledView
                        className={`w-8 h-8 rounded-full ${
                          isDark ? "bg-gray-700" : "bg-gray-100"
                        } items-center justify-center mr-3`}
                      >
                        <StyledText
                          className={`font-semibold ${
                            isDark ? "text-gray-300" : "text-gray-600"
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
