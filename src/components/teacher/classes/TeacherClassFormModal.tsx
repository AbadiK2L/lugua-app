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

import { languageOptions } from "@/src/components/home/LanguageSelector";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import type {
  CreateTeacherClassInput,
  TeacherClass,
} from "@/src/types/teacher";

type TeacherClassFormModalProps = {
  visible: boolean;
  mode: "create" | "edit";
  initialClass?: TeacherClass;
  onClose: () => void;
  onSubmit: (input: CreateTeacherClassInput) => void;
};

const levelOptions = ["A1", "A2", "B1", "B2", "Multi-niveaux", ""];

export function TeacherClassFormModal({
  visible,
  mode,
  initialClass,
  onClose,
  onSubmit,
}: TeacherClassFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [variety, setVariety] = useState<string>(languageOptions[0].detail);
  const [level, setLevel] = useState("");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(initialClass?.name ?? "");
    setDescription(initialClass?.description ?? "");
    setVariety(initialClass?.variety ?? languageOptions[0].detail);
    setLevel(initialClass?.level ?? "");
    setError(undefined);
  }, [initialClass, visible]);

  function submit() {
    if (!name.trim()) {
      setError("Ajoute un nom à la classe.");
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      language: languageOptions[0].label,
      variety,
      level: level || undefined,
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer le formulaire de classe"
          onPress={onClose}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.heading}>
              <Text style={styles.eyebrow}>{mode === "create" ? "NOUVELLE CLASSE" : "MODIFIER LA CLASSE"}</Text>
              <Text style={styles.modalTitle}>{mode === "create" ? "Créer une classe" : "Modifier la classe"}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.form}
          >
            <Field label="Nom de la classe" value={name} onChangeText={setName} placeholder="Ex. Groupe du mardi" />
            <Field label="Description (facultatif)" value={description} onChangeText={setDescription} placeholder="Décris ce groupe" multiline />

            <View style={styles.field}>
              <Text style={styles.label}>Langue enseignée</Text>
              <View style={styles.staticValue}>
                <Text style={styles.staticValueText}>{languageOptions[0].label}</Text>
              </View>
            </View>

            <ChoiceSection
              label="Variété"
              options={languageOptions.map((option) => ({
                value: option.id === "shikomori" ? option.detail : option.label,
                label: option.id === "shikomori" ? option.detail : option.label,
              }))}
              selected={variety}
              onChange={setVariety}
            />
            <ChoiceSection
              label="Niveau (facultatif)"
              options={levelOptions.map((option) => ({
                value: option,
                label: option || "Non défini",
              }))}
              selected={level}
              onChange={setLevel}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.actions}>
              <ActionButton label="Annuler" onPress={onClose} />
              <ActionButton
                label={mode === "create" ? "Créer la classe" : "Enregistrer"}
                onPress={submit}
                primary
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={HOME_COLORS.textMuted}
        multiline={multiline}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

function ChoiceSection({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choiceList}>
        {options.map((option) => (
          <Pressable
            key={option.value || "undefined"}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: option.value === selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.choice,
              option.value === selected && styles.selectedChoice,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.choiceText, option.value === selected && styles.selectedChoiceText]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, primary && styles.primaryButton, pressed && styles.pressed]}
    >
      <Text style={[styles.actionText, primary && styles.primaryActionText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(7, 17, 31, 0.84)",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "92%",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 18,
    backgroundColor: HOME_COLORS.card,
    padding: 18,
  },
  modalHeader: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  heading: { flex: 1, gap: 4 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 11, fontWeight: "900", letterSpacing: 0.6 },
  modalTitle: { color: HOME_COLORS.textPrimary, fontSize: 22, fontWeight: "900" },
  closeButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  closeText: { color: HOME_COLORS.textSecondary, fontSize: 28, fontWeight: "400", lineHeight: 30 },
  form: { gap: 12, paddingBottom: 4 },
  field: { gap: 6 },
  label: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "800" },
  input: { minHeight: 48, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, color: HOME_COLORS.textPrimary, fontSize: 14, paddingHorizontal: 12 },
  multilineInput: { minHeight: 82, textAlignVertical: "top", paddingTop: 12 },
  staticValue: { minHeight: 48, justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 12 },
  staticValueText: { color: HOME_COLORS.textPrimary, fontSize: 14, fontWeight: "800" },
  choiceList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  choice: { minHeight: 44, justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 11 },
  selectedChoice: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accentSoft },
  choiceText: { color: HOME_COLORS.textSecondary, fontSize: 12, fontWeight: "800" },
  selectedChoiceText: { color: HOME_COLORS.accent },
  errorText: { color: "#ffb4c0", fontSize: 13, fontWeight: "800", lineHeight: 19 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end", paddingTop: 4 },
  actionButton: { minHeight: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 14 },
  primaryButton: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accent },
  actionText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "900" },
  primaryActionText: { color: HOME_COLORS.ink },
  pressed: { opacity: 0.78 },
});
