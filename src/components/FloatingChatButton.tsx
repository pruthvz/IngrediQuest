import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  useColorScheme,
  Dimensions,
  Platform,
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome } from "@expo/vector-icons";
import RecipeChatbot from "./RecipeChatbot";
import { useAuth } from "../context/AuthContext";

const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);

const windowHeight = Dimensions.get("window").height;

export default function FloatingChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <StyledTouchableOpacity
        onPress={() => setIsChatOpen(true)}
        className="absolute bottom-20 right-4 z-50 rounded-full w-14 h-14 bg-blue-500 items-center justify-center"
        style={
          Platform.OS === "web"
            ? {
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }
            : {
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }
        }
      >
        <FontAwesome name="comment" size={24} color="white" />
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
                    boxShadow:
                      "0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }
                : {
                    height: windowHeight * 0.8,
                    elevation: 5,
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: -2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                  }
            }
          >
            <StyledView className="flex-row justify-between items-center p-4 border-b border-gray-200">
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
