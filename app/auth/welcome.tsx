import { router, type Href } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AuthButton } from "@/src/components/auth/AuthButton";
import { AuthScreenShell } from "@/src/components/auth/AuthScreenShell";
import { useAuthSession } from "@/src/contexts/AuthSessionContext";

export default function WelcomeScreen() {
  const { authError } = useAuthSession();

  return (
    <AuthScreenShell
      title="Apprends, enseigne et partage les langues."
      subtitle="Ton espace sera déterminé automatiquement par ton profil."
    >
      {authError ? (
        <Text accessibilityLiveRegion="polite" role="alert" style={styles.error}>
          {authError}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <AuthButton
          label="Se connecter"
          accessibilityHint="Ouvre le formulaire de connexion"
          onPress={() => router.push("/auth/sign-in" as Href)}
        />
        <AuthButton
          label="Créer un compte"
          variant="secondary"
          accessibilityHint="Ouvre le formulaire d’inscription"
          onPress={() => router.push("/auth/sign-up" as Href)}
        />
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
  },
  error: {
    borderWidth: 1,
    borderColor: "#8d4552",
    borderRadius: 12,
    backgroundColor: "#351d28",
    color: "#f4bac1",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
    padding: 14,
  },
});
