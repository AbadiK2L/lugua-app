import { StyleSheet, Text, View } from "react-native";

import type { DictionaryEntry } from "@/src/types/dictionary";

type DictionarySourceBadgeProps = Pick<
  DictionaryEntry,
  "provider" | "source" | "validationStatus" | "dialect"
>;

const providerLabels: Record<DictionaryEntry["provider"], string> = {
  local_curriculum: "Curriculum Lugua",
  orelc: "ORELC",
};

const sourceLabels: Record<DictionaryEntry["source"], string> = {
  user_provided: "Contenu fourni",
  orelc: "ORELC",
  teacher: "Enseignement",
  editorial: "Éditorial",
};

const validationLabels: Record<DictionaryEntry["validationStatus"], string> = {
  draft: "Brouillon",
  reviewed: "Relu",
  validated: "Validé",
};

export function DictionarySourceBadge({
  provider,
  source,
  validationStatus,
  dialect,
}: DictionarySourceBadgeProps) {
  const dialectLabel = dialect && dialect !== "unspecified"
    ? `Dialecte : ${dialect}`
    : "Dialecte non précisé";
  const sourceLabel =
    provider === "local_curriculum" && source === "orelc"
      ? "Contenu local"
      : sourceLabels[source];

  return (
    <View style={styles.container} accessibilityLabel="Métadonnées linguistiques">
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{providerLabels[provider]}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{sourceLabel}</Text>
      </View>
      <View style={styles.draftBadge}>
        <Text style={styles.draftText}>{validationLabels[validationStatus]}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{dialectLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    minHeight: 30,
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#172033",
    paddingHorizontal: 10,
  },
  badgeText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "800",
  },
  draftBadge: {
    minHeight: 30,
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#3f2d12",
    paddingHorizontal: 10,
  },
  draftText: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "800",
  },
});
