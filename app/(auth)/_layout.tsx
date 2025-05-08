import { Stack } from "expo-router";
// default _layout page for both login and register
// user can switch between login and register pages
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
