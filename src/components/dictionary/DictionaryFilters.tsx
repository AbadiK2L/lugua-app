import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { DICTIONARY_COLORS } from "@/src/components/dictionary/dictionaryColors";
import {
  getDictionaryPartOfSpeechLabel,
  type DictionaryPartOfSpeech,
} from "@/src/types/dictionary";

export type DictionaryFiltersProps = {
  selectedPartsOfSpeech: DictionaryPartOfSpeech[];
  onApply: (values: DictionaryPartOfSpeech[]) => void;
  onReset: () => void;
};

const partOfSpeechOptions: DictionaryPartOfSpeech[] = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "interjection",
  "question_word",
  "expression",
  "other",
];

export function DictionaryFilters({
  selectedPartsOfSpeech,
  onApply,
  onReset,
}: DictionaryFiltersProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [draftValues, setDraftValues] = useState<DictionaryPartOfSpeech[]>(
    selectedPartsOfSpeech,
  );

  function openFilters() {
    setDraftValues(selectedPartsOfSpeech);
    setIsVisible(true);
  }

  function closeFilters() {
    setIsVisible(false);
  }

  function togglePartOfSpeech(value: DictionaryPartOfSpeech) {
    setDraftValues((currentValues) =>
      currentValues.includes(value)
        ? currentValues.filter((currentValue) => currentValue !== value)
        : [...currentValues, value],
    );
  }

  function resetDraft() {
    setDraftValues([]);
    onReset();
  }

  function applyFilters() {
    onApply(draftValues);
    closeFilters();
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          selectedPartsOfSpeech.length
            ? "Filtres, " + selectedPartsOfSpeech.length + " actifs"
            : "Filtres"
        }
        accessibilityState={{ expanded: isVisible }}
        onPress={openFilters}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <IconSymbol
          name="line.3.horizontal.decrease.circle"
          size={18}
          color={DICTIONARY_COLORS.accent}
        />
        <Text style={styles.triggerText}>Filtres</Text>
        {selectedPartsOfSpeech.length ? (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{selectedPartsOfSpeech.length}</Text>
          </View>
        ) : null}
        <IconSymbol
          name="chevron.down"
          size={16}
          color={DICTIONARY_COLORS.textSecondary}
        />
      </Pressable>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={closeFilters}
        accessibilityViewIsModal
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer les filtres"
            onPress={closeFilters}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.heading}>
                <Text style={styles.modalTitle}>Filtres</Text>
                <Text style={styles.modalSubtitle}>Nature grammaticale</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fermer"
                onPress={closeFilters}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.pressed,
                ]}
              >
                <IconSymbol
                  name="xmark"
                  size={20}
                  color={DICTIONARY_COLORS.textSecondary}
                />
              </Pressable>
            </View>

            <ScrollView
              style={styles.options}
              contentContainerStyle={styles.optionsContent}
              showsVerticalScrollIndicator={false}
            >
              {partOfSpeechOptions.map((value) => {
                const isSelected = draftValues.includes(value);

                return (
                  <Pressable
                    key={value}
                    accessibilityRole="checkbox"
                    accessibilityLabel={getDictionaryPartOfSpeechLabel(value)}
                    accessibilityState={{ checked: isSelected }}
                    onPress={() => togglePartOfSpeech(value)}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.selectedOption,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.selectedOptionLabel,
                      ]}
                    >
                      {getDictionaryPartOfSpeechLabel(value)}
                    </Text>
                    <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
                      {isSelected ? (
                        <IconSymbol
                          name="checkmark"
                          size={15}
                          color={DICTIONARY_COLORS.ink}
                        />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Réinitialiser les filtres"
                onPress={resetDraft}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>Réinitialiser</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Appliquer les filtres"
                onPress={applyFilters}
                style={({ pressed }) => [
                  styles.applyButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.applyButtonText}>Appliquer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexShrink: 0,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 12,
    backgroundColor: DICTIONARY_COLORS.surface,
    paddingHorizontal: 14,
  },
  triggerText: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: DICTIONARY_COLORS.accent,
    paddingHorizontal: 5,
  },
  countText: {
    color: DICTIONARY_COLORS.ink,
    fontSize: 12,
    fontWeight: "800",
  },
  modalRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(7, 17, 31, 0.82)",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "86%",
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 18,
    backgroundColor: DICTIONARY_COLORS.card,
    padding: 18,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  heading: {
    flex: 1,
    gap: 4,
  },
  modalTitle: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 21,
    fontWeight: "800",
  },
  modalSubtitle: {
    color: DICTIONARY_COLORS.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  options: {
    marginTop: 14,
  },
  optionsContent: {
    gap: 8,
  },
  option: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  selectedOption: {
    borderColor: DICTIONARY_COLORS.accent,
    backgroundColor: DICTIONARY_COLORS.accentSoft,
  },
  optionLabel: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  selectedOptionLabel: {
    color: DICTIONARY_COLORS.textPrimary,
  },
  checkbox: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.textMuted,
    borderRadius: 6,
  },
  checkedBox: {
    borderColor: DICTIONARY_COLORS.accent,
    backgroundColor: DICTIONARY_COLORS.accent,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 14,
  },
  secondaryButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },
  applyButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: DICTIONARY_COLORS.accent,
    paddingHorizontal: 16,
  },
  applyButtonText: {
    color: DICTIONARY_COLORS.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.78,
  },
});
