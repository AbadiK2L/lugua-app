import { StyleSheet, Text, TouchableOpacity } from "react-native";

type AnswerCardProps = {
  text: string;
  selected: boolean;
  disabled: boolean;
  isCorrect?: boolean;
  showResult: boolean;
  onPress: () => void;
};

export function AnswerCard({
  text,
  selected,
  disabled,
  isCorrect = false,
  showResult,
  onPress,
}: AnswerCardProps) {
  const showCorrect = showResult && isCorrect;
  const showIncorrect = showResult && selected && !isCorrect;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      style={[
        styles.card,
        selected && styles.selectedCard,
        showCorrect && styles.correctCard,
        showIncorrect && styles.incorrectCard,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          selected && styles.selectedText,
          (showCorrect || showIncorrect) && styles.resultText,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    minHeight: 82,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  selectedCard: {
    borderColor: "#38bdf8",
    backgroundColor: "#123047",
  },
  correctCard: {
    borderColor: "#22c55e",
    backgroundColor: "#12351f",
  },
  incorrectCard: {
    borderColor: "#ef4444",
    backgroundColor: "#3b161a",
  },
  text: {
    color: "#cbd5e1",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
    textAlign: "center",
  },
  selectedText: {
    color: "#f8fafc",
  },
  resultText: {
    color: "#f8fafc",
  },
});
