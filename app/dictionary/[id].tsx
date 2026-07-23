import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import AudioButton from "@/src/components/AudioButton";
import { DictionaryDetailTabs } from "@/src/components/dictionary/DictionaryDetailTabs";
import { DICTIONARY_COLORS } from "@/src/components/dictionary/dictionaryColors";
import {
  getDictionaryEntryById,
  normalizeDictionaryText,
} from "@/src/data/dictionary";
import {
  getDictionaryPartOfSpeechLabel,
  type DictionaryDetailTab,
  type DictionaryEntry,
} from "@/src/types/dictionary";
import type {
  AudioStatus,
  ContentSource,
  ValidationStatus,
} from "@/src/types/learning";

const validationLabels: Record<ValidationStatus, string> = {
  draft: "Brouillon",
  reviewed: "Relu",
  validated: "Validé",
};

const sourceLabels: Record<ContentSource, string> = {
  user_provided: "Contenu fourni",
  orelc: "ORELC",
  teacher: "Enseignement",
  editorial: "Éditorial",
};

const audioLabels: Record<AudioStatus, string> = {
  missing: "Non disponible",
  draft: "Brouillon",
  validated: "Disponible",
};

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getUniqueMeanings(entry: DictionaryEntry) {
  const meanings = new Map<string, string>();

  for (const meaning of entry.frenchMeanings) {
    const normalizedMeaning = normalizeDictionaryText(meaning);

    if (normalizedMeaning && !meanings.has(normalizedMeaning)) {
      meanings.set(normalizedMeaning, meaning);
    }
  }

  return Array.from(meanings.values());
}

function getPartOfSpeechLabel(entry: DictionaryEntry) {
  return entry.partOfSpeech
    ? getDictionaryPartOfSpeechLabel(entry.partOfSpeech)
    : "Nature non renseignée";
}

function getDialectLabel(entry: DictionaryEntry) {
  return entry.dialect && entry.dialect !== "unspecified"
    ? entry.dialect
    : "Non précisée";
}

function getSourceLabel(entry: DictionaryEntry) {
  return entry.provider === "local_curriculum"
    ? "Curriculum local de Lugua"
    : sourceLabels[entry.source];
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.topBar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour au dictionnaire"
        accessibilityHint="Revient à la liste du dictionnaire"
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <IconSymbol
          name="chevron.right"
          size={19}
          color={DICTIONARY_COLORS.textPrimary}
          style={styles.backIcon}
        />
        <Text style={styles.backText}>Retour</Text>
      </Pressable>
      <Text style={styles.routeTitle}>Fiche du mot</Text>
      <View style={styles.topBarSpacer} />
    </View>
  );
}

function EmptyTabState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.emptyTabState}>
      <Text style={styles.emptyTabTitle}>{title}</Text>
      <Text style={styles.emptyTabText}>{message}</Text>
    </View>
  );
}

