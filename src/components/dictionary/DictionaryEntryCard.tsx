import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { DICTIONARY_COLORS } from "@/src/components/dictionary/dictionaryColors";
import {
  getDictionaryPartOfSpeechLabel,
  type DictionaryEntry,
} from "@/src/types/dictionary";

type DictionaryEntryCardProps = {
  entry: DictionaryEntry;
};

export function DictionaryEntryCard({ entry }: DictionaryEntryCardProps) {
  const meanings = entry.frenchMeanings.slice(0, 2);
  const metadata = [
    entry.partOfSpeech
      ? getDictionaryPartOfSpeechLabel(entry.partOfSpeech)
      : undefined,
    entry.level,
    entry.lessonAvailable ? "Leçon" : undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={"Ouvrir l’entrée " + entry.headword}
      accessibilityHint="Affiche la fiche détaillée"
      onPress={() =>
        router.push({
          pathname: "../dictionary/[id]",
          params: { id: entry.id },
        })
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.headword}>{entry.headword}</Text>
          <IconSymbol
            name="chevron.right"
            size={22}
            color={DICTIONARY_COLORS.textSecondary}
          />
        </View>

        <Text style={styles.meanings} numberOfLines={2}>
          {meanings.join(" · ")}
        </Text>

        <Text style={styles.metaText} numberOfLines={2}>
          {metadata}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    alignSelf: "stretch",
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 14,
    backgroundColor: DICTIONARY_COLORS.card,
  },
  pressed: {
    borderColor: DICTIONARY_COLORS.accent,
    backgroundColor: DICTIONARY_COLORS.cardActive,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headword: {
    flex: 1,
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: "800",
  },
  meanings: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 23,
  },
  metaText: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
});
