import { Tabs } from "expo-router";
import {
  LayoutDashboard,
  PlusCircle,
  ArrowLeftRight,
  Bookmark,
  ChartPie,
  Landmark,
} from "lucide-react-native";
import { useColorScheme } from "react-native";
import { useQuery } from "@tanstack/react-query";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });

  const isAdmin = profile?.profile?.role === "admin";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#1E1E1E" : "#fff",
          borderTopWidth: 1,
          borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
          paddingTop: 4,
          // height: 60, // [REMOVED]
        },
        tabBarActiveTintColor: "#10B981", // Emerald
        tabBarInactiveTintColor: isDark ? "#6B6B6B" : "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <LayoutDashboard color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="ledgers"
        options={{
          title: "Ledgers",
          tabBarIcon: ({ color }) => <PlusCircle color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color }) => <ArrowLeftRight color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="anamath"
        options={{
          title: "Anamath",
          tabBarIcon: ({ color }) => <Bookmark color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: "Summary",
          tabBarIcon: ({ color }) => <ChartPie color={color} size={24} />,
        }}
      />
      {isAdmin && (
        <Tabs.Screen
          name="opening"
          options={{
            title: "Opening",
            tabBarIcon: ({ color }) => <Landmark color={color} size={24} />,
          }}
        />
      )}
    </Tabs>
  );
}
