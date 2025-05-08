// this context manages saved recipes for users
// it syncs recipes between local storage and supabase user metadata

import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";

// defines what a saved recipe looks like
interface Recipe {
  id: number;
  title: string;
  image: string;
  usedIngredientCount?: number;
  missedIngredientCount?: number;
}

// functions available through the context
interface SavedRecipesContextType {
  savedRecipes: Recipe[];
  saveRecipe: (recipe: Recipe) => Promise<void>;
  removeRecipe: (recipeId: number) => Promise<void>;
  isSaved: (recipeId: number) => boolean;
}

const SavedRecipesContext = createContext<SavedRecipesContextType | undefined>(
  undefined
);

// handles storage operations for both web and mobile
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

// provider component that wraps the app
export function SavedRecipesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // state for saved recipes
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const { session } = useAuth();
  const userId = session?.user?.id;

  // load recipes when user logs in/out
  useEffect(() => {
    if (userId) {
      // try to load from supabase first
      loadSavedRecipesFromUserMetadata();
    } else {
      // fall back to local storage if not logged in
      loadSavedRecipesFromStorage();
    }
  }, [userId]);

  // loads recipes from supabase user metadata
  const loadSavedRecipesFromUserMetadata = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error getting user data:", error);
        loadSavedRecipesFromStorage(); // fall back to local storage
        return;
      }

      // check if user has saved recipes
      const userMetadata = data.user?.user_metadata;
      if (userMetadata && userMetadata.saved_recipes) {
        const recipes = JSON.parse(userMetadata.saved_recipes);
        setSavedRecipes(recipes);

        // backup to local storage
        await safeStorage.setItem("savedRecipes", JSON.stringify(recipes));
      } else {
        // try local storage if none in metadata
        loadSavedRecipesFromStorage();
      }
    } catch (error) {
      console.error("Error loading saved recipes from user metadata:", error);
      loadSavedRecipesFromStorage(); // fall back to local storage
    }
  };

  // loads recipes from local storage
  const loadSavedRecipesFromStorage = async () => {
    try {
      const saved = await safeStorage.getItem("savedRecipes");
      if (saved) {
        setSavedRecipes(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading saved recipes from storage:", error);
    }
  };

  // saves a new recipe
  const saveRecipe = async (recipe: Recipe) => {
    try {
      // update local state
      const updatedRecipes = [...savedRecipes, recipe];
      setSavedRecipes(updatedRecipes);

      // save to local storage
      await safeStorage.setItem("savedRecipes", JSON.stringify(updatedRecipes));

      // save to supabase if logged in
      if (userId) {
        await updateUserMetadata(updatedRecipes);
      }

      console.log(`Recipe saved: ${recipe.title}`);
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  // removes a saved recipe
  const removeRecipe = async (recipeId: number) => {
    try {
      // update local state
      const updatedRecipes = savedRecipes.filter(
        (recipe) => recipe.id !== recipeId
      );
      setSavedRecipes(updatedRecipes);

      // update local storage
      await safeStorage.setItem("savedRecipes", JSON.stringify(updatedRecipes));

      // update supabase if logged in
      if (userId) {
        await updateUserMetadata(updatedRecipes);
      }

      console.log(`Recipe removed: ${recipeId}`);
    } catch (error) {
      console.error("Error removing recipe:", error);
    }
  };

  // updates saved recipes in supabase
  const updateUserMetadata = async (recipes: Recipe[]) => {
    if (!userId) return;

    try {
      const { error } = await supabase.auth.updateUser({
        data: { saved_recipes: JSON.stringify(recipes) },
      });

      if (error) {
        console.error("Error updating user metadata:", error);
      }
    } catch (error) {
      console.error("Error updating user metadata:", error);
    }
  };

  // checks if a recipe is saved
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

// hook to use saved recipes in components
export function useSavedRecipes() {
  const context = useContext(SavedRecipesContext);
  if (context === undefined) {
    throw new Error(
      "useSavedRecipes must be used within a SavedRecipesProvider"
    );
  }
  return context;
}
