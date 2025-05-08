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
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import WebLayout from "../components/WebLayout";
import WebIcon from "../components/WebIcon";
import { useShoppingList } from "../../src/context/ShoppingListContext";
import { useUserPreferences } from "../../src/context/UserPreferencesContext";

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
  const [newListName, setNewListName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const { preferences } = useUserPreferences();
  const isDark = preferences.isDarkMode;
  const isWeb = Platform.OS === 'web';

  // Use the shopping list context
  const { 
    shoppingLists, 
    addList, 
    addItemToList, 
    toggleItem, 
    removeList, 
    removeItem, 
    clearCheckedItems,
    isLoading 
  } = useShoppingList();

  // Add a new shopping list
  const handleAddNewList = async () => {
    if (newListName.trim()) {
      const newListId = await addList(newListName.trim());
      setNewListName("");
      if (newListId) {
        setSelectedListId(newListId);
      }
    }
  };

  // Add an item to a shopping list
  const handleAddItemToList = async (recipeId: number) => {
    if (newItemName.trim()) {
      await addItemToList(recipeId, newItemName.trim());
      setNewItemName("");
    }
  };

  // Remove a shopping list with confirmation
  const handleRemoveList = async (recipeId: number) => {
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
            await removeList(recipeId);
            if (selectedListId === recipeId) {
              setSelectedListId(null);
            }
          },
        },
      ]
    );
  };

  // Web-specific rendering
  if (isWeb) {
    return (
      <WebLayout title="Shopping List" currentTab="shopping-list">
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Add New List */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 600, 
              marginBottom: '0.5rem',
              color: isDark ? '#F9FAFB' : '#111827',
            }}>
              Create a New Shopping List
            </h3>
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem' 
            }}>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddNewList()}
                placeholder="Enter list name (e.g., Weekly Groceries)"
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid ' + (isDark ? '#374151' : '#E5E7EB'),
                  backgroundColor: isDark ? '#111827' : '#FFFFFF',
                  color: isDark ? '#F9FAFB' : '#111827',
                  fontSize: '0.95rem',
                }}
              />
              <button
                onClick={handleAddNewList}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Create
              </button>
            </div>
          </div>
          
          {/* Loading Indicator */}
          {isLoading && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              padding: '2rem' 
            }}>
              <div style={{ 
                display: 'inline-block',
                width: '2rem',
                height: '2rem',
                border: '3px solid ' + (isDark ? '#374151' : '#E5E7EB'),
                borderRadius: '50%',
                borderTopColor: '#4F46E5',
                animation: 'spin 1s linear infinite',
              }}></div>
            </div>
          )}
          
          {/* Shopping Lists */}
          {!isLoading && shoppingLists.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '3rem 0',
              color: isDark ? '#9CA3AF' : '#6B7280',
            }}>
              <WebIcon name="shopping-basket" size={40} style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>No shopping lists yet</p>
              <p>Create a new list to get started</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {shoppingLists.map((recipe) => (
                <div 
                  key={recipe.recipeId}
                  style={{
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    border: '1px solid ' + (isDark ? '#374151' : '#E5E7EB'),
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {/* List Header */}
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid ' + (isDark ? '#374151' : '#E5E7EB'),
                  }}>
                    <div>
                      <h4 style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: 600, 
                        color: isDark ? '#F9FAFB' : '#111827',
                      }}>
                        {recipe.recipeName}
                      </h4>
                      <p style={{ 
                        fontSize: '0.875rem',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                      }}>
                        {recipe.ingredients.length} items
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => {
                          if (selectedListId === recipe.recipeId) {
                            setSelectedListId(null);
                          } else {
                            setSelectedListId(recipe.recipeId);
                          }
                        }}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          backgroundColor: isDark ? '#374151' : '#F3F4F6',
                          color: isDark ? '#E5E7EB' : '#4B5563',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <i className={`fas fa-${selectedListId === recipe.recipeId ? 'chevron-up' : 'chevron-down'}`}></i>
                      </button>
                      
                      <button
                        onClick={() => handleRemoveList(recipe.recipeId)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2',
                          color: isDark ? '#FECACA' : '#B91C1C',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <WebIcon name="trash-alt" />
                      </button>
                    </div>
                  </div>
                  
                  {/* List Items */}
                  {selectedListId === recipe.recipeId && (
                    <div>
                      {/* Add Item Form */}
                      <div style={{ 
                        display: 'flex', 
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid ' + (isDark ? '#374151' : '#E5E7EB'),
                        gap: '0.75rem',
                      }}>
                        <input
                          type="text"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddItemToList(recipe.recipeId)}
                          placeholder="Add an item"
                          style={{
                            flex: 1,
                            padding: '0.625rem 0.875rem',
                            borderRadius: '0.375rem',
                            border: '1px solid ' + (isDark ? '#374151' : '#E5E7EB'),
                            backgroundColor: isDark ? '#111827' : '#FFFFFF',
                            color: isDark ? '#F9FAFB' : '#111827',
                            fontSize: '0.875rem',
                          }}
                        />
                        <button
                          onClick={() => handleAddItemToList(recipe.recipeId)}
                          style={{
                            padding: '0.625rem 1rem',
                            borderRadius: '0.375rem',
                            backgroundColor: '#4F46E5',
                            color: 'white',
                            fontWeight: 500,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          <WebIcon name="plus" />
                          Add
                        </button>
                      </div>
                      
                      {/* Items List */}
                      <div style={{ padding: '0.5rem 0' }}>
                        {recipe.ingredients.length === 0 ? (
                          <div style={{ 
                            padding: '1.5rem', 
                            textAlign: 'center',
                            color: isDark ? '#9CA3AF' : '#6B7280',
                          }}>
                            <p>No items in this list yet</p>
                          </div>
                        ) : (
                          recipe.ingredients.map((item) => (
                            <div 
                              key={item.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.75rem 1.25rem',
                                borderBottom: '1px solid ' + (isDark ? '#374151' : '#E5E7EB'),
                              }}
                            >
                              <button
                                onClick={() => toggleItem(recipe.recipeId, item.id)}
                                style={{
                                  width: '1.5rem',
                                  height: '1.5rem',
                                  borderRadius: '0.375rem',
                                  marginRight: '0.75rem',
                                  backgroundColor: item.checked ? '#10B981' : 'transparent',
                                  border: item.checked ? 'none' : '1px solid ' + (isDark ? '#6B7280' : '#D1D5DB'),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                }}
                              >
                                {item.checked && <WebIcon name="check" style={{ color: 'white', fontSize: '0.75rem' }} />}
                              </button>
                              
                              <span style={{ 
                                flex: 1,
                                textDecoration: item.checked ? 'line-through' : 'none',
                                color: item.checked ? (isDark ? '#6B7280' : '#9CA3AF') : (isDark ? '#E5E7EB' : '#111827'),
                              }}>
                                {item.originalName}
                              </span>
                              
                              {item.amount && item.unit && (
                                <span style={{ 
                                  marginRight: '0.75rem',
                                  color: isDark ? '#9CA3AF' : '#6B7280',
                                  fontSize: '0.875rem',
                                }}>
                                  {item.amount} {item.unit}
                                </span>
                              )}
                              
                              <button
                                onClick={() => removeItem(recipe.recipeId, item.id)}
                                style={{
                                  padding: '0.5rem',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: isDark ? '#9CA3AF' : '#6B7280',
                                }}
                              >
                                <WebIcon name="times" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {/* List Footer */}
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem 1.25rem',
                        backgroundColor: isDark ? '#111827' : '#F9FAFB',
                        borderTop: '1px solid ' + (isDark ? '#374151' : '#E5E7EB'),
                      }}>
                        <span style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                          {recipe.ingredients.filter(i => i.checked).length} of {recipe.ingredients.length} completed
                        </span>
                        
                        <button
                          onClick={() => clearCheckedItems(recipe.recipeId)}
                          disabled={!recipe.ingredients.some(i => i.checked)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.375rem',
                            backgroundColor: recipe.ingredients.some(i => i.checked) ? '#4F46E5' : '#E5E7EB',
                            color: recipe.ingredients.some(i => i.checked) ? 'white' : '#9CA3AF',
                            border: 'none',
                            cursor: recipe.ingredients.some(i => i.checked) ? 'pointer' : 'not-allowed',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          }}
                        >
                          Clear Completed
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </WebLayout>
    );
  }
  
  // Mobile rendering
  return (
    <StyledSafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900 mb-12" : "bg-gray-50 mb-12"}`}
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
                  onSubmitEditing={handleAddNewList}
                />
                <StyledTouchableOpacity
                  className="ml-2 bg-white/30 w-8 h-8 rounded-full items-center justify-center"
                  onPress={handleAddNewList}
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
          ) : shoppingLists.length === 0 ? (
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
              {shoppingLists.map((recipe) => (
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
                          onPress={() => clearCheckedItems(recipe.recipeId)}
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
                          onPress={() => handleRemoveList(recipe.recipeId)}
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
                          onSubmitEditing={() => handleAddItemToList(recipe.recipeId)}
                        />
                        <StyledTouchableOpacity
                          className="p-3 rounded-xl"
                          style={{
                            backgroundColor: isDark ? "#4F46E5" : "#6366F1",
                          }}
                          onPress={() => handleAddItemToList(recipe.recipeId)}
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
                      className={`px-3 py-1 rounded-lg ${
                        recipe.ingredients.some((i) => i.checked)
                          ? isDark
                            ? "bg-indigo-600"
                            : "bg-indigo-500"
                          : isDark
                          ? "bg-gray-600"
                          : "bg-gray-300"
                      }`}
                      disabled={!recipe.ingredients.some((i) => i.checked)}
                      onPress={() => clearCheckedItems(recipe.recipeId)}
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
