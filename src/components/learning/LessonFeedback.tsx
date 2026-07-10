import { StyleSheet, Text, View } from "react-native";

type LessonFeedbackProps = {
  isCorrect: boolean;
  explanation: string;
};

export function LessonFeedback({ isCorrect, explanation }: LessonFeedbackProps) {
  return (
    <View style={[styles.container, isCorrect ? styles.correct : styles.incorrect]}>
      <Text style={styles.title}>{isCorrect ? "Bonne réponse" : "À revoir"}</Text>
      <Text style={styles.text}>{explanation}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 5,
  },
  correct: {
    backgroundColor: "#12351f",
    borderColor: "#22c55e",
  },
  incorrect: {
    backgroundColor: "#3b161a",
    borderColor: "#ef4444",
  },
  title: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
  },
  text: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
