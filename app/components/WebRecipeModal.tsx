import React from "react";
import WebIcon from "./WebIcon";

// Type definitions for recipe data structures
interface Ingredient {
  id: number;
  originalName: string;
  amount: number;
  unit: string;
}

interface Step {
  number: number;
  step: string;
  ingredients: { name: string }[];
}

interface RecipeDetail {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  extendedIngredients: Ingredient[];
  analyzedInstructions: {
    steps: Step[];
  }[];
}

// Props interface for WebRecipeModal component
interface WebRecipeModalProps {
  recipe: RecipeDetail | null; // Recipe data to display
  visible: boolean; // Controls modal visibility
  onClose: () => void; // Function to close the modal
  isSaved?: boolean; // Flag indicating if recipe is saved
  onSaveToggle?: () => void; // Function to toggle save state
  onAddToShoppingList?: () => void; // Function to add ingredients to shopping list
}

// WebRecipeModal component for displaying detailed recipe information
export default function WebRecipeModal({
  recipe,
  visible,
  onClose,
  isSaved = false,
  onSaveToggle,
  onAddToShoppingList,
}: WebRecipeModalProps) {
  // Don't render if modal is not visible or no recipe data
  if (!visible || !recipe) return null;

  // Extract recipe data
  const ingredients = recipe.extendedIngredients || [];
  const steps = recipe.analyzedInstructions?.[0]?.steps || [];
  const hasTags = recipe.dishTypes?.length > 0 || recipe.diets?.length > 0;

  // Handle click outside modal to close
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Get system dark mode preference
  const prefersDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const isDark = prefersDarkMode;

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
      {/* Modal container */}
      <div
        className="modal-container"
        style={{
          backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "900px",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 12px 28px rgba(0, 0, 0, 0.3)",
          border: isDark ? "1px solid #333" : "1px solid #e5e5e5",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Recipe Header with Image */}
        <div style={{ position: "relative" }}>
          <div style={{ height: "250px", overflow: "hidden" }}>
            <img
              src={recipe.image}
              alt={recipe.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
            {/* Gradient overlay for better text visibility */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8) 100%)",
              }}
            />
          </div>

          {/* Action buttons (close and save) */}
          <div
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              display: "flex",
              gap: "8px",
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                backdropFilter: "blur(4px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <WebIcon name="times" size={18} />
            </button>

            {/* Save button */}
            {onSaveToggle && (
              <button
                onClick={onSaveToggle}
                style={{
                  backgroundColor: isSaved
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(79, 70, 229, 0.9)",
                  color: isSaved ? (isDark ? "#1a1a1a" : "#333") : "white",
                  border: "none",
                  borderRadius: "20px",
                  padding: "0 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  backdropFilter: "blur(4px)",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <WebIcon
                  name={isSaved ? "bookmark-solid" : "bookmark"}
                  size={16}
                />
                {isSaved ? "Saved" : "Save"}
              </button>
            )}
          </div>

          {/* Recipe title and metadata */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "24px",
              color: "white",
            }}
          >
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 700,
                marginBottom: "8px",
                lineHeight: 1.2,
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {recipe.title}
            </h2>

            {/* Recipe metadata (cuisine, time, servings) */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {recipe.cuisines?.length > 0 && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <WebIcon
                    name="globe"
                    size={14}
                    color="rgba(255,255,255,0.8)"
                  />
                  <span style={{ fontSize: "14px", opacity: 0.9 }}>
                    {recipe.cuisines.join(", ")}
                  </span>
                </div>
              )}

              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <WebIcon name="clock" size={14} color="rgba(255,255,255,0.8)" />
                <span style={{ fontSize: "14px", opacity: 0.9 }}>
                  {recipe.readyInMinutes} min
                </span>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <WebIcon name="users" size={14} color="rgba(255,255,255,0.8)" />
                <span style={{ fontSize: "14px", opacity: 0.9 }}>
                  {recipe.servings}{" "}
                  {recipe.servings === 1 ? "serving" : "servings"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe content area */}
        <div
          style={{
            flex: 1,
            padding: "24px",
            overflowY: "auto",
            color: isDark ? "#f0f0f0" : "#333",
          }}
        >
          {/* Recipe tags section */}
          {hasTags && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {/* Dish type tags */}
                {recipe.dishTypes?.map((type) => (
                  <span
                    key={`dish-${type}`}
                    style={{
                      padding: "4px 12px",
                      backgroundColor: isDark
                        ? "rgba(79, 70, 229, 0.2)"
                        : "rgba(79, 70, 229, 0.1)",
                      color: isDark ? "#a5b4fc" : "#4f46e5",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <WebIcon name="utensils" size={12} />
                    {type}
                  </span>
                ))}
                {/* Diet tags */}
                {recipe.diets?.map((diet) => (
                  <span
                    key={`diet-${diet}`}
                    style={{
                      padding: "4px 12px",
                      backgroundColor: isDark
                        ? "rgba(16, 185, 129, 0.2)"
                        : "rgba(16, 185, 129, 0.1)",
                      color: isDark ? "#6ee7b7" : "#059669",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <WebIcon name="leaf" size={12} />
                    {diet}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients section */}
          <div style={{ marginBottom: "32px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <WebIcon
                  name="ingredients"
                  color={isDark ? "#a5b4fc" : "#4f46e5"}
                />
                Ingredients
              </h3>
              <span
                style={{
                  fontSize: "14px",
                  color: isDark ? "#a1a1aa" : "#6b7280",
                }}
              >
                {ingredients.length} items
              </span>
            </div>

            {/* Ingredients grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              {ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    padding: "12px",
                    backgroundColor: isDark ? "#252525" : "#f8f8f8",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = isDark
                      ? "0 4px 6px rgba(0,0,0,0.2)"
                      : "0 4px 6px rgba(0,0,0,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "4px",
                      backgroundColor: isDark ? "#4f46e5" : "#e0e7ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <WebIcon
                      name="check"
                      size={10}
                      color={isDark ? "#fff" : "#4f46e5"}
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {ingredient.originalName}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: isDark ? "#a1a1aa" : "#6b7280",
                      }}
                    >
                      {ingredient.amount} {ingredient.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add to shopping list button */}
            {onAddToShoppingList && (
              <button
                onClick={onAddToShoppingList}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  backgroundColor: isDark ? "#4f46e5" : "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 500,
                  cursor: "pointer",
                  width: "100%",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? "#6366f1"
                    : "#4338ca";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#4f46e5";
                }}
              >
                <WebIcon name="cart-plus" size={16} />
                Add All to Shopping List
              </button>
            )}
          </div>

          {/* Instructions section */}
          <div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <WebIcon
                name="instructions"
                color={isDark ? "#a5b4fc" : "#4f46e5"}
              />
              Cooking Instructions
            </h3>

            {/* Steps list */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {steps.map((step) => (
                <div
                  key={step.number}
                  style={{
                    display: "flex",
                    gap: "16px",
                    padding: "16px",
                    backgroundColor: isDark ? "#252525" : "#f8f8f8",
                    borderRadius: "12px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = isDark
                      ? "0 4px 6px rgba(0,0,0,0.2)"
                      : "0 4px 6px rgba(0,0,0,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Step number */}
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: isDark ? "#4f46e5" : "#e0e7ff",
                      color: isDark ? "#fff" : "#4f46e5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    {step.number}
                  </div>
                  <div>
                    {/* Step instructions */}
                    <p style={{ lineHeight: 1.6 }}>{step.step}</p>
                    {/* Step ingredients */}
                    {step.ingredients?.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginTop: "8px",
                        }}
                      >
                        {step.ingredients.map((ingredient, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: "2px 8px",
                              backgroundColor: isDark
                                ? "rgba(79, 70, 229, 0.2)"
                                : "rgba(79, 70, 229, 0.1)",
                              color: isDark ? "#a5b4fc" : "#4f46e5",
                              borderRadius: "4px",
                              fontSize: "12px",
                            }}
                          >
                            {ingredient.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
