import { Redirect, Stack } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  // If user is authenticated, redirect to home page
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // If user is not authenticated, show auth screens
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}
