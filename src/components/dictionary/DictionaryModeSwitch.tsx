import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { DICTIONARY_COLORS } from "@/src/components/dictionary/dictionaryColors";

export type DictionaryMode = "published" | "lessons";

type DictionaryModeSwitchProps = {
  value: DictionaryMode;
  onChange: (value: DictionaryMode) => void;
};

const options = [
  { value: "published", label: "Catalogue publié", icon: "book.fill" },
  { value: "lessons", label: "Contenus des leçons", icon: "books.vertical.fill" },
] as const;

export function DictionaryModeSwitch({
  value,
  onChange,
}: DictionaryModeSwitchProps) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              isSelected && styles.selectedOption,
              pressed && styles.pressed,
            ]}
          >
            <IconSymbol
              name={option.icon}
              size={17}
              color={
                isSelected
                  ? DICTIONARY_COLORS.ink
                  : DICTIONARY_COLORS.textSecondary
              }
            />
            <Text
              style={[styles.label, isSelected && styles.selectedLabel]}
              numberOfLines={2}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    gap: 4,
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 12,
    backgroundColor: DICTIONARY_COLORS.surface,
    padding: 4,
  },
  option: {
    minWidth: 0,
    minHeight: 40,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  selectedOption: {
    backgroundColor: DICTIONARY_COLORS.accent,
  },
  pressed: {
    opacity: 0.76,
  },
  label: {
    minWidth: 0,
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 17,
    textAlign: "center",
  },
  selectedLabel: {
    color: DICTIONARY_COLORS.ink,
  },
});
