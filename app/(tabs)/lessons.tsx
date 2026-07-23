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
import { LearningChapterCard } from "@/src/components/learning-path/LearningChapterCard";
import {
  LearningModeSwitch,
  type LearningMode,
} from "@/src/components/learning-path/LearningModeSwitch";
import { LearningPathSearchBar } from "@/src/components/learning-path/LearningPathSearchBar";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { useBottomNavigationLayout } from "@/src/contexts/BottomNavigationLayoutContext";
import {
  dictionaryEntries,
  normalizeDictionaryText,
} from "@/src/data/dictionary";
import { shikomoriLanguage } from "@/src/data/curriculum";
import type { Chapter, LanguageLevel, Skill } from "@/src/types/learning";

type LearningChapterRecord = {
  level: LanguageLevel;
  skill: Skill;
  chapter: Chapter;
};

const learningChapterRecords: LearningChapterRecord[] = shikomoriLanguage.levels.flatMap(
  (level) =>
    level.skills.flatMap((skill) =>
      skill.chapters.map((chapter) => ({ level, skill, chapter })),
    ),
);

const firstAvailableLesson = dictionaryEntries.find(
  (entry) => entry.lessonAvailable && entry.conceptId,
);

function getLevelAudienceLabel(level: LanguageLevel) {
  return level.level === "A1" ? "Débutant" : level.title;
}

function chapterHasAvailableLesson(chapter: Chapter) {
  return chapter.blocks.some((block) =>
    block.concepts.some((concept) =>
      dictionaryEntries.some(
        (entry) => entry.id === concept.id && entry.lessonAvailable,
      ),
    ),
  );
}

function getChapterSearchText({ level, skill, chapter }: LearningChapterRecord) {
  return [
    level.level,
    level.title,
    skill.title,
    chapter.title,
    chapter.description ?? "",
    ...chapter.blocks.flatMap((block) => [
      block.title,
      block.objective ?? "",
      ...block.concepts.flatMap((concept) => [
        concept.key,
        concept.title,
        concept.explanation ?? "",
        ...concept.examples.flatMap((example) => [
          example.targetLanguageText,
          example.frenchText,
        ]),
      ]),
    ]),
  ].join(" ");
}

function getFirstConcept(chapter: Chapter) {
  return chapter.blocks.flatMap((block) => block.concepts)[0];
}

export default function LessonsScreen() {
  const { bottomAreaHeight } = useBottomNavigationLayout();
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 390 ? 16 : 20;
  const [mode, setMode] = useState<LearningMode>("learn");
  const [search, setSearch] = useState("");

  const filteredRecords = useMemo(() => {
    const normalizedSearch = normalizeDictionaryText(search);

    if (!normalizedSearch) {
      return learningChapterRecords;
    }

    return learningChapterRecords.filter((record) =>
      normalizeDictionaryText(getChapterSearchText(record)).includes(normalizedSearch),
    );
  }, [search]);

  const levelGroups = useMemo(() => {
    const groups: { level: LanguageLevel; records: LearningChapterRecord[] }[] = [];

    for (const record of filteredRecords) {
      const existingGroup = groups.find((group) => group.level.id === record.level.id);

      if (existingGroup) {
        existingGroup.records.push(record);
      } else {
        groups.push({ level: record.level, records: [record] });
      }
    }

    return groups;
  }, [filteredRecords]);

  const recommendedRecord = learningChapterRecords[0];
  const showRecommended = Boolean(
    recommendedRecord &&
      filteredRecords.some((record) => record.chapter.id === recommendedRecord.chapter.id),
  );

  function openFirstLesson() {
    if (firstAvailableLesson?.conceptId) {
      router.push(`/lesson/${firstAvailableLesson.conceptId}`);
      return;
    }

    router.push("/(tabs)/lessons");
  }

  function openChapter(record: LearningChapterRecord) {
    const firstLesson = record.chapter.blocks
      .flatMap((block) => block.concepts)
      .map((concept) =>
        dictionaryEntries.find(
          (entry) => entry.id === concept.id && entry.lessonAvailable,
        ),
      )
      .find((entry) => entry?.conceptId);

    if (firstLesson?.conceptId) {
      router.push(`/lesson/${firstLesson.conceptId}`);
      return;
    }

    const concept = getFirstConcept(record.chapter);

    if (concept) {
      router.push({
        pathname: "/concept/[id]",
        params: { id: concept.id },
      });
    }
  }

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

          <LearningModeSwitch value={mode} onChange={setMode} />

          {mode === "review" ? (
            <View style={styles.reviewState}>
              <Text style={styles.reviewTitle}>Révisions</Text>
              <Text style={styles.reviewText}>
                Les révisions personnalisées seront disponibles lorsque le suivi de progression sera activé.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voir le dictionnaire"
                onPress={() => router.push("/(tabs)/explore")}
                style={({ pressed }) => [styles.reviewButton, pressed && styles.pressed]}
              >
                <Text style={styles.reviewButtonText}>Voir le dictionnaire</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.learnContent}>
              <LearningPathSearchBar
                value={search}
                onChangeText={setSearch}
                onClear={() => setSearch("")}
              />

              {filteredRecords.length === 0 ? (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsTitle}>Aucun chapitre trouvé</Text>
                  <Text style={styles.noResultsText}>
                    Aucun chapitre ou notion ne correspond à cette recherche.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Effacer la recherche"
                    onPress={() => setSearch("")}
                    style={({ pressed }) => [styles.reviewButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.reviewButtonText}>Effacer la recherche</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  {showRecommended && recommendedRecord ? (
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>EN COURS</Text>
                      <LearningChapterCard
                        chapter={recommendedRecord.chapter}
                        levelLabel={recommendedRecord.level.title}
                        skillTitle={recommendedRecord.skill.title}
                        statusLabel="À commencer"
                        lessonAvailable={chapterHasAvailableLesson(recommendedRecord.chapter)}
                        onPress={() => openChapter(recommendedRecord)}
                      />
                    </View>
                  ) : null}

                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>EXPLORER</Text>
                    {levelGroups.map((group) => (
                      <View key={group.level.id} style={styles.levelSection}>
                        <Text style={styles.levelTitle}>
                          {group.level.title} · {getLevelAudienceLabel(group.level)}
                        </Text>
                        <View style={styles.chapterList}>
                          {group.records.map((record) => (
                            <LearningChapterCard
                              key={record.chapter.id}
                              chapter={record.chapter}
                              levelLabel={record.level.title}
                              skillTitle={record.skill.title}
                              statusLabel="Disponible"
                              lessonAvailable={chapterHasAvailableLesson(record.chapter)}
                              onPress={() => openChapter(record)}
                            />
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
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
  learnContent: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    color: HOME_COLORS.accent,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  levelSection: {
    gap: 10,
  },
  levelTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  chapterList: {
    gap: 12,
  },
  reviewState: {
    gap: 10,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 18,
    backgroundColor: HOME_COLORS.card,
    padding: 20,
  },
  reviewTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: "900",
  },
  reviewText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  reviewButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    borderRadius: 12,
    backgroundColor: HOME_COLORS.accent,
    marginTop: 6,
    paddingHorizontal: 16,
  },
  reviewButtonText: {
    color: HOME_COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  noResults: {
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 18,
    backgroundColor: HOME_COLORS.card,
    padding: 20,
  },
  noResultsTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "900",
  },
  noResultsText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.78,
  },
});
