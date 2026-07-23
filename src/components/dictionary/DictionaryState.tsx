import { Pressable, StyleSheet, Text, View } from "react-native";

import { DICTIONARY_COLORS } from "@/src/components/dictionary/dictionaryColors";

export type DictionaryStateVariant = "empty" | "no_results" | "loading" | "error";

export type DictionaryStateProps = {
  variant: DictionaryStateVariant;
  query?: string;
  onReset?: () => void;
};

const stateContent: Record<
  DictionaryStateVariant,
  { title: string; explanation: string; action?: string }
> = {
  empty: {
    title: "Le dictionnaire est prêt",
    explanation: "Les entrées locales apparaîtront ici.",
  },
  no_results: {
    title: "Aucune entrée trouvée",
    explanation: "Essaie un autre mot ou réinitialise la recherche et les filtres.",
    action: "Réinitialiser la recherche et les filtres",
  },
  loading: {
    title: "Chargement du dictionnaire",
    explanation: "Les entrées sont en cours de préparation.",
  },
  error: {
    title: "Dictionnaire indisponible",
    explanation: "Une erreur est survenue. Réessaie plus tard.",
    action: "Réinitialiser",
  },
};

export function DictionaryState({
  variant,
  query,
  onReset,
}: DictionaryStateProps) {
  const content = stateContent[variant];

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.explanation}>
        {query ? "Aucune entrée ne correspond à « " + query + " ». " : ""}
        {content.explanation}
      </Text>
      {content.action && onReset ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={content.action}
          onPress={onReset}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text style={styles.actionText}>{content.action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "stretch",
    alignItems: "center",
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 14,
    backgroundColor: DICTIONARY_COLORS.card,
    padding: 24,
  },
  title: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "800",
  },
  explanation: {
    maxWidth: 520,
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },
  action: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: DICTIONARY_COLORS.accent,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.78,
  },
  actionText: {
    color: DICTIONARY_COLORS.ink,
    fontSize: 14,
    fontWeight: "800",
  },
});
