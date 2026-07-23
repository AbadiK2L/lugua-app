import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { conversationCategoryLabels } from "@/src/components/conversation/ConversationCategoryFilter";
import type { ConversationVideo } from "@/src/types/conversation";

type ConversationVideoCardProps = {
  video: ConversationVideo;
  onPress?: () => void;
};

export function ConversationVideoCard({
  video,
  onPress,
}: ConversationVideoCardProps) {
  const isAvailable = video.availability === "available" && Boolean(onPress);
  const metadata = [
    video.level,
    conversationCategoryLabels[video.category],
    video.variety,
  ].filter(Boolean).join(" · ");

  return (
    <View style={[styles.card, !isAvailable && styles.unavailableCard]}>
      <View style={styles.thumbnail} accessibilityElementsHidden>
        <IconSymbol name="headphones" size={30} color={HOME_COLORS.accent} />
        <Text style={styles.thumbnailLabel}>Audio / vidéo</Text>
      </View>
      <Text style={styles.title}>{video.title}</Text>
      <Text style={styles.description}>{video.description}</Text>
      {metadata ? <Text style={styles.metadata}>{metadata}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${video.title}. ${video.availability === "coming_soon" ? "Bientôt disponible" : "Disponible"}`}
        accessibilityState={{ disabled: !isAvailable }}
        disabled={!isAvailable}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          !isAvailable && styles.disabledButton,
          pressed && isAvailable && styles.pressed,
        ]}
      >
        <Text style={[styles.buttonText, !isAvailable && styles.disabledButtonText]}>
          {isAvailable ? "Écouter" : "Bientôt"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 18,
    backgroundColor: HOME_COLORS.card,
    padding: 14,
  },
  unavailableCard: {
    opacity: 0.68,
  },
  thumbnail: {
    aspectRatio: 16 / 9,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surfaceRaised,
  },
  thumbnailLabel: {
    color: HOME_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "900",
  },
  description: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  metadata: {
    color: HOME_COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  button: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: HOME_COLORS.accent,
  },
  disabledButton: {
    backgroundColor: HOME_COLORS.surfaceRaised,
  },
  buttonText: {
    color: HOME_COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  disabledButtonText: {
    color: HOME_COLORS.textMuted,
  },
  pressed: {
    backgroundColor: HOME_COLORS.accentPressed,
  },
});
