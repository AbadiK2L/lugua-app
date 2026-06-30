import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ResultScreen() {
  const params = useLocalSearchParams<{ score?: string; total?: string }>();

  const score = Number(params.score ?? 0);
  const total = Number(params.total ?? 0);
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const xpEarned = score * 10;

  return (
    <View style={styles.container}>
      <View style={styles.resultCard}>
        <Text style={styles.label}>Quiz terminé</Text>
        <Text style={styles.score}>
          {score}/{total}
        </Text>

        <View style={styles.stats}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>+{xpEarned}</Text>
            <Text style={styles.statLabel}>XP gagnés</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{percentage}%</Text>
            <Text style={styles.statLabel}>Réussite</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.primaryButton}
          onPress={() => router.replace("/quiz")}
        >
          <Text style={styles.primaryButtonText}>Recommencer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.secondaryButton}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.secondaryButtonText}>Retour accueil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1120",
    paddingHorizontal: 22,
    paddingTop: 70,
    paddingBottom: 32,
    justifyContent: "center",
    gap: 22,
  },
  resultCard: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 18,
    fontWeight: "800",
  },
  score: {
    color: "#f8fafc",
    fontSize: 64,
    fontWeight: "900",
    marginTop: 10,
  },
  stats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
    width: "100%",
  },
  statBox: {
    flex: 1,
    backgroundColor: "#172033",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    color: "#38bdf8",
    fontSize: 26,
    fontWeight: "900",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 6,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#38bdf8",
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
  secondaryButton: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: "#e2e8f0",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
});
