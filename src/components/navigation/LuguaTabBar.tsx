import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { HomeBottomDock } from "@/src/components/home/HomeBottomDock";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { useBottomNavigationLayout } from "@/src/contexts/BottomNavigationLayoutContext";

const TAB_BAR_CONTENT_HEIGHT = 68;

export function LuguaTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { setBottomAreaHeight } = useBottomNavigationLayout();
  const currentRouteName = state.routes[state.index]?.name;
  const isHome = currentRouteName === "index";

  return (
    <View
      style={[
        styles.container,
        isHome && styles.homeContainer,
        { paddingBottom: insets.bottom },
      ]}
      onLayout={(event) => {
        setBottomAreaHeight(event.nativeEvent.layout.height);
      }}
    >
      {currentRouteName === "index" ? <HomeBottomDock /> : null}
      <View style={styles.tabs}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const options = descriptor.options;
          const isFocused = state.index === index;
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : options.title ?? route.name;
          const color = isFocused
            ? options.tabBarActiveTintColor ??
              (isHome ? HOME_COLORS.accent : "#f4c95d")
            : options.tabBarInactiveTintColor ??
              (isHome ? HOME_COLORS.textSecondary : "#8797b5");

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
              accessibilityLabel={options.tabBarAccessibilityLabel ?? `${label} onglet`}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              {options.tabBarIcon?.({ focused: isFocused, color, size: 26 })}
              <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
                {label}
              </Text>
              {isFocused ? (
                <View style={[styles.activeMark, isHome && styles.homeActiveMark]} />
              ) : null}
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
    backgroundColor: "#111827",
    borderTopWidth: 1,
    borderTopColor: "#263750",
  },
  homeContainer: {
    backgroundColor: HOME_COLORS.navy,
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
    backgroundColor: "#f4c95d",
    marginTop: 1,
  },
  homeActiveMark: {
    backgroundColor: HOME_COLORS.accent,
  },
});
