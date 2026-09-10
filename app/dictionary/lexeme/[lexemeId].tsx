import { Redirect, router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
import { AuthLoadingScreen } from "@/src/components/auth/AuthLoadingScreen";
import { ProfileUnavailableScreen } from "@/src/components/auth/ProfileUnavailableScreen";
import { PublishedDictionaryState } from "@/src/components/dictionary/PublishedDictionaryState";
import { DICTIONARY_COLORS } from "@/src/components/dictionary/dictionaryColors";
import { useAuthSession } from "@/src/contexts/AuthSessionContext";
import {
  getPublishedLexemeEntry,
  mapPublishedDictionaryError,
  PUBLISHED_DICTIONARY_LOCALE_CODE,
  type PublishedDictionaryServiceErrorKind,
} from "@/src/services/publishedDictionaryService";
import type {
  PublishedDictionaryClassification,
  PublishedDictionaryClassAssignment,
  PublishedDictionaryNounClassPairing,
  PublishedDictionaryParadigm,
  PublishedDictionaryProvenance,
  PublishedDictionarySense,
  PublishedDictionaryVariety,
  PublishedLexemeEntry,
} from "@/src/types/publishedDictionary";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type DetailState =
  | { status: "loading" }
  | { status: "ready"; entry: PublishedLexemeEntry }
  | { status: "unavailable" }
  | {
      status: "error";
      kind: PublishedDictionaryServiceErrorKind;
      message: string;
    };

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isValidLocaleCode(value: string) {
  return (
    value.length >= 1 &&
    value.length <= 63 &&
    value === value.trim()
  );
}

function getModalityLabel(code: string) {
  if (code === "written") {
    return "Écrite";
  }

  if (code === "spoken") {
    return "Orale";
  }

  return code;
}

function getGlossTypeLabel(code: string) {
  if (code === "gloss") {
    return "Glose";
  }

  if (code === "definition") {
    return "Définition";
  }

  return code;
}

function getClassificationLabel(
  classification: PublishedDictionaryClassification,
) {
  return classification.label ?? classification.code;
}

function getVarietyLabel(
  varietyId: string,
  varieties: PublishedDictionaryVariety[],
) {
  const variety = varieties.find((candidate) => candidate.id === varietyId);
  return variety ? variety.name + " · " + variety.code : varietyId;
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.topBar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour au dictionnaire"
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
      <Text style={styles.routeTitle}>Fiche publiée</Text>
      <View style={styles.topBarSpacer} />
    </View>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function EmptySection({ children }: { children: ReactNode }) {
  return <Text style={styles.emptyText}>{children}</Text>;
}

function VarietyTags({
  varieties,
  emptyLabel = "Aucune variété précisée",
}: {
  varieties: PublishedDictionaryVariety[];
  emptyLabel?: string;
}) {
  if (varieties.length === 0) {
    return <Text style={styles.inlineMuted}>{emptyLabel}</Text>;
  }

  return (
    <View style={styles.tags}>
      {varieties.map((variety) => (
        <View key={variety.id} style={styles.tag}>
          <Text style={styles.tagText}>
            {variety.name} · {variety.code}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SenseBlock({
  sense,
  index,
}: {
  sense: PublishedDictionarySense;
  index: number;
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>Sens {index + 1}</Text>
      {sense.glosses.length > 0 ? (
        <View style={styles.rows}>
          {sense.glosses.map((gloss) => (
            <View key={gloss.glossId} style={styles.row}>
              <Text style={styles.rowLabel}>
                {getGlossTypeLabel(gloss.glossTypeCode)} · {gloss.localeCode}
              </Text>
              <Text style={styles.rowValue}>{gloss.glossText}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.inlineMuted}>
          Aucune glose disponible dans cette locale.
        </Text>
      )}
      <VarietyTags varieties={sense.varieties.map((item) => item.variety)} />
    </View>
  );
}

function ClassAssignmentBlock({
  assignment,
  varieties,
}: {
  assignment: PublishedDictionaryClassAssignment;
  varieties: PublishedDictionaryVariety[];
}) {
  return (
    <View style={styles.compactBlock}>
      <Text style={styles.blockTitle}>
        {getClassificationLabel(assignment.class)}
      </Text>
      <Text style={styles.rowValue}>
        Système : {getClassificationLabel(assignment.system)}
      </Text>
      <Text style={styles.inlineMuted}>
        {getVarietyLabel(assignment.varietyId, varieties)}
      </Text>
    </View>
  );
}

function NounPairingBlock({
  pairing,
  varieties,
}: {
  pairing: PublishedDictionaryNounClassPairing;
  varieties: PublishedDictionaryVariety[];
}) {
  return (
    <View style={styles.compactBlock}>
      <Text style={styles.blockTitle}>
        {getClassificationLabel(pairing.classA)} ↔{" "}
        {getClassificationLabel(pairing.classB)}
      </Text>
      <Text style={styles.rowValue}>
        Système : {getClassificationLabel(pairing.system)}
      </Text>
      <Text style={styles.inlineMuted}>
        {getVarietyLabel(pairing.varietyId, varieties)}
      </Text>
    </View>
  );
}

function ParadigmBlock({
  paradigm,
  varieties,
}: {
  paradigm: PublishedDictionaryParadigm;
  varieties: PublishedDictionaryVariety[];
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>
        {paradigm.label ?? "Paradigme sans libellé dans cette locale"}
      </Text>
      {paradigm.description ? (
        <Text style={styles.rowValue}>{paradigm.description}</Text>
      ) : null}
      <Text style={styles.inlineMuted}>
        {getVarietyLabel(paradigm.varietyId, varieties)}
      </Text>
      {paradigm.verbClasses.length > 0 ? (
        <View style={styles.rows}>
          {paradigm.verbClasses.map((verbClass) => (
            <View key={verbClass.membershipId} style={styles.row}>
              <Text style={styles.rowLabel}>
                {getClassificationLabel(verbClass.system)}
              </Text>
              <Text style={styles.rowValue}>
                {getClassificationLabel(verbClass.class)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.inlineMuted}>
          Aucune classe verbale résumée pour ce paradigme.
        </Text>
      )}
    </View>
  );
}

function ProvenanceBlock({
  provenance,
}: {
  provenance: PublishedDictionaryProvenance;
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{provenance.sourceLabel}</Text>
      <Text style={styles.rowValue}>{provenance.citationText}</Text>
      <View style={styles.sourceMeta}>
        {provenance.publicationYear !== null ? (
          <Text style={styles.inlineMuted}>
            Année : {provenance.publicationYear}
          </Text>
        ) : null}
        {provenance.locatorText ? (
          <Text style={styles.inlineMuted}>{provenance.locatorText}</Text>
        ) : null}
        <Text style={styles.inlineMuted}>Portée : {provenance.targetKind}</Text>
      </View>
      {provenance.canonicalUri ? (
        <Text selectable style={styles.uriText}>
          {provenance.canonicalUri}
        </Text>
      ) : null}
      {provenance.locationUri ? (
        <Text selectable style={styles.uriText}>
          {provenance.locationUri}
        </Text>
      ) : null}
    </View>
  );
}

function PublishedEntryContent({ entry }: { entry: PublishedLexemeEntry }) {
  const headword = entry.forms[0]?.surfaceText ?? "Entrée lexicale";
  const primaryGlosses = entry.senses
    .flatMap((sense) => sense.glosses.map((gloss) => gloss.glossText))
    .slice(0, 2);

  return (
    <>
      <View style={styles.hero}>
        <View style={styles.originBadge}>
          <Text style={styles.originText}>Catalogue publié</Text>
        </View>
        <Text style={styles.headword}>{headword}</Text>
        <Text style={styles.heroGloss}>
          {primaryGlosses.length > 0
            ? primaryGlosses.join(" · ")
            : "Aucune glose disponible dans cette locale"}
        </Text>
        <Text style={styles.heroMeta}>
          {entry.language.nativeName ?? entry.language.name} ·{" "}
          {entry.language.code} · locale {entry.localeCode}
        </Text>
      </View>

      <DetailSection title="Variétés">
        <VarietyTags
          varieties={entry.varieties}
          emptyLabel="Aucune variété publiée n’est rattachée à cette révision."
        />
      </DetailSection>

      <DetailSection title="Sens">
        {entry.senses.length > 0 ? (
          <View style={styles.blocks}>
            {entry.senses.map((sense, index) => (
              <SenseBlock key={sense.senseId} sense={sense} index={index} />
            ))}
          </View>
        ) : (
          <EmptySection>Aucun sens publié disponible.</EmptySection>
        )}
      </DetailSection>

      <DetailSection title="Formes">
        {entry.forms.length > 0 ? (
          <View style={styles.blocks}>
            {entry.forms.map((form) => (
              <View key={form.formId} style={styles.block}>
                <Text style={styles.formText}>{form.surfaceText}</Text>
                <Text style={styles.rowLabel}>
                  Modalité : {getModalityLabel(form.modalityCode)}
                </Text>
                <VarietyTags varieties={form.varieties} />

                {form.orthographies.length > 0 ? (
                  <View style={styles.rows}>
                    {form.orthographies.map((orthography) => (
                      <View key={orthography.formOrthographyId} style={styles.row}>
                        <Text style={styles.rowLabel}>Orthographe</Text>
                        <Text style={styles.rowValue}>
                          {orthography.name} · {orthography.code} ·{" "}
                          {orthography.scriptCode}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.inlineMuted}>
                    Aucune orthographie publiée pour cette forme.
                  </Text>
                )}

                {form.analyses.length > 0 ? (
                  <View style={styles.analysisSummary}>
                    <Text style={styles.analysisTitle}>
                      {form.analyses.length}{" "}
                      {form.analyses.length > 1
                        ? "analyses publiées"
                        : "analyse publiée"}
                    </Text>
                    {form.analyses.map((analysis) => (
                      <View
                        key={analysis.formAnalysisRevisionId}
                        style={styles.analysisRow}
                      >
                        <Text style={styles.inlineMuted}>
                          {analysis.senseId
                            ? "Analyse rattachée à un sens"
                            : "Analyse rattachée au lexème"}
                        </Text>
                        <VarietyTags varieties={analysis.varieties} />
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.inlineMuted}>
                    Aucune analyse publiée pour cette forme.
                  </Text>
                )}
              </View>
            ))}
          </View>
        ) : (
          <EmptySection>Aucune forme publiée disponible.</EmptySection>
        )}
      </DetailSection>

      <DetailSection title="Classes nominales">
        {entry.nounClasses.length > 0 ? (
          <View style={styles.blocks}>
            {entry.nounClasses.map((assignment) => (
              <ClassAssignmentBlock
                key={assignment.assignmentId}
                assignment={assignment}
                varieties={entry.varieties}
              />
            ))}
          </View>
        ) : (
          <EmptySection>Aucune classe nominale publiée.</EmptySection>
        )}
      </DetailSection>

      <DetailSection title="Appariements nominaux">
        {entry.nounClassPairings.length > 0 ? (
          <View style={styles.blocks}>
            {entry.nounClassPairings.map((pairing) => (
              <NounPairingBlock
                key={pairing.pairingId}
                pairing={pairing}
                varieties={entry.varieties}
              />
            ))}
          </View>
        ) : (
          <EmptySection>Aucun appariement nominal publié.</EmptySection>
        )}
      </DetailSection>

      <DetailSection title="Classes verbales">
        {entry.verbClasses.length > 0 ? (
          <View style={styles.blocks}>
            {entry.verbClasses.map((assignment) => (
              <ClassAssignmentBlock
                key={assignment.assignmentId}
                assignment={assignment}
                varieties={entry.varieties}
              />
            ))}
          </View>
        ) : (
          <EmptySection>Aucune classe verbale publiée.</EmptySection>
        )}
      </DetailSection>

      <DetailSection title="Paradigmes">
        {entry.paradigms.length > 0 ? (
          <View style={styles.blocks}>
            {entry.paradigms.map((paradigm) => (
              <ParadigmBlock
                key={paradigm.membershipId}
                paradigm={paradigm}
                varieties={entry.varieties}
              />
            ))}
          </View>
        ) : (
          <EmptySection>Aucun paradigme publié.</EmptySection>
        )}
      </DetailSection>

      <DetailSection title="Sources">
        {entry.provenance.length > 0 ? (
          <View style={styles.blocks}>
            {entry.provenance.map((provenance) => (
              <ProvenanceBlock
                key={provenance.provenanceLinkId}
                provenance={provenance}
              />
            ))}
          </View>
        ) : (
          <EmptySection>Aucune source documentaire active retournée.</EmptySection>
        )}
      </DetailSection>
    </>
  );
}

export default function PublishedDictionaryEntryScreen() {
  const params = useLocalSearchParams<{
    lexemeId?: string | string[];
    locale?: string | string[];
  }>();
  const lexemeId = normalizeParam(params.lexemeId) ?? "";
  const localeCode =
    normalizeParam(params.locale) ?? PUBLISHED_DICTIONARY_LOCALE_CODE;
  const {
    session,
    profile,
    isLoading,
    isRefreshingProfile,
    isSubmitting,
    refreshProfile,
    signOut,
  } = useAuthSession();
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 390 ? 16 : 20;
  const [retryVersion, setRetryVersion] = useState(0);
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const requestIdRef = useRef(0);
  const routeIsValid =
    UUID_PATTERN.test(lexemeId) && isValidLocaleCode(localeCode);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let cancelled = false;

    if (!session?.user.id || !routeIsValid) {
      return;
    }

    setState({ status: "loading" });

    void getPublishedLexemeEntry(lexemeId, localeCode)
      .then((entry) => {
        if (cancelled || requestIdRef.current !== requestId) {
          return;
        }

        setState(entry ? { status: "ready", entry } : { status: "unavailable" });
      })
      .catch((error: unknown) => {
        if (cancelled || requestIdRef.current !== requestId) {
          return;
        }

        const serviceError = mapPublishedDictionaryError(error);
        setState({
          status: "error",
          kind: serviceError.kind,
          message: serviceError.message,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [lexemeId, localeCode, retryVersion, routeIsValid, session?.user.id]);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(profile?.role === "teacher" ? "/teacher" : "/student/dictionary");
  }

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!session) {
    return <Redirect href="/auth/welcome" />;
  }

  if (!profile) {
    return (
      <ProfileUnavailableScreen
        isRetrying={isRefreshingProfile}
        isSigningOut={isSubmitting}
        onRetry={() => void refreshProfile()}
        onSignOut={() => void signOut()}
      />
    );
  }

  let body: ReactNode;

  if (!routeIsValid) {
    body = (
      <PublishedDictionaryState
        title="Lien de dictionnaire invalide"
        message="L’identifiant de l’entrée ou la locale ne respecte pas le format attendu."
        actionLabel="Retour au dictionnaire"
        onAction={goBack}
      />
    );
  } else if (state.status === "loading") {
    body = (
      <PublishedDictionaryState
        loading
        title="Chargement de la fiche"
        message="Lugua récupère les données linguistiques publiées."
      />
    );
  } else if (state.status === "unavailable") {
    body = (
      <PublishedDictionaryState
        title="Entrée publiée indisponible"
        message="Ce lexème n’existe pas, n’est pas publié ou n’est plus visible."
        actionLabel="Retour au dictionnaire"
        onAction={goBack}
      />
    );
  } else if (state.status === "error") {
    body = (
      <PublishedDictionaryState
        title={
          state.kind === "auth"
            ? "Session indisponible"
            : "Fiche momentanément indisponible"
        }
        message={state.message}
        actionLabel={state.kind === "auth" ? "Se reconnecter" : "Réessayer"}
        onAction={
          state.kind === "auth"
            ? () => router.replace("/auth/sign-in")
            : () => setRetryVersion((current) => current + 1)
        }
      />
    );
  } else {
    body = <PublishedEntryContent entry={state.entry} />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: horizontalPadding },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Header onBack={goBack} />
          {body}
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
    gap: 28,
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
    borderRadius: 10,
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
  pressed: {
    backgroundColor: DICTIONARY_COLORS.cardActive,
  },
  hero: {
    gap: 9,
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 16,
    backgroundColor: DICTIONARY_COLORS.card,
    padding: 20,
  },
  originBadge: {
    alignSelf: "flex-start",
    minHeight: 28,
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: DICTIONARY_COLORS.accentSoft,
    paddingHorizontal: 9,
  },
  originText: {
    color: DICTIONARY_COLORS.accent,
    fontSize: 11,
    fontWeight: "800",
  },
  headword: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 44,
  },
  heroGloss: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 26,
  },
  heroMeta: {
    color: DICTIONARY_COLORS.textMuted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  section: {
    width: "100%",
    gap: 12,
  },
  sectionTitle: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 28,
  },
  blocks: {
    gap: 10,
  },
  block: {
    minWidth: 0,
    gap: 10,
    borderWidth: 1,
    borderColor: DICTIONARY_COLORS.border,
    borderRadius: 14,
    backgroundColor: DICTIONARY_COLORS.surface,
    padding: 16,
  },
  compactBlock: {
    minWidth: 0,
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: DICTIONARY_COLORS.border,
    paddingVertical: 10,
  },
  blockTitle: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  formText: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 23,
    fontWeight: "900",
    lineHeight: 30,
  },
  rows: {
    gap: 8,
  },
  row: {
    minWidth: 0,
    gap: 3,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(41, 68, 96, 0.58)",
    paddingBottom: 8,
  },
  rowLabel: {
    color: DICTIONARY_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  rowValue: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  inlineMuted: {
    color: DICTIONARY_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  emptyText: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  tag: {
    minHeight: 28,
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: DICTIONARY_COLORS.cardActive,
    paddingHorizontal: 9,
  },
  tagText: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 16,
  },
  analysisSummary: {
    gap: 9,
    borderTopWidth: 1,
    borderTopColor: DICTIONARY_COLORS.border,
    paddingTop: 10,
  },
  analysisTitle: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "800",
  },
  analysisRow: {
    gap: 6,
  },
  sourceMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  uriText: {
    width: "100%",
    color: DICTIONARY_COLORS.accent,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
});
