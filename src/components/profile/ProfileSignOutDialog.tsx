import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";

type ProfileSignOutDialogProps = {
  visible: boolean;
  submitting: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ProfileSignOutDialog({
  visible,
  submitting,
  error,
  onCancel,
  onConfirm,
}: ProfileSignOutDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={submitting ? undefined : onCancel}
    >
      <View accessibilityViewIsModal style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Annuler la déconnexion"
          disabled={submitting}
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.dialog}>
          <Text style={styles.title}>Se déconnecter ?</Text>
          <Text style={styles.message}>
            Tu devras saisir de nouveau tes identifiants pour accéder à ton
            espace.
          </Text>
          {error ? (
            <Text
              accessibilityLiveRegion="assertive"
              role="alert"
              style={styles.error}
            >
              {error}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Annuler"
              accessibilityState={{ disabled: submitting }}
              disabled={submitting}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                submitting && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>Annuler</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Se déconnecter"
              accessibilityState={{ disabled: submitting, busy: submitting }}
              disabled={submitting}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                styles.destructiveButton,
                submitting && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.destructiveButtonText}>
                {submitting ? "Déconnexion…" : "Se déconnecter"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.66)",
    padding: 20,
  },
  dialog: {
    width: "100%",
    maxWidth: 430,
    gap: 11,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.card,
    padding: 18,
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "900",
  },
  message: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  error: {
    color: "#f1a5ae",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 6,
  },
  button: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 10,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 16,
  },
  destructiveButton: {
    borderColor: "#d86f7e",
    backgroundColor: "#d86f7e",
  },
  buttonText: {
    color: HOME_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "900",
  },
  destructiveButtonText: {
    color: HOME_COLORS.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.48,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});
