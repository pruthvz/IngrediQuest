// this component creates a floating chat button that appears in the bottom right corner
// it shows a tooltip on hover and takes you to the chatbot page when clicked

import React, { useState } from "react";
import { useRouter } from "expo-router";
import WebIcon from "./WebIcon";

// props for the button component
interface FloatingChatButtonProps {
  isDark?: boolean;
}

export default function FloatingChatButton({
  isDark = false,
}: FloatingChatButtonProps) {
  // track if user is hovering over the button
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // navigate to chatbot page when clicked
  const handleChatClick = () => {
    router.push("/chatbot");
  };

  return (
    // wrapper div that positions the button
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      {/* the actual chat button */}
      <button
        onClick={handleChatClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "9999px",
          backgroundColor: "#4F46E5",
          color: "white",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
          transition: "all 0.2s ease-in-out",
          transform: isHovered
            ? "translateY(-2px) scale(1.05)"
            : "translateY(0) scale(1)",
          pointerEvents: "auto",
        }}
      >
        <WebIcon name="comment-dots" size={20} />
      </button>

      {/* tooltip that shows on hover */}
      <div
        style={{
          marginBottom: "1rem",
          transform: `translateY(${isHovered ? "0" : "10px"}) scale(${
            isHovered ? "1" : "0.95"
          })`,
          opacity: isHovered ? 1 : 0,
          transition: "all 0.2s ease-in-out",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            backgroundColor: isDark ? "#1F2937" : "white",
            color: isDark ? "#F9FAFB" : "#111827",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            boxShadow: isDark
              ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
              : "0 2px 8px rgba(0, 0, 0, 0.15)",
            whiteSpace: "nowrap",
            fontWeight: 500,
          }}
        >
          Ask AI Assistant
        </div>
      </div>
    </div>
  );
}
