import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Database } from "../types/supabase";
import Constants from "expo-constants";

// Ensure environment variables are defined
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create Supabase client with type safety
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Utility function to handle Supabase errors
export const handleSupabaseError = (error: Error) => {
  console.error("Supabase error:", error.message);
  // You can add more error handling logic here, like showing a toast notification
  throw error;
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!supabase.auth.getSession();
};
