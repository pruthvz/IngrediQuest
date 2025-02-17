import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = "https://xoejqbmsmnjpisnzcduv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZWpxYm1zbW5qcGlzbnpjZHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NTQ5ODcsImV4cCI6MjA1NTEzMDk4N30.6CXMvITxnRNMvr7Km9lGddmCowNuA2m0fL6BWNBoyps";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
