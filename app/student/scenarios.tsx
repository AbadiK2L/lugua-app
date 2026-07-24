import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LuguaAppHeader } from "@/src/components/navigation/LuguaAppHeader";
import { ScenarioCard } from "@/src/components/scenarios/ScenarioCard";
import { ScenarioCategoryFilter } from "@/src/components/scenarios/ScenarioCategoryFilter";
import { ScenarioSearchBar } from "@/src/components/scenarios/ScenarioSearchBar";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { useBottomNavigationLayout } from "@/src/contexts/BottomNavigationLayoutContext";
import { dictionaryEntries, normalizeDictionaryText } from "@/src/data/dictionary";
import { scenarioCatalog } from "@/src/data/scenarioCatalog";
import type { ScenarioCategory } from "@/src/types/scenarios";

const firstAvailableLesson = dictionaryEntries.find(
  (entry) => entry.lessonAvailable && entry.conceptId,
);

export default function ScenariosScreen() {
  const { bottomAreaHeight } = useBottomNavigationLayout();
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 390 ? 16 : 20;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ScenarioCategory>("all");

  const filteredScenarios = useMemo(() => {
    const normalizedSearch = normalizeDictionaryText(search);

    return scenarioCatalog.filter((scenario) => {
      const matchesCategory = category === "all" || scenario.category === category;
      const matchesSearch =
        !normalizedSearch ||
        normalizeDictionaryText(
          [scenario.title, scenario.description, ...scenario.tags].join(" "),
        ).includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  function openFirstLesson() {
    if (firstAvailableLesson?.conceptId) {
      router.push(`/lesson/${firstAvailableLesson.conceptId}`);
      return;
    }

    router.push("/student/scenarios");
  }

  function openScenario(scenarioId: string) {
    const scenario = scenarioCatalog.find((item) => item.id === scenarioId);

    if (scenario?.lessonConceptId) {
      router.push(`/lesson/${scenario.lessonConceptId}`);
    }
  }

  function resetFilters() {
    setSearch("");
    setCategory("all");
  }

  const recommendedScenario = filteredScenarios[0];
  const explorerScenarios = filteredScenarios.slice(1);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: bottomAreaHeight + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          <LuguaAppHeader onPressCurrentLesson={openFirstLesson} />

          <View style={styles.intro}>
            <Text style={styles.title}>Scénarios</Text>
            <Text style={styles.subtitle}>
              Apprends le shiKomori dans des situations de la vie quotidienne.
            </Text>
          </View>

          <ScenarioSearchBar
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch("")}
          />

          <ScenarioCategoryFilter value={category} onChange={setCategory} />

          {filteredScenarios.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucun scénario trouvé</Text>
              <Text style={styles.emptyText}>
                Essaie une autre recherche ou un autre filtre.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Réinitialiser les filtres"
                onPress={resetFilters}
                style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
              >
                <Text style={styles.resetButtonText}>Réinitialiser</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>RECOMMANDÉ</Text>
                {recommendedScenario ? (
                  <ScenarioCard
                    scenario={recommendedScenario}
                    onPress={() => openScenario(recommendedScenario.id)}
                  />
                ) : null}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>EXPLORER</Text>
                {explorerScenarios.length > 0 ? (
                  <View style={styles.list}>
                    {explorerScenarios.map((scenario) => (
                      <ScenarioCard
                        key={scenario.id}
                        scenario={scenario}
                        onPress={() => openScenario(scenario.id)}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.futureState}>
                    <Text style={styles.futureTitle}>D&apos;autres situations seront ajoutées progressivement.</Text>
                    <Text style={styles.futureText}>
                      Les prochaines catégories apparaîtront après validation de leurs contenus.
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: HOME_COLORS.navy,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: "100%",
    paddingTop: 12,
  },
  column: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    gap: 18,
  },
  intro: {
    gap: 6,
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    color: HOME_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    color: HOME_COLORS.accent,
    fontSize: 12,
    fontWeight: "900",
  },
  list: {
    gap: 12,
  },
  emptyState: {
    gap: 8,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 18,
    backgroundColor: HOME_COLORS.card,
    padding: 20,
  },
  emptyTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "900",
  },
  emptyText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  resetButton: {
    minHeight: 44,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: HOME_COLORS.accent,
    marginTop: 6,
    paddingHorizontal: 16,
  },
  resetButtonText: {
    color: HOME_COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  futureState: {
    gap: 6,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 16,
    backgroundColor: HOME_COLORS.surface,
    padding: 16,
  },
  futureTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },
  futureText: {
    color: HOME_COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  pressed: {
    opacity: 0.78,
  },
});
