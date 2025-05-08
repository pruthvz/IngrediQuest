import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
} from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface Ingredient {
  id: string;
  name: string;
}

interface Recipe {
  id: string;
  title: string;
  image: string;
  matchingIngredients: number;
  totalIngredients: number;
  cookingTime: number;
  tags: string[];
}

export default function HomeScreen() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleAddIngredient = () => {
    if (inputValue.trim()) {
      setIngredients([
        ...ingredients,
        { id: Date.now().toString(), name: inputValue.trim() },
      ]);
      setInputValue("");
    }
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  return (
    <ScrollView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <StyledView className="p-4">
        {/* Header */}
        <StyledView className="mb-6">
          <StyledText
            className={`text-3xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            What's in your kitchen?
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
            placeholder="Enter an ingredient..."
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleAddIngredient}
          />
          <StyledTouchableOpacity
            className="bg-primary-600 px-4 py-3 rounded-lg"
            onPress={handleAddIngredient}
          >
            <StyledText className="text-white font-semibold">Add</StyledText>
          </StyledTouchableOpacity>
        </StyledView>

        {/* Ingredient Tags */}
        <StyledView className="flex-row flex-wrap gap-2 mb-6">
          {ingredients.map((ingredient) => (
            <StyledTouchableOpacity
              key={ingredient.id}
              className={`rounded-full px-3 py-1 flex-row items-center ${
                isDark ? "bg-gray-800" : "bg-gray-100"
              }`}
              onPress={() => handleRemoveIngredient(ingredient.id)}
            >
              <StyledText
                className={`mr-1 ${isDark ? "text-gray-200" : "text-gray-800"}`}
              >
                {ingredient.name}
              </StyledText>
              <StyledText
                className={isDark ? "text-gray-400" : "text-gray-500"}
              >
                ✕
              </StyledText>
            </StyledTouchableOpacity>
          ))}
        </StyledView>

        {/* Recipe List */}
        <StyledView className="mt-4">
          <StyledText
            className={`text-xl font-semibold mb-4 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            Recommended Recipes
          </StyledText>

          {/* Recipe Cards */}
          <StyledView className="space-y-4">
            {recipes.length === 0 ? (
              <StyledText
                className={`text-center ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Add ingredients to see matching recipes
              </StyledText>
            ) : (
              recipes.map((recipe) => (
                <StyledTouchableOpacity
                  key={recipe.id}
                  className={`rounded-lg overflow-hidden border ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Image
                    source={{ uri: recipe.image }}
                    className="w-full h-48"
                    resizeMode="cover"
                  />
                  <StyledView className="p-4">
                    <StyledText
                      className={`text-lg font-semibold mb-2 ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {recipe.title}
                    </StyledText>
                    <StyledText
                      className={isDark ? "text-gray-300" : "text-gray-600"}
                    >
                      {recipe.matchingIngredients}/{recipe.totalIngredients}{" "}
                      ingredients matched
                    </StyledText>
                    <StyledView className="flex-row mt-2">
                      {recipe.tags.map((tag, index) => (
                        <StyledText
                          key={index}
                          className={`text-xs rounded-full px-2 py-1 mr-2 ${
                            isDark
                              ? "bg-gray-700 text-gray-200"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {tag}
                        </StyledText>
                      ))}
                    </StyledView>
                  </StyledView>
                </StyledTouchableOpacity>
              ))
            )}
          </StyledView>
        </StyledView>
      </StyledView>
    </ScrollView>
  );
}
