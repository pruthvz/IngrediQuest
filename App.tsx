// Import polyfills first to ensure Node.js modules are available
import './polyfills';

import { AuthProvider } from "./src/context/AuthContext";
import { SavedRecipesProvider } from "./src/context/SavedRecipesContext";

export default function App() {
  return (
    <AuthProvider>
      <SavedRecipesProvider>
        {/* Expo Router handles the navigation */}
      </SavedRecipesProvider>
    </AuthProvider>
  );
}
