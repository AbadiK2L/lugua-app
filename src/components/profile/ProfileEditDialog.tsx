import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  languageOptions,
  type LanguageSelectionId,
} from "@/src/components/home/LanguageSelector";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import type { AuthActionResult } from "@/src/contexts/AuthSessionContext";
import type { UserRole } from "@/src/types/profile";

type ProfileEditDialogProps = {
  visible: boolean;
  initialDisplayName: string;
  initialVariety: LanguageSelectionId;
  role: UserRole;
  submitting: boolean;
  onCancel: () => void;
  onSave: (input: {
    displayName: string;
    variety: LanguageSelectionId;
  }) => Promise<AuthActionResult>;
};

function VarietyOption({
  id,
  label,
  detail,
  selected,
  onSelect,
}: {
  id: LanguageSelectionId;
  label: string;
  detail: string;
  selected: boolean;
  onSelect: (id: LanguageSelectionId) => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${label}, ${detail}`}
      accessibilityState={{ selected }}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={() => onSelect(id)}
      style={({ pressed }) => [
        styles.varietyOption,
        selected && styles.varietyOptionSelected,
        focused && styles.focused,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.varietyCopy}>
        <Text style={styles.varietyLabel}>{label}</Text>
        <Text style={styles.varietyDetail}>{detail}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

export function ProfileEditDialog({
  visible,
  initialDisplayName,
  initialVariety,
  role,
  submitting,
  onCancel,
  onSave,
}: ProfileEditDialogProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [variety, setVariety] =
    useState<LanguageSelectionId>(initialVariety);
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setDisplayName(initialDisplayName);
    setVariety(initialVariety);
    setError(null);
  }, [initialDisplayName, initialVariety, visible]);

  async function save() {
    if (submitting) {
      return;
    }

    const normalizedDisplayName = displayName.trim();

    if (
      normalizedDisplayName.length < 1 ||
      normalizedDisplayName.length > 80
    ) {
      setError("Le nom affiché doit contenir entre 1 et 80 caractères.");
      return;
    }

    setError(null);
    const result = await onSave({
      displayName: normalizedDisplayName,
      variety,
    });

    if (!result.ok) {
      setError(result.message);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={submitting ? undefined : onCancel}
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboard}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View accessibilityViewIsModal style={styles.dialog}>
              <View style={styles.heading}>
                <Text style={styles.title}>Modifier le profil</Text>
                <Text style={styles.subtitle}>
                  Le nom et la variété seront enregistrés dans ton profil
                  Lugua.
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Nom affiché</Text>
                <TextInput
                  accessibilityLabel="Nom affiché"
                  accessibilityHint={error ?? "Entre 1 et 80 caractères"}
                  aria-invalid={Boolean(error)}
                  value={displayName}
                  onBlur={() => setInputFocused(false)}
                  onFocus={() => setInputFocused(true)}
                  onChangeText={(value) => {
                    setDisplayName(value);
                    setError(null);
                  }}
                  autoCapitalize="words"
                  autoComplete="name"
                  maxLength={80}
                  placeholder="Utilisateur Lugua"
                  placeholderTextColor={HOME_COLORS.textSecondary}
                  returnKeyType="done"
                  style={[
                    styles.input,
                    inputFocused && styles.inputFocused,
                    error && styles.inputInvalid,
                  ]}
                />
              </View>

              <View style={styles.readOnlyField}>
                <Text style={styles.fieldLabel}>Rôle</Text>
                <Text style={styles.readOnlyValue}>
                  {role === "student" ? "Élève" : "Professeur"}
                </Text>
                <Text style={styles.readOnlyHint}>
                  Le rôle ne peut pas encore être modifié dans l’application.
                </Text>
              </View>

              <View style={styles.varietySection}>
                <Text style={styles.fieldLabel}>Variété préférée</Text>
                <View accessibilityRole="radiogroup" style={styles.varieties}>
                  {languageOptions.map((option) => (
                    <VarietyOption
                      key={option.id}
                      id={option.id}
                      label={option.label}
                      detail={option.detail}
                      selected={variety === option.id}
                      onSelect={setVariety}
                    />
                  ))}
                </View>
              </View>

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
                  accessibilityLabel="Annuler la modification"
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
                  accessibilityLabel="Enregistrer le profil"
                  accessibilityState={{
                    disabled: submitting,
                    busy: submitting,
                  }}
                  disabled={submitting}
                  onPress={() => {
                    void save();
                  }}
                  style={({ pressed }) => [
                    styles.button,
                    styles.primaryButton,
                    submitting && styles.disabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {submitting ? "Enregistrement…" : "Enregistrer"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: HOME_COLORS.navy,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  dialog: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    gap: 20,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 16,
    backgroundColor: HOME_COLORS.card,
    padding: 20,
  },
  heading: {
    gap: 7,
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 23,
    fontWeight: "900",
  },
  subtitle: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  field: {
    gap: 7,
  },
  fieldLabel: {
    color: HOME_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    color: HOME_COLORS.textPrimary,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: HOME_COLORS.accent,
  },
  inputInvalid: {
    borderColor: "#d86f7e",
  },
  readOnlyField: {
    gap: 5,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    padding: 14,
  },
  readOnlyValue: {
    color: HOME_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  readOnlyHint: {
    color: HOME_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  varietySection: {
    gap: 9,
  },
  varieties: {
    gap: 8,
  },
  varietyOption: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 11,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  varietyOptionSelected: {
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.accentSoft,
  },
  varietyCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  varietyLabel: {
    color: HOME_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  varietyDetail: {
    color: HOME_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  radio: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: HOME_COLORS.textMuted,
    borderRadius: 11,
  },
  radioSelected: {
    borderColor: HOME_COLORS.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: HOME_COLORS.accent,
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
  primaryButton: {
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.accent,
  },
  buttonText: {
    color: HOME_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "900",
  },
  primaryButtonText: {
    color: HOME_COLORS.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  focused: {
    borderWidth: 2,
    borderColor: HOME_COLORS.textPrimary,
  },
  disabled: {
    opacity: 0.48,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
});
