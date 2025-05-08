// this context handles user authentication with supabase
// it manages login, registration, session persistence, and auth state

import React, { createContext, useContext, useState, useEffect } from "react";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// functions and data available through the context
type AuthContextType = {
  isAuthenticated: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  username: string | null;
  email: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error("Error removing from storage:", error);
    }
  },
};

// provider component that wraps the app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // state for auth data
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // gets or creates a user profile with username
  const updateUsername = async (userId: string) => {
    try {
      // First try to get the profile
      let { data, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", userId)
        .single();

      // If no profile exists, create one
      if (error && error.code === "PGRST116") {
        const { data: userData } = await supabase.auth.getUser();
        const userEmail = userData.user?.email;
        const userName =
          userData.user?.user_metadata?.name || userEmail?.split("@")[0];

        const { data: newProfile, error: upsertError } = await supabase
          .from("profiles")
          .upsert({
            id: userId,
            name: userName,
            email: userEmail,
            updated_at: new Date(),
          })
          .select("name")
          .single();

        if (upsertError) throw upsertError;
        data = newProfile;
      } else if (error) {
        throw error;
      }

      setUsername(data?.name || null);
      // Store username in storage
      if (data?.name) {
        await safeStorage.setItem("username", data.name);
      }
    } catch (error) {
      console.error("Error fetching/creating username:", error);
    }
  };

  // setup auth state and session persistence
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // First check for an active session from Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // If we have a valid session, use it
        if (session?.user?.id) {
          console.log("Found valid session, user is authenticated");
          setSession(session);
          setIsAuthenticated(true);
          setEmail(session.user.email || null);
          await updateUsername(session.user.id);
          // Store the session in localStorage for web persistence
          if (Platform.OS === "web") {
            localStorage.setItem("isAuthenticated", "true");
          }
          return;
        }

        // If no active session, check for stored authentication state
        if (Platform.OS === "web") {
          const isAuthenticatedInStorage =
            localStorage.getItem("isAuthenticated");
          if (isAuthenticatedInStorage === "true") {
            console.log(
              "Found authentication state in storage, trying to refresh session"
            );
            // Try to refresh the session
            const { data, error } = await supabase.auth.refreshSession();
            if (data.session) {
              setSession(data.session);
              setIsAuthenticated(true);
              setEmail(data.session.user.email || null);
              await updateUsername(data.session.user.id);
              return;
            } else {
              // Clear invalid stored auth state
              localStorage.removeItem("isAuthenticated");
            }
          }
        }

        // Check if we have a stored session (for backward compatibility)
        const storedSession = await safeStorage.getItem("supabase.auth.token");
        if (storedSession) {
          try {
            console.log("Found stored session token, trying to restore");
            const parsedSession = JSON.parse(storedSession);
            if (parsedSession?.currentSession?.access_token) {
              // Verify the token is still valid
              const { data } = await supabase.auth.refreshSession({
                refresh_token: parsedSession.currentSession.refresh_token,
              });

              if (data.session) {
                setSession(data.session);
                setIsAuthenticated(true);
                setEmail(data.session.user.email || null);
                // Get the stored username if available
                const storedUsername = await safeStorage.getItem("username");
                if (storedUsername) {
                  setUsername(storedUsername);
                }
                return;
              }
            }
          } catch (e) {
            console.error("Error parsing stored session:", e);
          }
        }

        // If we get here, user is not authenticated
        console.log("No valid session found, user is not authenticated");
        setIsAuthenticated(false);
        setSession(null);
        setUsername(null);
        setEmail(null);

        // Redirect to login page
        router.replace("/login");
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsAuthenticated(false);
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setSession(session);
        setIsAuthenticated(true);
        if (session?.user) {
          await updateUsername(session.user.id);
          // Store authentication state in localStorage for web
          if (Platform.OS === "web") {
            localStorage.setItem("isAuthenticated", "true");
          }
        }
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setIsAuthenticated(false);
        setUsername(null);
        await safeStorage.removeItem("username");
        // Clear authentication state from localStorage
        if (Platform.OS === "web") {
          localStorage.removeItem("isAuthenticated");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // logs in a user with email and password
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        await updateUsername(data.user.id);
        setEmail(data.user.email || null);
        setIsAuthenticated(true);
        // Store authentication state in localStorage for web
        if (Platform.OS === "web") {
          localStorage.setItem("isAuthenticated", "true");
        }
        router.replace("/(tabs)");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred");
      console.error("Error logging in:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // registers a new user
  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          name,
          email,
          updated_at: new Date(),
        });

        if (profileError) throw profileError;
        setUsername(name);
        setEmail(email);
        await safeStorage.setItem("username", name);
        setIsAuthenticated(true);
      }

      router.replace("/(tabs)");
    } catch (error: any) {
      setError(error.message);
      console.error("Error registering:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // logs out the current user
  const logout = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUsername(null);
      setIsAuthenticated(false);
      await safeStorage.removeItem("username");
      // Clear authentication state from localStorage
      if (Platform.OS === "web") {
        localStorage.removeItem("isAuthenticated");
      }
      router.replace("/login");
    } catch (error: any) {
      setError(error.message);
      console.error("Error logging out:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        session,
        login,
        register,
        logout,
        isLoading,
        error,
        username,
        email,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// hook to use auth in components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
