/**
 * Register Component
 *
 * This component handles new user registration with both web and mobile interfaces.
 * It provides a comprehensive registration form with name, email, and password fields,
 * along with responsive design and theme support.
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

export default function Register() {
  // Platform-specific check to determine rendering mode
  const isWeb = Platform.OS === "web";

  // State management for form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Authentication context hooks for registration functionality and loading state
  const { register, isLoading, error } = useAuth();

  // Theme context for handling dark/light mode
  const { preferences } = useUserPreferences();
  const isDark = preferences.isDarkMode;

  /**
   * Handles the registration form submission
   * Validates all required fields and attempts to create a new user account
   * @returns {Promise<void>}
   */
  const handleRegister = async () => {
    // Validate form fields
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Attempt to register the user
    await register(name, email, password);
  };

  /**
   * Common form component shared between web and mobile views
   * Contains the registration form fields, validation, and submission button
   */
  const registerForm = (
    <>
      <StyledImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000",
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
            Join the Community
          </StyledText>
          <StyledText
            className={`text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Create an account to start your culinary journey
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
              Full Name
            </StyledText>
            <StyledTextInput
              className={`px-4 py-3.5 rounded-xl text-base ${
                isDark
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-gray-50 text-gray-900 border-gray-200"
              } border`}
              placeholder="Enter your full name"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={name}
              onChangeText={setName}
            />
          </StyledView>

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
              placeholder="Create a password"
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
          onPress={handleRegister}
          disabled={isLoading}
        >
          <StyledView className="flex-row justify-center items-center">
            {isLoading ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : null}
            <StyledText className="text-white text-center font-semibold text-lg">
              {isLoading ? "Creating account..." : "Create Account"}
            </StyledText>
          </StyledView>
        </StyledTouchableOpacity>

        <StyledView className="flex-row justify-center mt-8 mb-6">
          <StyledText
            className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Already have an account?{" "}
          </StyledText>
          <Link href="/login" asChild>
            <StyledTouchableOpacity>
              <StyledText
                className={`font-semibold ${
                  isDark ? "text-primary-400" : "text-primary-600"
                }`}
              >
                Sign in
              </StyledText>
            </StyledTouchableOpacity>
          </Link>
        </StyledView>
      </StyledView>
    </>
  );

  /**
   * Web-specific rendering with enhanced UI features
   * Provides a sophisticated layout with:
   * - Split-screen design
   * - Feature showcase
   * - Animated elements
   * - Responsive layout
   * - Dark/light mode support
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
          {/* Left side - Register form */}
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
                Join the Community
              </h1>
              <p
                style={{
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  fontSize: "0.875rem",
                  marginBottom: "2rem",
                }}
              >
                Create an account to start your culinary journey
              </p>
            </div>
            {error && (
              <div
                style={{
                  backgroundColor: "rgba(248, 113, 113, 0.1)",
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
                htmlFor="name"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: "#4B5563",
                }}
              >
                Full Name
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
                  <i className="fas fa-user"></i>
                </div>
                <input
                  type="text"
                  id="name"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    paddingLeft: "2.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #E5E7EB",
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease-in-out",
                    backgroundColor: "#FFFFFF",
                    color: "#1F2937",
                  }}
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
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
                    width: "100%",
                    padding: "0.75rem 1rem",
                    paddingLeft: "2.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #E5E7EB",
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease-in-out",
                    backgroundColor: "#FFFFFF",
                    color: "#1F2937",
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
                    width: "100%",
                    padding: "0.75rem 1rem",
                    paddingLeft: "2.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #E5E7EB",
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease-in-out",
                    backgroundColor: "#FFFFFF",
                    color: "#1F2937",
                  }}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "0.5rem",
                  fontSize: "0.75rem",
                  color: "#9CA3AF",
                }}
              >
                <i className="fas fa-info-circle"></i>
                <span style={{ marginLeft: "0.25rem" }}>
                  Password must be at least 8 characters
                </span>
              </div>
            </div>
            <button
              onClick={handleRegister}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)",
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
                  Creating account...
                </>
              ) : (
                <>Create Account</>
              )}
            </button>

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <p style={{ color: "#6B7280", fontSize: "0.875rem" }}>
                Already have an account?{" "}
                <a
                  href="/login"
                  style={{
                    color: "#4F46E5",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Sign in
                </a>
              </p>
            </div>
            <div style={{ marginTop: "auto", paddingTop: "2rem" }}>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#9CA3AF",
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
                <span style={{ fontSize: "1.75rem" }}>📖</span>
                Join our culinary community
              </h2>
              <p
                style={{
                  fontSize: "1rem",
                  opacity: 0.9,
                  marginBottom: "2.5rem",
                }}
              >
                Create an account to unlock personalized recipe recommendations
                and meal planning tools.
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
                src="https://images.unsplash.com/photo-1556911073-a517e752729c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Cooking Ingredients"
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
                  left: "1rem",
                  backgroundColor: "rgba(79, 70, 229, 0.9)",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ color: "white" }}>👥</span>
                <span style={{ fontWeight: "bold" }}>
                  Join 10,000+ food enthusiasts
                </span>
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
   * with touch-friendly input fields and appropriate spacing
   */
  return (
    <ScrollView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {registerForm}
    </ScrollView>
  );
}
