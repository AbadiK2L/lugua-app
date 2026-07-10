import { StyleSheet, Text, View } from "react-native";

import ProgressBar from "@/src/components/ProgressBar";

type LessonHeaderProps = {
  currentStep: number;
  totalSteps: number;
  title: string;
};

export function LessonHeader({ currentStep, totalSteps, title }: LessonHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.stepText}>
          Étape {currentStep}/{totalSteps}
        </Text>
      </View>
      <ProgressBar current={currentStep} total={totalSteps} color="#38bdf8" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 26,
  },
  stepText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },
});
