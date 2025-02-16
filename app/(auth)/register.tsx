import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from "react-native";
import { styled } from "nativewind";
import { Link } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { register } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleRegister = async () => {
    try {
      await register(name, email, password);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <ScrollView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <StyledView className="flex-1 p-6 justify-center">
        <StyledView className="mb-8">
          <StyledText
            className={`text-4xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Create Account
          </StyledText>
          <StyledText
            className={`text-base ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Sign up to get started with all features
          </StyledText>
        </StyledView>

        <StyledView className="space-y-4">
          <StyledView>
            <StyledText
              className={`text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Name
            </StyledText>
            <StyledTextInput
              className={`px-4 py-3 rounded-lg ${
                isDark
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              } border`}
              placeholder="Enter your name"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={name}
              onChangeText={setName}
            />
          </StyledView>

          <StyledView>
            <StyledText
              className={`text-sm font-medium mb-2 ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Email
            </StyledText>
            <StyledTextInput
              className={`px-4 py-3 rounded-lg ${
                isDark
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
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
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Password
            </StyledText>
            <StyledTextInput
              className={`px-4 py-3 rounded-lg ${
                isDark
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              } border`}
              placeholder="Create a password"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </StyledView>

          <StyledTouchableOpacity
            className="bg-primary-600 rounded-lg py-3 mt-6"
            onPress={handleRegister}
          >
            <StyledText className="text-white text-center font-semibold text-lg">
              Sign Up
            </StyledText>
          </StyledTouchableOpacity>

          <StyledView className="flex-row justify-center mt-4">
            <StyledText
              className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              Already have an account?{" "}
            </StyledText>
            <Link href="/login" asChild>
              <StyledTouchableOpacity>
                <StyledText className="text-primary-500 font-semibold">
                  Sign In
                </StyledText>
              </StyledTouchableOpacity>
            </Link>
          </StyledView>
        </StyledView>
      </StyledView>
    </ScrollView>
  );
}
