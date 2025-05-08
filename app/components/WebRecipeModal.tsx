// this component shows a recipe's details in a modal window
// it includes the recipe image, ingredients, steps, and actions like save/share

import React from "react";
import WebIcon from "./WebIcon";

// types for recipe data
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

// full recipe details type
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

// props for the modal component
interface WebRecipeModalProps {
  recipe: RecipeDetail | null; // recipe to display
  visible: boolean; // whether modal is shown
  onClose: () => void; // function to close modal
  isSaved?: boolean; // if recipe is saved
  onSaveToggle?: () => void; // function to save/unsave
  onAddToShoppingList?: () => void; // function to add to shopping list
}

export default function WebRecipeModal({
  recipe,
  visible,
  onClose,
  isSaved = false,
  onSaveToggle,
  onAddToShoppingList,
}: WebRecipeModalProps) {
  // don't render if not visible or no recipe
  if (!visible || !recipe) return null;

  // get recipe data
  const ingredients = recipe.extendedIngredients || [];
  const steps = recipe.analyzedInstructions?.[0]?.steps || [];

  // close modal when clicking outside
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // check if dark mode is enabled
  const prefersDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = prefersDarkMode;

  return (
    // modal overlay
    <div
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
      }}
      onClick={handleOutsideClick}
    >
      {/* modal content container */}
      <div
        style={{
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          borderRadius: "0.75rem",
          width: "100%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* recipe image and header info */}
        <div style={{ position: "relative" }}>
          <div style={{ height: "200px", overflow: "hidden" }}>
            <img
              src={recipe.image}
              alt={recipe.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7) 100%)",
              }}
            />
          </div>

          {/* close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              border: "none",
              borderRadius: "9999px",
              width: "2.5rem",
              height: "2.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            <WebIcon name="times" />
          </button>

          {/* save recipe button */}
          {onSaveToggle && (
            <button
              onClick={onSaveToggle}
              style={{
                padding: "0.75rem 1.25rem",
                borderRadius: "0.5rem",
                backgroundColor: isSaved
                  ? isDark
                    ? "#1F2937"
                    : "#F3F4F6"
                  : "#4F46E5",
                color: isSaved ? (isDark ? "#E5E7EB" : "#4B5563") : "white",
                fontWeight: 500,
                border: isSaved
                  ? `1px solid ${isDark ? "#374151" : "#D1D5DB"}`
                  : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <WebIcon name="bookmark" />
              {isSaved ? "Saved" : "Save Recipe"}
            </button>
          )}

          {/* recipe title and basic info */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "1.5rem",
              color: "white",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              {recipe.title}
            </h2>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {recipe.cuisines && recipe.cuisines.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <i className="fas fa-globe"></i>
                  <span>{recipe.cuisines.join(", ")}</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <i className="fas fa-clock"></i>
                <span>{recipe.readyInMinutes} min</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <i className="fas fa-utensils"></i>
                <span>{recipe.servings} servings</span>
              </div>
            </div>
          </div>
        </div>

        {/* recipe details content */}
        <div
          style={{
            flex: 1,
            padding: "1.5rem",
            overflowY: "auto",
            color: isDark ? "#F9FAFB" : "#111827",
          }}
        >
          {/* recipe tags and categories */}
          {(recipe.dishTypes?.length > 0 || recipe.diets?.length > 0) && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.375rem",
                    backgroundColor: isDark
                      ? "rgba(79, 70, 229, 0.2)"
                      : "rgba(79, 70, 229, 0.1)",
                    color: isDark ? "#818CF8" : "#4F46E5",
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <i className="fas fa-clock"></i>
                  {recipe.readyInMinutes} mins
                </div>
                {recipe.servings && (
                  <div
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.375rem",
                      backgroundColor: isDark
                        ? "rgba(79, 70, 229, 0.2)"
                        : "rgba(79, 70, 229, 0.1)",
                      color: isDark ? "#818CF8" : "#4F46E5",
                      fontSize: "0.875rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <i className="fas fa-utensils"></i>
                    {recipe.servings} servings
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {recipe.dishTypes?.map((type, index) => (
                  <span
                    key={`dish-${index}`}
                    style={{
                      padding: "0.25rem 0.75rem",
                      backgroundColor: isDark
                        ? "rgba(79, 70, 229, 0.2)"
                        : "rgba(79, 70, 229, 0.1)",
                      color: isDark ? "#818CF8" : "#4F46E5",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {type}
                  </span>
                ))}
                {recipe.diets?.map((diet, index) => (
                  <span
                    key={`diet-${index}`}
                    style={{
                      padding: "0.25rem 0.75rem",
                      backgroundColor: isDark
                        ? "rgba(16, 185, 129, 0.2)"
                        : "rgba(16, 185, 129, 0.1)",
                      color: isDark ? "#34D399" : "#059669",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {diet}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ingredients list */}
          <div style={{ marginBottom: "2rem" }}>
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <WebIcon name="shopping-basket" color="#4F46E5" />
              Ingredients
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {ingredients.map((ingredient) => (
                <li
                  key={ingredient.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem",
                    backgroundColor: isDark ? "#111827" : "#F9FAFB",
                    borderRadius: "0.375rem",
                  }}
                >
                  <WebIcon name="check" color="#4F46E5" size={12} />
                  <span>
                    {ingredient.amount} {ingredient.unit}{" "}
                    {ingredient.originalName}
                  </span>
                </li>
              ))}
            </ul>

            {/* Add to Shopping List button */}
            {onAddToShoppingList && (
              <button
                onClick={onAddToShoppingList}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  backgroundColor: "#4F46E5",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontWeight: 500,
                  marginTop: "1rem",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <WebIcon name="shopping-cart" />
                Add to Shopping List
              </button>
            )}
          </div>

          {/* cooking steps */}
          <div>
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <WebIcon name="list-ol" color="#4F46E5" />
              Instructions
            </h3>
            <ol
              style={{
                paddingLeft: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {steps.map((step) => (
                <li key={step.number} style={{ marginBottom: "0.5rem" }}>
                  <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>
                    Step {step.number}
                  </div>
                  <div style={{ color: isDark ? "#D1D5DB" : "#4B5563" }}>
                    {step.step}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
