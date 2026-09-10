import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { DICTIONARY_COLORS } from "@/src/components/dictionary/dictionaryColors";
import type { PublishedDictionarySearchEntry } from "@/src/types/publishedDictionary";

type PublishedDictionaryEntryCardProps = {
  entry: PublishedDictionarySearchEntry;
  onPress: () => void;
};

function getModalityLabel(code: string) {
  if (code === "written") {
    return "Forme écrite";
  }

  if (code === "spoken") {
    return "Forme orale";
  }

  return `Modalité : ${code}`;
}

export function PublishedDictionaryEntryCard({
  entry,
  onPress,
}: PublishedDictionaryEntryCardProps) {
  const matchLabel =
    entry.matchedField === "surface"
      ? "Correspondance dans la forme"
      : "Correspondance dans la glose";
  const varietyLabel = entry.varietyCode
    ? `Variété ${entry.varietyCode}`
    : "Variété non précisée";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir l’entrée publiée ${entry.surfaceText}`}
      accessibilityHint="Affiche la fiche linguistique publiée"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.headword}>{entry.surfaceText}</Text>
          <Text style={styles.gloss} numberOfLines={3}>
            {entry.glossText ?? "Aucune glose disponible dans cette locale"}
          </Text>
        </View>
        <IconSymbol
          name="chevron.right"
          size={22}
          color={DICTIONARY_COLORS.textSecondary}
        />
      </View>

      <View style={styles.metadata}>
        {entry.exactMatch ? (
          <View style={styles.exactBadge}>
            <Text style={styles.exactText}>Correspondance exacte</Text>
          </View>
        ) : null}
        <Text style={styles.metaText}>{getModalityLabel(entry.formModalityCode)}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.metaText}>{varietyLabel}</Text>
      </View>
      <Text style={styles.matchText}>{matchLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    gap: 12,
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 14,
    backgroundColor: DICTIONARY_COLORS.card,
    padding: 16,
  },
  pressed: {
    borderColor: DICTIONARY_COLORS.accent,
    backgroundColor: DICTIONARY_COLORS.cardActive,
  },
  headingRow: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headingCopy: {
    minWidth: 0,
    flex: 1,
    gap: 5,
  },
  headword: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 29,
  },
  gloss: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  metadata: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  exactBadge: {
    minHeight: 26,
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: DICTIONARY_COLORS.accentSoft,
    paddingHorizontal: 8,
  },
  exactText: {
    color: DICTIONARY_COLORS.accent,
    fontSize: 11,
    fontWeight: "800",
  },
  metaText: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  metaDot: {
    color: DICTIONARY_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  matchText: {
    color: DICTIONARY_COLORS.textMuted,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
  },
});
