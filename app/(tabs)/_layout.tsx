import { Tabs } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { LuguaTabBar } from "@/src/components/navigation/LuguaTabBar";
import { BottomNavigationLayoutProvider } from "@/src/contexts/BottomNavigationLayoutContext";
import { HomeActionProvider } from "@/src/contexts/HomeActionContext";

export default function TabLayout() {
  return (
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
            name="explore"
            options={{
              title: "Dictionnaire",
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="paperplane.fill" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="lessons"
            options={{
              title: "Parcours",
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="book.fill" color={color} />
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
  );
}
