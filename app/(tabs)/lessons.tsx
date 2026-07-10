import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { shikomoriQuestionsA1Path } from "@/src/data/curriculum";
import type { LearningBlock, MasteryStatus } from "@/src/types/learning";

const masteryByBlockId: Record<string, MasteryStatus> = {
  "questions-a1-block-place": "learning",
  "questions-a1-block-person": "not_started",
  "questions-a1-block-time": "not_started",
  "questions-a1-block-manner-state-price": "needs_revision",
  "questions-a1-block-thing-choice-quantity": "not_started",
  "questions-a1-block-reason": "mastered",
};

const masteryLabels: Record<MasteryStatus, string> = {
  not_started: "Non commencé",
  learning: "En apprentissage",
  needs_revision: "À revoir",
  mastered: "Maîtrisé",
};

const masteryStyles: Record<MasteryStatus, { backgroundColor: string; color: string }> = {
  not_started: {
    backgroundColor: "#172033",
    color: "#94a3b8",
  },
  learning: {
    backgroundColor: "#123047",
    color: "#38bdf8",
  },
  needs_revision: {
    backgroundColor: "#3f2d12",
    color: "#fbbf24",
  },
  mastered: {
    backgroundColor: "#12351f",
    color: "#22c55e",
  },
};

function formatCount(count: number, singular: string, plural: string) {
  return `${count} ${count > 1 ? plural : singular}`;
}

function getPrimaryConcept(block: LearningBlock) {
  return block.concepts[0];
}

export default function LessonsScreen() {
  const router = useRouter();
  const { language, level, skill, chapter } = shikomoriQuestionsA1Path;

  function openConcept(block: LearningBlock) {
    const concept = getPrimaryConcept(block);

    if (!concept) {
      return;
    }

    router.push({
      pathname: "../concept/[id]",
      params: {
        id: concept.id,
      },
    });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Parcours</Text>
        <Text style={styles.subtitle}>{chapter.title}</Text>

        <View style={styles.metaGrid}>
          <View style={styles.metaBadge}>
            <Text style={styles.metaLabel}>Langue</Text>
            <Text style={styles.metaValue}>{language.name}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaLabel}>Niveau</Text>
            <Text style={styles.metaValue}>{level.title}</Text>
          </View>
          <View style={styles.metaBadgeWide}>
            <Text style={styles.metaLabel}>Compétence</Text>
            <Text style={styles.metaValue}>{skill.title}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Blocs du chapitre</Text>

        <View style={styles.list}>
          {chapter.blocks.map((block) => {
            const concept = getPrimaryConcept(block);
            const masteryStatus = masteryByBlockId[block.id] ?? "not_started";
            const masteryStyle = masteryStyles[masteryStatus];
            const contextCount = concept?.contexts.length ?? 0;
            const exerciseCount =
              (concept?.exercises.length ?? 0) + (block.exercises?.length ?? 0);

            return (
              <View key={block.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardText}>
                    <Text style={styles.blockTitle}>{block.title}</Text>
                    <Text style={styles.conceptName}>
                      {concept?.title ?? "Concept à préciser"}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.masteryBadge,
                      { backgroundColor: masteryStyle.backgroundColor },
                    ]}
                  >
                    <Text style={[styles.masteryText, { color: masteryStyle.color }]}>
                      {masteryLabels[masteryStatus]}
                    </Text>
                  </View>
                </View>

                {block.objective ? (
                  <Text style={styles.description}>{block.objective}</Text>
                ) : null}

                <View style={styles.statsRow}>
                  <Text style={styles.statText}>
                    {formatCount(contextCount, "contexte", "contextes")}
                  </Text>
                  <Text style={styles.statDivider}>•</Text>
                  <Text style={styles.statText}>
                    {formatCount(exerciseCount, "exercice", "exercices")}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={!concept}
                  style={[styles.button, !concept && styles.disabledButton]}
                  onPress={() => openConcept(block)}
                >
                  <Text style={styles.buttonText}>Ouvrir</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
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
    paddingTop: 64,
    paddingBottom: 28,
  },
  header: {
    marginBottom: 24,
    gap: 14,
  },
  title: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metaBadge: {
    flexGrow: 1,
    minWidth: 132,
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  metaBadgeWide: {
    flexBasis: "100%",
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  metaLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metaValue: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
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
    gap: 14,
  },
  card: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cardText: {
    flex: 1,
  },
  blockTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 26,
  },
  conceptName: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 5,
  },
  masteryBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 124,
  },
  masteryText: {
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  description: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  statText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "800",
  },
  statDivider: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "900",
  },
  button: {
    minHeight: 46,
    backgroundColor: "#38bdf8",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  disabledButton: {
    opacity: 0.45,
  },
  buttonText: {
    color: "#082f49",
    fontSize: 16,
    fontWeight: "900",
  },
});
