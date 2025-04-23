import React from "react";
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
} from "react-native";
import { styled } from "nativewind";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { useSavedRecipes } from "../../src/context/SavedRecipesContext";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { useUserPreferences } from "../../src/context/UserPreferencesContext";
import { LinearGradient } from "expo-linear-gradient";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);
const StyledSwitch = styled(Switch);

interface SettingItem {
  id: string;
  title: string;
  icon: string;
  color: string;
}

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  color?: string;
  rightElement?: React.ReactNode;
  onPress: () => void;
  isDark: boolean;
}

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
  const { logout, username } = useAuth();
  const { savedRecipes } = useSavedRecipes();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { preferences } = useUserPreferences();

  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(isDark);

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
              <StyledView className="p-2 bg-white/20 rounded-full mb-4">
                <Image
                  source={{ uri: "https://i.pravatar.cc/150" }}
                  className="w-24 h-24 rounded-full"
                />
              </StyledView>
              <StyledText className="text-white text-xl font-bold">
                {username || "User"}
              </StyledText>
            </StyledView>

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
                subtitle="youremail@example.com"
                color="#8B5CF6"
                onPress={() => {}}
                isDark={isDark}
              />
              <SettingItem
                icon="key"
                title="Password"
                subtitle="Change your password"
                color="#EC4899"
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
                    value={darkMode}
                    onValueChange={() => setDarkMode(!darkMode)}
                    trackColor={{ false: "#767577", true: "#818CF8" }}
                    thumbColor={darkMode ? "#6366F1" : "#f4f3f4"}
                  />
                }
                onPress={() => setDarkMode(!darkMode)}
                isDark={isDark}
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

          {/* Help & Support */}
          <StyledView className="mb-6">
            <StyledText className="text-sm uppercase font-bold mb-2 ml-1 text-indigo-500">
              Help & Support
            </StyledText>
            <StyledView className="rounded-2xl overflow-hidden">
              <SettingItem
                icon="question-circle"
                title="Help Center"
                color="#8B5CF6"
                onPress={() => {}}
                isDark={isDark}
              />
              <SettingItem
                icon="comment-alt"
                title="Send Feedback"
                color="#14B8A6"
                onPress={() => {}}
                isDark={isDark}
              />
              <SettingItem
                icon="info-circle"
                title="About Us"
                color="#F97316"
                onPress={() => {}}
                isDark={isDark}
              />
            </StyledView>
          </StyledView>

          {/* Logout Button */}
          <StyledTouchableOpacity
            className="mt-4 p-4 rounded-xl overflow-hidden"
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
