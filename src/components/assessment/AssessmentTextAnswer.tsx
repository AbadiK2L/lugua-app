import { StyleSheet, TextInput } from "react-native";

type AssessmentTextAnswerProps = {
  value: string;
  editable: boolean;
  placeholder: string;
  onChangeText: (value: string) => void;
};

export function AssessmentTextAnswer({
  value,
  editable,
  placeholder,
  onChangeText,
}: AssessmentTextAnswerProps) {
  return (
    <TextInput
      editable={editable}
      multiline
      placeholder={placeholder}
      placeholderTextColor="#64748b"
      style={[styles.input, !editable && styles.lockedInput]}
      value={value}
      onChangeText={onChangeText}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 112,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#111827",
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlignVertical: "top",
  },
  lockedInput: {
    opacity: 0.72,
  },
});
