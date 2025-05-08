import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  Platform,
  Dimensions,
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome } from "@expo/vector-icons";
import RecipeChatbot from "./RecipeChatbot";
import { useAuth } from "../context/AuthContext";
import { useUserPreferences } from "../context/UserPreferencesContext";

const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);

const windowHeight = Dimensions.get("window").height;

export default function FloatingChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { preferences } = useUserPreferences();
  const isDark = preferences.isDarkMode;

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <StyledTouchableOpacity
        onPress={() => setIsChatOpen(true)}
        className="absolute bottom-24 right-6 z-50 rounded-full w-16 h-16 bg-indigo-600 items-center justify-center shadow-lg"
        style={
          Platform.OS === "web"
            ? {
                boxShadow: isDark
                  ? "0 4px 12px rgba(79, 70, 229, 0.4)"
                  : "0 4px 12px rgba(99, 102, 241, 0.3)",
              }
            : {
                elevation: 8,
                shadowColor: isDark ? "#4F46E5" : "#6366F1",
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
              }
        }
      >
        <FontAwesome name="comment" size={28} color="white" />
      </StyledTouchableOpacity>

      <Modal
        visible={isChatOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsChatOpen(false)}
      >
        <StyledView className="flex-1 bg-black/50">
          <StyledView
            className={`absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden ${
              isDark ? "bg-gray-900" : "bg-gray-50"
            }`}
            style={
              Platform.OS === "web"
                ? {
                    height: windowHeight * 0.8,
                    boxShadow: isDark
                      ? "0 -4px 12px rgba(0, 0, 0, 0.3)"
                      : "0 -4px 12px rgba(0, 0, 0, 0.1)",
                  }
                : {
                    height: windowHeight * 0.8,
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: -4,
                    },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 4.65,
                  }
            }
          >
            <StyledView
              className={`flex-row justify-between items-center p-4 border-b ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <StyledTouchableOpacity
                onPress={() => setIsChatOpen(false)}
                className="p-2"
              >
                <FontAwesome
                  name="times"
                  size={24}
                  color={isDark ? "#9CA3AF" : "#4B5563"}
                />
              </StyledTouchableOpacity>
            </StyledView>
            <StyledView className="flex-1">
              <RecipeChatbot />
            </StyledView>
          </StyledView>
        </StyledView>
      </Modal>
    </>
  );
}
