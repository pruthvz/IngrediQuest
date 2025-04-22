import { ThemeProvider } from "@/src/components/ThemeProvider";
import { AuthProvider } from "@/src/context/AuthContext";
import { SavedRecipesProvider } from "@/src/context/SavedRecipesContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { UserPreferencesProvider } from "../src/context/UserPreferencesContext";
import FloatingChatButton from "../src/components/FloatingChatButton";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <UserPreferencesProvider>
          <SavedRecipesProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />
            </Stack>
            <FloatingChatButton />
          </SavedRecipesProvider>
        </UserPreferencesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
