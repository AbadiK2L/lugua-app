import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const router = useRouter();

  const goToQuiz = () => {
    router.push("/quiz");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour Mohamed</Text>
        <Text style={styles.level}>Niveau 3 • 1 250 XP</Text>
      </View>

      <View style={[styles.card, styles.streakCard]}>
        <Text style={styles.cardLabel}>🔥 Série actuelle</Text>
        <Text style={styles.streakValue}>7 jours</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardLabel}>📚 Continuer la leçon</Text>
            <Text style={styles.cardTitle}>Les salutations</Text>
          </View>
          <Text style={styles.percent}>65%</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, styles.lessonProgress]} />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.primaryButton}
          onPress={goToQuiz}
        >
          <Text style={styles.primaryButtonText}>Continuer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardLabel}>⭐ Révisions du jour</Text>
            <Text style={styles.cardTitle}>18 mots à revoir</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.secondaryButton}
          onPress={goToQuiz}
        >
          <Text style={styles.secondaryButtonText}>Réviser</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>🎯 Objectif quotidien</Text>
          <Text style={styles.goalValue}>12 / 20 XP</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, styles.goalProgress]} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>📈 Statistiques</Text>

        <View style={styles.statsRow}>
          <Text style={styles.statText}>Mots appris : 134</Text>
          <Text style={styles.statText}>Quiz réussis : 96%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1120",
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 24,
    gap: 14,
  },
  header: {
    marginBottom: 6,
  },
  greeting: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "800",
  },
  level: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
  },
  streakCard: {
    backgroundColor: "#172033",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardLabel: {
    color: "#cbd5e1",
    fontSize: 15,
    fontWeight: "700",
  },
  cardTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8,
  },
  streakValue: {
    color: "#f8fafc",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 8,
  },
  percent: {
    color: "#38bdf8",
    fontSize: 18,
    fontWeight: "800",
  },
  goalValue: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
  },
  progressTrack: {
    height: 10,
    backgroundColor: "#1f2937",
    borderRadius: 999,
    marginTop: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  lessonProgress: {
    width: "65%",
    backgroundColor: "#38bdf8",
  },
  goalProgress: {
    width: "60%",
    backgroundColor: "#22c55e",
  },
  primaryButton: {
    minHeight: 48,
    backgroundColor: "#38bdf8",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  primaryButtonText: {
    color: "#082f49",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButton: {
    minHeight: 48,
    backgroundColor: "#facc15",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  secondaryButtonText: {
    color: "#422006",
    fontSize: 16,
    fontWeight: "900",
  },
  statsRow: {
    gap: 10,
    marginTop: 14,
  },
  statText: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "700",
  },
});
