import React from "react";
import { View, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScreenBase({
  children,
  style = {},
  withInsets = true,
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#121212" : "#fff",
        paddingTop: withInsets ? insets.top : 0,
        ...style,
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      {children}
    </View>
  );
}
