import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useUserPreferences } from "../src/context/UserPreferencesContext";
import WebLayout from "./components/WebLayout";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);

const { width } = Dimensions.get("window");

export default function AboutScreen() {
  const { preferences } = useUserPreferences();
  const isDark = preferences.isDarkMode;
  const router = useRouter();
  const isWeb = Platform.OS === "web";

  // App features for display
  const features = [
    {
      icon: "search",
      title: "Recipe Discovery",
      description: "Find recipes based on ingredients you already have at home",
    },
    {
      icon: "heart",
      title: "Save Favorites",
      description: "Save your favorite recipes for quick access anytime",
    },
    {
      icon: "shopping-basket",
      title: "Shopping Lists",
      description: "Automatically create shopping lists from recipes",
    },
    {
      icon: "robot",
      title: "AI Assistant",
      description: "Get personalized cooking advice from our AI assistant",
    },
    {
      icon: "calendar-alt",
      title: "Meal Planning",
      description: "Plan your meals for the week with our easy-to-use planner",
    },
    {
      icon: "utensils",
      title: "Dietary Preferences",
      description: "Find recipes that match your dietary needs and preferences",
    },
  ];

  // App images
  const appImages = [
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505935428862-770b6f24f629?q=80&w=500&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=500&auto=format&fit=crop",
  ];

  // Web-specific rendering
  if (isWeb) {
    return (
      <WebLayout title="About Us" currentTab="profile">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "1rem",
          }}
        >
          {/* Hero Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "3rem 1rem",
              backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
              borderRadius: "0.75rem",
            }}
          >
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                marginBottom: "1rem",
                background: "linear-gradient(90deg, #4F46E5, #EC4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome to Ingrei
            </h1>
            <p
              style={{
                fontSize: "1.25rem",
                color: isDark ? "#D1D5DB" : "#4B5563",
                maxWidth: "800px",
                lineHeight: 1.6,
                marginBottom: "2rem",
              }}
            >
              Your personal kitchen assistant that helps you discover recipes,
              plan meals, and make the most of the ingredients you already have.
            </p>
            <button
              onClick={() => router.push("/(tabs)")}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#4F46E5",
                color: "white",
                borderRadius: "0.5rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Explore Recipes
            </button>
          </div>

          {/* Image Gallery */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            {appImages.map((img, index) => (
              <div
                key={index}
                style={{
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                  height: "250px",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              >
                <img
                  src={img}
                  alt={`App screenshot ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div
            style={{
              marginBottom: "2rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.875rem",
                fontWeight: 700,
                marginBottom: "1.5rem",
                textAlign: "center",
                color: isDark ? "#F9FAFB" : "#111827",
              }}
            >
              App Features
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    padding: "1.5rem",
                    backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                    borderRadius: "0.75rem",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "9999px",
                      backgroundColor: "#4F46E5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <i
                      className={`fas fa-${feature.icon}`}
                      style={{ color: "white", fontSize: "1.25rem" }}
                    ></i>
                  </div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      color: isDark ? "#F9FAFB" : "#111827",
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      color: isDark ? "#D1D5DB" : "#6B7280",
                      lineHeight: 1.5,
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* About Section */}
          <div
            style={{
              padding: "2rem",
              backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
              borderRadius: "0.75rem",
              marginBottom: "2rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.875rem",
                fontWeight: 700,
                marginBottom: "1rem",
                color: isDark ? "#F9FAFB" : "#111827",
              }}
            >
              Our Story
            </h2>
            <p
              style={{
                color: isDark ? "#D1D5DB" : "#4B5563",
                lineHeight: 1.7,
                marginBottom: "1rem",
              }}
            >
              Ingrei was born from a simple idea: to help people make the most
              of what they already have in their kitchen. We noticed that many
              people struggle with meal planning, waste ingredients, or simply
              don't know what to cook with what they have on hand.
            </p>
            <p
              style={{
                color: isDark ? "#D1D5DB" : "#4B5563",
                lineHeight: 1.7,
                marginBottom: "1rem",
              }}
            >
              Our team of food enthusiasts and technology experts came together
              to create a solution that combines the joy of cooking with the
              convenience of modern technology. The result is Ingrei - your
              personal kitchen assistant.
            </p>
            <p
              style={{
                color: isDark ? "#D1D5DB" : "#4B5563",
                lineHeight: 1.7,
              }}
            >
              Whether you're a seasoned chef or just starting your culinary
              journey, Ingrei is designed to inspire you, save you time, and
              help you discover new flavors and recipes.
            </p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: isDark ? "#374151" : "#E5E7EB",
              color: isDark ? "#F9FAFB" : "#111827",
              borderRadius: "0.5rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              alignSelf: "flex-start",
              marginBottom: "2rem",
            }}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Profile
          </button>
        </div>
      </WebLayout>
    );
  }

  // Mobile rendering
  return (
    <StyledSafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      {/* Header with gradient */}
      <LinearGradient
        colors={
          isDark
            ? ["#4F46E5", "#6366F1", "#818CF8"]
            : ["#6366F1", "#818CF8", "#A5B4FC"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-4 pb-6 px-4"
      >
        <StyledView className="flex-row items-center">
          <StyledTouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-4"
          >
            <FontAwesome5 name="arrow-left" size={16} color="white" />
          </StyledTouchableOpacity>
          <StyledText className="text-white text-xl font-bold">
            About Ingrei
          </StyledText>
        </StyledView>
      </LinearGradient>

      <StyledScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <StyledView className="items-center py-6">
          <StyledText className="text-2xl font-bold mb-2 text-center text-indigo-600">
            Welcome to Ingrei
          </StyledText>
          <StyledText
            className={`text-base ${
              isDark ? "text-gray-300" : "text-gray-600"
            } text-center mb-6`}
          >
            Your personal kitchen assistant that helps you discover recipes,
            plan meals, and make the most of the ingredients you already have.
          </StyledText>
        </StyledView>

        {/* Image Gallery */}
        <StyledView className="mb-8">
          <StyledScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pb-4"
          >
            {appImages.map((img, index) => (
              <StyledView
                key={index}
                className="mr-3 rounded-xl overflow-hidden"
                style={{ width: width * 0.8, height: 200, elevation: 3 }}
              >
                <Image
                  source={{ uri: img }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </StyledView>
            ))}
          </StyledScrollView>
        </StyledView>

        {/* Features Section */}
        <StyledView className="mb-8">
          <StyledText
            className={`text-xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            App Features
          </StyledText>

          {features.map((feature, index) => (
            <StyledView
              key={index}
              className={`p-4 rounded-xl mb-3 ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
              style={{ elevation: 2 }}
            >
              <StyledView className="flex-row items-center">
                <StyledView className="w-10 h-10 rounded-full bg-indigo-500 items-center justify-center mr-4">
                  <FontAwesome5 name={feature.icon} size={16} color="white" />
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText
                    className={`font-bold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {feature.title}
                  </StyledText>
                  <StyledText
                    className={`text-sm ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {feature.description}
                  </StyledText>
                </StyledView>
              </StyledView>
            </StyledView>
          ))}
        </StyledView>

        {/* About Section */}
        <StyledView
          className={`p-4 rounded-xl mb-10 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <StyledText
            className={`text-xl font-bold mb-3 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            Our Story
          </StyledText>
          <StyledText
            className={`mb-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Ingrei was born from a simple idea: to help people make the most of
            what they already have in their kitchen. We noticed that many people
            struggle with meal planning, waste ingredients, or simply don't know
            what to cook with what they have on hand.
          </StyledText>
          <StyledText
            className={`mb-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Our team of food enthusiasts and technology experts came together to
            create a solution that combines the joy of cooking with the
            convenience of modern technology. The result is Ingrei - your
            personal kitchen assistant.
          </StyledText>
          <StyledText
            className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Whether you're a seasoned chef or just starting your culinary
            journey, Ingrei is designed to inspire you, save you time, and help
            you discover new flavors and recipes.
          </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
}
