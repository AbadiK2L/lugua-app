import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import {
  getLuguaConceptSummary,
  hasInteractiveLesson,
  luguaProgramChapter,
  luguaProgramConcepts,
  luguaProgramLanguage,
  luguaProgramSkill,
} from "@/src/components/teacher/courses/luguaProgram";

type LuguaProgramSectionProps = {
  onConsult: () => void;
  onUseAsBase: () => void;
};

export function LuguaProgramSection({
  onConsult,
  onUseAsBase,
}: LuguaProgramSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const interactiveLessonCount = luguaProgramConcepts.filter(
    hasInteractiveLesson,
  ).length;

  return (
    <View style={styles.section}>
      <View style={styles.programCard}>
        <Text style={styles.eyebrow}>PROGRAMME LUGUA</Text>
        <Text style={styles.title}>Programme Lugua</Text>
        <Text style={styles.meta}>
          {luguaProgramChapter.level} · {luguaProgramChapter.title}
        </Text>
        <Text style={styles.skill}>{luguaProgramSkill.title}</Text>
        <Text style={styles.description}>
          Contenu structuré fourni par l’application à partir du curriculum local.
        </Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{luguaProgramConcepts.length}</Text>
            <Text style={styles.summaryLabel}>notions</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{interactiveLessonCount}</Text>
            <Text style={styles.summaryLabel}>leçons interactives</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Consulter le programme Lugua"
            accessibilityHint="Ouvre la première leçon interactive disponible"
            onPress={onConsult}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>Consulter</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Utiliser le programme Lugua comme base"
            onPress={onUseAsBase}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>Utiliser comme base</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? "Masquer les détails du programme" : "Afficher les détails du programme"}
          accessibilityState={{ expanded: isExpanded }}
          onPress={() => setIsExpanded((current) => !current)}
          style={({ pressed }) => [styles.detailsButton, pressed && styles.pressed]}
        >
          <Text style={styles.detailsButtonText}>
            {isExpanded ? "Masquer les détails" : "Voir les détails"}
          </Text>
        </Pressable>
      </View>

      {isExpanded ? (
        <View style={styles.detailsCard}>
          <DetailRow label="Langue" value={luguaProgramLanguage.name} />
          <DetailRow label="Niveau" value={luguaProgramChapter.level} />
          <DetailRow label="Compétence" value={luguaProgramSkill.title} />
          <DetailRow label="Chapitre" value={luguaProgramChapter.title} />
          <DetailRow label="Source" value="Programme Lugua" />
          <DetailRow label="Validation" value="Contenu local actuel" />

          <View style={styles.conceptList}>
            <Text style={styles.listTitle}>Notions du chapitre</Text>
            {luguaProgramConcepts.map((concept, index) => (
              <View key={concept.id} style={styles.conceptRow}>
                <Text style={styles.conceptIndex}>{String(index + 1).padStart(2, "0")}</Text>
                <View style={styles.conceptCopy}>
                  <Text style={styles.conceptTitle}>{concept.title}</Text>
                  <Text style={styles.conceptSummary} numberOfLines={2}>
                    {getLuguaConceptSummary(concept)}
                  </Text>
                </View>
                <Text style={styles.lessonStatus}>
                  {hasInteractiveLesson(concept) ? "Disponible" : "Bientôt"}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  programCard: {
    gap: 12,
    borderWidth: 1,
    borderColor: HOME_COLORS.accent,
    borderRadius: 16,
    backgroundColor: HOME_COLORS.card,
    padding: 18,
  },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 11, fontWeight: "900", letterSpacing: 0.7 },
  title: { color: HOME_COLORS.textPrimary, fontSize: 22, fontWeight: "900" },
  meta: { color: HOME_COLORS.accentMuted, fontSize: 13, fontWeight: "800" },
  skill: { color: HOME_COLORS.textPrimary, fontSize: 15, fontWeight: "800" },
  description: { color: HOME_COLORS.textSecondary, fontSize: 14, fontWeight: "600", lineHeight: 21 },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryItem: { flex: 1, borderRadius: 10, backgroundColor: HOME_COLORS.surface, padding: 12 },
  summaryValue: { color: HOME_COLORS.textPrimary, fontSize: 20, fontWeight: "900" },
  summaryLabel: { color: HOME_COLORS.textMuted, fontSize: 12, fontWeight: "700" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  primaryButton: { minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: HOME_COLORS.accent, paddingHorizontal: 14 },
  primaryButtonText: { color: HOME_COLORS.ink, fontSize: 13, fontWeight: "900" },
  secondaryButton: { minHeight: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 14 },
  secondaryButtonText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "900" },
  detailsButton: { minHeight: 44, alignItems: "flex-start", justifyContent: "center" },
  detailsButtonText: { color: HOME_COLORS.accent, fontSize: 13, fontWeight: "800" },
  detailsCard: { gap: 10, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 16, backgroundColor: HOME_COLORS.surface, padding: 16 },
  detailRow: { minHeight: 30, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  detailLabel: { color: HOME_COLORS.textMuted, fontSize: 13, fontWeight: "700" },
  detailValue: { flex: 1, color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "800", textAlign: "right" },
  conceptList: { gap: 6, borderTopWidth: 1, borderTopColor: HOME_COLORS.border, paddingTop: 12 },
  listTitle: { color: HOME_COLORS.textPrimary, fontSize: 15, fontWeight: "900" },
  conceptRow: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10 },
  conceptIndex: { width: 24, color: HOME_COLORS.textMuted, fontSize: 12, fontWeight: "800" },
  conceptCopy: { flex: 1, gap: 2 },
  conceptTitle: { color: HOME_COLORS.textPrimary, fontSize: 14, fontWeight: "800" },
  conceptSummary: { color: HOME_COLORS.textSecondary, fontSize: 12, fontWeight: "600" },
  lessonStatus: { color: HOME_COLORS.accentMuted, fontSize: 11, fontWeight: "800" },
  pressed: { opacity: 0.8 },
});
