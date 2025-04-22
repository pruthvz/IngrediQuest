import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

interface Recipe {
  id: number;
  title: string;
  image: string;
  usedIngredientCount?: number;
  missedIngredientCount?: number;
}

interface SavedRecipesContextType {
  savedRecipes: Recipe[];
  saveRecipe: (recipe: Recipe) => Promise<void>;
  removeRecipe: (recipeId: number) => Promise<void>;
  isSaved: (recipeId: number) => boolean;
}

const SavedRecipesContext = createContext<SavedRecipesContextType | undefined>(
  undefined
);

// Helper function to safely use storage
const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error("Error reading from storage:", error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error("Error writing to storage:", error);
    }
  },
};

export function SavedRecipesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  React.useEffect(() => {
    // Load saved recipes from storage when app starts
    loadSavedRecipes();
  }, []);

  const loadSavedRecipes = async () => {
    try {
      const saved = await safeStorage.getItem("savedRecipes");
      if (saved) {
        setSavedRecipes(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading saved recipes:", error);
    }
  };

  const saveRecipe = async (recipe: Recipe) => {
    try {
      const updatedRecipes = [...savedRecipes, recipe];
      await safeStorage.setItem("savedRecipes", JSON.stringify(updatedRecipes));
      setSavedRecipes(updatedRecipes);
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  const removeRecipe = async (recipeId: number) => {
    try {
      const updatedRecipes = savedRecipes.filter(
        (recipe) => recipe.id !== recipeId
      );
      await safeStorage.setItem("savedRecipes", JSON.stringify(updatedRecipes));
      setSavedRecipes(updatedRecipes);
    } catch (error) {
      console.error("Error removing recipe:", error);
    }
  };

  const isSaved = (recipeId: number) => {
    return savedRecipes.some((recipe) => recipe.id === recipeId);
  };

  return (
    <SavedRecipesContext.Provider
      value={{ savedRecipes, saveRecipe, removeRecipe, isSaved }}
    >
      {children}
    </SavedRecipesContext.Provider>
  );
}

export function useSavedRecipes() {
  const context = useContext(SavedRecipesContext);
  if (context === undefined) {
    throw new Error(
      "useSavedRecipes must be used within a SavedRecipesProvider"
    );
  }
  return context;
}
