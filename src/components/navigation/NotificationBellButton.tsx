import { useFocusEffect } from "@react-navigation/native";
import { router, type Href } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { useNotifications } from "@/src/contexts/NotificationsContext";

export function NotificationBellButton({
  href,
  showLabel,
}: {
  href: Href;
  showLabel: boolean;
}) {
  const { unreadCount, refreshNotifications } = useNotifications();
  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  useFocusEffect(
    useCallback(() => {
      void refreshNotifications();
      return undefined;
    }, [refreshNotifications]),
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        unreadCount > 0
          ? `Notifications, ${unreadCount} non lues`
          : "Notifications, aucune non lue"
      }
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <IconSymbol name="bell.fill" size={18} color={HOME_COLORS.accent} />
        {unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        ) : null}
      </View>
      {showLabel ? <Text style={styles.actionLabel}>Notifications</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    minWidth: 44,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 8,
  },
  iconWrap: {
    minWidth: 22,
    minHeight: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -10,
    minWidth: 18,
    minHeight: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: HOME_COLORS.navy,
    borderRadius: 9,
    backgroundColor: "#d86f7e",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: HOME_COLORS.ink,
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 12,
  },
  actionLabel: {
    color: HOME_COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },
  pressed: {
    backgroundColor: HOME_COLORS.surfaceRaised,
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
