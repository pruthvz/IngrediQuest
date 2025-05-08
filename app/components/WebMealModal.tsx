import React, { useState } from "react";
import WebIcon from "./WebIcon";

// Define types for meal data
interface Meal {
  type: "breakfast" | "lunch" | "dinner";
  title: string;
  time: string;
  recipeId?: string;
}

// Props interface for the WebMealModal component
interface WebMealModalProps {
  visible: boolean; // Controls modal visibility
  onClose: () => void; // Function to close the modal
  onSave: (meal: Meal) => void; // Function to save meal data
  initialMeal?: Meal; // Optional initial meal data for editing
  isDark: boolean; // Dark mode flag
}

// WebMealModal component for adding/editing meals
export default function WebMealModal({
  visible,
  onClose,
  onSave,
  initialMeal,
  isDark,
}: WebMealModalProps) {
  // State management for form fields
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner">(
    initialMeal?.type || "breakfast"
  );
  const [title, setTitle] = useState(initialMeal?.title || "");
  const [time, setTime] = useState(initialMeal?.time || "");

  // Don't render if modal is not visible
  if (!visible) return null;

  // Handle click outside modal to close
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle save action
  const handleSave = () => {
    if (!title || !time) return;
    onSave({
      type: mealType,
      title,
      time,
      recipeId: initialMeal?.recipeId,
    });
    onClose();
  };

  return (
    // Modal overlay with backdrop blur
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "1rem",
        backdropFilter: "blur(4px)",
      }}
      onClick={handleOutsideClick}
    >
      {/* Modal container with responsive design */}
      <div
        className="modal-container"
        style={{
          backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "500px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 12px 28px rgba(0, 0, 0, 0.3)",
          border: isDark ? "1px solid #333" : "1px solid #e5e5e5",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: `1px solid ${isDark ? "#333" : "#e5e5e5"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 600,
              color: isDark ? "#f0f0f0" : "#111827",
            }}
          >
            {initialMeal ? "Edit Meal" : "Add New Meal"}
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: "0.375rem",
              color: isDark ? "#9ca3af" : "#6b7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WebIcon name="times" />
          </button>
        </div>

        {/* Form Content Area */}
        <div
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Meal Type Selection Buttons */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: isDark ? "#e5e7eb" : "#374151",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Meal Type
            </label>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
              }}
            >
              {/* Map through meal types to create selection buttons */}
              {(["breakfast", "lunch", "dinner"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setMealType(type)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    backgroundColor:
                      mealType === type
                        ? "#4F46E5"
                        : isDark
                        ? "#333"
                        : "#f3f4f6",
                    color:
                      mealType === type
                        ? "white"
                        : isDark
                        ? "#e5e7eb"
                        : "#374151",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  <WebIcon
                    name={
                      type === "breakfast"
                        ? "coffee"
                        : type === "lunch"
                        ? "utensils"
                        : "moon"
                    }
                  />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Title Input */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: isDark ? "#e5e7eb" : "#374151",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Meal Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter meal title"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: `1px solid ${isDark ? "#333" : "#e5e7eb"}`,
                backgroundColor: isDark ? "#111827" : "#ffffff",
                color: isDark ? "#e5e7eb" : "#111827",
                fontSize: "1rem",
              }}
            />
          </div>

          {/* Meal Time Input */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: isDark ? "#e5e7eb" : "#374151",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: `1px solid ${isDark ? "#333" : "#e5e7eb"}`,
                backgroundColor: isDark ? "#111827" : "#ffffff",
                color: isDark ? "#e5e7eb" : "#111827",
                fontSize: "1rem",
              }}
            />
          </div>
        </div>

        {/* Modal Footer with Action Buttons */}
        <div
          style={{
            padding: "1.5rem",
            borderTop: `1px solid ${isDark ? "#333" : "#e5e5e5"}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
          }}
        >
          {/* Cancel Button */}
          <button
            onClick={onClose}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              border: `1px solid ${isDark ? "#333" : "#e5e7eb"}`,
              backgroundColor: "transparent",
              color: isDark ? "#e5e7eb" : "#374151",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          {/* Save/Add Button */}
          <button
            onClick={handleSave}
            disabled={!title || !time}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: !title || !time ? "#6b7280" : "#4F46E5",
              color: "white",
              cursor: !title || !time ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            {initialMeal ? "Save Changes" : "Add Meal"}
          </button>
        </div>
      </div>
    </div>
  );
}
