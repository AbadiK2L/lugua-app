import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import type { Chapter } from "@/src/types/learning";

type LearningChapterCardProps = {
  chapter: Chapter;
  levelLabel: string;
  skillTitle: string;
  statusLabel: string;
  lessonAvailable: boolean;
  onPress: () => void;
};

export function LearningChapterCard({
  chapter,
  levelLabel,
  skillTitle,
  statusLabel,
  lessonAvailable,
  onPress,
}: LearningChapterCardProps) {
  const concepts = chapter.blocks.flatMap((block) => block.concepts);
  const availabilityLabel = lessonAvailable
    ? "Leçon disponible"
    : "Leçon bientôt disponible";

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <IconSymbol name="book.fill" size={21} color={HOME_COLORS.accent} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>{statusLabel}</Text>
          <Text style={styles.skill}>
            {levelLabel} · {skillTitle}
          </Text>
          <Text style={styles.title}>{chapter.title}</Text>
          <Text style={styles.count}>
            {concepts.length} {concepts.length > 1 ? "notions" : "notion"} disponibles
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.concepts}
        accessibilityLabel={`${concepts.length} notions disponibles`}
      >
        {concepts.map((concept) => (
          <View key={concept.id} style={styles.conceptChip}>
            <Text style={styles.conceptText} numberOfLines={1}>
              {concept.title}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.availability}>{availabilityLabel}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${chapter.title}, ${levelLabel}, ${concepts.length} notions disponibles, ${availabilityLabel}`}
          onPress={onPress}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>{lessonAvailable ? "Commencer" : "Voir"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 18,
    backgroundColor: HOME_COLORS.card,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: HOME_COLORS.accentSoft,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  eyebrow: {
    color: HOME_COLORS.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  skill: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
  },
  count: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  concepts: {
    gap: 8,
    paddingRight: 8,
  },
  conceptChip: {
    minHeight: 34,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 10,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 11,
  },
  conceptText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  footer: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  availability: {
    flex: 1,
    color: HOME_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  button: {
    minHeight: 44,
    minWidth: 104,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: HOME_COLORS.accent,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: HOME_COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  pressed: {
    backgroundColor: HOME_COLORS.accentPressed,
  },
});
