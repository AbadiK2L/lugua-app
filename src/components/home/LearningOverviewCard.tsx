import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import {
  useHomeAction,
  type HomeActionIndex,
} from "@/src/contexts/HomeActionContext";

type LearningOverviewCardProps = {
  lessonCount: number;
};

const learningRows = [
  { index: 0, icon: "book.fill", label: "Leçons" },
  { index: 1, icon: "doc.text.fill", label: "Devoirs" },
  { index: 2, icon: "bubble.left.fill", label: "Entraînement IA" },
] as const;

export function LearningOverviewCard({
  lessonCount,
}: LearningOverviewCardProps) {
  const { activeIndex, selectAction } = useHomeAction();
  const statuses = [`${lessonCount} notions`, "Aucun", "Bientôt"];

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Mon apprentissage</Text>
      <View style={styles.card}>
        {learningRows.map((row, index) => {
          const isActive = activeIndex === row.index;

          return (
            <Pressable
              key={row.label}
              accessibilityRole="button"
              accessibilityLabel={`${row.label}, ${statuses[index]}`}
              accessibilityState={{ selected: isActive }}
              onPress={() => selectAction(row.index as HomeActionIndex)}
              style={({ pressed }) => [
                styles.row,
                index === learningRows.length - 1 && styles.rowLast,
                isActive && styles.activeRow,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.iconBox, isActive && styles.activeIconBox]}>
                <IconSymbol
                  name={row.icon}
                  size={20}
                  color={isActive ? HOME_COLORS.ink : HOME_COLORS.accent}
                />
              </View>
              <Text style={[styles.label, isActive && styles.activeText]}>
                {row.label}
              </Text>
              <Text
                style={[
                  styles.detail,
                  index === 0 && styles.accentDetail,
                  isActive && styles.activeText,
                ]}
              >
                {statuses[index]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.surface,
  },
  row: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: HOME_COLORS.border,
    paddingHorizontal: 14,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  activeRow: {
    backgroundColor: HOME_COLORS.cardActive,
  },
  iconBox: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: HOME_COLORS.surfaceRaised,
  },
  activeIconBox: {
    backgroundColor: HOME_COLORS.accent,
  },
  label: {
    flex: 1,
    color: HOME_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  detail: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  accentDetail: {
    color: HOME_COLORS.accent,
  },
  activeText: {
    color: HOME_COLORS.textPrimary,
  },
  pressed: {
    opacity: 0.82,
  },
});
