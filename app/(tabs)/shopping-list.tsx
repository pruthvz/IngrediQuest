import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);

const { width } = Dimensions.get("window");

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
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useFocusEffect(
    React.useCallback(() => {
      loadShoppingList();
    }, [])
  );

  const loadShoppingList = async () => {
    setIsLoading(true);
    try {
      const list = await AsyncStorage.getItem("shoppingList");
      if (list) {
        const parsedList = JSON.parse(list);
        console.log("Loaded shopping list:", parsedList);
        setShoppingList(parsedList);
      }
    } catch (error) {
      console.error("Error loading shopping list:", error);
    } finally {
      setIsLoading(false);
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
    Alert.alert(
      "Delete List",
      "Are you sure you want to delete this shopping list?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedList = shoppingList.filter(
              (recipe) => recipe.recipeId !== recipeId
            );
            setShoppingList(updatedList);
            await AsyncStorage.setItem(
              "shoppingList",
              JSON.stringify(updatedList)
            );
          },
        },
      ]
    );
  };

  const removeItem = async (recipeId: number, itemId: number) => {
    const updatedList = shoppingList.map((recipe) => {
      if (recipe.recipeId === recipeId) {
        return {
          ...recipe,
          ingredients: recipe.ingredients.filter((item) => item.id !== itemId),
        };
      }
      return recipe;
    });

    setShoppingList(updatedList);
    await AsyncStorage.setItem("shoppingList", JSON.stringify(updatedList));
  };

  const clearCompleted = async (recipeId: number) => {
    const updatedList = shoppingList.map((recipe) => {
      if (recipe.recipeId === recipeId) {
        return {
          ...recipe,
          ingredients: recipe.ingredients.filter((item) => !item.checked),
        };
      }
      return recipe;
    });

    setShoppingList(updatedList);
    await AsyncStorage.setItem("shoppingList", JSON.stringify(updatedList));
  };

  return (
    <StyledSafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StyledScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with search bar */}
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
              <StyledView className="flex-row items-center justify-between mb-6">
                <StyledView>
                  <StyledText className="text-white text-2xl font-bold">
                    Shopping Lists
                  </StyledText>
                  <StyledText className="text-white/80 text-base">
                    Manage your grocery lists
                  </StyledText>
                </StyledView>

                <StyledTouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                  <FontAwesome5 name="shopping-basket" size={16} color="#fff" />
                </StyledTouchableOpacity>
              </StyledView>

              {/* Add new list input */}
              <StyledView
                className={`rounded-xl overflow-hidden flex-row items-center bg-white/20 px-4 py-3`}
              >
                <FontAwesome5 name="list" size={16} color="white" />
                <StyledTextInput
                  className="flex-1 ml-3 text-white"
                  placeholder="Create a new shopping list..."
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={newListName}
                  onChangeText={setNewListName}
                  onSubmitEditing={addNewList}
                />
                <StyledTouchableOpacity
                  className="ml-2 bg-white/30 w-8 h-8 rounded-full items-center justify-center"
                  onPress={addNewList}
                >
                  <FontAwesome5 name="plus" size={14} color="white" />
                </StyledTouchableOpacity>
              </StyledView>
            </StyledView>
          </LinearGradient>
        </StyledView>

        {/* Content Section */}
        <StyledView className="px-5 pt-2 pb-10 -mt-10">
          {/* Loading State */}
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
                Loading your shopping lists...
              </StyledText>
            </StyledView>
          ) : shoppingList.length === 0 ? (
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
                name="shopping-basket"
                size={48}
                color={isDark ? "#818CF8" : "#6366F1"}
              />
              <StyledText
                className={`mt-4 text-xl font-semibold text-center ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Your shopping list is empty
              </StyledText>
              <StyledText
                className={`mt-2 text-center ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Add your first shopping list to get started
              </StyledText>
            </StyledView>
          ) : (
            <StyledView className="mt-2 space-y-4">
              {shoppingList.map((recipe) => (
                <StyledView
                  key={recipe.recipeId}
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
                  <StyledView className="px-4 py-5 border-b border-gray-200">
                    <StyledView className="flex-row justify-between items-center">
                      <StyledView className="flex-row items-center">
                        <StyledView
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{
                            backgroundColor: isDark ? "#4F46E5" : "#6366F1",
                          }}
                        >
                          <FontAwesome5
                            name="clipboard-list"
                            size={16}
                            color="white"
                          />
                        </StyledView>
                        <StyledText
                          className={`text-lg font-bold ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {recipe.recipeName}
                        </StyledText>
                      </StyledView>

                      <StyledView className="flex-row">
                        <StyledTouchableOpacity
                          onPress={() => clearCompleted(recipe.recipeId)}
                          className="p-2 mr-2"
                        >
                          <FontAwesome5
                            name="broom"
                            size={16}
                            color={isDark ? "#818CF8" : "#6366F1"}
                          />
                        </StyledTouchableOpacity>
                        <StyledTouchableOpacity
                          onPress={() => setSelectedListId(recipe.recipeId)}
                          className="p-2 mr-2"
                        >
                          <FontAwesome5
                            name="plus"
                            size={16}
                            color={isDark ? "#818CF8" : "#6366F1"}
                          />
                        </StyledTouchableOpacity>
                        <StyledTouchableOpacity
                          onPress={() => removeRecipe(recipe.recipeId)}
                          className="p-2"
                        >
                          <FontAwesome5
                            name="trash-alt"
                            size={16}
                            color={isDark ? "#EF4444" : "#DC2626"}
                          />
                        </StyledTouchableOpacity>
                      </StyledView>
                    </StyledView>

                    {selectedListId === recipe.recipeId && (
                      <StyledView className="flex-row items-center mt-4">
                        <StyledTextInput
                          className={`flex-1 px-4 py-3 rounded-xl mr-2 ${
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
                          className="p-3 rounded-xl"
                          style={{
                            backgroundColor: isDark ? "#4F46E5" : "#6366F1",
                          }}
                          onPress={() => addItemToList(recipe.recipeId)}
                        >
                          <FontAwesome5 name="plus" size={16} color="white" />
                        </StyledTouchableOpacity>
                      </StyledView>
                    )}
                  </StyledView>

                  <StyledView className="p-4">
                    {recipe.ingredients.length === 0 ? (
                      <StyledView className="py-4 items-center">
                        <StyledText
                          className={isDark ? "text-gray-400" : "text-gray-500"}
                        >
                          No items in this list yet
                        </StyledText>
                      </StyledView>
                    ) : (
                      recipe.ingredients.map((item) => (
                        <StyledView
                          key={item.id}
                          className="flex-row items-center py-3 border-b border-gray-200 last:border-b-0"
                        >
                          <StyledTouchableOpacity
                            onPress={() => toggleItem(recipe.recipeId, item.id)}
                            className="mr-3"
                          >
                            <StyledView
                              className={`w-6 h-6 rounded-md items-center justify-center ${
                                item.checked
                                  ? isDark
                                    ? "bg-green-500"
                                    : "bg-green-500"
                                  : "border border-gray-300"
                              }`}
                            >
                              {item.checked && (
                                <FontAwesome5
                                  name="check"
                                  size={12}
                                  color="white"
                                />
                              )}
                            </StyledView>
                          </StyledTouchableOpacity>

                          <StyledText
                            className={`flex-1 ${
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
                              className={`mr-3 ${
                                isDark ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              {item.amount} {item.unit}
                            </StyledText>
                          )}

                          <StyledTouchableOpacity
                            onPress={() => removeItem(recipe.recipeId, item.id)}
                            className="p-2"
                          >
                            <FontAwesome5
                              name="times"
                              size={16}
                              color={isDark ? "#9CA3AF" : "#6B7280"}
                            />
                          </StyledTouchableOpacity>
                        </StyledView>
                      ))
                    )}
                  </StyledView>

                  <StyledView className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex-row justify-between items-center">
                    <StyledText
                      className={isDark ? "text-gray-300" : "text-gray-600"}
                    >
                      {recipe.ingredients.filter((i) => i.checked).length} of{" "}
                      {recipe.ingredients.length} completed
                    </StyledText>

                    <StyledTouchableOpacity
                      className={`px-3 py-2 rounded-lg ${
                        recipe.ingredients.some((i) => i.checked)
                          ? isDark
                            ? "bg-indigo-600"
                            : "bg-indigo-500"
                          : isDark
                          ? "bg-gray-600"
                          : "bg-gray-300"
                      }`}
                      disabled={!recipe.ingredients.some((i) => i.checked)}
                      onPress={() => clearCompleted(recipe.recipeId)}
                    >
                      <StyledText className="text-sm text-white font-medium">
                        Clear Completed
                      </StyledText>
                    </StyledTouchableOpacity>
                  </StyledView>
                </StyledView>
              ))}
            </StyledView>
          )}
        </StyledView>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
}
