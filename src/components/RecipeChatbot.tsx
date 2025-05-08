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
  const scrollViewRef = useRef<ScrollView | null>(null);
  const webScrollViewRef = useRef<HTMLDivElement | null>(null);
  const { preferences } = useUserPreferences();
  const colorScheme = useColorScheme();
  const isDark = preferences.isDarkMode;
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (isWeb && webScrollViewRef.current) {
      webScrollViewRef.current.scrollTop =
        webScrollViewRef.current.scrollHeight;
    } else if (scrollViewRef.current) {
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

  // Custom Web styling
  const webStyles: Record<string, any> = isWeb
    ? {
        container: {
          height: "100%",
          display: "flex",
          flexDirection: "column" as const,
          borderRadius: "16px",
          overflow: "hidden",
          margin: "50px",
        },
        header: {
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          borderBottom: isDark ? "1px solid #333" : "1px solid #e5e7eb",
          background: isDark
            ? "linear-gradient(135deg, #4338ca 0%, #6366f1 100%)"
            : "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)",
        },
        headerTitle: {
          fontWeight: "bold",
          fontSize: "18px",
          color: "white",
          marginLeft: "12px",
        },
        headerSubtitle: {
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.8)",
          marginLeft: "12px",
          marginTop: "2px",
        },
        scrollArea: {
          flex: 1,
          overflowY: "auto" as const,
          padding: "24px",
          backgroundColor: isDark ? "#121212" : "#f9fafb",
        },
        messageContainer: {
          marginBottom: "20px",
          maxWidth: "80%",
          animationName: "fadeIn",
          animationDuration: "0.3s",
          animationFillMode: "both",
        },
        userMessageContainer: {
          alignSelf: "flex-end",
          backgroundColor: isDark ? "#4f46e5" : "#4f46e5",
          color: "white",
          borderRadius: "16px 16px 0 16px",
          padding: "12px 16px",
          boxShadow: isDark
            ? "0 2px 8px rgba(0, 0, 0, 0.3)"
            : "0 2px 8px rgba(79, 70, 229, 0.2)",
          transform: "translateZ(0)", // Force GPU acceleration
          transition: "all 0.2s ease",
        },
        botMessageContainer: {
          alignSelf: "flex-start",
          backgroundColor: isDark ? "#27272a" : "white",
          color: isDark ? "#f9fafb" : "#111827",
          borderRadius: "16px 16px 16px 0",
          padding: "12px 16px",
          boxShadow: isDark
            ? "0 2px 8px rgba(0, 0, 0, 0.2)"
            : "0 2px 8px rgba(0, 0, 0, 0.05)",
          transform: "translateZ(0)", // Force GPU acceleration
          transition: "all 0.2s ease",
        },
        messageTimestamp: {
          fontSize: "11px",
          marginTop: "6px",
          textAlign: "right" as const,
          opacity: 0.7,
        },
        sectionTitle: {
          fontSize: "16px",
          fontWeight: "bold",
          marginBottom: "8px",
          color: isDark ? "#a5b4fc" : "#4f46e5",
          borderBottom: isDark ? "1px solid #3f3f46" : "1px solid #e5e7eb",
          paddingBottom: "6px",
        },
        sectionContent: {
          fontSize: "14px",
          marginBottom: "12px",
          lineHeight: 1.5,
        },
        listItem: {
          display: "flex",
          marginBottom: "6px",
          paddingLeft: "16px",
          position: "relative" as const,
          transition: "all 0.2s ease",
        },
        listItemBullet: {
          position: "absolute" as const,
          left: "0",
          top: "6px",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: isDark ? "#a5b4fc" : "#4f46e5",
        },
        loadingContainer: {
          alignSelf: "flex-start" as const,
          display: "flex",
          alignItems: "center",
          padding: "8px 16px",
          backgroundColor: isDark ? "#27272a" : "#e5e7eb",
          borderRadius: "16px",
          marginBottom: "20px",
          animationName: "pulse",
          animationDuration: "2s",
          animationIterationCount: "infinite",
        },
        inputContainer: {
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          borderTop: isDark ? "1px solid #333" : "1px solid #e5e7eb",
          backgroundColor: isDark ? "#1f1f23" : "white",
        },
        textInput: {
          flex: 1,
          padding: "12px 16px",
          borderRadius: "24px",
          border: isDark ? "1px solid #3f3f46" : "1px solid #e5e7eb",
          backgroundColor: isDark ? "#27272a" : "#f9fafb",
          color: isDark ? "white" : "#111827",
          fontSize: "14px",
          marginRight: "12px",
          outline: "none",
          transition: "all 0.2s ease",
        },
        sendButton: {
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "#4f46e5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
          transform: "translateZ(0)", // Force GPU acceleration
        },
        disabledSendButton: {
          backgroundColor: isDark ? "#3f3f46" : "#e5e7eb",
          cursor: "not-allowed",
        },
        highlight: {
          backgroundColor: isDark
            ? "rgba(79, 70, 229, 0.15)"
            : "rgba(79, 70, 229, 0.08)",
          padding: "2px 4px",
          borderRadius: "4px",
          color: isDark ? "#a5b4fc" : "#4f46e5",
          fontWeight: 500,
        },
      }
    : {};

  // Optimized rendering for web
  if (isWeb) {
    return (
      <div style={webStyles.container}>
        {/* Header */}
        <div style={webStyles.header}>
          <FontAwesome5 name="robot" size={24} color="white" />
          <div>
            <div style={webStyles.headerTitle}>Recipe Assistant</div>
            <div style={webStyles.headerSubtitle}>
              Ask me anything about cooking
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div style={webStyles.scrollArea} ref={webScrollViewRef}>
          {messages.map((message, msgIndex) => (
            <div
              key={message.id}
              style={{
                ...webStyles.messageContainer,
                alignSelf:
                  message.sender === "user" ? "flex-end" : "flex-start",
                marginLeft: message.sender === "user" ? "auto" : "0",
                animationDelay: `${msgIndex * 0.1}s`,
              }}
            >
              <div
                style={
                  message.sender === "user"
                    ? webStyles.userMessageContainer
                    : webStyles.botMessageContainer
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = isDark
                    ? "0 4px 12px rgba(0, 0, 0, 0.4)"
                    : "0 4px 12px rgba(79, 70, 229, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    message.sender === "user"
                      ? isDark
                        ? "0 2px 8px rgba(0, 0, 0, 0.3)"
                        : "0 2px 8px rgba(79, 70, 229, 0.2)"
                      : isDark
                      ? "0 2px 8px rgba(0, 0, 0, 0.2)"
                      : "0 2px 8px rgba(0, 0, 0, 0.05)";
                }}
              >
                {message.sender === "user" ? (
                  <div>{message.text}</div>
                ) : message.sections ? (
                  <div>
                    {message.sections.map((section, index) => (
                      <div key={index} style={{ marginBottom: "16px" }}>
                        {section.title && (
                          <div style={webStyles.sectionTitle}>
                            {section.title}
                          </div>
                        )}
                        {section.type === "list" ? (
                          section.content.split("\n").map((item, idx) => (
                            <div
                              key={idx}
                              style={webStyles.listItem}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.paddingLeft = "18px";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.paddingLeft = "16px";
                              }}
                            >
                              <div style={webStyles.listItemBullet}></div>
                              <div>{item.replace(/^-\s*/, "")}</div>
                            </div>
                          ))
                        ) : (
                          <div style={webStyles.sectionContent}>
                            {section.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>{message.text}</div>
                )}
                <div style={webStyles.messageTimestamp}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={webStyles.loadingContainer}>
              <div
                style={{ width: "16px", height: "16px", marginRight: "8px" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    animation: "spin 1s linear infinite",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke={isDark ? "#a5b4fc" : "#4f46e5"}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="62.83"
                    strokeDashoffset="31.42"
                  />
                </svg>
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: isDark ? "#d4d4d8" : "#6b7280",
                }}
              >
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={webStyles.inputContainer}>
          <input
            type="text"
            style={webStyles.textInput}
            placeholder="Ask me anything about recipes..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <div
            onClick={!inputText.trim() || isLoading ? undefined : handleSend}
            style={{
              ...webStyles.sendButton,
              ...((!inputText.trim() || isLoading) &&
                webStyles.disabledSendButton),
            }}
            onMouseEnter={(e) => {
              if (inputText.trim() && !isLoading) {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.backgroundColor = "#4338ca";
              }
            }}
            onMouseLeave={(e) => {
              if (inputText.trim() && !isLoading) {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "#4f46e5";
              }
            }}
          >
            <FontAwesome5
              name="paper-plane"
              size={16}
              color={
                !inputText.trim() || isLoading
                  ? isDark
                    ? "#71717a"
                    : "#9ca3af"
                  : "white"
              }
            />
          </div>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
          }
          input:focus {
            border-color: #4f46e5 !important;
            outline: none !important;
            box-shadow: 0 0 0 2px ${
              isDark ? "rgba(165, 180, 252, 0.3)" : "rgba(79, 70, 229, 0.2)"
            };
          }
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: ${isDark ? "#27272a" : "#f1f1f1"};
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb {
            background: ${isDark ? "#4b5563" : "#c7c7c7"};
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: ${isDark ? "#6b7280" : "#a3a3a3"};
          }
        `}</style>
      </div>
    );
  }

  // Original mobile rendering
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
