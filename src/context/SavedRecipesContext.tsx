import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      const saved = await AsyncStorage.getItem("savedRecipes");
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
      await AsyncStorage.setItem(
        "savedRecipes",
        JSON.stringify(updatedRecipes)
      );
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
      await AsyncStorage.setItem(
        "savedRecipes",
        JSON.stringify(updatedRecipes)
      );
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
