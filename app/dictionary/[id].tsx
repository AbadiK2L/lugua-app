import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AudioButton from "@/src/components/AudioButton";
import { DictionarySourceBadge } from "@/src/components/dictionary/DictionarySourceBadge";
import { getDictionaryEntryById } from "@/src/data/dictionary";

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function DictionaryEntryScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const entry = getDictionaryEntryById(normalizeParam(params.id) ?? "");

  if (!entry) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Text style={styles.backText}>Retour</Text>
          </Pressable>
          <View style={styles.emptyContent}>
            <Text style={styles.emptyTitle}>Entrée introuvable</Text>
            <Text style={styles.emptyText}>
              Cette entrée n’existe pas ou n’est plus disponible.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const canLearn = entry.lessonAvailable && Boolean(entry.conceptId);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>Retour</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>{entry.blockTitle}</Text>
          <Text style={styles.headword}>{entry.headword}</Text>
          <Text style={styles.meanings}>{entry.frenchMeanings.join(" · ")}</Text>
          <DictionarySourceBadge
            provider={entry.provider}
            source={entry.source}
            validationStatus={entry.validationStatus}
            dialect={entry.dialect}
          />
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>Niveau</Text>
            <Text style={styles.levelValue}>{entry.level}</Text>
          </View>
        </View>

        <AudioButton
          audioStatus={entry.audioStatus}
          audioUrl={entry.audioUrl}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exemples</Text>
          <View style={styles.exampleList}>
            {entry.examples.map((example) => (
              <View key={example.id} style={styles.exampleCard}>
                <Text style={styles.targetText}>{example.targetLanguageText}</Text>
                <Text style={styles.frenchText}>{example.frenchText}</Text>
                {example.contextLabel ? (
                  <Text style={styles.contextLabel}>{example.contextLabel}</Text>
                ) : null}
                {example.contextDescription ? (
                  <Text style={styles.contextDescription}>{example.contextDescription}</Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.attribution}>
          <Text style={styles.attributionTitle}>Attribution des données</Text>
          <Text style={styles.attributionText}>
            Cette entrée de démonstration provient du curriculum local de Lugua. La connexion aux données ORELC n’est pas encore active.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={canLearn ? "Apprendre ce mot" : "Leçon bientôt disponible"}
            accessibilityState={{ disabled: !canLearn }}
            disabled={!canLearn}
            onPress={() => {
              if (entry.conceptId) {
                router.push(`/lesson/${entry.conceptId}`);
              }
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              !canLearn && styles.disabledButton,
              pressed && canLearn && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {canLearn ? "Apprendre ce mot" : "Leçon bientôt disponible"}
            </Text>
          </Pressable>

          {entry.conceptId ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voir le concept"
              onPress={() => router.push(`/concept/${entry.conceptId}`)}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryButtonText}>Voir le concept</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0b1120",
  },
  container: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    gap: 22,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    gap: 24,
    paddingHorizontal: 20,
    paddingTop: 26,
  },
  emptyContent: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 16,
    backgroundColor: "#111827",
    padding: 24,
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: {
    color: "#cbd5e1",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  pressed: {
    opacity: 0.78,
  },
  backText: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "800",
  },
  header: {
    gap: 12,
  },
  eyebrow: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "800",
  },
  headword: {
    color: "#f8fafc",
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 44,
  },
  meanings: {
    color: "#cbd5e1",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  levelLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
  },
  levelValue: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "900",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 21,
    fontWeight: "800",
  },
  exampleList: {
    gap: 12,
  },
  exampleCard: {
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 14,
    backgroundColor: "#111827",
    padding: 16,
    gap: 6,
  },
  targetText: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 29,
  },
  frenchText: {
    color: "#cbd5e1",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 23,
  },
  contextLabel: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 6,
  },
  contextDescription: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  attribution: {
    borderLeftWidth: 2,
    borderLeftColor: "#38bdf8",
    paddingLeft: 14,
    gap: 6,
  },
  attributionTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
  },
  attributionText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#38bdf8",
    paddingHorizontal: 18,
  },
  disabledButton: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: "#082f49",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  secondaryButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 14,
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "800",
  },
});
