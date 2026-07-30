import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HOME_COLORS } from "@/src/components/home/homeColors";

export function AuthLoadingScreen() {
  return (
    <SafeAreaView
      accessibilityLabel="Chargement de ton espace."
      accessibilityLiveRegion="polite"
      style={styles.safe}
    >
      <View style={styles.content}>
        <Text style={styles.brand}>Lugua</Text>
        <ActivityIndicator
          accessibilityLabel="Chargement en cours"
          color={HOME_COLORS.accent}
          size="large"
        />
        <Text style={styles.message}>Chargement de ton espace…</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: HOME_COLORS.navy,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    padding: 24,
  },
  brand: {
    color: HOME_COLORS.textPrimary,
    fontSize: 34,
    fontWeight: "900",
  },
  message: {
    color: HOME_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
