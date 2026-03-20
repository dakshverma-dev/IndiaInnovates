import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Priority, PRIORITY_META } from "@/context/AppContext";

interface Props {
  priority: Priority;
  size?: "sm" | "md";
}

export function PriorityBadge({ priority, size = "md" }: Props) {
  const meta = PRIORITY_META[priority];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: meta.bg },
        size === "sm" && styles.sm,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: meta.color },
          size === "sm" && styles.textSm,
        ]}
      >
        {size === "sm" ? priority : meta.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  sm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: 10,
  },
});
