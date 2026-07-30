import { Tabs } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProtectedRoleRoute } from "@/src/components/auth/ProtectedRoleRoute";
import { TeacherTabBar } from "@/src/components/navigation/TeacherTabBar";
import { BottomNavigationLayoutProvider } from "@/src/contexts/BottomNavigationLayoutContext";
import { TeacherAssignmentsProvider } from "@/src/contexts/TeacherAssignmentsContext";
import { TeacherClassesProvider } from "@/src/contexts/TeacherClassesContext";
import { TeacherCourseDraftsProvider } from "@/src/contexts/TeacherCourseDraftsContext";

export default function TeacherLayout() {
  return (
    <ProtectedRoleRoute allowedRole="teacher">
      <TeacherCourseDraftsProvider>
        <TeacherClassesProvider>
          <TeacherAssignmentsProvider>
            <BottomNavigationLayoutProvider>
              <Tabs
              tabBar={(props) => <TeacherTabBar {...props} />}
              screenOptions={{ headerShown: false }}
            >
              <Tabs.Screen
                name="index"
                options={{
                  title: "Tableau de bord",
                  tabBarIcon: ({ color }) => (
                    <IconSymbol
                      size={28}
                      name="square.grid.2x2.fill"
                      color={color}
                    />
                  ),
                }}
              />
              <Tabs.Screen
                name="classes"
                options={{
                  title: "Classes",
                  tabBarIcon: ({ color }) => (
                    <IconSymbol size={28} name="person.3.fill" color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="courses"
                options={{
                  title: "Cours",
                  tabBarIcon: ({ color }) => (
                    <IconSymbol
                      size={28}
                      name="books.vertical.fill"
                      color={color}
                    />
                  ),
                }}
              />
              <Tabs.Screen
                name="assignments"
                options={{
                  title: "Devoirs",
                  tabBarIcon: ({ color }) => (
                    <IconSymbol size={28} name="doc.text.fill" color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="profile"
                options={{
                  title: "Profil",
                  tabBarIcon: ({ color }) => (
                    <IconSymbol size={28} name="person.fill" color={color} />
                  ),
                }}
              />
              <Tabs.Screen name="course-builder" options={{ href: null }} />
              <Tabs.Screen name="assignment-builder" options={{ href: null }} />
              <Tabs.Screen name="class/[classId]" options={{ href: null }} />
              <Tabs.Screen
                name="assignment/[assignmentId]"
                options={{ href: null }}
              />
              </Tabs>
            </BottomNavigationLayoutProvider>
          </TeacherAssignmentsProvider>
        </TeacherClassesProvider>
      </TeacherCourseDraftsProvider>
    </ProtectedRoleRoute>
  );
}
