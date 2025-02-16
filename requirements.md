# Recipe App Feature Document

## Platform

- **Mobile:** Expo React Native (cross-platform)
- **Web:** Expo React Native + Web

## Tech Stack

- **AI Code Editor:** Cursor AI
- **Styling:** Tailwind CSS (via NativeWind for React Native)
- **Backend/Database:** Supabase
- **AI Integration:** DeepSeek AI (recipe suggestions, substitutions)
- **Recipe API:** Spoonacular/Rapid Food API (recipe data)

## Core Features

### 1. User Authentication

- **Sign up/Login:** via email, Google, or Apple.
- **Profile Management:** Manage username, dietary preferences, allergies.
- **Security:** Supabase Auth for secure user sessions.

### 2. Ingredient Input & Management

- **Dynamic Input Field:** Supports ingredient entry with auto-suggestions (using Spoonacular’s ingredient database).
- **Tag/Chip System:** Displays added ingredients (e.g., “Tomato 🗑”).
- **Future Feature:** Scan pantry items via camera.

### 3. Recipe Search & Display

- **Recipe Fetching:** Retrieve recipes from the Spoonacular API based on user’s ingredients.
- **Display Options:**
  - Recipe name
  - Thumbnail image
  - Matching ingredient count (e.g., “7/10 ingredients available”)
  - Cooking time, difficulty, and dietary tags (vegan, gluten-free)

### 4. Recipe Details Page

- **Content:**
  - Full recipe instructions with step-by-step guides
  - Ingredients list with checkboxes
  - Nutritional information (calories, protein, etc.)
- **Interactive Features:**
  - “Save to Favorites” button (stored in Supabase)
  - Share recipe via social media or messaging apps

### 5. AI-Powered Features (DeepSeek)

- **Ingredient Substitutions:** Suggest alternatives for missing ingredients.
- **Personalized Recommendations:** Learn and adapt to user preferences over time.
- **Chat Assistance:** Answer queries like “What can I make with [X]?” with AI-generated ideas.

### 6. Meal Planning & Shopping List

- **Weekly Meal Planner:** Drag-and-drop functionality for recipes.
- **Shopping List Generation:** Auto-generates lists for missing ingredients.
- **Data Sync:** Planner data synced with Supabase.

### 7. Notifications

- **Reminders:** For planned meals.
- **Future Feature:** Alerts for expiring ingredients.

## Technical Architecture

### Frontend (Expo React Native + Web)

- **UI Components:**
  - Responsive layout with Tailwind CSS/NativeWind.
  - Custom hooks for API calls (Spoonacular, Supabase).
- **State Management:**
  - Utilize React Context or Zustand for shared state (e.g., user session, ingredients).

### Backend (Supabase)

- **Database Tables:**
  - `users`: Profiles and dietary preferences.
  - `saved_recipes`: Favorites and meal plans.
  - `user_ingredients`: Track pantry items (future phase).
- **Realtime Updates:**
  - Supabase subscriptions for syncing favorites/meal plans.

### APIs

#### Spoonacular/Rapid Food API

- **Endpoints:**
  - `GET /recipes/findByIngredients` for recipe search.
  - `GET /recipes/{id}/information` for detailed recipe information.

#### DeepSeek API

- **Functionality:**
  - Generate ingredient substitutions and personalized recommendations via prompt engineering.

## Additional Features

### 1. Social Sharing

- **Capabilities:**
  - Share recipes/meal plans as links or images.
  - Future enhancement: Follow other users.

### 2. Offline Mode

- **Functionality:**
  - Cache recipes and ingredients locally (using AsyncStorage/SQLite).

### 3. Voice Input

- **Feature:**
  - Add ingredients via voice-to-text (Expo Speech API).

## Monetization Strategy

### Freemium Model

- **Free Tier:** Basic features with ads.
- **Premium Tier ($4.99/month):**
  - Ad-free experience, advanced filters, AI chat, and meal planning.
- **In-App Purchases:** One-time payment for exclusive recipes.

## Testing & Deployment

### Testing

- **Unit Testing:** Jest/Testing Library.
- **End-to-End Testing:** Detox.

### Deployment

- **Mobile:** Android/iOS via Expo EAS.
- **Web:** Hosted on Vercel/Netlify.

## Timeline

### Phase 1 (MVP – 4-6 Weeks)

- User authentication.
- Ingredient input.
- Basic recipe search and details page.

### Phase 2 (8-10 Weeks)

- AI features (ingredient substitutions, personalized recommendations).
- Meal planner.
- Shopping list generation.

### Phase 3 (12+ Weeks)

- Social features.
- Camera integration.
- Offline mode.
