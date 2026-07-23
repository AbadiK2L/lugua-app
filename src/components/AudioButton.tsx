import { Pressable, StyleSheet, Text } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import type { AudioStatus } from "@/src/types/learning";

export type AudioButtonProps = {
  audioStatus: AudioStatus;
  audioUrl?: string;
  label?: string;
  compact?: boolean;
  onPress?: () => void;
};

export default function AudioButton({
  audioStatus,
  audioUrl,
  label,
  compact = false,
  onPress,
}: AudioButtonProps) {
  const canPlay = audioStatus === "validated" && Boolean(audioUrl) && Boolean(onPress);
  const buttonLabel = label ?? (canPlay ? "Écouter" : "Audio bientôt disponible");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={buttonLabel}
      accessibilityState={{ disabled: !canPlay }}
      disabled={!canPlay}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compactButton,
        !canPlay && styles.disabledButton,
        pressed && canPlay && styles.pressed,
      ]}
    >
      <IconSymbol name="speaker.wave.2.fill" size={compact ? 17 : 19} color="#94a3b8" />
      <Text style={[styles.text, compact && styles.compactText]}>{buttonLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 13,
    paddingHorizontal: 16,
  },
  compactButton: {
    minHeight: 44,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
  },
  disabledButton: {
    opacity: 0.72,
  },
  pressed: {
    backgroundColor: "#172033",
  },
  text: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "800",
  },
  compactText: {
    fontSize: 13,
  },
});
