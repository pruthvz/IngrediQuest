import { ThemeProvider } from "@/src/components/ThemeProvider";
import { AuthProvider } from "@/src/context/AuthContext";
import { SavedRecipesProvider } from "@/src/context/SavedRecipesContext";
import { ShoppingListProvider } from "@/src/context/ShoppingListContext";
import FontAwesomeScript from "./components/FontAwesomeScript";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
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
  // tabs include all the pages that are accessible after login
  // auth includes login and register pages
  // about is the about page
  // floating chat button is the chatbot
  return (
    <AuthProvider>
      <UserPreferencesProvider>
        <ThemeProvider>
          <SavedRecipesProvider>
            <ShoppingListProvider>
              <>
                <FontAwesomeScript />
                <Stack>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(auth)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="about" options={{ headerShown: false }} />
                </Stack>
                <FloatingChatButton />
              </>
            </ShoppingListProvider>
          </SavedRecipesProvider>
        </ThemeProvider>
      </UserPreferencesProvider>
    </AuthProvider>
  );
}
