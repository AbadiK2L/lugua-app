import { StyleSheet, Text, TouchableOpacity } from "react-native";

type AnswerOptionProps = {
  text: string;
  selected: boolean;
  disabled: boolean;
  isCorrect?: boolean;
  showResult: boolean;
  onPress: () => void;
};

export function AnswerOption({
  text,
  selected,
  disabled,
  isCorrect = false,
  showResult,
  onPress,
}: AnswerOptionProps) {
  const showCorrect = showResult && isCorrect;
  const showIncorrect = showResult && selected && !isCorrect;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      style={[
        styles.option,
        selected && styles.selectedOption,
        showCorrect && styles.correctOption,
        showIncorrect && styles.incorrectOption,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.optionText,
          selected && styles.selectedText,
          showCorrect && styles.resultText,
          showIncorrect && styles.resultText,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#111827",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedOption: {
    borderColor: "#38bdf8",
    backgroundColor: "#123047",
  },
  correctOption: {
    borderColor: "#22c55e",
    backgroundColor: "#12351f",
  },
  incorrectOption: {
    borderColor: "#ef4444",
    backgroundColor: "#3b161a",
  },
  optionText: {
    color: "#cbd5e1",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  selectedText: {
    color: "#f8fafc",
  },
  resultText: {
    color: "#f8fafc",
  },
});
