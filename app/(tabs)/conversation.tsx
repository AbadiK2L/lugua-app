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

import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  ConversationCategoryFilter,
  conversationCategoryLabels,
} from "@/src/components/conversation/ConversationCategoryFilter";
import { ConversationSearchBar } from "@/src/components/conversation/ConversationSearchBar";
import { ConversationVideoCard } from "@/src/components/conversation/ConversationVideoCard";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { LuguaAppHeader } from "@/src/components/navigation/LuguaAppHeader";
import { useBottomNavigationLayout } from "@/src/contexts/BottomNavigationLayoutContext";
import { conversationVideos } from "@/src/data/conversation";
import { dictionaryEntries, normalizeDictionaryText } from "@/src/data/dictionary";
import type { ConversationVideoFilter } from "@/src/types/conversation";

export default function ConversationScreen() {
  const { bottomAreaHeight } = useBottomNavigationLayout();
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 390 ? 16 : 20;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ConversationVideoFilter>("all");

  const filteredVideos = useMemo(() => {
    const normalizedSearch = normalizeDictionaryText(search);

    return conversationVideos.filter((video) => {
      const matchesCategory = category === "all" || video.category === category;
      const searchableText = [
        video.title,
        video.description,
        conversationCategoryLabels[video.category],
        video.level ?? "",
        video.speaker ?? "",
        video.variety ?? "",
      ].join(" ");
      const matchesSearch =
        !normalizedSearch || normalizeDictionaryText(searchableText).includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const hasActiveControls = Boolean(search.trim()) || category !== "all";

  function openFirstLesson() {
    const nextLesson = dictionaryEntries.find((entry) => entry.lessonAvailable);

    if (nextLesson?.conceptId) {
      router.push(`/lesson/${nextLesson.conceptId}`);
      return;
    }

    router.push("/(tabs)/lessons");
  }

  function resetFilters() {
    setSearch("");
    setCategory("all");
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

          <View style={styles.intro}>
            <Text style={styles.title}>Conversation</Text>
            <Text style={styles.subtitle}>
              Comprends le shiKomori tel qu’il est réellement parlé.
            </Text>
          </View>

          <ConversationSearchBar
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch("")}
          />
          <ConversationCategoryFilter value={category} onChange={setCategory} />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>À LA UNE</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewFrame} accessible accessibilityLabel="Aperçu de la future bibliothèque orale">
                <IconSymbol name="headphones" size={32} color={HOME_COLORS.accent} />
                <Text style={styles.previewLabel}>Aperçu de la future bibliothèque orale</Text>
              </View>
              <Text style={styles.previewTitle}>Une parole authentique, bientôt disponible.</Text>
              <Text style={styles.previewText}>
                Les vidéos seront ajoutées après validation des transcriptions et des droits de diffusion.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>VIDÉOS</Text>
            {filteredVideos.length > 0 ? (
              <View style={styles.list}>
                {filteredVideos.map((video) => (
                  <ConversationVideoCard key={video.id} video={video} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>
                  {hasActiveControls ? "Aucune vidéo trouvée" : "Contenu vidéo bientôt disponible"}
                </Text>
                <Text style={styles.emptyText}>
                  {hasActiveControls
                    ? "Essaie une autre recherche ou une autre catégorie."
                    : "La bibliothèque de conversations sera enrichie progressivement avec des contenus validés."}
                </Text>
                {hasActiveControls ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Réinitialiser les filtres"
                    onPress={resetFilters}
                    style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.resetButtonText}>Réinitialiser</Text>
                  </Pressable>
                ) : null}
              </View>
            )}
          </View>
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
  previewCard: {
    gap: 12,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 18,
    backgroundColor: HOME_COLORS.card,
    padding: 14,
  },
  previewFrame: {
    aspectRatio: 16 / 9,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surfaceRaised,
  },
  previewLabel: {
    color: HOME_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  previewTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "900",
  },
  previewText: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
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
  pressed: {
    opacity: 0.78,
  },
});
