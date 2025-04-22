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
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome } from "@expo/vector-icons";
import { useUserPreferences } from "../context/UserPreferencesContext";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <StyledView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
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
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.sender === "user"
                    ? isDark
                      ? "bg-blue-600"
                      : "bg-blue-500"
                    : isDark
                    ? "bg-gray-800"
                    : "bg-white"
                }`}
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
              </StyledView>
            </StyledView>
          ))}
          {isLoading && (
            <StyledView className="items-start mb-4">
              <StyledView
                className={`rounded-lg px-4 py-2 ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
              >
                <ActivityIndicator
                  color={isDark ? "#9CA3AF" : "#4B5563"}
                  size="small"
                />
              </StyledView>
            </StyledView>
          )}
        </StyledScrollView>

        <StyledView
          className={`p-4 border-t ${
            isDark
              ? "bg-gray-900 border-gray-800"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <StyledView className="flex-row items-center">
            <StyledTextInput
              className={`flex-1 rounded-full px-4 py-2 mr-2 ${
                isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
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
              className={`rounded-full p-2 ${
                !inputText.trim() || isLoading
                  ? isDark
                    ? "bg-gray-800"
                    : "bg-gray-200"
                  : "bg-blue-500"
              }`}
            >
              <FontAwesome
                name="send"
                size={20}
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
      </StyledView>
    </KeyboardAvoidingView>
  );
}
