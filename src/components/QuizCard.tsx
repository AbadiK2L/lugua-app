import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type QuizCardProps = {
  question: {
    word: string;
    correct: string;
    options: string[];
  };
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
};

export function QuizCard({
  question,
  selectedAnswer,
  onSelectAnswer,
}: QuizCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Traduis ce mot</Text>
      <Text style={styles.word}>{question.word}</Text>

      <View style={styles.options}>
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = selectedAnswer !== null && option === question.correct;
          const isWrong = isSelected && option !== question.correct;

          return (
            <TouchableOpacity
              key={`${option}-${index}`}
              activeOpacity={0.8}
              disabled={selectedAnswer !== null}
              style={[
                styles.option,
                isCorrect && styles.correctOption,
                isWrong && styles.wrongOption,
              ]}
              onPress={() => onSelectAnswer(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  (isCorrect || isWrong) && styles.feedbackText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 22,
    gap: 18,
  },
  label: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  word: {
    color: "#0f172a",
    fontSize: 42,
    fontWeight: "800",
    textAlign: "center",
  },
  options: {
    gap: 12,
  },
  option: {
    minHeight: 54,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: "#f8fafc",
  },
  correctOption: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  wrongOption: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  optionText: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  feedbackText: {
    color: "#ffffff",
  },
});
