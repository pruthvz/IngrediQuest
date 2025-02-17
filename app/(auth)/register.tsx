import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { styled } from "nativewind";
import { Link } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImageBackground = styled(ImageBackground);

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, isLoading, error } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    await register(name, email, password);
  };

  return (
    <ScrollView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}
      contentContainerStyle={{ flexGrow: 1 }}
    >
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

        <StyledView className="mt-8">
          <StyledView className="flex-row items-center mb-4">
            <StyledView className="flex-1 h-[1px] bg-gray-300" />
            <StyledText
              className={`mx-4 text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              or sign up with
            </StyledText>
            <StyledView className="flex-1 h-[1px] bg-gray-300" />
          </StyledView>

          <StyledView className="flex-row space-x-4">
            <StyledTouchableOpacity
              className={`flex-1 p-3 rounded-xl ${
                isDark ? "bg-gray-800" : "bg-gray-100"
              } flex-row justify-center items-center`}
            >
              <FontAwesome name="google" size={20} color="#DB4437" />
              <StyledText
                className={`ml-2 font-medium ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Google
              </StyledText>
            </StyledTouchableOpacity>

            <StyledTouchableOpacity
              className={`flex-1 p-3 rounded-xl ${
                isDark ? "bg-gray-800" : "bg-gray-100"
              } flex-row justify-center items-center`}
            >
              <FontAwesome
                name="apple"
                size={20}
                color={isDark ? "#FFFFFF" : "#000000"}
              />
              <StyledText
                className={`ml-2 font-medium ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Apple
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>

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
    </ScrollView>
  );
}
