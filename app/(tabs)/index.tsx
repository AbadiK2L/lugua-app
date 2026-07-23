import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LuguaAppHeader } from "@/src/components/navigation/LuguaAppHeader";
import { DictionaryAccessRow } from "@/src/components/home/DictionaryAccessRow";
import { LearningHeroCard } from "@/src/components/home/LearningHeroCard";
import { LearningOverviewCard } from "@/src/components/home/LearningOverviewCard";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { useBottomNavigationLayout } from "@/src/contexts/BottomNavigationLayoutContext";
import { shikomoriQuestionsA1Path } from "@/src/data/curriculum";
import { dictionaryEntries } from "@/src/data/dictionary";

const { chapter, language, level } = shikomoriQuestionsA1Path;
const conceptCount = chapter.blocks.reduce(
  (total, block) => total + block.concepts.length,
  0,
);
const nextLesson = dictionaryEntries.find((entry) => entry.lessonAvailable);
const steps = chapter.blocks.map((block) => ({
  id: block.id,
  label: block.concepts[0]?.title ?? block.title,
}));
const levelAudienceLabel = level.level === "A1" ? "Débutant" : level.title;
const levelNumberLabel = level.level === "A1" ? "Niveau 1" : level.title;

export default function Home() {
  const { bottomAreaHeight } = useBottomNavigationLayout();

  function openNextLesson() {
    if (nextLesson?.conceptId) {
      router.push({
        pathname: "/lesson/[conceptId]",
        params: { conceptId: nextLesson.conceptId },
      });
      return;
    }

    router.push("/(tabs)/lessons");
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: bottomAreaHeight + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.column}>
            <LuguaAppHeader onPressCurrentLesson={openNextLesson} />

            <LearningHeroCard
              levelCode={level.title}
              levelAudienceLabel={levelAudienceLabel}
              languageName={language.name}
              levelNumberLabel={levelNumberLabel}
              chapterTitle={chapter.title}
              conceptCount={conceptCount}
              steps={steps}
              onPress={openNextLesson}
            />

            <LearningOverviewCard
              lessonCount={dictionaryEntries.length}
            />

            <DictionaryAccessRow
              onPress={() => router.push("/(tabs)/explore")}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: HOME_COLORS.navy,
  },
  safe: {
    flex: 1,
    backgroundColor: HOME_COLORS.navy,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  column: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    gap: 18,
  },
});
