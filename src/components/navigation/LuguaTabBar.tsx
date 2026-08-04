import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { HomeBottomDock } from "@/src/components/home/HomeBottomDock";
import { RoleTabBar } from "@/src/components/navigation/RoleTabBar";

const visibleStudentTabs = [
  "index",
  "dictionary",
  "scenarios",
  "conversation",
] as const;

export function LuguaTabBar(props: BottomTabBarProps) {
  return (
    <RoleTabBar
      {...props}
      visibleRouteNames={visibleStudentTabs}
      renderDock={(routeName) =>
        routeName === "index" ? <HomeBottomDock /> : null
      }
    />
  );
}
