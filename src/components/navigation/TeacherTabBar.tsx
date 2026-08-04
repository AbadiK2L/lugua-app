import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { RoleTabBar } from "@/src/components/navigation/RoleTabBar";

const visibleTeacherTabs = [
  "index",
  "classes",
  "courses",
  "assignments",
] as const;

export function TeacherTabBar(props: BottomTabBarProps) {
  const currentRoute = props.state.routes[props.state.index]?.name;

  if (
    currentRoute === "course-builder" ||
    currentRoute === "assignment-builder" ||
    currentRoute === "class/[classId]" ||
    currentRoute === "assignment/[assignmentId]"
  ) {
    return null;
  }

  return (
    <RoleTabBar
      {...props}
      visibleRouteNames={visibleTeacherTabs}
    />
  );
}
