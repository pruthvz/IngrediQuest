// this screen shows user profile info and settings
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  Platform,
  StatusBar,
  SafeAreaView,
  Switch,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { useSavedRecipes } from "../../src/context/SavedRecipesContext";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { useUserPreferences } from "../../src/context/UserPreferencesContext";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import WebLayout from "../components/WebLayout";
import WebIcon from "../components/WebIcon";

// styled components for consistent styling
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);
const StyledSwitch = styled(Switch);

// defines what a setting item looks like
interface SettingItem {
  id: string;
  title: string;
  icon: string;
  color: string;
}

// props for the setting item component
interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  color?: string;
  rightElement?: React.ReactNode;
  onPress: () => void;
  isDark: boolean;
}

// reusable component for settings menu items
const SettingItem = ({
  icon,
  title,
  subtitle,
  color,
  rightElement,
  onPress,
  isDark,
}: SettingItemProps) => (
  <StyledTouchableOpacity
    onPress={onPress}
    className={`flex-row items-center px-5 py-4 mb-0.5 ${
      isDark ? "bg-gray-800" : "bg-white"
    }`}
    style={{
      borderRadius: 12,
    }}
  >
    <StyledView
      className="w-10 h-10 rounded-full items-center justify-center mr-4"
      style={{ backgroundColor: color || (isDark ? "#4F46E5" : "#6366F1") }}
    >
      <FontAwesome5 name={icon} size={16} color="white" />
    </StyledView>
    <StyledView className="flex-1">
      <StyledText
        className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
      >
        {title}
      </StyledText>
      {subtitle && (
        <StyledText
          className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {subtitle}
        </StyledText>
      )}
    </StyledView>
    {rightElement || (
      <FontAwesome5
        name="chevron-right"
        size={14}
        color={isDark ? "#6B7280" : "#9CA3AF"}
      />
    )}
  </StyledTouchableOpacity>
);

