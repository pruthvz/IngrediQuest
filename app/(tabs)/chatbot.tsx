import React from "react";
import { View, useColorScheme, Platform } from "react-native";
import { styled } from "nativewind";
import RecipeChatbot from "../../src/components/RecipeChatbot";
import WebLayout from "../components/WebLayout";
import WebIcon from "../components/WebIcon";
import { useUserPreferences } from "../../src/context/UserPreferencesContext";

const StyledView = styled(View);

// separate chatbot page for web and mobile, the working chatbot is the modal.

export default function ChatbotScreen() {
  const { preferences } = useUserPreferences();
  const isDark = preferences.isDarkMode;

  if (Platform.OS === "web") {
    return (
      <WebLayout title="AI Assistant" currentTab="chatbot">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 12rem)",
            maxHeight: "800px",
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            borderRadius: "0.75rem",
            overflow: "hidden",
            border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
            boxShadow: isDark
              ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
              : "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              padding: "1rem",
              backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
              borderBottom: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: isDark ? "#F9FAFB" : "#111827",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <WebIcon name="robot" color="#4F46E5" />
              Recipe AI Assistant
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: isDark ? "#9CA3AF" : "#6B7280",
                marginTop: "0.25rem",
              }}
            >
              Ask me anything about recipes, ingredients, or cooking techniques
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              overflow: "hidden",
            }}
          >
            {/* Custom Web Chatbot UI */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
              id="chat-messages"
            >
              {/* Initial bot message */}
              <div
                style={{
                  alignSelf: "flex-start",
                  maxWidth: "80%",
                  backgroundColor: isDark ? "#1F2937" : "#F3F4F6",
                  padding: "1rem",
                  borderRadius: "1rem",
                  borderTopLeftRadius: "0.25rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "2rem",
                      height: "2rem",
                      borderRadius: "9999px",
                      backgroundColor: "#4F46E5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <WebIcon name="robot" size={12} />
                  </div>
                  <span
                    style={{
                      fontWeight: 600,
                      color: isDark ? "#E5E7EB" : "#4B5563",
                    }}
                  >
                    AI Assistant
                  </span>
                </div>
                <p
                  style={{
                    color: isDark ? "#E5E7EB" : "#4B5563",
                    lineHeight: "1.5",
                  }}
                >
                  Hello! I'm your personal recipe assistant. I can help you find
                  recipes, answer cooking questions, and provide culinary tips.
                  What would you like to know?
                </p>
              </div>
            </div>

            {/* Chat input */}
            <div
              style={{
                padding: "1rem",
                borderTop: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                }}
              >
                <input
                  type="text"
                  placeholder="Ask me anything about recipes..."
                  style={{
                    flex: 1,
                    padding: "0.75rem 1rem",
                    borderRadius: "9999px",
                    border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                    backgroundColor: isDark ? "#111827" : "#FFFFFF",
                    color: isDark ? "#F9FAFB" : "#111827",
                    outline: "none",
                  }}
                />
                <button
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "9999px",
                    backgroundColor: "#4F46E5",
                    color: "white",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <WebIcon name="paper-plane" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </WebLayout>
    );
  }

  return (
    <StyledView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <RecipeChatbot />
    </StyledView>
  );
}
