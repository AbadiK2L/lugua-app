import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ReactNode } from "react";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { TeacherAppHeader } from "@/src/components/navigation/TeacherAppHeader";
import { useBottomNavigationLayout } from "@/src/contexts/BottomNavigationLayoutContext";

export function TeacherScreenShell({
  children,
  hideBottomNavigation = false,
  refreshing = false,
  onRefresh,
}: {
  children: ReactNode;
  hideBottomNavigation?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const { bottomAreaHeight } = useBottomNavigationLayout();

  return (
    <SafeAreaView style={styles.safe} edges={hideBottomNavigation ? ["top", "bottom"] : ["top"]}>
      <ScrollView
        style={styles.scroll}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={HOME_COLORS.accent}
              colors={[HOME_COLORS.accent]}
            />
          ) : undefined
        }
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (hideBottomNavigation ? 0 : bottomAreaHeight) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          <TeacherAppHeader />
          {children}
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
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  column: {
    width: "100%",
    maxWidth: 860,
    alignSelf: "center",
    gap: 20,
  },
});
