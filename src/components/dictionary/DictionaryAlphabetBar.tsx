import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { DICTIONARY_COLORS } from "@/src/components/dictionary/dictionaryColors";
import {
  SHIKOMORI_ALPHABET,
  type DictionaryLetterSelection,
  type ShikomoriAlphabetLetter,
} from "@/src/data/dictionary/alphabet";

export type DictionaryAlphabetBarProps = {
  selectedLetter: DictionaryLetterSelection;
  availableLetters: Set<ShikomoriAlphabetLetter>;
  onSelectLetter: (letter: DictionaryLetterSelection) => void;
};

export function DictionaryAlphabetBar({
  selectedLetter,
  availableLetters,
  onSelectLetter,
}: DictionaryAlphabetBarProps) {
  const letters: DictionaryLetterSelection[] = ["all", ...SHIKOMORI_ALPHABET];

  return (
    <ScrollView
      style={styles.scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      accessibilityLabel="Alphabet shiKomori"
    >
      {letters.map((letter) => {
        const isAll = letter === "all";
        const isSelected = selectedLetter === letter;
        const isAvailable = isAll || availableLetters.has(letter);
        const label = isAll ? "Tous" : letter;

        return (
          <Pressable
            key={letter}
            accessibilityRole="button"
            accessibilityLabel={
              isAll
                ? "Toutes les lettres"
                : "Lettre " +
                  letter +
                  ", " +
                  (isAvailable ? "disponible" : "aucune entrée")
            }
            accessibilityState={{
              selected: isSelected,
              disabled: !isAvailable,
            }}
            disabled={!isAvailable}
            onPress={() => onSelectLetter(letter)}
            style={({ pressed }) => [
              styles.letter,
              isSelected && styles.selectedLetter,
              !isAvailable && styles.unavailableLetter,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.label,
                isSelected && styles.selectedLabel,
                !isAvailable && styles.unavailableLabel,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    paddingVertical: 2,
    paddingRight: 8,
  },
  scroll: {
    width: "100%",
  },
  letter: {
    minWidth: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 12,
    backgroundColor: DICTIONARY_COLORS.surface,
    paddingHorizontal: 8,
  },
  selectedLetter: {
    borderColor: DICTIONARY_COLORS.accent,
    backgroundColor: DICTIONARY_COLORS.accentSoft,
  },
  unavailableLetter: {
    opacity: 0.48,
  },
  label: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },
  selectedLabel: {
    color: DICTIONARY_COLORS.accent,
  },
  unavailableLabel: {
    color: DICTIONARY_COLORS.textMuted,
  },
  pressed: {
    backgroundColor: DICTIONARY_COLORS.cardActive,
  },
});
