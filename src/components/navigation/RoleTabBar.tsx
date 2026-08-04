import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { ReactNode } from "react";
import { StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { useBottomNavigationLayout } from "@/src/contexts/BottomNavigationLayoutContext";

const TAB_BAR_CONTENT_HEIGHT = 68;

type RoleTabBarProps = BottomTabBarProps & {
  hiddenRouteNames?: string[];
  visibleRouteNames?: readonly string[];
  renderDock?: (routeName: string | undefined) => ReactNode;
};

export function RoleTabBar({
  state,
  descriptors,
  navigation,
  hiddenRouteNames = [],
  visibleRouteNames,
  renderDock,
}: RoleTabBarProps) {
  const insets = useSafeAreaInsets();
  const { setBottomAreaHeight } = useBottomNavigationLayout();
  const currentRouteName = state.routes[state.index]?.name;
  const visibleRoutes = state.routes
    .map((route, index) => ({ route, index }))
    .filter(({ route }) =>
      visibleRouteNames
        ? visibleRouteNames.includes(route.name)
        : !hiddenRouteNames.includes(route.name),
    );

  return (
    <View
      style={[styles.container, { paddingBottom: insets.bottom }]}
      onLayout={(event: LayoutChangeEvent) => {
        setBottomAreaHeight(event.nativeEvent.layout.height);
      }}
    >
      {renderDock?.(currentRouteName)}
      <View style={styles.tabs}>
        {visibleRoutes.map(({ route, index }) => {
          const descriptor = descriptors[route.key];
          const options = descriptor.options;
          const isFocused = state.index === index;
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : options.title ?? route.name;
          const color = isFocused
            ? options.tabBarActiveTintColor ?? HOME_COLORS.accent
            : options.tabBarInactiveTintColor ?? HOME_COLORS.textSecondary;

          function onPress() {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          }

          function onLongPress() {
            navigation.emit({ type: "tabLongPress", target: route.key });
          }

          return (
            <HapticTab
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={
                options.tabBarAccessibilityLabel ?? `${label} onglet`
              }
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              {options.tabBarIcon?.({ focused: isFocused, color, size: 26 })}
              <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
                {label}
              </Text>
              {isFocused ? <View style={styles.activeMark} /> : null}
            </HapticTab>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: HOME_COLORS.navy,
    borderTopWidth: 1,
    borderTopColor: HOME_COLORS.border,
  },
  tabs: {
    height: TAB_BAR_CONTENT_HEIGHT,
    flexDirection: "row",
  },
  tabButton: {
    minHeight: 44,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 4,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  activeMark: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: HOME_COLORS.accent,
    marginTop: 1,
  },
});
