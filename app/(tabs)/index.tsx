import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ProgressBar from "@/src/components/ProgressBar";
import { ScenarioCard } from "@/src/components/ScenarioCard";
import { scenarios } from "@/src/data/scenarios";
import { words } from "@/src/data/words";

const MOCK_XP = 340;
const NEXT_LEVEL_XP = 500;
const MOCK_STREAK = 5;

export default function Home() {
  const featuredScenarios = scenarios.slice(0, 2);
  const learnedWords = Math.min(12, words.length);
  const levelProgress = Math.round((MOCK_XP / NEXT_LEVEL_XP) * 100);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.greeting}>Habari, Mohamed</Text>
            <Text style={styles.subtitle}>Continue ton apprentissage du shikomori.</Text>
          </View>

          <View style={styles.streakBadge}>
            <Text style={styles.streakValue}>{MOCK_STREAK}</Text>
            <Text style={styles.streakLabel}>jours</Text>
          </View>
        </View>

        <View style={styles.progressPanel}>
          <View style={styles.progressHeader}>
            <Text style={styles.panelTitle}>Niveau 2</Text>
            <Text style={styles.panelMeta}>
              {MOCK_XP}/{NEXT_LEVEL_XP} XP
            </Text>
          </View>
          <ProgressBar value={levelProgress} color="#38bdf8" />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{learnedWords}</Text>
            <Text style={styles.statLabel}>mots actifs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{scenarios.length}</Text>
            <Text style={styles.statLabel}>scénarios</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.primaryAction}
            onPress={() => router.push("/quiz")}
          >
            <Text style={styles.primaryActionText}>Quiz rapide</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.secondaryAction}
            onPress={() => router.push("/(tabs)/lessons")}
          >
            <Text style={styles.secondaryActionText}>Voir les leçons</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Scénarios suggérés</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/lessons")}>
            <Text style={styles.sectionLink}>Tout voir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scenarioList}>
          {featuredScenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onPress={() => router.push("/(tabs)/lessons")}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0b1120",
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 30,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  headerCopy: {
    flex: 1,
  },
  greeting: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
    marginTop: 6,
  },
  streakBadge: {
    width: 72,
    minHeight: 72,
    borderRadius: 18,
    backgroundColor: "#172033",
    borderWidth: 1,
    borderColor: "#273449",
    alignItems: "center",
    justifyContent: "center",
  },
  streakValue: {
    color: "#fbbf24",
    fontSize: 25,
    fontWeight: "900",
  },
  streakLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "800",
  },
  progressPanel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#111827",
    padding: 18,
    gap: 14,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  panelTitle: {
    color: "#f8fafc",
    fontSize: 19,
    fontWeight: "900",
  },
  panelMeta: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "800",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#111827",
    padding: 16,
  },
  statValue: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "900",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#38bdf8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  primaryActionText: {
    color: "#082f49",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  secondaryAction: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  secondaryActionText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "900",
  },
  sectionLink: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "900",
  },
  scenarioList: {
    gap: 12,
  },
});
