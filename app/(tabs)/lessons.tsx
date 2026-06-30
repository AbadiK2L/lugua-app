import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScenarioCard } from "@/src/components/ScenarioCard";
import { lessons } from "@/src/data/lessons";
import { scenarios } from "@/src/data/scenarios";

export default function LessonsScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Leçons</Text>
        <Text style={styles.subtitle}>Choisis une catégorie ou un scénario pour continuer.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scénarios guidés</Text>
        <View style={styles.list}>
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onPress={() => router.push("/quiz")}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Catégories de vocabulaire</Text>
        <View style={styles.list}>
          {lessons.map((lesson) => (
            <View key={lesson.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardText}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.description}>{lesson.description}</Text>
                </View>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>{lesson.level}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{lesson.wordCount} mots</Text>
                <Text style={styles.metaText}>{lesson.progress}%</Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${lesson.progress}%` }]} />
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.button}
                onPress={() => router.push("/quiz")}
              >
                <Text style={styles.buttonText}>Commencer</Text>
              </TouchableOpacity>
            </View>
          ))}
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
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 6,
    lineHeight: 21,
  },
  section: {
    gap: 12,
    marginBottom: 26,
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
  lessonTitle: {
    color: "#f8fafc",
    fontSize: 21,
    fontWeight: "900",
  },
  description: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 6,
  },
  levelBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#172033",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  levelText: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "900",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  metaText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "800",
  },
  progressTrack: {
    height: 9,
    backgroundColor: "#1f2937",
    borderRadius: 999,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 999,
  },
  button: {
    minHeight: 46,
    backgroundColor: "#38bdf8",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  buttonText: {
    color: "#082f49",
    fontSize: 16,
    fontWeight: "900",
  },
});
