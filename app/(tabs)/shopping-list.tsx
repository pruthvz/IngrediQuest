import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface ShoppingItem {
  id: number;
  originalName: string;
  amount: number;
  unit: string;
  checked: boolean;
}

interface RecipeShoppingList {
  recipeId: number;
  recipeName: string;
  ingredients: ShoppingItem[];
}

export default function ShoppingList() {
  const [shoppingList, setShoppingList] = useState<RecipeShoppingList[]>([]);
  const [newListName, setNewListName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useFocusEffect(
    React.useCallback(() => {
      loadShoppingList();
    }, [])
  );

  const loadShoppingList = async () => {
    try {
      const list = await AsyncStorage.getItem("shoppingList");
      if (list) {
        const parsedList = JSON.parse(list);
        console.log("Loaded shopping list:", parsedList);
        setShoppingList(parsedList);
      }
    } catch (error) {
      console.error("Error loading shopping list:", error);
    }
  };

  const addNewList = async () => {
    if (newListName.trim()) {
      const newList = {
        recipeId: Date.now(),
        recipeName: newListName.trim(),
        ingredients: [],
      };
      const updatedList = [...shoppingList, newList];
      setShoppingList(updatedList);
      await AsyncStorage.setItem("shoppingList", JSON.stringify(updatedList));
      setNewListName("");
      setSelectedListId(newList.recipeId);
    }
  };

  const addItemToList = async (recipeId: number) => {
    if (!newItemName.trim()) return;

    const updatedList = shoppingList.map((list) => {
      if (list.recipeId === recipeId) {
        return {
          ...list,
          ingredients: [
            ...list.ingredients,
            {
              id: Date.now(),
              originalName: newItemName.trim(),
              amount: 1,
              unit: "",
              checked: false,
            },
          ],
        };
      }
      return list;
    });

    setShoppingList(updatedList);
    await AsyncStorage.setItem("shoppingList", JSON.stringify(updatedList));
    setNewItemName("");
  };

  const toggleItem = async (recipeId: number, itemId: number) => {
    const updatedList = shoppingList.map((recipe) => {
      if (recipe.recipeId === recipeId) {
        return {
          ...recipe,
          ingredients: recipe.ingredients.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      }
      return recipe;
    });

    setShoppingList(updatedList);
    await AsyncStorage.setItem("shoppingList", JSON.stringify(updatedList));
  };

  const removeRecipe = async (recipeId: number) => {
    const updatedList = shoppingList.filter(
      (recipe) => recipe.recipeId !== recipeId
    );
    setShoppingList(updatedList);
    await AsyncStorage.setItem("shoppingList", JSON.stringify(updatedList));
  };

  const debugShoppingList = async () => {
    try {
      const list = await AsyncStorage.getItem("shoppingList");
      console.log(
        "Current shopping list in storage:",
        list ? JSON.parse(list) : null
      );
    } catch (error) {
      console.error("Error debugging shopping list:", error);
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
          Shopping List
        </StyledText>

        <StyledTouchableOpacity
          className="bg-primary-600 p-2 rounded-lg mb-4"
          onPress={debugShoppingList}
        >
          <StyledText className="text-white text-center">Debug List</StyledText>
        </StyledTouchableOpacity>

        {/* Add New List Input */}
        <StyledView className="flex-row items-center mb-6">
          <StyledTextInput
            className={`flex-1 px-4 py-3 rounded-lg mr-2 ${
              isDark
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-gray-900 border-gray-300"
            } border`}
            placeholder="Add new list..."
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            value={newListName}
            onChangeText={setNewListName}
            onSubmitEditing={addNewList}
          />
          <StyledTouchableOpacity
            className="bg-primary-600 p-3 rounded-lg"
            onPress={addNewList}
          >
            <FontAwesome name="plus" size={20} color="white" />
          </StyledTouchableOpacity>
        </StyledView>

        {shoppingList.length === 0 ? (
          <StyledView className="items-center py-8">
            <FontAwesome
              name="shopping-basket"
              size={48}
              color={isDark ? "#4B5563" : "#9CA3AF"}
            />
            <StyledText
              className={`mt-4 text-lg text-center ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Your shopping list is empty
            </StyledText>
          </StyledView>
        ) : (
          shoppingList.map((recipe) => (
            <StyledView
              key={recipe.recipeId}
              className={`mb-6 rounded-lg overflow-hidden border ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <StyledView className="p-4 border-b border-gray-200">
                <StyledView className="flex-row justify-between items-center">
                  <StyledText
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {recipe.recipeName}
                  </StyledText>
                  <StyledView className="flex-row">
                    <StyledTouchableOpacity
                      onPress={() => setSelectedListId(recipe.recipeId)}
                      className="p-2 mr-2"
                    >
                      <FontAwesome
                        name="plus"
                        size={20}
                        color={isDark ? "#3B82F6" : "#2563eb"}
                      />
                    </StyledTouchableOpacity>
                    <StyledTouchableOpacity
                      onPress={() => removeRecipe(recipe.recipeId)}
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

                {selectedListId === recipe.recipeId && (
                  <StyledView className="flex-row items-center mt-2">
                    <StyledTextInput
                      className={`flex-1 px-4 py-2 rounded-lg mr-2 ${
                        isDark
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-gray-50 text-gray-900 border-gray-200"
                      } border`}
                      placeholder="Add item..."
                      placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                      value={newItemName}
                      onChangeText={setNewItemName}
                      onSubmitEditing={() => addItemToList(recipe.recipeId)}
                    />
                    <StyledTouchableOpacity
                      className="bg-primary-600 p-2 rounded-lg"
                      onPress={() => addItemToList(recipe.recipeId)}
                    >
                      <FontAwesome name="plus" size={16} color="white" />
                    </StyledTouchableOpacity>
                  </StyledView>
                )}
              </StyledView>

              <StyledView className="p-4">
                {recipe.ingredients.map((item) => (
                  <StyledTouchableOpacity
                    key={item.id}
                    className="flex-row items-center py-2 border-b border-gray-200 last:border-b-0"
                    onPress={() => toggleItem(recipe.recipeId, item.id)}
                  >
                    <FontAwesome
                      name={item.checked ? "check-square-o" : "square-o"}
                      size={24}
                      color={
                        item.checked
                          ? "#10B981"
                          : isDark
                          ? "#6B7280"
                          : "#9CA3AF"
                      }
                    />
                    <StyledText
                      className={`ml-3 flex-1 ${
                        item.checked
                          ? "line-through text-gray-400"
                          : isDark
                          ? "text-gray-200"
                          : "text-gray-800"
                      }`}
                    >
                      {item.originalName}
                    </StyledText>
                    {item.amount && item.unit && (
                      <StyledText
                        className={isDark ? "text-gray-400" : "text-gray-600"}
                      >
                        {item.amount} {item.unit}
                      </StyledText>
                    )}
                  </StyledTouchableOpacity>
                ))}
              </StyledView>
            </StyledView>
          ))
        )}
      </StyledView>
    </ScrollView>
  );
}
