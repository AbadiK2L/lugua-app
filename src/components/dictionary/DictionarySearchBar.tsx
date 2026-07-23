import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { DICTIONARY_COLORS } from "@/src/components/dictionary/dictionaryColors";

export type DictionarySearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
};

export function DictionarySearchBar({
  value,
  onChangeText,
  onClear,
}: DictionarySearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, isFocused && styles.focusedContainer]}>
      <IconSymbol
        name="magnifyingglass"
        size={21}
        color={DICTIONARY_COLORS.accent}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Rechercher en shiKomori ou en français"
        placeholderTextColor={DICTIONARY_COLORS.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        accessibilityLabel="Rechercher en shiKomori ou en français"
        style={styles.input}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Effacer la recherche"
          hitSlop={6}
          onPress={onClear}
          style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
        >
          <IconSymbol
            name="xmark"
            size={19}
            color={DICTIONARY_COLORS.textSecondary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 14,
    backgroundColor: DICTIONARY_COLORS.surface,
    paddingLeft: 16,
    paddingRight: 6,
  },
  focusedContainer: {
    borderColor: DICTIONARY_COLORS.accent,
    backgroundColor: DICTIONARY_COLORS.cardActive,
  },
  input: {
    flex: 1,
    minHeight: 44,
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  clearButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  pressed: {
    backgroundColor: DICTIONARY_COLORS.cardActive,
  },
});
