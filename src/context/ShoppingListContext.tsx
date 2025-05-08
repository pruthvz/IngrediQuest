// this context manages shopping lists for recipes
// it syncs lists between local storage and supabase user metadata
// and provides functions to add/remove items and lists

import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";

// defines what a shopping item looks like
interface ShoppingItem {
  id: number;
  originalName: string;
  amount: number;
  unit: string;
  checked: boolean;
}

// defines a shopping list for a recipe
interface RecipeShoppingList {
  recipeId: number;
  recipeName: string;
  ingredients: ShoppingItem[];
}

// functions available through the context
interface ShoppingListContextType {
  shoppingLists: RecipeShoppingList[];
  addList: (listName: string) => Promise<number>;
  addItemToList: (
    recipeId: number,
    itemName: string,
    amount?: number,
    unit?: string
  ) => Promise<void>;
  toggleItem: (recipeId: number, itemId: number) => Promise<void>;
  removeList: (recipeId: number) => Promise<void>;
  removeItem: (recipeId: number, itemId: number) => Promise<void>;
  clearCheckedItems: (recipeId: number) => Promise<void>;
  isLoading: boolean;
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(
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
export function ShoppingListProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // state for shopping lists
  const [shoppingLists, setShoppingLists] = useState<RecipeShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();
  const userId = session?.user?.id;

  // load lists when user logs in/out
  useEffect(() => {
    loadShoppingLists();
  }, [userId]);

  // loads all shopping lists
  const loadShoppingLists = async () => {
    setIsLoading(true);
    try {
      if (userId) {
        // try to load from supabase first
        await loadShoppingListsFromUserMetadata();
      } else {
        // fall back to local storage if not logged in
        await loadShoppingListsFromStorage();
      }
    } catch (error) {
      console.error("Error loading shopping lists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // loads lists from supabase user metadata
  const loadShoppingListsFromUserMetadata = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error getting user data:", error);
        loadShoppingListsFromStorage(); // fall back to local storage
        return;
      }

      // check if user has shopping lists
      const userMetadata = data.user?.user_metadata;
      if (userMetadata && userMetadata.shopping_lists) {
        const lists = JSON.parse(userMetadata.shopping_lists);
        setShoppingLists(lists);

        // backup to local storage
        await safeStorage.setItem("shoppingList", JSON.stringify(lists));
      } else {
        // try local storage if none in metadata
        await loadShoppingListsFromStorage();
      }
    } catch (error) {
      console.error("Error loading shopping lists from user metadata:", error);
      loadShoppingListsFromStorage(); // fall back to local storage
    }
  };

  // loads lists from local storage
  const loadShoppingListsFromStorage = async () => {
    try {
      const saved = await safeStorage.getItem("shoppingList");
      if (saved) {
        setShoppingLists(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading shopping lists from storage:", error);
    }
  };

  // updates shopping lists in supabase
  const updateUserMetadata = async (lists: RecipeShoppingList[]) => {
    if (!userId) {
      console.log("Not updating metadata - no userId");
      return;
    }

    try {
      console.log("Updating user metadata with shopping lists:", lists);
      const { error } = await supabase.auth.updateUser({
        data: { shopping_lists: JSON.stringify(lists) },
      });

      if (error) {
        console.error("Error updating user metadata:", error);
      } else {
        console.log("Successfully updated user metadata");
      }
    } catch (error) {
      console.error("Error updating user metadata:", error);
    }
  };

  // creates a new shopping list
  const addList = async (listName: string): Promise<number> => {
    if (!listName.trim()) return 0;

    try {
      console.log("Adding new shopping list:", listName);
      const newList = {
        recipeId: Date.now(),
        recipeName: listName.trim(),
        ingredients: [],
      };

      const updatedLists = [...shoppingLists, newList];
      console.log("Updated shopping lists:", updatedLists);
      setShoppingLists(updatedLists);

      // save to local storage
      console.log("Saving to local storage...");
      await safeStorage.setItem("shoppingList", JSON.stringify(updatedLists));
      console.log("Saved to local storage");

      // save to supabase if logged in
      if (userId) {
        console.log("User is logged in, updating metadata...");
        await updateUserMetadata(updatedLists);
      } else {
        console.log("User not logged in, skipping metadata update");
      }

      return newList.recipeId;
    } catch (error) {
      console.error("Error adding shopping list:", error);
      return 0;
    }
  };

  // adds an item to a list
  const addItemToList = async (
    recipeId: number,
    itemName: string,
    amount?: number,
    unit?: string
  ) => {
    if (!itemName.trim()) return;

    try {
      console.log(
        `Adding item "${itemName}" to list ${recipeId}, amount: ${amount}, unit: ${unit}`
      );

      // First check if the list exists
      const listExists = shoppingLists.some(
        (list) => list.recipeId === recipeId
      );
      if (!listExists) {
        console.error(`Shopping list with ID ${recipeId} not found!`);
        return;
      }

      const updatedLists = shoppingLists.map((list) => {
        if (list.recipeId === recipeId) {
          const newItem = {
            id: Date.now(),
            originalName: itemName.trim(),
            amount: amount || 1,
            unit: unit || "",
            checked: false,
          };
          console.log("Adding new item to list:", newItem);

          return {
            ...list,
            ingredients: [...list.ingredients, newItem],
          };
        }
        return list;
      });

      console.log("Setting updated shopping lists");
      setShoppingLists(updatedLists);

      // save changes
      console.log("Saving to local storage...");
      await safeStorage.setItem("shoppingList", JSON.stringify(updatedLists));
      console.log("Saved to local storage");

      // save to supabase if logged in
      if (userId) {
        console.log("User is logged in, updating metadata...");
        await updateUserMetadata(updatedLists);
      } else {
        console.log("User not logged in, skipping metadata update");
      }
    } catch (error) {
      console.error("Error adding item to shopping list:", error);
    }
  };

  // marks an item as checked/unchecked
  const toggleItem = async (recipeId: number, itemId: number) => {
    try {
      const updatedLists = shoppingLists.map((recipe) => {
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

      setShoppingLists(updatedLists);

      // save changes
      await safeStorage.setItem("shoppingList", JSON.stringify(updatedLists));

      // save to supabase if logged in
      if (userId) {
        await updateUserMetadata(updatedLists);
      }
    } catch (error) {
      console.error("Error toggling item in shopping list:", error);
    }
  };

  // deletes a shopping list
  const removeList = async (recipeId: number) => {
    try {
      const updatedLists = shoppingLists.filter(
        (list) => list.recipeId !== recipeId
      );

      setShoppingLists(updatedLists);

      // save changes
      await safeStorage.setItem("shoppingList", JSON.stringify(updatedLists));

      // save to supabase if logged in
      if (userId) {
        await updateUserMetadata(updatedLists);
      }
    } catch (error) {
      console.error("Error removing shopping list:", error);
    }
  };

  // removes an item from a list
  const removeItem = async (recipeId: number, itemId: number) => {
    try {
      const updatedLists = shoppingLists.map((list) => {
        if (list.recipeId === recipeId) {
          return {
            ...list,
            ingredients: list.ingredients.filter((item) => item.id !== itemId),
          };
        }
        return list;
      });

      setShoppingLists(updatedLists);

      // save changes
      await safeStorage.setItem("shoppingList", JSON.stringify(updatedLists));

      // save to supabase if logged in
      if (userId) {
        await updateUserMetadata(updatedLists);
      }
    } catch (error) {
      console.error("Error removing item from shopping list:", error);
    }
  };

  // removes all checked items from a list
  const clearCheckedItems = async (recipeId: number) => {
    try {
      const updatedLists = shoppingLists.map((list) => {
        if (list.recipeId === recipeId) {
          return {
            ...list,
            ingredients: list.ingredients.filter((item) => !item.checked),
          };
        }
        return list;
      });

      setShoppingLists(updatedLists);

      // save changes
      await safeStorage.setItem("shoppingList", JSON.stringify(updatedLists));

      // save to supabase if logged in
      if (userId) {
        await updateUserMetadata(updatedLists);
      }
    } catch (error) {
      console.error("Error clearing checked items from shopping list:", error);
    }
  };

  return (
    <ShoppingListContext.Provider
      value={{
        shoppingLists,
        addList,
        addItemToList,
        toggleItem,
        removeList,
        removeItem,
        clearCheckedItems,
        isLoading,
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
}

// hook to use shopping lists in components
export function useShoppingList() {
  const context = useContext(ShoppingListContext);
  if (context === undefined) {
    throw new Error(
      "useShoppingList must be used within a ShoppingListProvider"
    );
  }
  return context;
}
