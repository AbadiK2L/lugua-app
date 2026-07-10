import { router, useLocalSearchParams } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { shikomoriQuestionsA1Path } from "@/src/data/curriculum";
import type {
  Concept,
  ExerciseType,
  LearningBlock,
  ValidationStatus,
} from "@/src/types/learning";

const validationLabels: Record<ValidationStatus, string> = {
  draft: "Brouillon",
  reviewed: "Relu",
  validated: "Validé",
};

const exerciseTypeLabels: Record<ExerciseType, string> = {
  recognition: "Reconnaissance",
  multiple_choice: "Choix multiple",
  context_choice: "Choix selon le contexte",
  fill_blank: "Phrase à compléter",
  translation_to_french: "Traduction vers le français",
  translation_to_target: "Traduction vers le shiKomori",
  direct_thinking: "Pensée directe",
  listening: "Écoute",
  speaking: "Expression orale",
  conversation: "Conversation",
};

type ConceptDetails = {
  block: LearningBlock;
  concept: Concept;
};

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function findConceptDetails(conceptId: string | undefined): ConceptDetails | undefined {
  if (!conceptId) {
    return undefined;
  }

  for (const block of shikomoriQuestionsA1Path.chapter.blocks) {
    const concept = block.concepts.find((candidate) => candidate.id === conceptId);

    if (concept) {
      return {
        block,
        concept,
      };
    }
  }

  return undefined;
}

function showSoonMessage() {
  Alert.alert(
    "Bientôt disponible",
    "La leçon interactive sera connectée dans une prochaine étape.",
  );
}

export default function ConceptDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const conceptId = normalizeParam(params.id);
  const details = findConceptDetails(conceptId);

  if (!details) {
    return (
      <View style={styles.emptyContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>

        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Concept introuvable</Text>
          <Text style={styles.emptyText}>
            Aucun concept local ne correspond à cet identifiant.
          </Text>
        </View>
      </View>
    );
  }

  const { block, concept } = details;
  const primaryMeaning = concept.examples[0]?.frenchText ?? "Sens à préciser";
  const validationLabel = validationLabels[concept.validationStatus];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <Text style={styles.eyebrow}>{block.title}</Text>
            <Text style={styles.title}>{concept.title}</Text>
          </View>

          <View style={styles.validationBadge}>
            <Text style={styles.validationText}>{validationLabel}</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Sens principal</Text>
            <Text style={styles.summaryValue}>{primaryMeaning}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Objectif</Text>
            <Text style={styles.summaryValue}>{block.objective ?? "Objectif à préciser"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exemples</Text>
        <View style={styles.list}>
          {concept.examples.map((example) => (
            <View key={example.id} style={styles.exampleCard}>
              <Text style={styles.targetText}>{example.targetLanguageText}</Text>
              <Text style={styles.frenchText}>{example.frenchText}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contextes</Text>
        <View style={styles.list}>
          {concept.contexts.map((context) => (
            <View key={context.id} style={styles.contextCard}>
              <Text style={styles.contextTitle}>{context.label}</Text>
              <Text style={styles.description}>{context.description}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercices disponibles</Text>
        <View style={styles.list}>
          {concept.exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseRow}>
              <View style={styles.exerciseText}>
                <Text style={styles.exerciseType}>{exerciseTypeLabels[exercise.type]}</Text>
                <Text style={styles.exercisePrompt}>{exercise.prompt}</Text>
              </View>
              <Text style={styles.exerciseInstruction}>{exercise.instruction}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.85} style={styles.primaryButton} onPress={showSoonMessage}>
        <Text style={styles.primaryButtonText}>Commencer la leçon</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1120",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 28,
    gap: 24,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#0b1120",
    paddingHorizontal: 20,
    paddingTop: 58,
    gap: 24,
  },
  backButton: {
    alignSelf: "flex-start",
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  backButtonText: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "800",
  },
  header: {
    gap: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleText: {
    flex: 1,
  },
  eyebrow: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    color: "#f8fafc",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 6,
  },
  validationBadge: {
    backgroundColor: "#3f2d12",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 116,
  },
  validationText: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  summaryGrid: {
    gap: 10,
  },
  summaryBox: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  summaryLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  summaryValue: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
    marginTop: 6,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "900",
  },
  list: {
    gap: 12,
  },
  exampleCard: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  targetText: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
  },
  frenchText: {
    color: "#cbd5e1",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 8,
  },
  contextCard: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  contextTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22,
  },
  description: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 6,
  },
  exerciseRow: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  exerciseText: {
    gap: 5,
  },
  exerciseType: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "900",
  },
  exercisePrompt: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  exerciseInstruction: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  primaryButton: {
    minHeight: 54,
    backgroundColor: "#38bdf8",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#082f49",
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyCard: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "900",
  },
  emptyText: {
    color: "#cbd5e1",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginTop: 8,
  },
});
