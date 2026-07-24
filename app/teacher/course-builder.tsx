import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { LanguageSelector, languageOptions } from "@/src/components/home/LanguageSelector";
import type { LanguageSelectionId } from "@/src/components/home/LanguageSelector";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { TeacherScreenShell } from "@/src/components/teacher/TeacherScreenShell";
import { TeacherSegmentedControl } from "@/src/components/teacher/TeacherSegmentedControl";
import { shikomoriQuestionsA1Path } from "@/src/data/curriculum";
import type { TeacherCourseDraft, TeacherCourseOrigin } from "@/src/types/teacher";

const { chapter, language, level } = shikomoriQuestionsA1Path;
const concepts = chapter.blocks.flatMap((block) => block.concepts);

export default function TeacherCourseBuilderScreen() {
  const params = useLocalSearchParams<{ origin?: string | string[] }>();
  const initialOrigin = params.origin === "lugua_program" ? "lugua_program" : "teacher_created";
  const [origin, setOrigin] = useState<TeacherCourseOrigin>(initialOrigin);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState("");
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageSelectionId>("shikomori");
  const [levelValue, setLevelValue] = useState(initialOrigin === "lugua_program" ? level.level : "");
  const [selectedConceptIds, setSelectedConceptIds] = useState<string[]>(
    initialOrigin === "lugua_program" ? concepts.map((concept) => concept.id) : [],
  );
  const [showPreview, setShowPreview] = useState(false);

  const selectedLanguageOption = useMemo(
    () => languageOptions.find((option) => option.id === selectedLanguage) ?? languageOptions[0],
    [selectedLanguage],
  );

  function changeOrigin(nextOrigin: string) {
    const value = nextOrigin as TeacherCourseOrigin;
    setOrigin(value);
    if (value === "lugua_program") {
      setLevelValue(level.level);
      setSelectedConceptIds(concepts.map((concept) => concept.id));
    } else {
      setLevelValue("");
      setSelectedConceptIds([]);
    }
  }

  function toggleConcept(conceptId: string) {
    setSelectedConceptIds((current) =>
      current.includes(conceptId)
        ? current.filter((id) => id !== conceptId)
        : [...current, conceptId],
    );
  }

  function previewDraft() {
    if (!title.trim()) {
      setShowPreview(false);
      Alert.alert("Titre requis", "Ajoute un titre avant de prévisualiser le brouillon.");
      return;
    }

    setShowPreview(true);
  }

  function saveLocally() {
    const draft: TeacherCourseDraft = {
      origin,
      title: title.trim(),
      description: description.trim(),
      languageId: selectedLanguage,
      variety: selectedLanguageOption.detail,
      level: levelValue as TeacherCourseDraft["level"],
      objective: objective.trim(),
      conceptIds: selectedConceptIds,
      status: "draft",
    };

    Alert.alert(
      "Brouillon prêt",
      `${draft.title}\n${draft.conceptIds.length} notion(s) sélectionnée(s). Rien n’est encore enregistré.`,
    );
  }

  return (
    <TeacherScreenShell>
      <View style={styles.topLine}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour aux cours"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backLabel}>← Cours</Text>
        </Pressable>
      </View>

      <View style={styles.intro}>
        <Text style={styles.eyebrow}>CONSTRUCTEUR LOCAL</Text>
        <Text style={styles.title}>Créer un cours</Text>
        <Text style={styles.subtitle}>
          Prépare un brouillon local. Aucune classe, publication ou donnée distante n’est créée.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Choisir un point de départ</Text>
        <TeacherSegmentedControl
          value={origin}
          onChange={changeOrigin}
          options={[
            { id: "lugua_program", label: "Programme Lugua" },
            { id: "teacher_created", label: "Partir de zéro" },
          ]}
        />
        {origin === "lugua_program" ? (
          <View style={styles.referenceCard}>
            <Text style={styles.referenceTitle}>Programme Lugua</Text>
            <Text style={styles.referenceText}>
              {language.name} · {level.level} · {chapter.title}
            </Text>
            <Text style={styles.referenceText}>{concepts.length} notions du curriculum disponibles.</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Décrire le cours</Text>
        <Field label="Titre" value={title} onChangeText={setTitle} placeholder="Titre du cours" />
        <Field
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Description du cours"
          multiline
        />
        <Field
          label="Objectifs"
          value={objective}
          onChangeText={setObjective}
          placeholder="Objectifs pédagogiques"
          multiline
        />
        <View style={styles.field}>
          <Text style={styles.label}>Langue enseignée</Text>
          <LanguageSelector value={selectedLanguage} onChange={setSelectedLanguage} />
        </View>
        <Field
          label="Niveau"
          value={levelValue}
          onChangeText={setLevelValue}
          placeholder="Ex. A1"
          autoCapitalize="characters"
        />
      </View>

      {origin === "lugua_program" ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Notions à inclure</Text>
          <Text style={styles.helper}>Sélectionne les notions du curriculum à proposer dans ce brouillon.</Text>
          <View style={styles.conceptList}>
            {concepts.map((concept) => {
              const selected = selectedConceptIds.includes(concept.id);
              return (
                <Pressable
                  key={concept.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={concept.title}
                  onPress={() => toggleConcept(concept.id)}
                  style={({ pressed }) => [styles.conceptRow, pressed && styles.pressed]}
                >
                  <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                    {selected ? <Text style={styles.checkmark}>✓</Text> : null}
                  </View>
                  <Text style={styles.conceptTitle}>{concept.title}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Afficher l’aperçu du brouillon"
          onPress={previewDraft}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>Aperçu du brouillon</Text>
        </Pressable>
        {showPreview ? (
          <View style={styles.previewCard}>
            <Text style={styles.previewEyebrow}>APERÇU LOCAL</Text>
            <Text style={styles.previewTitle}>{title.trim()}</Text>
            {description.trim() ? <Text style={styles.previewText}>{description.trim()}</Text> : null}
            <Text style={styles.previewMeta}>
              {selectedLanguageOption.label} · {levelValue || "Niveau non renseigné"} · {selectedConceptIds.length} notion(s)
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Garder le brouillon local"
              onPress={saveLocally}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryButtonText}>Garder en aperçu local</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </TeacherScreenShell>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  autoCapitalize = "sentences",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
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
        autoCapitalize={autoCapitalize}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topLine: { minHeight: 44, justifyContent: "center" },
  backButton: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start", borderRadius: 10, paddingHorizontal: 4 },
  backLabel: { color: HOME_COLORS.accent, fontSize: 14, fontWeight: "800" },
  intro: { gap: 6 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  title: { color: HOME_COLORS.textPrimary, fontSize: 30, fontWeight: "900" },
  subtitle: { color: HOME_COLORS.textSecondary, fontSize: 15, fontWeight: "600", lineHeight: 22 },
  section: { gap: 10 },
  sectionTitle: { color: HOME_COLORS.textPrimary, fontSize: 17, fontWeight: "900" },
  helper: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  referenceCard: { gap: 5, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 12, backgroundColor: HOME_COLORS.surface, padding: 14 },
  referenceTitle: { color: HOME_COLORS.textPrimary, fontSize: 15, fontWeight: "900" },
  referenceText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "700" },
  field: { gap: 6 },
  label: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "800" },
  input: { minHeight: 48, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, color: HOME_COLORS.textPrimary, fontSize: 14, paddingHorizontal: 12 },
  multilineInput: { minHeight: 86, textAlignVertical: "top", paddingTop: 12 },
  conceptList: { gap: 6 },
  conceptRow: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 12 },
  checkbox: { width: 24, height: 24, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.textMuted, borderRadius: 6 },
  checkboxSelected: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accent },
  checkmark: { color: HOME_COLORS.ink, fontSize: 16, fontWeight: "900" },
  conceptTitle: { flex: 1, color: HOME_COLORS.textPrimary, fontSize: 14, fontWeight: "800" },
  actions: { gap: 12 },
  primaryButton: { minHeight: 48, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", borderRadius: 10, backgroundColor: HOME_COLORS.accent, paddingHorizontal: 16 },
  primaryButtonText: { color: HOME_COLORS.ink, fontSize: 14, fontWeight: "900" },
  previewCard: { gap: 8, borderWidth: 1, borderColor: HOME_COLORS.accent, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 16 },
  previewEyebrow: { color: HOME_COLORS.accent, fontSize: 11, fontWeight: "900" },
  previewTitle: { color: HOME_COLORS.textPrimary, fontSize: 19, fontWeight: "900" },
  previewText: { color: HOME_COLORS.textSecondary, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  previewMeta: { color: HOME_COLORS.accentMuted, fontSize: 13, fontWeight: "800" },
  secondaryButton: { minHeight: 44, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 14 },
  secondaryButtonText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "900" },
  pressed: { opacity: 0.8, backgroundColor: HOME_COLORS.surfaceRaised },
});
