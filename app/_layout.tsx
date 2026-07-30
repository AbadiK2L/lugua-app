import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthSessionProvider } from "@/src/contexts/AuthSessionContext";
import { LanguageSelectionProvider } from "@/src/contexts/LanguageSelectionContext";

export const unstable_settings = {
  anchor: "index",
};

export default function RootLayout() {
  return (
    <AuthSessionProvider>
      <LanguageSelectionProvider>
        <RootNavigation />
      </LanguageSelectionProvider>
    </AuthSessionProvider>
  );
}

function RootNavigation() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="student" options={{ headerShown: false }} />
        <Stack.Screen name="teacher" options={{ headerShown: false }} />
        <Stack.Screen name="lesson/[conceptId]" options={{ headerShown: false }} />
        <Stack.Screen name="concept/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="dictionary/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="assessment/[assessmentId]"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="quiz" options={{ headerShown: false }} />
        <Stack.Screen name="result" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
