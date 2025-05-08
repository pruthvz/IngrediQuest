import { Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

// this is the main entry point for the app
// it redirects to the login page if the user is not authenticated
// otherwise it redirects to the home page

export default function Index() {
  const { isAuthenticated } = useAuth();

  return <Redirect href={isAuthenticated ? "/(tabs)" : "/login"} />;
}
