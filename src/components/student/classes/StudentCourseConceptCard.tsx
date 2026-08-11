import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import type { ResolvedCourseConcept } from "@/src/data/curriculum";

export function StudentCourseConceptCard({
  concept,
  onPress,
}: {
  concept: ResolvedCourseConcept;
  onPress: () => void;
}) {
  const content = (
    <>
      <View style={styles.copy}>
        <Text style={styles.block}>{concept.blockTitle}</Text>
        <Text style={styles.title}>{concept.title}</Text>
        {concept.primaryMeaning ? (
          <Text style={styles.meaning}>{concept.primaryMeaning}</Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text
          style={[
            styles.status,
            concept.lessonEnabled ? styles.statusReady : styles.statusMuted,
          ]}
        >
          {concept.lessonEnabled ? "Leçon interactive" : "Bientôt disponible"}
        </Text>
        {concept.lessonEnabled ? (
          <View style={styles.action}>
            <Text style={styles.actionLabel}>Commencer</Text>
            <IconSymbol
              name="chevron.right"
              size={18}
              color={HOME_COLORS.accent}
            />
          </View>
        ) : null}
      </View>
    </>
  );

  if (!concept.lessonEnabled) {
    return (
      <View
        accessible
        accessibilityLabel={`${concept.title}, bientôt disponible`}
        style={styles.card}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Commencer la leçon ${concept.title}`}
      accessibilityHint="Ouvre la leçon interactive"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 126,
    gap: 14,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.card,
    padding: 16,
  },
  copy: { gap: 5 },
  block: {
    color: HOME_COLORS.accentMuted,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 16,
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
  },
  meaning: {
    color: HOME_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  footer: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: "auto",
  },
  status: {
    minWidth: 0,
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 18,
  },
  statusReady: { color: HOME_COLORS.accentMuted },
  statusMuted: { color: HOME_COLORS.textMuted },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  actionLabel: {
    color: HOME_COLORS.accent,
    fontSize: 12,
    fontWeight: "900",
  },
  pressed: {
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.cardActive,
    transform: [{ scale: 0.99 }],
  },
});
