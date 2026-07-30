import { Tabs } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProtectedRoleRoute } from "@/src/components/auth/ProtectedRoleRoute";
import { LuguaTabBar } from "@/src/components/navigation/LuguaTabBar";
import { BottomNavigationLayoutProvider } from "@/src/contexts/BottomNavigationLayoutContext";
import { HomeActionProvider } from "@/src/contexts/HomeActionContext";

export default function StudentLayout() {
  return (
    <ProtectedRoleRoute allowedRole="student">
      <BottomNavigationLayoutProvider>
        <HomeActionProvider>
          <Tabs
            tabBar={(props) => <LuguaTabBar {...props} />}
            screenOptions={{ headerShown: false }}
          >
          <Tabs.Screen
            name="index"
            options={{
              title: "Accueil",
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="house.fill" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="dictionary"
            options={{
              title: "Dictionnaire",
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="book.fill" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="scenarios"
            options={{
              title: "Scénarios",
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="bubble.left.fill" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="conversation"
            options={{
              title: "Conversation",
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="headphones" color={color} />
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
          </Tabs>
        </HomeActionProvider>
      </BottomNavigationLayoutProvider>
    </ProtectedRoleRoute>
  );
}
