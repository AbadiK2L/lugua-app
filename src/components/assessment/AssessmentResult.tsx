import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type CorrectedAssessmentResult = {
  id: string;
  sectionTitle: string;
  question: string;
  learnerAnswer: string;
  expectedAnswer: string;
  isCorrect: boolean;
};

export type OralAssessmentResult = {
  sectionTitle: string;
  status: "completed" | "not_completed";
  acceptedAnswers: string[];
};

type AssessmentResultProps = {
  score: number;
  totalAutomaticallyCorrected: number;
  percentage: number;
  statusLabel: string;
  correctedResults: CorrectedAssessmentResult[];
  oralResult?: OralAssessmentResult;
  onRestart: () => void;
  onBackToPath: () => void;
};

export function AssessmentResult({
  score,
  totalAutomaticallyCorrected,
  percentage,
  statusLabel,
  correctedResults,
  oralResult,
  onRestart,
  onBackToPath,
}: AssessmentResultProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Résultat final</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Résultat provisoire</Text>
          </View>
        </View>

        <View style={styles.resultGrid}>
          <View style={styles.resultBox}>
            <Text style={styles.resultValue}>
              {score}/{totalAutomaticallyCorrected}
            </Text>
            <Text style={styles.resultLabel}>Bonnes réponses</Text>
          </View>
          <View style={styles.resultBox}>
            <Text style={styles.resultValue}>{percentage}%</Text>
            <Text style={styles.resultLabel}>Réussite</Text>
          </View>
          <View style={styles.resultBox}>
            <Text style={styles.resultValue}>{statusLabel}</Text>
            <Text style={styles.resultLabel}>Statut</Text>
          </View>
          <View style={styles.resultBox}>
            <Text style={styles.resultValue}>
              {oralResult?.status === "completed" ? "Terminée" : "Non terminée"}
            </Text>
            <Text style={styles.resultLabel}>Activité orale</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Correction détaillée</Text>

        <View style={styles.list}>
          {correctedResults.map((result) => (
            <View key={result.id} style={styles.correctionCard}>
              <View style={styles.correctionHeader}>
                <Text style={styles.correctionSection}>{result.sectionTitle}</Text>
                <Text
                  style={[
                    styles.correctionStatus,
                    result.isCorrect ? styles.correctStatus : styles.incorrectStatus,
                  ]}
                >
                  {result.isCorrect ? "Correct" : "Incorrect"}
                </Text>
              </View>

              <Text style={styles.question}>{result.question}</Text>
              <Text style={styles.detailLabel}>Réponse de l’élève</Text>
              <Text style={styles.detailText}>{result.learnerAnswer}</Text>
              <Text style={styles.detailLabel}>Réponse attendue</Text>
              <Text style={styles.detailText}>{result.expectedAnswer}</Text>
            </View>
          ))}
        </View>
      </View>

      {oralResult ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activité orale</Text>
          <View style={styles.correctionCard}>
            <Text style={styles.detailLabel}>Section</Text>
            <Text style={styles.detailText}>{oralResult.sectionTitle}</Text>
            <Text style={styles.detailLabel}>Statut</Text>
            <Text style={styles.detailText}>
              {oralResult.status === "completed" ? "Terminée" : "Non terminée"}
            </Text>
            <Text style={styles.detailLabel}>Exemples attendus</Text>
            {oralResult.acceptedAnswers.map((answer) => (
              <Text key={answer} style={styles.detailText}>
                {answer}
              </Text>
            ))}
            <Text style={styles.note}>
              Cette activité devra plus tard être évaluée par un enseignant ou un
              système audio validé.
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity activeOpacity={0.85} style={styles.primaryButton} onPress={onRestart}>
          <Text style={styles.primaryButtonText}>Recommencer le contrôle</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} style={styles.secondaryButton} onPress={onBackToPath}>
          <Text style={styles.secondaryButtonText}>Retour au parcours</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 22,
  },
  card: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 18,
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    color: "#f8fafc",
    flex: 1,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
  },
  badge: {
    backgroundColor: "#3f2d12",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "900",
  },
  resultGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  resultBox: {
    flexGrow: 1,
    flexBasis: "45%",
    minHeight: 96,
    backgroundColor: "#172033",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  resultValue: {
    color: "#38bdf8",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
  },
  resultLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
    textAlign: "center",
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
  correctionCard: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  correctionHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  correctionSection: {
    color: "#38bdf8",
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  correctionStatus: {
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  correctStatus: {
    backgroundColor: "#12351f",
    color: "#22c55e",
  },
  incorrectStatus: {
    backgroundColor: "#3b161a",
    color: "#f87171",
  },
  question: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 24,
  },
  detailLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
    textTransform: "uppercase",
  },
  detailText: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },
  note: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 6,
  },
  actions: {
    gap: 10,
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
  secondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
});
