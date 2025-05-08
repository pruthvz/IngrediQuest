import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  Platform,
  Dimensions,
  Text,
  StyleSheet,
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome } from "@expo/vector-icons";
import RecipeChatbot from "./RecipeChatbot";
import { useAuth } from "../context/AuthContext";
import { useUserPreferences } from "../context/UserPreferencesContext";

const StyledView = styled(View);
const StyledText = styled(Text);

const windowHeight = Dimensions.get("window").height;

export default function FloatingChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated } = useAuth();
  const { preferences } = useUserPreferences();
  const isDark = preferences.isDarkMode;

  if (!isAuthenticated) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 32,
      right: 32,
      zIndex: 50,
    },
    button: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: isDark ? "#4F46E5" : "#6366F1",
      alignItems: "center",
      justifyContent: "center",
      ...(Platform.OS === "web"
        ? {
            cursor: "pointer",
            transform: isHovered
              ? "translateY(-2px) scale(1.05)"
              : "translateY(0) scale(1)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: isDark
              ? "0 4px 20px rgba(79, 70, 229, 0.4), 0 0 0 2px rgba(79, 70, 229, 0.2)"
              : "0 4px 20px rgba(99, 102, 241, 0.3), 0 0 0 2px rgba(99, 102, 241, 0.1)",
          }
        : {
            elevation: 8,
            shadowColor: isDark ? "#4F46E5" : "#6366F1",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
          }),
    },
    iconContainer: {
      alignItems: "center",
      justifyContent: "center",
      ...(Platform.OS === "web"
        ? {
            transform: isHovered ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.2s ease",
          }
        : {}),
    },
    tooltip:
      Platform.OS === "web"
        ? {
            position: "absolute",
            bottom: 70,
            right: 0,
            backgroundColor: isDark ? "#1F2937" : "white",
            padding: 12,
            borderRadius: 12,
            boxShadow: isDark
              ? "0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)"
              : "0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            transform: isHovered
              ? "translateY(0) scale(1)"
              : "translateY(10px) scale(0.95)",
            opacity: isHovered ? 1 : 0,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            pointerEvents: "none",
          }
        : {},
    tooltipText: {
      color: isDark ? "#F9FAFB" : "#111827",
      fontSize: 15,
      fontWeight: "500",
    },
    modalOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      ...(Platform.OS === "web"
        ? {
            backdropFilter: "blur(4px)",
          }
        : {}),
    },
    modalContent: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: isDark ? "#111827" : "#ffffff",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: "hidden",
      height: windowHeight * 0.8,
      ...(Platform.OS === "web"
        ? {
            boxShadow: isDark
              ? "0 -4px 20px rgba(0, 0, 0, 0.4)"
              : "0 -4px 20px rgba(0, 0, 0, 0.1)",
          }
        : {
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 4.65,
          }),
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#374151" : "#E5E7EB",
      backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
    },
    headerTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    headerText: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#F9FAFB" : "#111827",
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      ...(Platform.OS === "web"
        ? {
            cursor: "pointer",
            transition: "all 0.2s ease",
            ":hover": {
              backgroundColor: isDark ? "#374151" : "#F3F4F6",
            },
          }
        : {}),
    },
    chatbotContainer: {
      height: windowHeight * 0.8 - 72, // Subtract header height
    },
  });

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => setIsChatOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={styles.button}
        >
          <View style={styles.iconContainer}>
            <FontAwesome name="comment" size={24} color="white" />
          </View>
        </TouchableOpacity>
        {Platform.OS === "web" && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>Ask AI Assistant</Text>
          </View>
        )}
      </View>

      <Modal
        visible={isChatOpen}
        animationType="none"
        transparent={true}
        onRequestClose={() => setIsChatOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.headerTitle}>
                <FontAwesome
                  name="comments"
                  size={20}
                  color={isDark ? "#A5B4FC" : "#6366F1"}
                />
                <Text style={styles.headerText}>AI Assistant</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsChatOpen(false)}
                style={styles.closeButton}
              >
                <FontAwesome
                  name="times"
                  size={20}
                  color={isDark ? "#9CA3AF" : "#4B5563"}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.chatbotContainer}>
              <RecipeChatbot />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
