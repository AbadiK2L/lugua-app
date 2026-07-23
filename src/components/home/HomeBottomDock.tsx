import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import {
  useHomeAction,
  type HomeActionIndex,
} from "@/src/contexts/HomeActionContext";
import { dictionaryEntries } from "@/src/data/dictionary";
import { shikomoriQuestionsA1Path } from "@/src/data/curriculum";

export const HOME_ACTION_PRIORITY = [
  "assignment",
  "in_progress_lesson",
  "next_lesson",
  "path",
] as const;

export type HomeActionSource = (typeof HOME_ACTION_PRIORITY)[number] | "ai";

export type HomeActionItem = {
  source: HomeActionSource;
  kind: "assignment" | "lesson" | "ai";
  eyebrow: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  disabled?: boolean;
  onPress?: () => void;
};

export const HOME_BOTTOM_DOCK_HEIGHT = 120;
const COMPACT_DOCK_HEIGHT = 130;
const DOCK_INDICATORS_HEIGHT = 14;
const DOCK_BOTTOM_PADDING = 4;
const { chapter } = shikomoriQuestionsA1Path;
const nextLesson = dictionaryEntries.find((entry) => entry.lessonAvailable);

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

const actionItems: HomeActionItem[] = [
  {
    source: nextLesson ? "next_lesson" : "path",
    kind: "lesson",
    eyebrow: "LEÇON",
    title: chapter.title,
    subtitle: nextLesson
      ? `Prochaine notion : ${nextLesson.headword}`
      : "Aucune leçon disponible pour le moment.",
    actionLabel: nextLesson ? "Commencer" : "Voir le parcours",
    onPress: openNextLesson,
  },
  {
    source: "assignment",
    kind: "assignment",
    eyebrow: "DEVOIR",
    title: "Aucun devoir pour le moment",
    subtitle: "Les devoirs de ton professeur apparaîtront ici.",
    actionLabel: "Bientôt",
    disabled: true,
  },
  {
    source: "ai",
    kind: "ai",
    eyebrow: "ENTRAÎNEMENT IA",
    title: "Pratique le shiKomori en conversation guidée.",
    subtitle: "",
    actionLabel: "Bientôt disponible",
    disabled: true,
  },
];

export function HomeBottomDock() {
  const { activeIndex, selectAction } = useHomeAction();
  const listRef = useRef<FlatList<HomeActionItem>>(null);
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.max(screenWidth, 1);
  const isCompact = cardWidth < 340;
  const dockHeight = isCompact ? COMPACT_DOCK_HEIGHT : HOME_BOTTOM_DOCK_HEIGHT;
  const cardHeight = dockHeight - DOCK_INDICATORS_HEIGHT - DOCK_BOTTOM_PADDING;

  useEffect(() => {
    listRef.current?.scrollToIndex({ index: activeIndex, animated: true });
  }, [activeIndex, cardWidth]);

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / cardWidth);

    if (nextIndex >= 0 && nextIndex < actionItems.length && nextIndex !== activeIndex) {
      selectAction(nextIndex as HomeActionIndex);
    }
  }

  function renderItem({ item, index }: ListRenderItemInfo<HomeActionItem>) {
    return (
      <View style={{ width: cardWidth, height: cardHeight }}>
        <ActionCard
          item={item}
          activeIndex={activeIndex}
          isCompact={isCompact}
          index={index}
          total={actionItems.length}
          cardHeight={cardHeight}
        />
      </View>
    );
  }

  return (
    <View style={[styles.dock, { height: dockHeight }]}>
      <FlatList
        ref={listRef}
        style={styles.list}
        data={actionItems}
        horizontal
        pagingEnabled
        snapToInterval={cardWidth}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `${item.kind}-${item.source}`}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: cardWidth,
          offset: cardWidth * index,
          index,
        })}
        onMomentumScrollEnd={handleScrollEnd}
      />
      <CarouselIndicators activeIndex={activeIndex} total={actionItems.length} />
    </View>
  );
}

