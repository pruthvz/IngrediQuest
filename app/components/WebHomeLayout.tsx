// this component is a special layout for the home page
// it includes a hero section, feature highlights, and stats
// it's designed to be more visually appealing than the standard layout

import React, { ReactNode } from "react";
import { useColorScheme } from "react-native";
import WebIcon from "./WebIcon";

// props for the layout component
interface WebHomeLayoutProps {
  children: ReactNode; // content to display
  isDark: boolean; // dark mode flag
}

export default function WebHomeLayout({
  children,
  isDark,
}: WebHomeLayoutProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        backgroundColor: isDark ? "#111827" : "#F9FAFB",
      }}
    >
      {/* hero section with background image and feature highlights */}
      <div
        style={{
          background: isDark
            ? "linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)"
            : "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
          padding: "3rem 2rem",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* blurred background image */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage:
              "url(https://images.unsplash.com/photo-1495546968767-f0573cca821e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(8px)",
          }}
        />

        {/* hero content container */}
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* two-column layout for text and image */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "2rem",
            }}
          >
            {/* left column with text and feature badges */}
            <div style={{ flex: "1", minWidth: "300px", maxWidth: "600px" }}>
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  lineHeight: 1.2,
                }}
              >
                Cook Smarter with What You Have
              </h1>
              <p
                style={{
                  fontSize: "1.125rem",
                  opacity: 0.9,
                  marginBottom: "1.5rem",
                  lineHeight: 1.5,
                }}
              >
                Enter ingredients you have on hand, and we'll find delicious
                recipes you can make right now.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                  }}
                >
                  <WebIcon name="search" />
                  <span>Find recipes</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                  }}
                >
                  <WebIcon name="calendar" />
                  <span>Plan meals</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                  }}
                >
                  <WebIcon name="shopping-cart" />
                  <span>Create shopping lists</span>
                </div>
              </div>
            </div>

            {/* right column with featured image */}
            <div
              style={{
                flex: "1",
                minWidth: "300px",
                maxWidth: "500px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4/3",
                  backgroundColor: "white",
                  borderRadius: "1rem",
                  overflow: "hidden",
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transform: "rotate(2deg)",
                  position: "relative",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Healthy Food"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "1rem",
                    left: "1rem",
                    right: "1rem",
                    backgroundColor: "rgba(79, 70, 229, 0.9)",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Discover new recipes today!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* main content area */}
      <div
        style={{
          padding: "2rem",
          flex: 1,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            backgroundColor: isDark ? "#1F2937" : "white",
            borderRadius: "1rem",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>

      {/* stats and features section */}
      <div
        style={{
          backgroundColor: isDark ? "#111827" : "#F3F4F6",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1.5rem",
              textAlign: "center",
              color: isDark ? "#E5E7EB" : "#1F2937",
            }}
          >
            Why IngrediQuest?
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: "250px",
                backgroundColor: isDark ? "#1F2937" : "white",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "#4F46E5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "1rem",
                  }}
                >
                  <WebIcon name="utensils" color="white" />
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    color: isDark ? "#E5E7EB" : "#1F2937",
                  }}
                >
                  10,000+ Recipes
                </h3>
              </div>
              <p
                style={{
                  color: isDark ? "#9CA3AF" : "#4B5563",
                  lineHeight: 1.5,
                }}
              >
                Access our extensive database of recipes for any occasion,
                cuisine, or dietary preference.
              </p>
            </div>

            <div
              style={{
                flex: 1,
                minWidth: "250px",
                backgroundColor: isDark ? "#1F2937" : "white",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "#4F46E5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "1rem",
                  }}
                >
                  <WebIcon name="calendar" color="white" />
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    color: isDark ? "#E5E7EB" : "#1F2937",
                  }}
                >
                  Meal Planning
                </h3>
              </div>
              <p
                style={{
                  color: isDark ? "#9CA3AF" : "#4B5563",
                  lineHeight: 1.5,
                }}
              >
                Plan your meals for the week with our intuitive meal planning
                tools and save time.
              </p>
            </div>

            <div
              style={{
                flex: 1,
                minWidth: "250px",
                backgroundColor: isDark ? "#1F2937" : "white",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "#4F46E5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "1rem",
                  }}
                >
                  <WebIcon name="shopping-cart" color="white" />
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    color: isDark ? "#E5E7EB" : "#1F2937",
                  }}
                >
                  Smart Shopping
                </h3>
              </div>
              <p
                style={{
                  color: isDark ? "#9CA3AF" : "#4B5563",
                  lineHeight: 1.5,
                }}
              >
                Generate shopping lists automatically based on your selected
                recipes and meal plans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