export default function ProfileScreen() {
  // get user info and auth functions
  const { logout, username, email } = useAuth();
  const { savedRecipes } = useSavedRecipes();
  const { preferences, toggleDarkMode, updatePreferences } =
    useUserPreferences();
  const isDark = preferences.isDarkMode;
  const router = useRouter();

  // local state for profile settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [profilePicture, setProfilePicture] = useState<string | null>(
    preferences.profilePicture || null
  );
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isWeb = Platform.OS === "web";

  // ask for permission to access photos when app starts
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to change your profile picture!"
        );
      }
    })();
  }, []);

  // opens the image picker to select profile picture
  const pickImage = async (useCamera: boolean = false) => {
    try {
      setIsLoading(true);
      let result;

      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Sorry, we need camera permissions to take a photo!"
          );
          setIsLoading(false);
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0].uri;
        setProfilePicture(selectedImage);
        // Save to preferences
        await updatePreferences({ profilePicture: selectedImage });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        "Error",
        "There was an error selecting your image. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsImagePickerVisible(false);
    }
  };

  // shows options to take photo or choose from gallery
  const showImagePickerOptions = () => {
    setIsImagePickerVisible(true);
  };

  // show web version if on web platform
  if (isWeb) {
    return (
      <WebLayout title="Profile" currentTab="profile">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Profile Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "1.5rem",
              backgroundColor: isDark ? "#1F2937" : "#F9FAFB",
              borderRadius: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                position: "relative",
                marginRight: "1.5rem",
              }}
            >
              <div
                style={{
                  width: "6rem",
                  height: "6rem",
                  borderRadius: "9999px",
                  backgroundColor: isDark ? "#374151" : "#E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <i
                    className="fas fa-user"
                    style={{
                      fontSize: "2rem",
                      color: isDark ? "#9CA3AF" : "#6B7280",
                    }}
                  ></i>
                )}
              </div>
              <button
                onClick={() => setIsImagePickerVisible(true)}
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "9999px",
                  backgroundColor: "#4F46E5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                }}
              >
                <i
                  className="fas fa-camera"
                  style={{ color: "white", fontSize: "0.875rem" }}
                ></i>
              </button>
            </div>

            <div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: isDark ? "#F9FAFB" : "#111827",
                  marginBottom: "0.5rem",
                }}
              >
                {username || "User"}
              </h2>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                  }}
                >
                  <i className="fas fa-bookmark"></i>
                  <span>{savedRecipes.length} saved recipes</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                  }}
                >
                  <i className="fas fa-utensils"></i>
                  <span>0 cooked recipes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#4F46E5",
                marginBottom: "0.75rem",
                paddingLeft: "0.5rem",
              }}
            >
              Features
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                borderRadius: "0.75rem",
                overflow: "hidden",
              }}
            >
              {/* Setting Items */}
              {[
                {
                  icon: "bookmark",
                  title: "Saved Recipes",
                  subtitle: `${savedRecipes.length} recipes`,
                  color: "#10B981",
                  path: "/saved",
                },
                {
                  icon: "shopping-basket",
                  title: "Shopping List",
                  subtitle: "Manage your groceries",
                  color: "#F59E0B",
                  path: "/shopping-list",
                },
                {
                  icon: "calendar-alt",
                  title: "Meal Planner",
                  subtitle: "Plan your weekly meals",
                  color: "#3B82F6",
                  path: "/meal-planner",
                },
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "1rem 1.25rem",
                    borderBottom:
                      index < 2
                        ? `1px solid ${isDark ? "#374151" : "#E5E7EB"}`
                        : "none",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "9999px",
                      backgroundColor: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "1rem",
                    }}
                  >
                    <i
                      className={`fas fa-${item.icon}`}
                      style={{ color: "white" }}
                    ></i>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: isDark ? "#F9FAFB" : "#111827",
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: isDark ? "#9CA3AF" : "#6B7280",
                      }}
                    >
                      {item.subtitle}
                    </div>
                  </div>

                  <i
                    className="fas fa-chevron-right"
                    style={{ color: isDark ? "#6B7280" : "#9CA3AF" }}
                  ></i>
                </a>
              ))}
            </div>
          </div>

          {/* App Settings */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#4F46E5",
                marginBottom: "0.75rem",
                paddingLeft: "0.5rem",
              }}
            >
              App Settings
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                borderRadius: "0.75rem",
                overflow: "hidden",
              }}
            >
              {/* Setting Items */}
              {[
                {
                  icon: "bell",
                  title: "Push Notifications",
                  color: "#EF4444",
                  hasSwitch: true,
                  switchValue: pushNotifications,
                  onToggle: () => setPushNotifications(!pushNotifications),
                },
                {
                  icon: "moon",
                  title: "Dark Mode",
                  color: "#6B7280",
                  hasSwitch: true,
                  switchValue: preferences.isDarkMode,
                  onToggle: toggleDarkMode,
                },
                {
                  icon: "globe",
                  title: "Language",
                  subtitle: "English",
                  color: "#0EA5E9",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "1rem 1.25rem",
                    borderBottom:
                      index < 2
                        ? `1px solid ${isDark ? "#374151" : "#E5E7EB"}`
                        : "none",
                    cursor: item.hasSwitch ? "default" : "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "9999px",
                      backgroundColor: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "1rem",
                    }}
                  >
                    <i
                      className={`fas fa-${item.icon}`}
                      style={{ color: "white" }}
                    ></i>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: isDark ? "#F9FAFB" : "#111827",
                      }}
                    >
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: isDark ? "#9CA3AF" : "#6B7280",
                        }}
                      >
                        {item.subtitle}
                      </div>
                    )}
                  </div>

                  {item.hasSwitch ? (
                    <label
                      className="switch"
                      style={{
                        position: "relative",
                        display: "inline-block",
                        width: "3rem",
                        height: "1.5rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={item.switchValue}
                        onChange={item.onToggle}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          cursor: "pointer",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: item.switchValue
                            ? "#4F46E5"
                            : "#9CA3AF",
                          borderRadius: "34px",
                          transition: "background-color 0.2s",
                        }}
                      >
                        {/* Toggle knob */}
                        <span
                          style={{
                            position: "absolute",
                            height: "1.25rem",
                            width: "1.25rem",
                            left: "0.125rem",
                            bottom: "0.125rem",
                            backgroundColor: "white",
                            borderRadius: "50%",
                            transition: "0.2s",
                            transform: item.switchValue
                              ? "translateX(1.5rem)"
                              : "translateX(0)",
                          }}
                        ></span>
                      </span>
                    </label>
                  ) : (
                    <i
                      className="fas fa-chevron-right"
                      style={{ color: isDark ? "#6B7280" : "#9CA3AF" }}
                    ></i>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Help & Support */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#4F46E5",
                marginBottom: "0.75rem",
                paddingLeft: "0.5rem",
              }}
            >
              Help & Support
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                borderRadius: "0.75rem",
                overflow: "hidden",
              }}
            >
              {/* Setting Items */}
              {[
                {
                  icon: "question-circle",
                  title: "Help Center",
                  color: "#8B5CF6",
                },
                {
                  icon: "comment-alt",
                  title: "Send Feedback",
                  color: "#14B8A6",
                },
                { icon: "info-circle", title: "About Us", color: "#F97316" },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "1rem 1.25rem",
                    borderBottom:
                      index < 2
                        ? `1px solid ${isDark ? "#374151" : "#E5E7EB"}`
                        : "none",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "9999px",
                      backgroundColor: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "1rem",
                    }}
                  >
                    <i
                      className={`fas fa-${item.icon}`}
                      style={{ color: "white" }}
                    ></i>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: isDark ? "#F9FAFB" : "#111827",
                      }}
                    >
                      {item.title}
                    </div>
                  </div>

                  <i
                    className="fas fa-chevron-right"
                    style={{ color: isDark ? "#6B7280" : "#9CA3AF" }}
                  ></i>
                </div>
              ))}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              backgroundColor: isDark ? "#991B1B" : "#EF4444",
              color: "white",
              borderRadius: "0.75rem",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              marginBottom: "2rem",
              gap: "0.5rem",
            }}
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
          {/* Logout Button */}
          <button
            onClick={logout}
            style={{
              padding: "1rem",
              backgroundColor: isDark ? "#991B1B" : "#EF4444",
              color: "white",
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "1rem",
              marginBottom: "2rem",
              width: "100%",
            }}
          >
            <WebIcon name="sign-out-alt" />
            Logout
          </button>
        </div>
      </WebLayout>
    );
  }

  // show mobile version for mobile platforms
  return (
    <StyledSafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StyledScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with gradient */}
        <LinearGradient
          colors={
            isDark
              ? ["#4F46E5", "#6366F1", "#818CF8"]
              : ["#6366F1", "#818CF8", "#A5B4FC"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-8 pb-12 rounded-b-3xl"
        >
          <StyledView className="px-5">
            <StyledView className="items-center">
              <TouchableOpacity
                onPress={showImagePickerOptions}
                activeOpacity={0.8}
              >
                <StyledView className="p-2 bg-white/20 rounded-full mb-4 relative">
                  {isLoading ? (
                    <StyledView className="w-24 h-24 rounded-full items-center justify-center bg-gray-300">
                      <ActivityIndicator size="large" color="#6366F1" />
                    </StyledView>
                  ) : (
                    <Image
                      source={{
                        uri: profilePicture || "https://i.pravatar.cc/150",
                      }}
                      className="w-24 h-24 rounded-full"
                    />
                  )}
                  <StyledView
                    className="absolute bottom-0 right-0 bg-indigo-500 rounded-full p-2"
                    style={{ elevation: 5 }}
                  >
                    <FontAwesome5 name="camera" size={12} color="white" />
                  </StyledView>
                </StyledView>
              </TouchableOpacity>
              <StyledText className="text-white text-xl font-bold">
                {username || "User"}
              </StyledText>
            </StyledView>

            {/* Image Picker Modal */}
            <Modal
              visible={isImagePickerVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setIsImagePickerVisible(false)}
            >
              <TouchableOpacity
                style={{ flex: 1, justifyContent: "flex-end" }}
                activeOpacity={1}
                onPress={() => setIsImagePickerVisible(false)}
              >
                <StyledView
                  className={`${
                    isDark ? "bg-gray-800" : "bg-white"
                  } rounded-t-3xl p-5`}
                  style={{ elevation: 10 }}
                >
                  <StyledView className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

                  <StyledText
                    className={`text-xl font-bold mb-4 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Change Profile Picture
                  </StyledText>

                  <TouchableOpacity
                    className={`flex-row items-center p-4 mb-3 rounded-xl ${
                      isDark ? "bg-gray-700" : "bg-gray-100"
                    }`}
                    onPress={() => pickImage(false)}
                  >
                    <FontAwesome5
                      name="images"
                      size={20}
                      color={isDark ? "#A5B4FC" : "#6366F1"}
                    />
                    <StyledText
                      className={`ml-3 font-medium ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Choose from Gallery
                    </StyledText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-row items-center p-4 mb-3 rounded-xl ${
                      isDark ? "bg-gray-700" : "bg-gray-100"
                    }`}
                    onPress={() => pickImage(true)}
                  >
                    <FontAwesome5
                      name="camera"
                      size={20}
                      color={isDark ? "#A5B4FC" : "#6366F1"}
                    />
                    <StyledText
                      className={`ml-3 font-medium ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Take a Photo
                    </StyledText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-row items-center p-4 mb-3 rounded-xl ${
                      isDark ? "bg-red-900/50" : "bg-red-100"
                    }`}
                    onPress={() => setIsImagePickerVisible(false)}
                  >
                    <FontAwesome5
                      name="times"
                      size={20}
                      color={isDark ? "#FCA5A5" : "#EF4444"}
                    />
                    <StyledText
                      className={`ml-3 font-medium ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Cancel
                    </StyledText>
                  </TouchableOpacity>
                </StyledView>
              </TouchableOpacity>
            </Modal>

            <StyledView className="flex-row justify-between mt-6 bg-white/10 rounded-2xl p-4">
              <Link href="/(tabs)/saved" asChild>
                <StyledTouchableOpacity className="items-center flex-1">
                  <StyledView className="bg-white/20 w-10 h-10 rounded-full items-center justify-center mb-2">
                    <FontAwesome5 name="bookmark" size={16} color="white" />
                  </StyledView>
                  <StyledText className="text-white font-bold text-base">
                    {savedRecipes.length}
                  </StyledText>
                  <StyledText className="text-white/80 text-xs">
                    Saved Recipes
                  </StyledText>
                </StyledTouchableOpacity>
              </Link>
              <Link href="/(tabs)/shopping-list" asChild>
                <StyledTouchableOpacity className="items-center flex-1">
                  <StyledView className="bg-white/20 w-10 h-10 rounded-full items-center justify-center mb-2">
                    <FontAwesome5
                      name="shopping-basket"
                      size={16}
                      color="white"
                    />
                  </StyledView>
                  <StyledText className="text-white font-bold text-base">
                    Lists
                  </StyledText>
                  <StyledText className="text-white/80 text-xs">
                    Shopping Lists
                  </StyledText>
                </StyledTouchableOpacity>
              </Link>
              <Link href="/chatbot" asChild>
                <StyledTouchableOpacity className="items-center flex-1">
                  <StyledView className="bg-white/20 w-10 h-10 rounded-full items-center justify-center mb-2">
                    <FontAwesome5 name="robot" size={16} color="white" />
                  </StyledView>
                  <StyledText className="text-white font-bold text-base">
                    Chat
                  </StyledText>
                  <StyledText className="text-white/80 text-xs">
                    Recipe Assistant
                  </StyledText>
                </StyledTouchableOpacity>
              </Link>
            </StyledView>
          </StyledView>
        </LinearGradient>

        {/* Settings Sections */}
        <StyledView className="px-5 pt-4 pb-10 mt-6">
          {/* Account Section */}
          <StyledView className="mb-6">
            <StyledText className="text-sm uppercase font-bold mb-2 ml-1 text-indigo-500">
              Account
            </StyledText>
            <StyledView className="rounded-2xl overflow-hidden">
              {/* <SettingItem
                icon="user"
                title="Profile Information"
                subtitle="Edit your personal details"
                color="#6366F1"
                onPress={() => {}}
                isDark={isDark}
              /> */}
              <SettingItem
                icon="envelope"
                title="Email"
                subtitle={email || "Not available"}
                color="#8B5CF6"
                onPress={() => {}}
                isDark={isDark}
              />
            </StyledView>
          </StyledView>

          {/* Preferences */}
          <StyledView className="mb-6">
            <StyledText className="text-sm uppercase font-bold mb-2 ml-1 text-indigo-500">
              Cooking Preferences
            </StyledText>
            <StyledView className="rounded-2xl overflow-hidden">
              <SettingItem
                icon="utensils"
                title="Dietary Preferences"
                subtitle={
                  preferences.dietaryPreferences.join(", ") || "Not set"
                }
                color="#10B981"
                onPress={() => router.push("/preferences")}
                isDark={isDark}
              />
              {/* <SettingItem
                icon="allergies"
                title="Allergies & Restrictions"
                subtitle={preferences.allergies.join(", ") || "Not set"}
                color="#F59E0B"
                onPress={() => router.push("/preferences")}
                isDark={isDark}
              /> */}
              <SettingItem
                icon="calendar-alt"
                title="Meal Planner"
                subtitle="Plan your weekly meals"
                color="#3B82F6"
                onPress={() => router.push("/meal-planner")}
                isDark={isDark}
              />
            </StyledView>
          </StyledView>

          {/* App Settings */}
          <StyledView className="mb-6">
            <StyledText className="text-sm uppercase font-bold mb-2 ml-1 text-indigo-500">
              App Settings
            </StyledText>
            <StyledView className="rounded-2xl overflow-hidden">
              <SettingItem
                icon="bell"
                title="Push Notifications"
                color="#EF4444"
                rightElement={
                  <StyledSwitch
                    value={pushNotifications}
                    onValueChange={() =>
                      setPushNotifications(!pushNotifications)
                    }
                    trackColor={{ false: "#767577", true: "#818CF8" }}
                    thumbColor={pushNotifications ? "#6366F1" : "#f4f3f4"}
                  />
                }
                onPress={() => setPushNotifications(!pushNotifications)}
                isDark={isDark}
              />
              <SettingItem
                icon="moon"
                title="Dark Mode"
                color="#6B7280"
                rightElement={
                  <StyledSwitch
                    value={preferences.isDarkMode}
                    onValueChange={toggleDarkMode}
                    trackColor={{ false: "#767577", true: "#818CF8" }}
                    thumbColor={preferences.isDarkMode ? "#6366F1" : "#f4f3f4"}
                  />
                }
                onPress={() => {}}
                isDark={preferences.isDarkMode}
              />
              <SettingItem
                icon="globe"
                title="Language"
                subtitle="English"
                color="#0EA5E9"
                onPress={() => {}}
                isDark={isDark}
              />
            </StyledView>
          </StyledView>

          {/* About */}
          <StyledView className="mb-6">
            <StyledText className="text-sm uppercase font-bold mb-2 ml-1 text-indigo-500">
              About
            </StyledText>
            <StyledView className="rounded-2xl overflow-hidden">
              <SettingItem
                icon="info-circle"
                title="About Us"
                subtitle="Learn more about Ingrei"
                color="#F97316"
                onPress={() => router.push("/about")}
                isDark={isDark}
              />
            </StyledView>
          </StyledView>

          {/* Logout Button */}
          <StyledTouchableOpacity
            className="mt-4 p-4 rounded-xl overflow-hidden mb-16"
            style={{
              backgroundColor: isDark ? "#991B1B" : "#EF4444",
            }}
            onPress={logout}
          >
            <StyledView className="flex-row items-center justify-center">
              <FontAwesome5
                name="sign-out-alt"
                size={16}
                color="white"
                style={{ marginRight: 8 }}
              />
              <StyledText className="text-white text-base font-semibold">
                Logout
              </StyledText>
            </StyledView>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
}
