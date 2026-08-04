import { router, type Href } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { LanguageSelector } from "@/src/components/home/LanguageSelector";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { NotificationBellButton } from "@/src/components/navigation/NotificationBellButton";
import { useAuthSession } from "@/src/contexts/AuthSessionContext";
import { useLanguageSelection } from "@/src/contexts/LanguageSelectionContext";

type HeaderIconName = ComponentProps<typeof IconSymbol>["name"];

export function LuguaAppHeader() {
  const { profile } = useAuthSession();
  const { selectedLanguage, setSelectedLanguage } = useLanguageSelection();
  const { width } = useWindowDimensions();
  const showLabels = width >= 620;
  const inlineLanguage = width >= 620;
  const displayName = profile?.displayName?.trim() || "Profil";

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ouvrir mon profil"
          onPress={() => router.push("/student/profile")}
          style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
        >
          <View style={styles.avatar}>
            <IconSymbol name="person.fill" size={18} color={HOME_COLORS.accent} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName} numberOfLines={1}>
              {displayName}
            </Text>
            {showLabels ? <Text style={styles.profileMeta}>Profil</Text> : null}
          </View>
        </Pressable>

        {inlineLanguage ? (
          <LanguageSelector
            value={selectedLanguage}
            onChange={setSelectedLanguage}
          />
        ) : null}

        <View style={styles.actions}>
          <HeaderShortcut
            href="/student/statistics"
            icon="chart.bar.fill"
            label="Statistiques"
            accessibilityLabel="Ouvrir mes statistiques"
            showLabel={showLabels}
          />
          <NotificationBellButton href="/student/notifications" showLabel={showLabels} />
          <HeaderShortcut
            href="/student/classes"
            icon="graduationcap.fill"
            label="Classes"
            accessibilityLabel="Ouvrir mes classes"
            showLabel={showLabels}
          />
        </View>
      </View>

      {!inlineLanguage ? (
        <View style={styles.languageRow}>
          <LanguageSelector
            value={selectedLanguage}
            onChange={setSelectedLanguage}
          />
        </View>
      ) : null}
    </View>
  );
}

function HeaderShortcut({
  href,
  icon,
  label,
  accessibilityLabel,
  showLabel,
}: {
  href: Href;
  icon: HeaderIconName;
  label: string;
  accessibilityLabel: string;
  showLabel: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
    >
      <IconSymbol name={icon} size={18} color={HOME_COLORS.accent} />
      {showLabel ? <Text style={styles.actionLabel}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 8,
  },
  topRow: {
    width: "100%",
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileButton: {
    minWidth: 0,
    minHeight: 44,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: HOME_COLORS.accentSoft,
  },
  profileCopy: {
    minWidth: 0,
    flex: 1,
  },
  profileName: {
    color: HOME_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "900",
  },
  profileMeta: {
    color: HOME_COLORS.textMuted,
    fontSize: 10,
    fontWeight: "800",
  },
  languageRow: {
    alignSelf: "flex-start",
  },
  actions: {
    flexShrink: 0,
    flexDirection: "row",
    gap: 6,
    marginLeft: "auto",
  },
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
