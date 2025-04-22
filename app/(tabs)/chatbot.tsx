import React from "react";
import { View, useColorScheme } from "react-native";
import { styled } from "nativewind";
import RecipeChatbot from "../../src/components/RecipeChatbot";

const StyledView = styled(View);

export default function ChatbotScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <StyledView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <RecipeChatbot />
    </StyledView>
  );
}
