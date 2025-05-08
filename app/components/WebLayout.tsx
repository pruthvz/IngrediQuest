// this component is the main layout for web pages
// it provides the header, navigation, footer and consistent styling
// it also handles dark mode and responsive design

import React, { ReactNode } from "react";
import { useColorScheme, Platform } from "react-native";
import WebIcon from "./WebIcon";
import { Link } from "expo-router";
import FloatingChatButton from "./FloatingChatButton";

// props for the layout component
interface WebLayoutProps {
  children: ReactNode; // content to display
  title: string; // page title
  currentTab?: string; // current navigation tab
}

export default function WebLayout({
  children,
  title,
  currentTab,
}: WebLayoutProps) {
  // check if we're on web and get color scheme
  const isWeb = Platform.OS === "web";
  const isDark = useColorScheme() === "dark";

  // return normal view on mobile
  if (!isWeb) {
    return <>{children}</>;
  }

  // styles for the layout components
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column" as const,
      minHeight: "100vh",
      backgroundColor: isDark ? "#111827" : "#F9FAFB",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "1rem 2rem",
      backgroundColor: isDark ? "#1F2937" : "white",
      borderBottom: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "1.25rem",
      fontWeight: 700,
      color: "#4F46E5",
      textDecoration: "none",
    },
    logoIcon: {
      width: "2rem",
      height: "2rem",
      backgroundColor: "#4F46E5",
      borderRadius: "0.375rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
    },
    nav: {
      display: "flex",
      gap: "1.5rem",
    },
    navLink: {
      color: isDark ? "#E5E7EB" : "#4B5563",
      textDecoration: "none",
      fontWeight: 500,
      fontSize: "0.95rem",
      padding: "0.5rem 0",
      position: "relative" as const,
    },
    activeNavLink: {
      color: "#4F46E5",
      fontWeight: 600,
    },
    activeIndicator: {
      position: "absolute" as const,
      bottom: 0,
      left: 0,
      right: 0,
      height: "2px",
      backgroundColor: "#4F46E5",
      borderRadius: "1px",
    },
    content: {
      flex: 1,
      padding: "2rem",
      backgroundColor: "#F9FAFB",
    },
    contentInner: {
      maxWidth: "1200px",
      margin: "0 auto",
      backgroundColor: "#FFFFFF",
      borderRadius: "0.75rem",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      padding: "2rem",
      minHeight: "calc(100vh - 12rem)",
    },
    pageTitle: {
      fontSize: "1.75rem",
      fontWeight: 700,
      color: "#111827",
      marginBottom: "1.5rem",
      paddingBottom: "1rem",
      borderBottom: "1px solid #E5E7EB",
    },
    footer: {
      padding: "1.5rem",
      textAlign: "center" as const,
      borderTop: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
      backgroundColor: isDark ? "#1F2937" : "white",
      color: isDark ? "#9CA3AF" : "#6B7280",
      fontSize: "0.875rem",
    },
    footerText: {
      margin: 0,
      color: isDark ? "#9CA3AF" : "#6B7280",
    },
  };

  // update styles for dark mode if user prefers it
  const prefersDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (prefersDarkMode) {
    styles.container.backgroundColor = "#111827";
    styles.header.backgroundColor = "#1F2937";
    styles.header.borderBottom = "1px solid #374151";
    styles.logo.color = "#F9FAFB";
    styles.navLink.color = "#9CA3AF";
    styles.activeNavLink.color = "#818CF8";
    styles.activeIndicator.backgroundColor = "#818CF8";
    styles.content.backgroundColor = "#111827";
    styles.contentInner.backgroundColor = "#1F2937";
    styles.pageTitle.color = "#F9FAFB";
    styles.pageTitle.borderBottom = "1px solid #374151";
    styles.footer.backgroundColor = "#111827";
    styles.footer.borderTop = "1px solid #374151";
    styles.footer.color = "#9CA3AF";
  }

  // navigation links configuration
  const navLinks = [
    { name: "Home", path: "/", key: "home" },
    { name: "Explore", path: "/explore", key: "explore" },
    { name: "Meal Planner", path: "/meal-planner", key: "meal-planner" },
    { name: "Shopping List", path: "/shopping-list", key: "shopping-list" },
    { name: "Saved", path: "/saved", key: "saved" },
    { name: "AI Assistant", path: "/chatbot", key: "chatbot" },
    { name: "Profile", path: "/profile", key: "profile" },
  ];

  return (
    <div style={styles.container}>
      {/* header with logo and navigation */}
      <header style={styles.header}>
        <Link href="/" asChild>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <WebIcon name="utensils" />
            </div>
            <span>IngrediQuest</span>
          </div>
        </Link>

        {/* navigation menu */}
        <nav style={styles.nav}>
          <Link href="/" asChild>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color:
                  currentTab === "home"
                    ? "#4F46E5"
                    : isDark
                    ? "#E5E7EB"
                    : "#4B5563",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <WebIcon name="home" />
              <span>Home</span>
            </div>
          </Link>
          {/* rest of navigation links */}
          {navLinks.slice(1).map((link) => (
            <Link key={link.key} href={link.path} asChild>
              <div
                style={{
                  color:
                    currentTab === link.key
                      ? "#4F46E5"
                      : isDark
                      ? "#E5E7EB"
                      : "#4B5563",
                  fontWeight: currentTab === link.key ? 600 : 500,
                  fontSize: "0.95rem",
                  padding: "0.5rem 0",
                  position: "relative" as const,
                  cursor: "pointer",
                }}
              >
                {link.name}
                {currentTab === link.key && (
                  <div style={styles.activeIndicator}></div>
                )}
              </div>
            </Link>
          ))}
        </nav>
      </header>

      {/* main content area */}
      <main style={styles.content}>
        <div style={styles.contentInner}>
          <h1 style={styles.pageTitle}>{title}</h1>
          {children}
        </div>
      </main>

      {/* footer with copyright */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          &copy; {new Date().getFullYear()} IngrediQuest. All rights reserved.
        </p>
      </footer>

      {/* show chat button except on chatbot page */}
      {currentTab !== "chatbot" && <FloatingChatButton isDark={isDark} />}
    </div>
  );
}
