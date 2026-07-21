import { StyleSheet, Text, TouchableOpacity } from "react-native";

type AssessmentOptionCardProps = {
  text: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

export function AssessmentOptionCard({
  text,
  selected,
  disabled,
  onPress,
}: AssessmentOptionCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      style={[styles.card, selected && styles.selectedCard]}
      onPress={onPress}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#111827",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  selectedCard: {
    borderColor: "#38bdf8",
    backgroundColor: "#123047",
  },
  text: {
    color: "#cbd5e1",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  selectedText: {
    color: "#f8fafc",
  },
});
