import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";

export const languageOptions = [
  { id: "shikomori", label: "shiKomori", detail: "Général" },
  { id: "shingazidja", label: "shiNgazidja", detail: "Grande Comore" },
  { id: "shindzuani", label: "shiNdzuani", detail: "Anjouan" },
  { id: "shimwali", label: "shiMwali", detail: "Mohéli" },
  { id: "shimaore", label: "shiMaore", detail: "Mayotte" },
] as const;

export type LanguageSelectionId = (typeof languageOptions)[number]["id"];

type LanguageSelectorProps = {
  value: LanguageSelectionId;
  onChange: (value: LanguageSelectionId) => void;
};

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const selectedOption = useMemo(
    () => languageOptions.find((option) => option.id === value) ?? languageOptions[0],
    [value],
  );

  function close() {
    setIsVisible(false);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Langue d’apprentissage : ${selectedOption.label}`}
        accessibilityHint="Ouvre le sélecteur de langue et de variété"
        accessibilityState={{ expanded: isVisible }}
        onPress={() => setIsVisible(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <Text style={styles.flag} accessibilityLabel="Drapeau des Comores">
          🇰🇲
        </Text>
        <Text style={styles.triggerText} numberOfLines={1}>
          {selectedOption.label}
        </Text>
        <IconSymbol name="chevron.down" size={18} color={HOME_COLORS.textSecondary} />
      </Pressable>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={close}
        accessibilityViewIsModal
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer le sélecteur de langue"
            onPress={close}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeading}>
                <Text style={styles.modalTitle}>Langue d’apprentissage</Text>
                <Text style={styles.modalSection}>shiKomori</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fermer"
                onPress={close}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              >
                <IconSymbol name="xmark" size={20} color={HOME_COLORS.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.options}>
              {languageOptions.map((option) => {
                const isSelected = option.id === value;

                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="radio"
                    accessibilityLabel={`${option.label} — ${option.detail}`}
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      onChange(option.id);
                      close();
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.selectedOption,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.optionCopy}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      <Text style={styles.optionDetail}>— {option.detail}</Text>
                    </View>
                    {isSelected ? (
                      <IconSymbol name="checkmark" size={21} color={HOME_COLORS.accent} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.modalNote}>
              Le contenu spécifique à chaque variété sera ajouté progressivement.
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 44,
    maxWidth: 114,
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 10,
  },
  pressed: {
    opacity: 0.76,
  },
  flag: {
    fontSize: 19,
  },
  triggerText: {
    flex: 1,
    color: HOME_COLORS.textPrimary,
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
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 18,
    backgroundColor: HOME_COLORS.surface,
    padding: 18,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  modalHeading: {
    flex: 1,
    gap: 5,
  },
  modalTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "800",
  },
  modalSection: {
    color: HOME_COLORS.accent,
    fontSize: 13,
    fontWeight: "800",
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  options: {
    gap: 8,
    marginTop: 18,
  },
  option: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  selectedOption: {
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.accentSoft,
  },
  optionCopy: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: 5,
    rowGap: 2,
  },
  optionLabel: {
    color: HOME_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  optionDetail: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  modalNote: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 16,
  },
});