function DefinitionsTab({
  entry,
  meanings,
}: {
  entry: DictionaryEntry;
  meanings: string[];
}) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.tabSection}>
        <Text style={styles.sectionTitle}>Définitions</Text>
        {meanings.length > 0 ? (
          <View style={styles.meaningList}>
            {meanings.map((meaning, index) => (
              <View key={`${meaning}-${index}`} style={styles.meaningRow}>
                <Text style={styles.meaningNumber}>{index + 1}</Text>
                <Text style={styles.meaningText}>{meaning}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.mutedText}>
            Aucune définition renseignée pour le moment.
          </Text>
        )}
      </View>

      <View style={styles.tabSection}>
        <Text style={styles.sectionTitle}>Exemples</Text>
        {entry.examples.length > 0 ? (
          <View style={styles.exampleList}>
            {entry.examples.map((example) => (
              <View key={example.id} style={styles.exampleCard}>
                <Text style={styles.targetText}>{example.targetLanguageText}</Text>
                <Text style={styles.frenchText}>{example.frenchText}</Text>
                {example.contextLabel ? (
                  <Text style={styles.contextLabel}>{example.contextLabel}</Text>
                ) : null}
                {example.contextDescription ? (
                  <Text style={styles.contextDescription}>
                    {example.contextDescription}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.mutedText}>Aucun exemple disponible.</Text>
        )}
      </View>
    </View>
  );
}

function SynonymsTab({ entry }: { entry: DictionaryEntry }) {
  if (!entry.synonyms || entry.synonyms.length === 0) {
    return (
      <EmptyTabState
        title="Synonymes"
        message="Aucun synonyme renseigné pour le moment."
      />
    );
  }

  return (
    <View style={styles.tabContent}>
      <View style={styles.tabSection}>
        <Text style={styles.sectionTitle}>Synonymes</Text>
        <View style={styles.simpleList}>
          {entry.synonyms.map((synonym) => (
            <View key={synonym.id} style={styles.simpleListRow}>
              <Text style={styles.simpleListLabel}>{synonym.label}</Text>
              {synonym.note ? (
                <Text style={styles.simpleListNote}>{synonym.note}</Text>
              ) : null}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function ConjugationTab({ entry }: { entry: DictionaryEntry }) {
  if (entry.partOfSpeech !== "verb") {
    return (
      <EmptyTabState
        title="Conjugaison"
        message="Non applicable à cette entrée."
      />
    );
  }

  if (!entry.conjugation || entry.conjugation.length === 0) {
    return (
      <EmptyTabState
        title="Conjugaison"
        message="Aucune conjugaison renseignée pour le moment."
      />
    );
  }

  return (
    <View style={styles.tabContent}>
      <View style={styles.tabSection}>
        <Text style={styles.sectionTitle}>Conjugaison</Text>
        <View style={styles.conjugationList}>
          {entry.conjugation.map((group) => (
            <View key={group.id} style={styles.conjugationGroup}>
              <Text style={styles.conjugationTitle}>{group.title}</Text>
              {group.forms.map((form) => (
                <View key={`${group.id}-${form.label}`} style={styles.conjugationRow}>
                  <Text style={styles.conjugationLabel}>{form.label}</Text>
                  <Text style={styles.conjugationValue}>{form.value}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function EtymologyTab({ entry }: { entry: DictionaryEntry }) {
  if (!entry.etymology) {
    return (
      <EmptyTabState
        title="Étymologie"
        message="Information non disponible pour le moment."
      />
    );
  }

  return (
    <View style={styles.tabContent}>
      <View style={styles.tabSection}>
        <Text style={styles.sectionTitle}>Étymologie</Text>
        <Text style={styles.editorialText}>{entry.etymology}</Text>
      </View>
    </View>
  );
}

function MapTab({ entry }: { entry: DictionaryEntry }) {
  if (!entry.geographicUsage || entry.geographicUsage.length === 0) {
    return (
      <EmptyTabState
        title="Cartographie"
        message="Les données géographiques seront ajoutées progressivement."
      />
    );
  }

  return (
    <View style={styles.tabContent}>
      <View style={styles.tabSection}>
        <Text style={styles.sectionTitle}>Cartographie</Text>
        <View style={styles.exampleList}>
          {entry.geographicUsage.map((usage) => (
            <View key={usage.id} style={styles.exampleCard}>
              <Text style={styles.targetText}>{usage.variety}</Text>
              {usage.region ? (
                <Text style={styles.frenchText}>{usage.region}</Text>
              ) : null}
              <Text style={styles.contextLabel}>
                {usage.status === "confirmed" ? "Confirmé" : "Brouillon"}
              </Text>
              {usage.note ? (
                <Text style={styles.contextDescription}>{usage.note}</Text>
              ) : null}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function DetailTabContent({
  activeTab,
  entry,
  meanings,
}: {
  activeTab: DictionaryDetailTab;
  entry: DictionaryEntry;
  meanings: string[];
}) {
  switch (activeTab) {
    case "synonyms":
      return <SynonymsTab entry={entry} />;
    case "conjugation":
      return <ConjugationTab entry={entry} />;
    case "etymology":
      return <EtymologyTab entry={entry} />;
    case "map":
      return <MapTab entry={entry} />;
    case "definitions":
    default:
      return <DefinitionsTab entry={entry} meanings={meanings} />;
  }
}

function LinguisticInformation({ entry }: { entry: DictionaryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const rows = [
    ...(entry.dialect !== undefined
      ? [{ label: "Variété", value: getDialectLabel(entry) }]
      : []),
    { label: "Niveau", value: entry.level },
    ...(entry.partOfSpeech
      ? [{ label: "Nature grammaticale", value: getPartOfSpeechLabel(entry) }]
      : []),
    { label: "Validation", value: validationLabels[entry.validationStatus] },
    { label: "Source", value: getSourceLabel(entry) },
    { label: "Audio", value: audioLabels[entry.audioStatus] },
    { label: "Chapitre", value: entry.chapterTitle },
    { label: "Bloc", value: entry.blockTitle },
  ];

  return (
    <View style={styles.infoSection}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Informations linguistiques"
        accessibilityHint={expanded ? "Réduit les informations" : "Affiche les informations"}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [styles.infoHeader, pressed && styles.pressed]}
      >
        <View style={styles.infoHeaderText}>
          <Text style={styles.sectionTitle}>Informations linguistiques</Text>
          <Text style={styles.infoHint}>
            {expanded ? "Masquer les détails" : "Voir la source et le statut"}
          </Text>
        </View>
        <IconSymbol
          name="chevron.down"
          size={20}
          color={DICTIONARY_COLORS.textSecondary}
          style={[styles.infoChevron, expanded && styles.infoChevronExpanded]}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.infoContent}>
          <View style={styles.infoRows}>
            {rows.map((row) => (
              <View key={row.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.attributionText}>
            Cette entrée de démonstration provient du curriculum local de Lugua. La connexion aux données ORELC n’est pas encore active.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function NotFoundState() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.emptyContainer}>
        <Header onBack={() => router.back()} />
        <View style={styles.emptyContent}>
          <Text style={styles.emptyTitle}>Entrée introuvable</Text>
          <Text style={styles.emptyText}>
            Cette entrée n’existe pas ou n’est plus disponible.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour au dictionnaire"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>Retour au dictionnaire</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function DictionaryEntryScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const resolvedEntry = getDictionaryEntryById(normalizeParam(params.id) ?? "");
  const [activeTab, setActiveTab] = useState<DictionaryDetailTab>("definitions");
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 390 ? 16 : 20;

  if (!resolvedEntry) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <NotFoundState />
      </>
    );
  }

  const entry = resolvedEntry;
  const meanings = getUniqueMeanings(entry);
  const primaryMeaning = meanings.slice(0, 2).join(" · ");
  const canLearn = entry.lessonAvailable && Boolean(entry.conceptId);

  function openLesson() {
    if (entry.conceptId) {
      router.push(`/lesson/${entry.conceptId}`);
    }
  }

  function openConcept() {
    if (entry.conceptId) {
      router.push(`/concept/${entry.conceptId}`);
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
          showsVerticalScrollIndicator={false}
        >
          <Header onBack={() => router.back()} />

          <View style={styles.wordCard}>
            <Text style={styles.cardKicker}>Mot shiKomori</Text>
            <Text style={styles.headword}>{entry.headword}</Text>
            <Text style={styles.meanings}>
              {primaryMeaning || "Sens non renseigné"}
            </Text>
            <Text style={styles.metadata}>
              {entry.level} · {getPartOfSpeechLabel(entry)} · {validationLabels[entry.validationStatus]}
            </Text>
          </View>

          <AudioButton
            audioStatus={entry.audioStatus}
            audioUrl={entry.audioUrl}
            compact
          />

          <DictionaryDetailTabs activeTab={activeTab} onChange={setActiveTab} />

          <DetailTabContent
            activeTab={activeTab}
            entry={entry}
            meanings={meanings}
          />

          <LinguisticInformation entry={entry} />

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={canLearn ? "Apprendre ce mot" : "Leçon bientôt disponible"}
              accessibilityState={{ disabled: !canLearn }}
              disabled={!canLearn}
              onPress={openLesson}
              style={({ pressed }) => [
                styles.primaryButton,
                !canLearn && styles.disabledButton,
                pressed && canLearn && styles.primaryPressed,
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
                onPress={openConcept}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>Voir le concept</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DICTIONARY_COLORS.navy,
  },
  container: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    gap: 26,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topBar: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    minHeight: 44,
    minWidth: 96,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  backIcon: {
    transform: [{ rotate: "180deg" }],
  },
  backText: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  routeTitle: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  topBarSpacer: {
    minWidth: 96,
  },
  wordCard: {
    gap: 10,
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 20,
    backgroundColor: DICTIONARY_COLORS.card,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cardKicker: {
    color: DICTIONARY_COLORS.accent,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  headword: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 40,
    fontWeight: "900",
    lineHeight: 46,
  },
  meanings: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 19,
    fontWeight: "700",
    lineHeight: 27,
  },
  metadata: {
    color: DICTIONARY_COLORS.textMuted,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 20,
  },
  tabContent: {
    gap: 26,
  },
  tabSection: {
    gap: 12,
  },
  sectionTitle: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 28,
  },
  meaningList: {
    gap: 10,
  },
  meaningRow: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: DICTIONARY_COLORS.border,
    paddingBottom: 10,
  },
  meaningNumber: {
    color: DICTIONARY_COLORS.accent,
    fontSize: 15,
    fontWeight: "900",
    minWidth: 20,
  },
  meaningText: {
    flex: 1,
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 23,
  },
  mutedText: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  exampleList: {
    gap: 12,
  },
  exampleCard: {
    gap: 6,
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 16,
    backgroundColor: DICTIONARY_COLORS.surface,
    padding: 16,
  },
  targetText: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 28,
  },
  frenchText: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 23,
  },
  contextLabel: {
    color: DICTIONARY_COLORS.accent,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 18,
    marginTop: 6,
    textTransform: "uppercase",
  },
  contextDescription: {
    color: DICTIONARY_COLORS.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  simpleList: {
    gap: 8,
  },
  simpleListRow: {
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: DICTIONARY_COLORS.border,
    paddingBottom: 10,
  },
  simpleListLabel: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "800",
  },
  simpleListNote: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  conjugationList: {
    gap: 14,
  },
  conjugationGroup: {
    gap: 8,
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 16,
    backgroundColor: DICTIONARY_COLORS.surface,
    padding: 16,
  },
  conjugationTitle: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
  conjugationRow: {
    minHeight: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(41, 68, 96, 0.58)",
  },
  conjugationLabel: {
    color: DICTIONARY_COLORS.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  conjugationValue: {
    flex: 1,
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },
  editorialText: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 25,
  },
  emptyTabState: {
    gap: 8,
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 16,
    backgroundColor: DICTIONARY_COLORS.surface,
    padding: 18,
  },
  emptyTabTitle: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  emptyTabText: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  infoSection: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 16,
    backgroundColor: DICTIONARY_COLORS.surface,
  },
  infoHeader: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
  },
  infoHeaderText: {
    flex: 1,
    gap: 2,
  },
  infoHint: {
    color: DICTIONARY_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  infoChevron: {
    transform: [{ rotate: "0deg" }],
  },
  infoChevronExpanded: {
    transform: [{ rotate: "180deg" }],
  },
  infoContent: {
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: DICTIONARY_COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoRows: {
    gap: 0,
  },
  infoRow: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(41, 68, 96, 0.58)",
  },
  infoLabel: {
    color: DICTIONARY_COLORS.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  infoValue: {
    flex: 1,
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    textAlign: "right",
  },
  attributionText: {
    color: DICTIONARY_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: DICTIONARY_COLORS.accent,
    paddingHorizontal: 18,
  },
  primaryPressed: {
    backgroundColor: DICTIONARY_COLORS.accentPressed,
  },
  disabledButton: {
    backgroundColor: DICTIONARY_COLORS.card,
    opacity: 0.62,
  },
  primaryButtonText: {
    color: DICTIONARY_COLORS.ink,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  secondaryButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.accent,
    borderRadius: 14,
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  pressed: {
    backgroundColor: DICTIONARY_COLORS.cardActive,
  },
  emptyContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    gap: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyContent: {
    gap: 10,
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 18,
    backgroundColor: DICTIONARY_COLORS.card,
    padding: 20,
  },
  emptyTitle: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "900",
  },
  emptyText: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 10,
  },
});
