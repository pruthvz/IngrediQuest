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
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../config/env";
import OpenAI from "openai";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

// Initialize AI clients
const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

// Initialize OpenAI client only if API key is available
let openai: OpenAI | null = null;
if (ENV.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: ENV.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  sections?: {
    title?: string;
    content: string;
    type?: "normal" | "list" | "highlight";
  }[];
}

const INITIAL_MESSAGE: Message = {
  id: "0",
  text: "Hello! I'm your personal recipe assistant. I can help you find recipes, answer cooking questions, and provide culinary tips. What would you like to know?",
  sender: "bot",
  timestamp: new Date(),
};

// Get AI response using Gemini with OpenAI fallback
const getAIResponse = async (
  userInput: string,
  preferences: any
): Promise<string> => {
  const prompt = createPrompt(userInput, preferences);

  try {
    // Try Gemini first
    return await getGeminiResponse(prompt);
  } catch (geminiError: any) {
    console.warn("Gemini API error:", geminiError);

    // If Gemini fails and OpenAI key is available, try OpenAI
    if (ENV.OPENAI_API_KEY) {
      try {
        return await getOpenAIResponse(prompt);
      } catch (openaiError) {
        console.error("OpenAI API error:", openaiError);
        return generateFallbackResponse(userInput, preferences);
      }
    }

    // If no OpenAI key or OpenAI fails, use fallback
    return generateFallbackResponse(userInput, preferences);
  }
};

// Create a consistent prompt format for both AI providers
const createPrompt = (userInput: string, preferences: any): string => {
  const {
    dietaryPreferences,
    cuisinePreferences,
    cookingSkillLevel,
    allergies,
    restrictions,
  } = preferences;

  return (
    `As a culinary expert, please help with this request: ${userInput}\n\n` +
    `Consider these user preferences:\n` +
    `- Dietary preferences: ${
      dietaryPreferences.length ? dietaryPreferences.join(", ") : "None"
    }\n` +
    `- Allergies: ${allergies.length ? allergies.join(", ") : "None"}\n` +
    `- Dietary restrictions: ${
      restrictions.length ? restrictions.join(", ") : "None"
    }\n` +
    `- Preferred cuisines: ${
      cuisinePreferences.length ? cuisinePreferences.join(", ") : "Any"
    }\n` +
    `- Cooking skill level: ${cookingSkillLevel}\n\n` +
    `Please structure your response using these markers:\n` +
    `[TITLE] for main sections\n` +
    `[LIST] for bullet points\n` +
    `[END] to end sections\n\n` +
    `Make your response engaging, well-structured, and personalized to the user's preferences.`
  );
};

// Get response from Gemini
const getGeminiResponse = async (prompt: string): Promise<string> => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro-002",
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return formatAIResponse(text);
};

// Get response from OpenAI
const getOpenAIResponse = async (prompt: string): Promise<string> => {
  if (!openai) {
    throw new Error("OpenAI client not initialized - API key missing");
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful culinary expert assistant. Format your responses using [TITLE], [LIST], and [END] markers for sections and lists.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const text = completion.choices[0]?.message?.content || "";
  return formatAIResponse(text);
};

// Format AI response consistently
const formatAIResponse = (text: string): string => {
  const sections = [];
  const parts = text.split(/\[TITLE\]|\[LIST\]/);

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const content = part.split("[END]")[0].trim();

    if (text.includes(`[LIST]${part}`)) {
      sections.push({
        content: content,
        type: "list",
      });
    } else {
      sections.push({
        title: content,
        content: "",
        type: "normal",
      });
    }
  }

  return JSON.stringify({ text, sections });
};

