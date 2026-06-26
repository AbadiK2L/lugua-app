import { StyleSheet, Text, View } from "react-native";

const badges = ["Débutant", "Série 7 jours", "100 mots"];

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>M</Text>
        </View>

        <Text style={styles.name}>Mohamed</Text>
        <Text style={styles.role}>Élève</Text>

        <View style={styles.levelRow}>
          <View style={styles.levelPill}>
            <Text style={styles.levelText}>Niveau 3</Text>
          </View>
          <View style={styles.xpPill}>
            <Text style={styles.xpText}>1 250 XP</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Série actuelle</Text>
          <Text style={styles.statValue}>7 jours</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Mots appris</Text>
          <Text style={styles.statValue}>134</Text>
        </View>

        <View style={[styles.statCard, styles.fullWidthCard]}>
          <Text style={styles.statLabel}>Quiz réussis</Text>
          <Text style={styles.statValue}>96%</Text>
        </View>
      </View>

      <View style={styles.badgesCard}>
        <Text style={styles.sectionTitle}>Badges</Text>

        <View style={styles.badges}>
          {badges.map((badge) => (
            <View key={badge} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
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
    gap: 16,
  },
  profileCard: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 24,
    alignItems: "center",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#38bdf8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    color: "#082f49",
    fontSize: 38,
    fontWeight: "900",
  },
  name: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "900",
  },
  role: {
    color: "#94a3b8",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  levelRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  levelPill: {
    backgroundColor: "#172033",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  levelText: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "900",
  },
  xpPill: {
    backgroundColor: "#163323",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  xpText: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "900",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },
  fullWidthCard: {
    minWidth: "100%",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "700",
  },
  statValue: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 8,
  },
  badgesCard: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "900",
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  badge: {
    backgroundColor: "#172033",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  badgeText: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "800",
  },
});
