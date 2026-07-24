import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { RoleTabBar } from "@/src/components/navigation/RoleTabBar";

export function TeacherTabBar(props: BottomTabBarProps) {
  return (
    <RoleTabBar {...props} hiddenRouteNames={["profile", "course-builder"]} />
  );
}
