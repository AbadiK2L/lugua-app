import { router, type Href } from "expo-router";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { DictionaryAlphabetBar } from "@/src/components/dictionary/DictionaryAlphabetBar";
import { DictionaryEntryCard } from "@/src/components/dictionary/DictionaryEntryCard";
import { DictionaryFilters } from "@/src/components/dictionary/DictionaryFilters";
import {
  DictionaryModeSwitch,
  type DictionaryMode,
} from "@/src/components/dictionary/DictionaryModeSwitch";
import { PublishedDictionaryEntryCard } from "@/src/components/dictionary/PublishedDictionaryEntryCard";
import { PublishedDictionaryState } from "@/src/components/dictionary/PublishedDictionaryState";
import { DICTIONARY_COLORS } from "@/src/components/dictionary/dictionaryColors";
import { DictionarySearchBar } from "@/src/components/dictionary/DictionarySearchBar";
import { DictionaryState } from "@/src/components/dictionary/DictionaryState";
import { languageOptions } from "@/src/components/home/LanguageSelector";
import { LuguaAppHeader } from "@/src/components/navigation/LuguaAppHeader";
import {
  dictionaryEntries,
  filterDictionaryEntries,
} from "@/src/data/dictionary";
import {
  getDictionaryInitial,
  groupDictionaryEntriesByInitial,
  SHIKOMORI_ALPHABET,
  type DictionaryLetterSelection,
  type ShikomoriAlphabetLetter,
} from "@/src/data/dictionary/alphabet";
import { useAuthSession } from "@/src/contexts/AuthSessionContext";
import { useBottomNavigationLayout } from "@/src/contexts/BottomNavigationLayoutContext";
import { useLanguageSelection } from "@/src/contexts/LanguageSelectionContext";
import {
  mapPublishedDictionaryError,
  PUBLISHED_DICTIONARY_PAGE_SIZE,
  searchPublishedDictionary,
} from "@/src/services/publishedDictionaryService";
import type {
  DictionaryEntry,
  DictionaryPartOfSpeech,
} from "@/src/types/dictionary";
import type { PublishedDictionarySearchEntry } from "@/src/types/publishedDictionary";
import {
  getPublishedDictionarySearchEntryKey,
  initialPublishedDictionarySearchState,
  publishedDictionarySearchReducer,
} from "@/src/utils/publishedDictionarySearchState";
import { buildPublishedDictionaryEntryHref } from "@/src/utils/publishedDictionaryNavigation";
import { resolvePublishedDictionaryScope } from "@/src/utils/publishedDictionaryScope";

const SEARCH_DEBOUNCE_MS = 350;

type DictionaryListItem =
  | { kind: "published"; entry: PublishedDictionarySearchEntry }
  | { kind: "lesson_section"; id: string; title: string }
  | { kind: "lesson"; entry: DictionaryEntry };

function formatLocalEntryCount(count: number) {
  if (count === 0) {
    return "Aucune entrée";
  }

  return count + " " + (count > 1 ? "entrées" : "entrée");
}

function formatLoadedResultCount(count: number) {
  return count + " " + (count > 1 ? "résultats chargés" : "résultat chargé");
}

