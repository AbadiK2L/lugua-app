import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HOME_COLORS } from "@/src/components/home/homeColors";

type ProfileUnavailableScreenProps = {
  isRetrying: boolean;
  isSigningOut: boolean;
  onRetry: () => void;
  onSignOut: () => void;
};

export function ProfileUnavailableScreen({
  isRetrying,
  isSigningOut,
  onRetry,
  onSignOut,
}: ProfileUnavailableScreenProps) {
  const isBusy = isRetrying || isSigningOut;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={styles.title}>Profil indisponible</Text>
          <Text style={styles.message}>
            Ton compte est connecté, mais son profil Lugua n’a pas pu être
            chargé.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Réessayer de charger le profil"
            accessibilityState={{ disabled: isBusy, busy: isRetrying }}
            disabled={isBusy}
            onPress={onRetry}
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              isBusy && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isRetrying ? "Chargement…" : "Réessayer"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Se déconnecter"
            accessibilityState={{ disabled: isBusy, busy: isSigningOut }}
            disabled={isBusy}
            onPress={onSignOut}
            style={({ pressed }) => [
              styles.button,
              isBusy && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.buttonText}>
              {isSigningOut ? "Déconnexion…" : "Se déconnecter"}
            </Text>
          </Pressable>
        </View>
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
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    justifyContent: "center",
    gap: 28,
    padding: 24,
  },
  copy: {
    gap: 10,
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 30,
    fontWeight: "900",
  },
  message: {
    color: HOME_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  actions: {
    gap: 10,
  },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 18,
  },
  primaryButton: {
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.accent,
  },
  buttonText: {
    color: HOME_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  primaryButtonText: {
    color: HOME_COLORS.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.48,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
});
