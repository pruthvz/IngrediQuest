// this context manages user preferences like dark mode, dietary preferences, and settings
// it saves preferences to local storage and provides functions to update them

import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// defines what user preferences look like
export interface UserPreferences {
  isDarkMode: boolean;
  dietaryPreferences: string[];
  cuisinePreferences: string[];
  cookingSkillLevel: "beginner" | "intermediate" | "advanced";
  allergies: string[];
  restrictions: string[];
  profilePicture?: string; // Base64 encoded image string or URI
  displayName?: string;
}

// functions available through the context
interface UserPreferencesContextType {
  toggleDarkMode: () => Promise<void>;
  preferences: UserPreferences;
  updatePreferences: (
    newPreferences: Partial<UserPreferences>
  ) => Promise<void>;
  isPreferencesSet: boolean;
}

// default values for new users
const DEFAULT_PREFERENCES: UserPreferences = {
  isDarkMode: false,
  dietaryPreferences: [],
  cuisinePreferences: [],
  cookingSkillLevel: "beginner",
  allergies: [],
  restrictions: [],
  profilePicture: "https://i.pravatar.cc/150", // Default avatar
  displayName: "",
};

const UserPreferencesContext = createContext<
  UserPreferencesContextType | undefined
>(undefined);

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
export function UserPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // state for user preferences
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isPreferencesSet, setIsPreferencesSet] = useState(false);

  // load saved preferences when app starts
  useEffect(() => {
    loadPreferences();
  }, []);

  // gets preferences from storage
  const loadPreferences = async () => {
    try {
      const savedPreferences = await safeStorage.getItem("userPreferences");
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
        setIsPreferencesSet(true);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  // toggles dark mode and saves the change
  const toggleDarkMode = async () => {
    try {
      const updatedPreferences = {
        ...preferences,
        isDarkMode: !preferences.isDarkMode,
      };
      await safeStorage.setItem(
        "userPreferences",
        JSON.stringify(updatedPreferences)
      );
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error("Error toggling dark mode:", error);
    }
  };

  // updates any preference values and saves them
  const updatePreferences = async (
    newPreferences: Partial<UserPreferences>
  ) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      await safeStorage.setItem(
        "userPreferences",
        JSON.stringify(updatedPreferences)
      );
      setPreferences(updatedPreferences);
      setIsPreferencesSet(true);
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        isPreferencesSet,
        toggleDarkMode,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

// hook to use preferences in components
export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useUserPreferences must be used within a UserPreferencesProvider"
    );
  }
  return context;
}