export default function DictionaryScreen() {
  const { bottomAreaHeight } = useBottomNavigationLayout();
  const { session, profile } = useAuthSession();
  const { selectedLanguage } = useLanguageSelection();
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 390 ? 16 : 20;
  const [mode, setMode] = useState<DictionaryMode>("published");
  const [search, setSearch] = useState("");
  const [selectedLetter, setSelectedLetter] =
    useState<DictionaryLetterSelection>("all");
  const [selectedPartsOfSpeech, setSelectedPartsOfSpeech] = useState<
    DictionaryPartOfSpeech[]
  >([]);
  const [retryVersion, setRetryVersion] = useState(0);
  const [publishedState, dispatchPublished] = useReducer(
    publishedDictionarySearchReducer,
    initialPublishedDictionarySearchState,
  );
  const requestSequenceRef = useRef(0);
  const paginationRequestRef = useRef<string | null>(null);

  const selectedLanguageOption =
    languageOptions.find((option) => option.id === selectedLanguage) ??
    languageOptions[0];
  const publishedScope = useMemo(
    () =>
      resolvePublishedDictionaryScope(
        profile?.preferredLanguage,
        selectedLanguage,
      ),
    [profile?.preferredLanguage, selectedLanguage],
  );

  const filteredLocalEntries = useMemo(
    () =>
      filterDictionaryEntries({
        entries: dictionaryEntries,
        query: search,
        selectedPartsOfSpeech,
        selectedLetter,
      }),
    [search, selectedLetter, selectedPartsOfSpeech],
  );
  const entriesForAvailableLetters = useMemo(
    () =>
      filterDictionaryEntries({
        entries: dictionaryEntries,
        query: search,
        selectedPartsOfSpeech,
        selectedLetter: "all",
      }),
    [search, selectedPartsOfSpeech],
  );
  const availableLetters = useMemo(
    () =>
      new Set(
        entriesForAvailableLetters
          .map((entry) => getDictionaryInitial(entry.headword))
          .filter(
            (initial): initial is ShikomoriAlphabetLetter =>
              initial !== "OTHER" && SHIKOMORI_ALPHABET.includes(initial),
          ),
      ),
    [entriesForAvailableLetters],
  );
  const localItems = useMemo<DictionaryListItem[]>(
    () =>
      groupDictionaryEntriesByInitial(filteredLocalEntries).flatMap((section) => [
        {
          kind: "lesson_section" as const,
          id: "section:" + section.title,
          title: section.title === "OTHER" ? "Autres" : section.title,
        },
        ...section.data.map((entry) => ({ kind: "lesson" as const, entry })),
      ]),
    [filteredLocalEntries],
  );
  const listItems = useMemo<DictionaryListItem[]>(
    () =>
      mode === "published"
        ? publishedState.entries.map((entry) => ({
            kind: "published" as const,
            entry,
          }))
        : localItems,
    [localItems, mode, publishedState.entries],
  );
  const hasActiveLocalControls =
    Boolean(search.trim()) ||
    selectedLetter !== "all" ||
    selectedPartsOfSpeech.length > 0;

  useEffect(() => {
    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    paginationRequestRef.current = null;

    if (mode !== "published") {
      dispatchPublished({ type: "reset", requestId, status: "idle" });
      return;
    }

    const query = search.trim();

    if (!session?.user.id) {
      dispatchPublished({
        type: "reset",
        requestId,
        status: "session_unavailable",
        query,
      });
      return;
    }

    if (publishedScope.status === "unavailable") {
      dispatchPublished({
        type: "reset",
        requestId,
        status: "scope_unavailable",
        query,
      });
      return;
    }

    if (!query) {
      dispatchPublished({ type: "reset", requestId, status: "idle" });
      return;
    }

    if (query.length > 200) {
      dispatchPublished({
        type: "reset",
        requestId,
        status: "validation_error",
        query,
        errorMessage: "La recherche doit contenir 200 caractères maximum.",
      });
      return;
    }

    dispatchPublished({ type: "first_started", requestId, query });
    let cancelled = false;
    const timeout = setTimeout(() => {
      void searchPublishedDictionary({
        query,
        localeCode: publishedScope.localeCode,
        languageCode: publishedScope.languageCode,
        varietyId: publishedScope.varietyId,
        limit: PUBLISHED_DICTIONARY_PAGE_SIZE,
        offset: 0,
      })
        .then((entries) => {
          if (!cancelled) {
            dispatchPublished({
              type: "first_succeeded",
              requestId,
              entries,
              pageSize: PUBLISHED_DICTIONARY_PAGE_SIZE,
            });
          }
        })
        .catch((error: unknown) => {
          if (!cancelled) {
            const serviceError = mapPublishedDictionaryError(error);
            dispatchPublished({
              type: "first_failed",
              requestId,
              errorKind: serviceError.kind,
              errorMessage: serviceError.message,
            });
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [mode, publishedScope, retryVersion, search, session?.user.id]);

  function resetLocalControls() {
    setSearch("");
    setSelectedLetter("all");
    setSelectedPartsOfSpeech([]);
  }

  function retryPublishedSearch() {
    setRetryVersion((current) => current + 1);
  }

  async function loadMorePublishedResults() {
    if (
      mode !== "published" ||
      publishedScope.status !== "ready" ||
      publishedState.status !== "ready" ||
      !publishedState.hasMore ||
      publishedState.isLoadingMore ||
      !session?.user.id
    ) {
      return;
    }

    const requestId = publishedState.requestId;
    const requestedOffset = publishedState.nextOffset;
    const paginationKey = requestId + ":" + requestedOffset;

    if (paginationRequestRef.current) {
      return;
    }

    paginationRequestRef.current = paginationKey;
    dispatchPublished({ type: "next_started", requestId });

    try {
      const entries = await searchPublishedDictionary({
        query: publishedState.query,
        localeCode: publishedScope.localeCode,
        languageCode: publishedScope.languageCode,
        varietyId: publishedScope.varietyId,
        limit: PUBLISHED_DICTIONARY_PAGE_SIZE,
        offset: requestedOffset,
      });
      dispatchPublished({
        type: "next_succeeded",
        requestId,
        entries,
        requestedOffset,
        pageSize: PUBLISHED_DICTIONARY_PAGE_SIZE,
      });
    } catch (error) {
      dispatchPublished({
        type: "next_failed",
        requestId,
        errorMessage: mapPublishedDictionaryError(error).message,
      });
    } finally {
      if (paginationRequestRef.current === paginationKey) {
        paginationRequestRef.current = null;
      }
    }
  }

  function openPublishedEntry(entry: PublishedDictionarySearchEntry) {
    if (publishedScope.status !== "ready") {
      return;
    }

    const href = buildPublishedDictionaryEntryHref(
      entry.lexemeId,
      publishedScope.localeCode,
    );
    router.push(href as Href);
  }

  function renderHeader() {
    const isPublished = mode === "published";

    return (
      <View style={styles.header}>
        <LuguaAppHeader />
        <View style={styles.intro}>
          <Text style={styles.title}>Dictionnaire</Text>
          <Text style={styles.subtitle}>
            {isPublished
              ? "Recherche les formes et les sens du catalogue linguistique publié."
              : "Retrouve les mots déjà utilisés dans les contenus pédagogiques Lugua."}
          </Text>
          <Text style={styles.disclaimer}>
            {isPublished
              ? "Catalogue linguistique · contenu publié"
              : "Curriculum Lugua · données locales de démonstration"}
          </Text>
        </View>

        <View style={styles.modeSlot}>
          <DictionaryModeSwitch value={mode} onChange={setMode} />
        </View>

        <View style={styles.searchSlot}>
          <DictionarySearchBar
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch("")}
          />
        </View>

        <Text style={styles.direction}>
          {selectedLanguageOption.label} ↔ Français
        </Text>

        {isPublished ? (
          <View style={styles.publishedSummary}>
            <View style={styles.scopeCopy}>
              <Text style={styles.scopeLabel}>Recherche publiée</Text>
              <Text style={styles.scopeValue} numberOfLines={2}>
                {publishedScope.status === "ready"
                  ? publishedScope.languageCode +
                    " · locale " +
                    publishedScope.localeCode +
                    (publishedScope.varietyId === null
                      ? " · toutes variétés publiées"
                      : " · " + selectedLanguageOption.label)
                  : "Périmètre du catalogue indisponible"}
              </Text>
            </View>
            <Text style={styles.resultsCount}>
              {publishedState.status === "ready"
                ? formatLoadedResultCount(publishedState.entries.length)
                : publishedState.status === "empty"
                  ? "Aucun résultat"
                  : publishedState.status === "loading"
                    ? "Recherche en cours"
                    : "Saisis un terme"}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.alphabetSlot}>
              <DictionaryAlphabetBar
                selectedLetter={selectedLetter}
                availableLetters={availableLetters}
                onSelectLetter={setSelectedLetter}
              />
            </View>

            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {formatLocalEntryCount(filteredLocalEntries.length)}
              </Text>
              <DictionaryFilters
                selectedPartsOfSpeech={selectedPartsOfSpeech}
                onApply={setSelectedPartsOfSpeech}
                onReset={() => setSelectedPartsOfSpeech([])}
              />
            </View>
          </>
        )}
      </View>
    );
  }

  function renderPublishedEmptyState() {
    switch (publishedState.status) {
      case "loading":
        return (
          <PublishedDictionaryState
            loading
            title="Recherche en cours"
            message={
              "Lugua recherche « " +
              publishedState.query +
              " » dans le catalogue publié."
            }
          />
        );
      case "empty":
        return (
          <PublishedDictionaryState
            title="Aucun résultat publié"
            message={
              "Aucune forme ni glose ne correspond à « " +
              publishedState.query +
              " » dans ce périmètre."
            }
          />
        );
      case "error":
        if (publishedState.errorKind === "auth") {
          return (
            <PublishedDictionaryState
              title="Session indisponible"
              message={
                publishedState.errorMessage ??
                "Ta session a expiré. Connecte-toi de nouveau."
              }
              actionLabel="Se reconnecter"
              onAction={() => router.replace("/auth/sign-in")}
            />
          );
        }

        return (
          <PublishedDictionaryState
            title="Recherche indisponible"
            message={
              publishedState.errorMessage ??
              "Le catalogue publié n’a pas pu être chargé."
            }
            actionLabel="Réessayer"
            onAction={retryPublishedSearch}
          />
        );
      case "session_unavailable":
        return (
          <PublishedDictionaryState
            title="Session indisponible"
            message="Connecte-toi avec un compte Lugua pour consulter le catalogue publié."
            actionLabel="Se connecter"
            onAction={() => router.replace("/auth/sign-in")}
          />
        );
      case "scope_unavailable":
        return (
          <PublishedDictionaryState
            title="Variété non reliée au catalogue"
            message={
              selectedLanguageOption.label +
              " ne dispose pas encore d’un UUID de variété configuré. Aucune recherche élargie n’a été lancée."
            }
            actionLabel="Voir les contenus des leçons"
            onAction={() => setMode("lessons")}
          />
        );
      case "validation_error":
        return (
          <PublishedDictionaryState
            title="Recherche trop longue"
            message={
              publishedState.errorMessage ??
              "Réduis le terme de recherche à 200 caractères."
            }
          />
        );
      case "idle":
      default:
        return (
          <PublishedDictionaryState
            title="Quel mot cherches-tu ?"
            message="Saisis une forme shiKomori ou une glose française pour lancer la recherche publiée."
          />
        );
    }
  }

  function renderEmpty() {
    if (mode === "published") {
      return renderPublishedEmptyState();
    }

    return (
      <DictionaryState
        variant={hasActiveLocalControls ? "no_results" : "empty"}
        query={search.trim() ? search : undefined}
        onReset={hasActiveLocalControls ? resetLocalControls : undefined}
      />
    );
  }

  function renderItem({ item }: ListRenderItemInfo<DictionaryListItem>) {
    if (item.kind === "lesson_section") {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
        </View>
      );
    }

    if (item.kind === "lesson") {
      return <DictionaryEntryCard entry={item.entry} />;
    }

    return (
      <PublishedDictionaryEntryCard
        entry={item.entry}
        onPress={() => openPublishedEntry(item.entry)}
      />
    );
  }

  function keyExtractor(item: DictionaryListItem) {
    if (item.kind === "lesson_section") {
      return item.id;
    }

    if (item.kind === "lesson") {
      return "lesson:" + item.entry.id;
    }

    return "published:" + getPublishedDictionarySearchEntryKey(item.entry);
  }

  function renderFooter() {
    if (mode !== "published" || publishedState.status !== "ready") {
      return null;
    }

    return (
      <View style={styles.footer}>
        {publishedState.paginationError ? (
          <Text accessibilityRole="alert" style={styles.paginationError}>
            {publishedState.paginationError}
          </Text>
        ) : null}
        {publishedState.hasMore ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Afficher plus de résultats"
            accessibilityState={{ disabled: publishedState.isLoadingMore }}
            disabled={publishedState.isLoadingMore}
            onPress={() => void loadMorePublishedResults()}
            style={({ pressed }) => [
              styles.loadMoreButton,
              pressed && styles.loadMorePressed,
              publishedState.isLoadingMore && styles.disabledButton,
            ]}
          >
            {publishedState.isLoadingMore ? (
              <ActivityIndicator color={DICTIONARY_COLORS.ink} size="small" />
            ) : (
              <IconSymbol
                name="chevron.down"
                size={18}
                color={DICTIONARY_COLORS.ink}
              />
            )}
            <Text style={styles.loadMoreText}>
              {publishedState.isLoadingMore
                ? "Chargement"
                : publishedState.paginationError
                  ? "Réessayer"
                  : "Afficher plus"}
            </Text>
          </Pressable>
        ) : (
          <Text style={styles.endText}>Fin des résultats chargés</Text>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <View style={[styles.content, { paddingHorizontal: horizontalPadding }]}>
          <FlatList
            style={styles.list}
            data={listItems}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            ItemSeparatorComponent={EntrySeparator}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: bottomAreaHeight + 24 },
            ]}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function EntrySeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DICTIONARY_COLORS.navy,
  },
  screen: {
    flex: 1,
    width: "100%",
    backgroundColor: DICTIONARY_COLORS.navy,
  },
  content: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    flex: 1,
  },
  list: {
    width: "100%",
  },
  listContent: {
    width: "100%",
    alignItems: "stretch",
    paddingTop: 16,
  },
  header: {
    width: "100%",
    marginBottom: 16,
  },
  intro: {
    gap: 6,
  },
  title: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  disclaimer: {
    color: DICTIONARY_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  modeSlot: {
    width: "100%",
    marginTop: 18,
  },
  searchSlot: {
    width: "100%",
    marginTop: 12,
  },
  direction: {
    color: DICTIONARY_COLORS.accent,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 10,
  },
  publishedSummary: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 12,
  },
  scopeCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  scopeLabel: {
    color: DICTIONARY_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "800",
  },
  scopeValue: {
    color: DICTIONARY_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  alphabetSlot: {
    width: "100%",
    marginTop: 6,
  },
  resultsHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
  },
  resultsCount: {
    flexShrink: 1,
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    textAlign: "right",
  },
  sectionHeader: {
    width: "100%",
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    color: DICTIONARY_COLORS.accent,
    fontSize: 16,
    fontWeight: "800",
  },
  separator: {
    height: 10,
  },
  footer: {
    width: "100%",
    alignItems: "center",
    gap: 10,
    paddingTop: 18,
  },
  paginationError: {
    width: "100%",
    color: "#f1a5ae",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    textAlign: "center",
  },
  loadMoreButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    backgroundColor: DICTIONARY_COLORS.accent,
    paddingHorizontal: 18,
  },
  loadMorePressed: {
    backgroundColor: DICTIONARY_COLORS.accentPressed,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadMoreText: {
    color: DICTIONARY_COLORS.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  endText: {
    color: DICTIONARY_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
});
