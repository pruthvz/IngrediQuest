import React, { createContext, useContext, useState, useEffect } from "react";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";

type AuthContextType = {
  isAuthenticated: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  username: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

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
    } catch (error) {
      console.error("Error fetching/creating username:", error);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setIsAuthenticated(!!session);
      if (session?.user) {
        await updateUsername(session.user.id);
      }
      setIsLoading(false);
    });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setIsAuthenticated(!!session);
      if (session?.user) {
        await updateUsername(session.user.id);
      } else {
        setUsername(null);
      }
    });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        await updateUsername(data.user.id);
      }
      router.replace("/(tabs)");
    } catch (error: any) {
      setError(error.message);
      console.error("Error logging in:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
      }

      router.replace("/(tabs)");
    } catch (error: any) {
      setError(error.message);
      console.error("Error registering:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUsername(null);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