// Generate a fallback response when API is unavailable
const generateFallbackResponse = (
  userInput: string,
  userPreferences: any
): string => {
  const lowerCaseInput = userInput.toLowerCase();
  let responseText = "";
  let sections = [];

  // Check for common recipe questions
  if (
    lowerCaseInput.includes("recipe") ||
    lowerCaseInput.includes("how to make") ||
    lowerCaseInput.includes("cook")
  ) {
    responseText =
      "I'm currently experiencing high demand and can't generate a personalized recipe right now. Here are some general cooking tips instead:";

    sections = [
      {
        title: "Cooking Tips",
        content: "",
        type: "normal",
      },
      {
        content:
          "- Always read the entire recipe before starting\n- Prep and measure ingredients before cooking (mise en place)\n- Taste and adjust seasoning as you cook\n- Let meat rest after cooking\n- Don't overcrowd the pan when sautéing",
        type: "list",
      },
      {
        title: "Try Again Later",
        content:
          "Please try again in a few minutes when our service might be less busy.",
        type: "normal",
      },
    ];
  }
  // Check for ingredient questions
  else if (
    lowerCaseInput.includes("ingredient") ||
    lowerCaseInput.includes("substitute")
  ) {
    responseText =
      "I'm currently experiencing high demand and can't provide personalized ingredient advice right now. Here are some common substitutions:";

    sections = [
      {
        title: "Common Ingredient Substitutions",
        content: "",
        type: "normal",
      },
      {
        content:
          "- Buttermilk: 1 cup milk + 1 tbsp lemon juice\n- Sour cream: Greek yogurt\n- Wine: Stock + vinegar\n- Fresh herbs: 1/3 amount dried herbs\n- Butter: Applesauce (in baking) or olive oil",
        type: "list",
      },
      {
        title: "Try Again Later",
        content:
          "Please try again in a few minutes when our service might be less busy.",
        type: "normal",
      },
    ];
  }
  // Default response for other questions
  else {
    responseText =
      "I'm currently experiencing high demand and can't provide a detailed response right now. Here's some general information that might help:";

    sections = [
      {
        title: "General Cooking Advice",
        content:
          "The key to becoming a better cook is practice, experimentation, and learning basic techniques rather than just following recipes.",
        type: "normal",
      },
      {
        title: "Try Again Later",
        content:
          "Please try again in a few minutes when our service might be less busy.",
        type: "normal",
      },
    ];
  }

  return JSON.stringify({ text: responseText, sections });
};

// Format timestamp for messages
const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function RecipeChatbot() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { preferences } = useUserPreferences();
  const colorScheme = useColorScheme();
  const isDark = preferences.isDarkMode;

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
      const response = await getAIResponse(userMessage.text, preferences);
      const parsedResponse = JSON.parse(response);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: parsedResponse.text,
        sender: "bot",
        timestamp: new Date(),
        sections: parsedResponse.sections,
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
                {message.sender === "user" ? (
                  <StyledText className="text-white">{message.text}</StyledText>
                ) : message.sections ? (
                  <StyledView>
                    {message.sections.map((section, index) => (
                      <StyledView key={index} className="mb-3">
                        {section.title && (
                          <StyledText
                            className={`text-lg font-bold mb-2 ${
                              isDark ? "text-indigo-300" : "text-indigo-600"
                            }`}
                          >
                            {section.title}
                          </StyledText>
                        )}
                        {section.type === "list" ? (
                          section.content.split("\n").map((item, idx) => (
                            <StyledView key={idx} className="flex-row mb-1">
                              <StyledText
                                className={`${
                                  isDark ? "text-gray-200" : "text-gray-800"
                                }`}
                              >
                                {item}
                              </StyledText>
                            </StyledView>
                          ))
                        ) : (
                          <StyledText
                            className={`${
                              isDark ? "text-gray-200" : "text-gray-800"
                            }`}
                          >
                            {section.content}
                          </StyledText>
                        )}
                      </StyledView>
                    ))}
                  </StyledView>
                ) : (
                  <StyledText
                    className={`${isDark ? "text-gray-200" : "text-gray-800"}`}
                  >
                    {message.text}
                  </StyledText>
                )}
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
