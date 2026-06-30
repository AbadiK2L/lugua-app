import { StyleSheet, Text, View } from "react-native";

type ProgressBarProps = {
  current?: number;
  total?: number;
  value?: number;
  color?: string;
  label?: string;
};

export default function ProgressBar({
  current = 0,
  total = 100,
  value,
  color = "#22c55e",
  label,
}: ProgressBarProps) {
  const progress =
    value === undefined
      ? total > 0
        ? Math.min(current / total, 1)
        : 0
      : Math.min(Math.max(value, 0), 100) / 100;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "800",
  },
  track: {
    width: "100%",
    height: 10,
    backgroundColor: "#1e293b",
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
