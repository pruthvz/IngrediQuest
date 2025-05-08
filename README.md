# IngrediQuest 🍳

IngrediQuest is a modern recipe management and discovery app built with React Native and Expo. It helps users discover, save, and organize recipes while providing smart shopping list management and personalized recipe recommendations.

## Features

### Recipe Discovery 🔍

- Search through thousands of recipes using the Spoonacular API
- Filter recipes by cuisine, diet, and ingredients
- Get AI-powered recipe suggestions using Google's Gemini API
- View detailed recipe information including ingredients, instructions, and nutritional facts

### User Management 👤

- Create and manage your user profile
- Set dietary preferences and restrictions
- Toggle between light and dark themes
- Customize your recipe viewing experience

### Recipe Management 📚

- Save favorite recipes for quick access
- Create and organize shopping lists
- Share recipes with other users
- Rate and review recipes

### Shopping List 🛒

- Automatically generate shopping lists from recipes
- Manage multiple shopping lists
- Mark items as purchased
- Organize items by category

## Tech Stack

- React Native / Expo
- Supabase for authentication and data storage
- Spoonacular API for recipe data
- Google Gemini API for AI-powered features
- TypeScript for type safety
- Expo Router for navigation

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac users) or Android Studio (for Android development)

### Environment Setup

1. Clone the repository

   ```bash
   git clone [repository-url]
   cd IngrediQuest
   ```

2. Create a `.env` file in the root directory with the following variables:

   ```bash
   EXPO_PUBLIC_SPOONACULAR_API_KEY=your_spoonacular_api_key_here
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Install dependencies

   ```bash
   npm install
   ```

4. Start the development server
   ```bash
   npx expo start
   ```

### Running the App

After starting the development server, you have several options to run the app:

- Press `a` to open in Android Emulator
- Press `i` to open in iOS Simulator
- Scan the QR code with Expo Go app on your physical device
- Press `w` to open in web browser

> Note: You'll need to obtain API keys from [Spoonacular](https://spoonacular.com/food-api) and [Google AI Studio](https://makersuite.google.com/app/apikey) to use all features.

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
