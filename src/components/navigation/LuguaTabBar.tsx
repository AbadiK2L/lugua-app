import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { HomeBottomDock } from "@/src/components/home/HomeBottomDock";
import { RoleTabBar } from "@/src/components/navigation/RoleTabBar";

export function LuguaTabBar(props: BottomTabBarProps) {
  return (
    <RoleTabBar
      {...props}
      hiddenRouteNames={["profile"]}
      renderDock={(routeName) =>
        routeName === "index" ? <HomeBottomDock /> : null
      }
    />
  );
}
