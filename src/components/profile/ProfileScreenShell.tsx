import { router, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { useBottomNavigationLayout } from "@/src/contexts/BottomNavigationLayoutContext";

type ProfileScreenShellProps = {
  children: ReactNode;
  fallbackHref: "/student" | "/teacher";
  title?: string;
};

export function ProfileScreenShell({
  children,
  fallbackHref,
  title = "Profil",
}: ProfileScreenShellProps) {
  const { bottomAreaHeight } = useBottomNavigationLayout();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHref as Href);
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
            <View style={styles.topBar}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retour à la page précédente"
                onPress={handleBack}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
              >
                <IconSymbol name="chevron.left" size={20} color={HOME_COLORS.accent} />
                <Text style={styles.backLabel}>Retour</Text>
              </Pressable>
              <Text style={styles.topBarTitle}>{title}</Text>
              <View style={styles.topBarSide} />
            </View>
            {children}
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
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  column: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    gap: 20,
  },
  topBar: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarSide: {
    width: 112,
    minHeight: 44,
  },
  backButton: {
    minWidth: 112,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderRadius: 10,
  },
  backLabel: {
    color: HOME_COLORS.accent,
    fontSize: 14,
    fontWeight: "800",
  },
  topBarTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  pressed: {
    backgroundColor: HOME_COLORS.surfaceRaised,
  },
});
