import { StyleSheet, Text, View } from "react-native";

type AssessmentHeaderProps = {
  currentQuestion: number;
  totalQuestions: number;
  sectionTitle: string;
};

export function AssessmentHeader({
  currentQuestion,
  totalQuestions,
  sectionTitle,
}: AssessmentHeaderProps) {
  const progress =
    totalQuestions > 0 ? Math.min(currentQuestion / totalQuestions, 1) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.progressText}>
          Question {currentQuestion} sur {totalQuestions}
        </Text>
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  textBlock: {
    gap: 4,
  },
  progressText: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#1f2937",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#38bdf8",
  },
});
