import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useColorScheme,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome5 } from "@expo/vector-icons";
import { useUserPreferences } from "../context/UserPreferencesContext";
import { LinearGradient } from "expo-linear-gradient";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: "0",
  text: "Hello! I'm your personal recipe assistant. I can help you find recipes, answer cooking questions, and provide culinary tips. What would you like to know?",
  sender: "bot",
  timestamp: new Date(),
};

export default function RecipeChatbot() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { preferences } = useUserPreferences();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // TODO: Replace with your actual API call to OpenAI or another AI service
      const response = await mockAIResponse(userMessage.text);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock AI response function - replace with actual API call
  const mockAIResponse = async (userInput: string): Promise<string> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple response logic based on user preferences and input
    const { dietaryPreferences, allergies } = preferences;

    if (userInput.toLowerCase().includes("recipe")) {
      return `Based on your preferences (${dietaryPreferences.join(
        ", "
      )}), here are some recipe suggestions...`;
    } else if (userInput.toLowerCase().includes("substitute")) {
      return "Here are some ingredient substitution options...";
    } else {
      return "I can help you find recipes, suggest ingredient substitutions, or answer cooking questions. What would you like to know?";
    }
  };

  // Format timestamp for messages
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <StyledSafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      {/* Header */}
      <LinearGradient
        colors={
          isDark
            ? ["#4F46E5", "#6366F1", "#818CF8"]
            : ["#6366F1", "#818CF8", "#A5B4FC"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-5 pt-4 pb-4"
      >
        <StyledView className="flex-row items-center">
          <FontAwesome5 name="robot" size={24} color="white" />
          <StyledView className="ml-3">
            <StyledText className="text-white font-bold text-lg">
              Recipe Assistant
            </StyledText>
            <StyledText className="text-white/70 text-xs">
              Ask me anything about recipes
            </StyledText>
          </StyledView>
        </StyledView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <StyledScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          {messages.map((message) => (
            <StyledView
              key={message.id}
              className={`mb-4 ${
                message.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <StyledView
                className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                  message.sender === "user"
                    ? isDark
                      ? "bg-indigo-600"
                      : "bg-indigo-500"
                    : isDark
                    ? "bg-gray-800"
                    : "bg-white"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <StyledText
                  className={`${
                    message.sender === "user"
                      ? "text-white"
                      : isDark
                      ? "text-gray-200"
                      : "text-gray-800"
                  }`}
                >
                  {message.text}
                </StyledText>
                <StyledText
                  className={`text-xs mt-1 ${
                    message.sender === "user"
                      ? "text-indigo-200"
                      : isDark
                      ? "text-gray-500"
                      : "text-gray-500"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </StyledText>
              </StyledView>
            </StyledView>
          ))}
          {isLoading && (
            <StyledView className="items-start mb-4">
              <StyledView
                className={`rounded-2xl px-4 py-3 ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <StyledView className="flex-row items-center">
                  <ActivityIndicator
                    color={isDark ? "#818CF8" : "#6366F1"}
                    size="small"
                  />
                  <StyledText
                    className={`ml-2 text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Thinking...
                  </StyledText>
                </StyledView>
              </StyledView>
            </StyledView>
          )}
        </StyledScrollView>

        <StyledView
          className={`p-4 border-t ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 10,
          }}
        >
          <StyledView className="flex-row items-center">
            <StyledTextInput
              className={`flex-1 rounded-full px-5 py-3 mr-2 ${
                isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"
              }`}
              placeholder="Ask me anything about recipes..."
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <StyledTouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              className={`rounded-full p-3.5 ${
                !inputText.trim() || isLoading
                  ? isDark
                    ? "bg-gray-700"
                    : "bg-gray-200"
                  : isDark
                  ? "bg-indigo-600"
                  : "bg-indigo-500"
              }`}
            >
              <FontAwesome5
                name="paper-plane"
                size={16}
                color={
                  !inputText.trim() || isLoading
                    ? isDark
                      ? "#6B7280"
                      : "#9CA3AF"
                    : "white"
                }
              />
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}
