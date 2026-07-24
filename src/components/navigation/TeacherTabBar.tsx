import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { RoleTabBar } from "@/src/components/navigation/RoleTabBar";

export function TeacherTabBar(props: BottomTabBarProps) {
  const currentRoute = props.state.routes[props.state.index]?.name;

  if (currentRoute === "course-builder" || currentRoute === "class/[classId]") {
    return null;
  }

  return (
    <RoleTabBar
      {...props}
      hiddenRouteNames={["profile", "course-builder", "class/[classId]"]}
    />
  );
}