type ActionCardProps = {
  item: HomeActionItem;
  activeIndex: HomeActionIndex;
  isCompact: boolean;
  index: number;
  total: number;
  cardHeight: number;
};

function ActionCard({
  item,
  activeIndex,
  isCompact,
  index,
  total,
  cardHeight,
}: ActionCardProps) {
  const iconName = {
    lesson: "book.fill",
    assignment: "doc.text.fill",
    ai: "bubble.left.fill",
  } as const;

  return (
    <View
      accessible
      accessibilityLabel={`${item.eyebrow}. ${item.title}. Carte ${index + 1} sur ${total}${activeIndex === index ? ", active" : ""}`}
      accessibilityState={{ selected: activeIndex === index }}
      style={[styles.card, { height: cardHeight }]}
    >
      <View style={[styles.cardBody, isCompact && styles.compactCardBody]}>
        <View style={[styles.infoRow, isCompact && styles.compactInfoRow]}>
          <View style={[styles.iconBox, item.disabled && styles.disabledIconBox]}>
            <IconSymbol
              name={iconName[item.kind]}
              size={18}
              color={item.disabled ? "rgba(241, 255, 245, 0.4)" : HOME_COLORS.accent}
            />
          </View>
          <View style={styles.copy}>
            <Text style={styles.eyebrow}>{item.eyebrow}</Text>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            {item.subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {item.subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={item.actionLabel}
          accessibilityState={{ disabled: item.disabled }}
          disabled={item.disabled}
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.button,
            isCompact && styles.compactButton,
            item.disabled && styles.disabledButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.buttonText, item.disabled && styles.disabledButtonText]}>
            {item.actionLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function CarouselIndicators({
  activeIndex,
  total,
}: {
  activeIndex: HomeActionIndex;
  total: number;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`Carte active : ${activeIndex + 1} sur ${total}`}
      style={styles.indicators}
    >
      {Array.from({ length: total }, (_, index) => (
        <View
          key={`indicator-${index}`}
          accessible={false}
          style={[styles.indicator, index === activeIndex && styles.activeIndicator]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    width: "100%",
    height: HOME_BOTTOM_DOCK_HEIGHT,
    backgroundColor: HOME_COLORS.dock,
    borderTopWidth: 1,
    borderTopColor: HOME_COLORS.dockBorder,
    paddingBottom: DOCK_BOTTOM_PADDING,
  },
  list: {
    flex: 1,
  },
  card: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 16,
  },
  cardBody: {
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  compactCardBody: {
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 2,
  },
  infoRow: {
    minWidth: 0,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  compactInfoRow: {
    flex: 0,
    alignItems: "flex-start",
  },
  iconBox: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: HOME_COLORS.accentSoft,
  },
  disabledIconBox: {
    backgroundColor: "rgba(241, 255, 245, 0.08)",
  },
  copy: {
    minWidth: 0,
    flex: 1,
    gap: 1,
  },
  eyebrow: {
    color: HOME_COLORS.accentMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
    lineHeight: 11,
  },
  title: {
    color: HOME_COLORS.dockText,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 16,
  },
  subtitle: {
    color: HOME_COLORS.dockSubtitle,
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 13,
  },
  button: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: HOME_COLORS.accent,
    paddingHorizontal: 12,
  },
  compactButton: {
    alignSelf: "flex-start",
  },
  disabledButton: {
    backgroundColor: "rgba(241, 255, 245, 0.14)",
  },
  buttonText: {
    color: HOME_COLORS.ink,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 15,
  },
  disabledButtonText: {
    color: "rgba(241, 255, 245, 0.58)",
  },
  pressed: {
    opacity: 0.82,
  },
  indicators: {
    height: DOCK_INDICATORS_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  indicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(184, 221, 197, 0.42)",
  },
  activeIndicator: {
    width: 13,
    backgroundColor: HOME_COLORS.accent,
  },
});
