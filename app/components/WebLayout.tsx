import React, { ReactNode } from "react";
import { useColorScheme, Platform } from "react-native";
import WebIcon from "./WebIcon";
import { Link } from "expo-router";
import FloatingChatButton from "../../src/components/FloatingChatButton";

interface WebLayoutProps {
  children: ReactNode;
  title: string;
  currentTab?: string;
}

export default function WebLayout({
  children,
  title,
  currentTab,
}: WebLayoutProps) {
  const isWeb = Platform.OS === "web";
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!isWeb) {
    return <>{children}</>;
  }

  // Theme configuration
  const theme = {
    colors: {
      primary: "#6366f1",
      primaryLight: "#818cf8",
      primaryDark: "#4f46e5",
      text: isDark ? "#f3f4f6" : "#111827",
      textSecondary: isDark ? "#9ca3af" : "#6b7280",
      background: isDark ? "#111827" : "#ffffff",
      backgroundSecondary: isDark ? "#1f2937" : "#f9fafb",
      border: isDark ? "#374151" : "#e5e7eb",
      accent: isDark ? "#a5b4fc" : "#6366f1",
    },
    spacing: {
      small: "0.5rem",
      medium: "1rem",
      large: "1.5rem",
      xlarge: "2rem",
    },
    shadows: {
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    },
    radii: {
      sm: "0.25rem",
      md: "0.5rem",
      lg: "0.75rem",
      full: "9999px",
    },
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column" as const,
      minHeight: "100vh",
      backgroundColor: theme.colors.backgroundSecondary,
      fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: theme.colors.text,
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `${theme.spacing.medium} ${theme.spacing.xlarge}`,
      backgroundColor: theme.colors.background,
      borderBottom: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      position: "sticky" as const,
      top: 0,
      zIndex: 50,
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing.small,
      fontSize: "1.25rem",
      fontWeight: 700,
      color: theme.colors.primary,
      textDecoration: "none",
      transition: "all 0.2s ease",
      ":hover": {
        color: theme.colors.primaryLight,
      },
    },
    logoIcon: {
      width: "2rem",
      height: "2rem",
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.sm,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      transition: "all 0.2s ease",
    },
    nav: {
      display: "flex",
      gap: theme.spacing.large,
      alignItems: "center",
    },
    navLink: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      color: theme.colors.textSecondary,
      textDecoration: "none",
      fontWeight: 500,
      fontSize: "0.95rem",
      padding: `${theme.spacing.small} 0`,
      position: "relative" as const,
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        color: theme.colors.primaryLight,
      },
    },
    activeNavLink: {
      color: theme.colors.primary,
      fontWeight: 600,
    },
    activeIndicator: {
      position: "absolute" as const,
      bottom: 0,
      left: 0,
      right: 0,
      height: "2px",
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.full,
    },
    content: {
      flex: 1,
      padding: theme.spacing.xlarge,
      backgroundColor: theme.colors.backgroundSecondary,
      overflowY: "auto" as const,
      height: "calc(100vh - 64px)", // Subtract header height
      position: "relative" as const,
    },
    contentInner: {
      maxWidth: "1200px",
      margin: "0 auto",
      backgroundColor: theme.colors.background,
      borderRadius: theme.radii.lg,
      boxShadow: theme.shadows.sm,
      padding: theme.spacing.xlarge,
      height: "100%",
      overflowY: "auto" as const,
    },
    pageTitle: {
      fontSize: "1.75rem",
      fontWeight: 700,
      color: theme.colors.text,
      marginBottom: theme.spacing.large,
      paddingBottom: theme.spacing.medium,
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    footer: {
      padding: theme.spacing.large,
      textAlign: "center" as const,
      borderTop: `1px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.background,
      color: theme.colors.textSecondary,
      fontSize: "0.875rem",
    },
    mobileMenuButton: {
      display: "none",
      backgroundColor: "transparent",
      border: "none",
      color: theme.colors.text,
      cursor: "pointer",
      padding: theme.spacing.small,
      borderRadius: theme.radii.full,
      ":hover": {
        backgroundColor: isDark ? "#374151" : "#f3f4f6",
      },
    },
  };

  const navLinks = [
    { name: "Home", path: "/", key: "home", icon: "home" },
    { name: "Explore", path: "/explore", key: "explore", icon: "compass" },
    {
      name: "Meal Planner",
      path: "/meal-planner",
      key: "meal-planner",
      icon: "calendar",
    },
    {
      name: "Shopping List",
      path: "/shopping-list",
      key: "shopping-list",
      icon: "shopping-cart",
    },
    { name: "Saved", path: "/saved", key: "saved", icon: "bookmark" },
    { name: "Profile", path: "/profile", key: "profile", icon: "user" },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link href="/" asChild>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <WebIcon name="utensils" />
            </div>
            <span>IngrediQuest</span>
          </div>
        </Link>

        {/* Mobile menu button (hidden by default) */}
        <button style={styles.mobileMenuButton}>
          <WebIcon name="bars" size={20} />
        </button>

        <nav style={styles.nav}>
          {navLinks.map((link) => (
            <Link key={link.key} href={link.path} asChild>
              <div
                style={{
                  ...styles.navLink,
                  ...(currentTab === link.key ? styles.activeNavLink : {}),
                }}
              >
                <WebIcon
                  name={link.icon}
                  size={16}
                  color={
                    currentTab === link.key
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                  }
                />
                <span>{link.name}</span>
                {currentTab === link.key && (
                  <div style={styles.activeIndicator}></div>
                )}
              </div>
            </Link>
          ))}
        </nav>
      </header>

      <main style={styles.content}>
        <div style={styles.contentInner}>
          <h1 style={styles.pageTitle}>{title}</h1>
          <div
            style={{
              overflowY: "auto" as const,
              height: "calc(100% - 80px)", // Subtract page title height
              paddingRight: "8px", // Add padding for scrollbar
            }}
          >
            {children}
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <p style={{ margin: 0 }}>
          &copy; {new Date().getFullYear()} IngrediQuest. All rights reserved.
        </p>
      </footer>

      <FloatingChatButton />

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          nav {
            display: none !important;
          }
          [style*="mobileMenuButton"] {
            display: block !important;
          }
        }
        @media (min-width: 1025px) {
          [style*="mobileMenuButton"] {
            display: none !important;
          }
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: ${isDark ? "#27272a" : "#f1f1f1"};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: ${isDark ? "#4b5563" : "#c7c7c7"};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? "#6b7280" : "#a3a3a3"};
        }
      `}</style>
    </div>
  );
}
