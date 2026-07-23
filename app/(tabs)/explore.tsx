import { useMemo, useState } from "react";
import {
  SectionList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type SectionListRenderItemInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DictionaryAlphabetBar } from "@/src/components/dictionary/DictionaryAlphabetBar";
import { DictionaryEntryCard } from "@/src/components/dictionary/DictionaryEntryCard";
import { DictionaryFilters } from "@/src/components/dictionary/DictionaryFilters";
import { DICTIONARY_COLORS } from "@/src/components/dictionary/dictionaryColors";
import { DictionarySearchBar } from "@/src/components/dictionary/DictionarySearchBar";
import { DictionaryState } from "@/src/components/dictionary/DictionaryState";
import {
  dictionaryEntries,
  filterDictionaryEntries,
} from "@/src/data/dictionary";
import {
  getDictionaryInitial,
  groupDictionaryEntriesByInitial,
  SHIKOMORI_ALPHABET,
  type DictionaryLetterSelection,
  type DictionarySection,
  type ShikomoriAlphabetLetter,
} from "@/src/data/dictionary/alphabet";
import { useBottomNavigationLayout } from "@/src/contexts/BottomNavigationLayoutContext";
import type { DictionaryEntry, DictionaryPartOfSpeech } from "@/src/types/dictionary";

function formatEntryCount(count: number) {
  if (count === 0) {
    return "Aucune entrée";
  }

  return count + " " + (count > 1 ? "entrées" : "entrée");
}

export default function DictionaryScreen() {
  const { bottomAreaHeight } = useBottomNavigationLayout();
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 390 ? 16 : 20;
  const [search, setSearch] = useState("");
  const [selectedLetter, setSelectedLetter] =
    useState<DictionaryLetterSelection>("all");
  const [selectedPartsOfSpeech, setSelectedPartsOfSpeech] = useState<
    DictionaryPartOfSpeech[]
  >([]);

  const filteredEntries = useMemo(
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
  const sections = useMemo(
    () => groupDictionaryEntriesByInitial(filteredEntries),
    [filteredEntries],
  );
  const hasActiveControls =
    Boolean(search.trim()) ||
    selectedLetter !== "all" ||
    selectedPartsOfSpeech.length > 0;

  function resetAll() {
    setSearch("");
    setSelectedLetter("all");
    setSelectedPartsOfSpeech([]);
  }

  function renderHeader() {
    return (
      <View style={styles.header}>
        <View style={styles.intro}>
          <Text style={styles.title}>Dictionnaire</Text>
          <Text style={styles.subtitle}>
            Explore le shiKomori et retrouve les mots utilisés dans les leçons.
          </Text>
          <Text style={styles.disclaimer}>Données locales de démonstration</Text>
        </View>

        <View style={styles.searchSlot}>
          <DictionarySearchBar
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch("")}
          />
        </View>

        <Text style={styles.direction}>shiKomori ↔ Français</Text>

        <View style={styles.alphabetSlot}>
          <DictionaryAlphabetBar
            selectedLetter={selectedLetter}
            availableLetters={availableLetters}
            onSelectLetter={setSelectedLetter}
          />
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {formatEntryCount(filteredEntries.length)}
          </Text>
          <DictionaryFilters
            selectedPartsOfSpeech={selectedPartsOfSpeech}
            onApply={setSelectedPartsOfSpeech}
            onReset={() => setSelectedPartsOfSpeech([])}
          />
        </View>
      </View>
    );
  }

  function renderEmpty() {
    return (
      <DictionaryState
        variant={hasActiveControls ? "no_results" : "empty"}
        query={search.trim() ? search : undefined}
        onReset={hasActiveControls ? resetAll : undefined}
      />
    );
  }

  function renderSectionHeader({
    section,
  }: {
    section: DictionarySection;
  }) {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {section.title === "OTHER" ? "Autres" : section.title}
        </Text>
      </View>
    );
  }

  function renderItem({
    item,
  }: SectionListRenderItemInfo<DictionaryEntry, DictionarySection>) {
    return <DictionaryEntryCard entry={item} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <View style={[styles.content, { paddingHorizontal: horizontalPadding }]}>
          <SectionList
            style={styles.list}
            sections={sections}
            keyExtractor={(entry) => entry.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            ItemSeparatorComponent={EntrySeparator}
            stickySectionHeadersEnabled={false}
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
  searchSlot: {
    width: "100%",
    marginTop: 16,
  },
  direction: {
    color: DICTIONARY_COLORS.accent,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 10,
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
    flex: 1,
    color: DICTIONARY_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "800",
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
});
