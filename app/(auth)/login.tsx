/**
 * Login Component
 *
 * This component handles user authentication by providing both web and mobile interfaces
 * for user login. It supports dark/light mode theming and provides a responsive layout
 * with different optimizations for web and mobile platforms.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Platform,
} from "react-native";
import { styled } from "nativewind";
import { Link } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useUserPreferences } from "../../src/context/UserPreferencesContext";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import WebAuth from "../components/WebAuth";

/**
 * Styled components using nativewind for consistent styling across platforms
 * These components provide a bridge between React Native components and Tailwind CSS
 */
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImageBackground = styled(ImageBackground);

export default function Login() {
  // Platform-specific check to determine rendering mode
  const isWeb = Platform.OS === "web";

  // State management for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Authentication context hooks for login functionality and loading state
  const { login, isLoading, error } = useAuth();

  // Theme context for handling dark/light mode
  const { preferences } = useUserPreferences();
  const isDark = preferences.isDarkMode;

  /**
   * Handles the login form submission
   * Validates inputs and attempts to authenticate the user
   */
  const handleLogin = async () => {
    // Validate form fields
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      // Error is handled by the AuthContext
      console.error("Login error:", error);
    }
  };

  /**
   * Common form component shared between web and mobile views
   * Contains the login form fields and submission button
   */
  const loginForm = (
    <>
      <StyledImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=1000",
        }}
        className="h-72"
      >
        <LinearGradient
          colors={["transparent", isDark ? "#111827" : "#ffffff"]}
          className="absolute bottom-0 left-0 right-0 h-40"
        />
      </StyledImageBackground>

      <StyledView className="px-6 pt-4 -mt-10">
        <StyledView className="mb-8">
          <StyledText
            className={`text-4xl font-bold mb-3 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Welcome Back
          </StyledText>
          <StyledText
            className={`text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Let's find your next culinary adventure
          </StyledText>
        </StyledView>

        {error && (
          <StyledView className="mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
            <StyledText className="text-red-600">{error}</StyledText>
          </StyledView>
        )}

        <StyledView className="space-y-4">
          <StyledView>
            <StyledText
              className={`text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Email
            </StyledText>
            <StyledTextInput
              className={`px-4 py-3.5 rounded-xl text-base ${
                isDark
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-gray-50 text-gray-900 border-gray-200"
              } border`}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </StyledView>

          <StyledView>
            <StyledText
              className={`text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Password
            </StyledText>
            <StyledTextInput
              className={`px-4 py-3.5 rounded-xl text-base ${
                isDark
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-gray-50 text-gray-900 border-gray-200"
              } border`}
              placeholder="Enter your password"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </StyledView>
        </StyledView>

        <StyledTouchableOpacity
          className={`mt-6 py-4 rounded-xl ${
            isDark ? "bg-primary-500" : "bg-primary-600"
          } ${isLoading ? "opacity-50" : ""}`}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <StyledView className="flex-row justify-center items-center">
            {isLoading ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : null}
            <StyledText className="text-white text-center font-semibold text-lg">
              {isLoading ? "Signing in..." : "Sign in"}
            </StyledText>
          </StyledView>
        </StyledTouchableOpacity>

        <StyledView className="flex-row justify-center mt-8 mb-6">
          <StyledText
            className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Don't have an account?{" "}
          </StyledText>
          <Link href="/register" asChild>
            <StyledTouchableOpacity>
              <StyledText
                className={`font-semibold ${
                  isDark ? "text-primary-400" : "text-primary-600"
                }`}
              >
                Sign up
              </StyledText>
            </StyledTouchableOpacity>
          </Link>
        </StyledView>
      </StyledView>
    </>
  );

  /**
   * Web-specific rendering with enhanced UI features
   * Provides a more sophisticated layout with additional visual elements
   * and responsive design considerations
   */
  if (isWeb) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          backgroundColor: isDark ? "#111827" : "#F3F4F6",
          color: isDark ? "#F9FAFB" : "#111827",
          transition: "all 0.3s ease",
        }}
      >
        <button
          onClick={() => {}}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            padding: "0.5rem",
            borderRadius: "50%",
            width: "2.5rem",
            height: "2.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isDark ? "#374151" : "#E5E7EB",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
            zIndex: 10,
          }}
        >
          {isDark ? (
            <span style={{ fontSize: "1.25rem" }}>☀️</span>
          ) : (
            <span style={{ fontSize: "1.25rem" }}>🌙</span>
          )}
        </button>
        <div
          style={{
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2rem",
            display: "flex",
            borderRadius: "1rem",
            overflow: "hidden",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Left side - Login form */}
          <div
            style={{
              flex: "0 1 480px",
              backgroundColor: isDark ? "#1F2937" : "white",
              padding: "3rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ marginBottom: "0.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <span
                  style={{
                    color: "#4F46E5",
                    fontSize: "1.5rem",
                    marginRight: "0.75rem",
                  }}
                >
                  🍽️
                </span>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    color: isDark ? "#F9FAFB" : "#111827",
                  }}
                >
                  IngrediQuest
                </h2>
              </div>
              <h1
                style={{
                  fontSize: "1.875rem",
                  fontWeight: "600",
                  color: isDark ? "#F9FAFB" : "#111827",
                  marginBottom: "0.5rem",
                }}
              >
                Welcome Back
              </h1>
              <p
                style={{
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  fontSize: "0.875rem",
                  marginBottom: "2rem",
                }}
              >
                Enter your email and password to access your account.
              </p>
            </div>
            {error && (
              <div
                style={{
                  backgroundColor: isDark
                    ? "rgba(248, 113, 113, 0.2)"
                    : "rgba(248, 113, 113, 0.1)",
                  borderRadius: "0.5rem",
                  padding: "0.75rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  color: "#EF4444",
                  fontSize: "0.875rem",
                }}
              >
                <div
                  style={{
                    marginRight: "0.5rem",
                    width: "1.25rem",
                    height: "1.25rem",
                    backgroundColor: "rgba(248, 113, 113, 0.2)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <i className="fas fa-exclamation-circle"></i>
                </div>
                <p>{error}</p>
              </div>
            )}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: "#4B5563",
                }}
              >
                Email
              </label>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9CA3AF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fas fa-envelope"></i>
                </div>
                <input
                  type="email"
                  id="email"
                  style={{
                    width: "90%",
                    padding: "0.75rem 1rem",
                    paddingLeft: "2.75rem",
                    borderRadius: "0.5rem",
                    border: `1px solid ${isDark ? "#4B5563" : "#E5E7EB"}`,
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease-in-out",
                    backgroundColor: isDark ? "#374151" : "#FFFFFF",
                    color: isDark ? "#F9FAFB" : "#1F2937",
                  }}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: "#4B5563",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9CA3AF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fas fa-lock"></i>
                </div>
                <input
                  type="password"
                  id="password"
                  style={{
                    width: "90%",
                    padding: "0.75rem 1rem",
                    paddingLeft: "2.75rem",
                    borderRadius: "0.5rem",
                    border: `1px solid ${isDark ? "#4B5563" : "#E5E7EB"}`,
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease-in-out",
                    backgroundColor: isDark ? "#374151" : "#FFFFFF",
                    color: isDark ? "#F9FAFB" : "#1F2937",
                  }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                border: "none",
                background: isDark
                  ? "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)"
                  : "linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                position: "relative",
                overflow: "hidden",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                marginTop: "1.5rem",
              }}
            >
              {isLoading ? (
                <>
                  <span
                    style={{
                      animation: "spin 1s linear infinite",
                      marginRight: "0.5rem",
                    }}
                  >
                    <span>⏳</span>
                  </span>
                  Signing in...
                </>
              ) : (
                <>Sign in</>
              )}
            </button>

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <p
                style={{
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  fontSize: "0.875rem",
                }}
              >
                Don't have an account?{" "}
                <a
                  href="/register"
                  style={{
                    color: "#4F46E5",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Register Now
                </a>
              </p>
            </div>
            <div style={{ marginTop: "auto", paddingTop: "2rem" }}>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: isDark ? "#6B7280" : "#9CA3AF",
                  textAlign: "center",
                }}
              >
                Copyright © 2025 IngrediQuest Enterprises LTD.
              </p>
            </div>
          </div>

          {/* Right side - Feature showcase */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#4F46E5",
              padding: "3rem",
              color: "white",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span style={{ fontSize: "1.75rem" }}>🍽️</span>
                Let's find your next culinary adventure
              </h2>
              <p
                style={{
                  fontSize: "1rem",
                  opacity: 0.9,
                  marginBottom: "2.5rem",
                }}
              >
                Log in to access your personalized recipe recommendations and
                meal planning tools.
              </p>

              <div style={{ marginBottom: "2.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      borderRadius: "50%",
                      width: "2.5rem",
                      height: "2.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "1rem",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>🍳</span>
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Discover Recipes
                    </h3>
                    <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>
                      Find recipes that match your preferences and dietary needs
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      borderRadius: "50%",
                      width: "2.5rem",
                      height: "2.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "1rem",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>📅</span>
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Plan Your Meals
                    </h3>
                    <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>
                      Organize your weekly meal schedule effortlessly
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      borderRadius: "50%",
                      width: "2.5rem",
                      height: "2.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "1rem",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>🛒</span>
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Smart Shopping Lists
                    </h3>
                    <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>
                      Generate shopping lists based on your meal plans
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "auto", position: "relative" }}>
              <img
                src="https://images.unsplash.com/photo-1495546968767-f0573cca821e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Food Preparation"
                style={{
                  width: "100%",
                  borderRadius: "0.5rem",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  height: "300px",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "1rem",
                  right: "1rem",
                  backgroundColor: "rgba(79, 70, 229, 0.9)",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ color: "#FCD34D" }}>⭐</span>
                <span style={{ fontWeight: "bold" }}>4.9/5 User Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Mobile-specific rendering
   * Provides a simplified, scrollable interface optimized for mobile devices
   */
  return (
    <ScrollView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {loginForm}
    </ScrollView>
  );
}
