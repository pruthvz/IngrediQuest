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
  Image,
} from "react-native";
import { styled } from "nativewind";
import { Link } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { FontAwesome } from "@expo/vector-icons";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    await login(email, password);
  };

  return (
    <ScrollView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Image Grid */}
      <StyledView className="flex-row flex-wrap h-48">
        <Image
          source={{
            uri: "https://source.unsplash.com/featured/?food,cooking,1",
          }}
          className="w-1/3 h-full"
        />
        <Image
          source={{
            uri: "https://source.unsplash.com/featured/?food,cooking,2",
          }}
          className="w-1/3 h-full"
        />
        <Image
          source={{
            uri: "https://source.unsplash.com/featured/?food,cooking,3",
          }}
          className="w-1/3 h-full"
        />
      </StyledView>

      <StyledView className="p-8">
        <StyledView className="mb-8">
          <StyledText
            className={`text-3xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Elevate your home cooking
          </StyledText>
          <StyledText
            className={`text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            with our expertly curated recipes!
          </StyledText>
        </StyledView>

        {error && (
          <StyledView className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <StyledText className="text-red-600">{error}</StyledText>
          </StyledView>
        )}

        <StyledView className="space-y-4">
          <StyledTextInput
            className={`px-4 py-3 rounded-xl text-base ${
              isDark
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-gray-50 text-gray-900 border-gray-200"
            } border`}
            placeholder="Email"
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <StyledTextInput
            className={`px-4 py-3 rounded-xl text-base ${
              isDark
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-gray-50 text-gray-900 border-gray-200"
            } border`}
            placeholder="Password"
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </StyledView>

        <StyledTouchableOpacity
          className={`mt-6 p-4 rounded-xl bg-black ${
            isLoading ? "opacity-50" : ""
          }`}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <StyledView className="flex-row justify-center items-center">
            {isLoading ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : null}
            <StyledText className="text-white text-center font-semibold text-lg">
              {isLoading ? "Signing in..." : "Sign in with email"}
            </StyledText>
          </StyledView>
        </StyledTouchableOpacity>

        <StyledView className="mt-6 space-y-4">
          <StyledTouchableOpacity className="p-4 rounded-xl border border-gray-200 flex-row justify-center items-center">
            <FontAwesome
              name="google"
              size={20}
              color="#DB4437"
              className="mr-2"
            />
            <StyledText className="text-center font-semibold text-lg ml-2">
              Sign in with Google
            </StyledText>
          </StyledTouchableOpacity>

          <StyledTouchableOpacity className="p-4 rounded-xl border border-gray-200 flex-row justify-center items-center">
            <FontAwesome
              name="apple"
              size={20}
              color="#000000"
              className="mr-2"
            />
            <StyledText className="text-center font-semibold text-lg ml-2">
              Sign in with Apple
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>

        <StyledView className="flex-row justify-center mt-6">
          <StyledText
            className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Don't have an account?{" "}
          </StyledText>
          <Link href="/register" asChild>
            <StyledTouchableOpacity>
              <StyledText className="font-semibold text-black">
                Sign up
              </StyledText>
            </StyledTouchableOpacity>
          </Link>
        </StyledView>
      </StyledView>
    </ScrollView>
  );
}
