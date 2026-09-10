import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { DICTIONARY_COLORS } from "@/src/components/dictionary/dictionaryColors";

type PublishedDictionaryStateProps = {
  title: string;
  message: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

export function PublishedDictionaryState({
  title,
  message,
  loading = false,
  actionLabel,
  onAction,
}: PublishedDictionaryStateProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole={loading ? undefined : "alert"}
      accessibilityLiveRegion="polite"
    >
      {loading ? (
        <ActivityIndicator
          accessibilityLabel="Chargement du dictionnaire publié"
          color={DICTIONARY_COLORS.accent}
          size="small"
        />
      ) : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 28,
  },
  title: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 25,
    textAlign: "center",
  },
  message: {
    width: "100%",
    maxWidth: 520,
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
    textAlign: "center",
  },
  action: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: DICTIONARY_COLORS.accent,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.78,
  },
  actionText: {
    color: DICTIONARY_COLORS.ink,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
});
