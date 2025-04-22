import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export interface UserPreferences {
  dietaryPreferences: string[];
  cuisinePreferences: string[];
  cookingSkillLevel: "beginner" | "intermediate" | "advanced";
  allergies: string[];
  restrictions: string[];
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (
    newPreferences: Partial<UserPreferences>
  ) => Promise<void>;
  isPreferencesSet: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  dietaryPreferences: [],
  cuisinePreferences: [],
  cookingSkillLevel: "beginner",
  allergies: [],
  restrictions: [],
};

const UserPreferencesContext = createContext<
  UserPreferencesContextType | undefined
>(undefined);

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

export function UserPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isPreferencesSet, setIsPreferencesSet] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

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
      value={{ preferences, updatePreferences, isPreferencesSet }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useUserPreferences must be used within a UserPreferencesProvider"
    );
  }
  return context;
}
