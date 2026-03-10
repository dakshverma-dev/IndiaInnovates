import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SOSAlert, SOS_META } from "@/context/AppContext";
import Colors from "@/constants/colors";

interface Props {
  alert: SOSAlert;
  onResolve?: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export function SOSAlertCard({ alert, onResolve }: Props) {
  const meta = SOS_META[alert.category];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (alert.status === "active") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [alert.status]);

  const statusColor =
    alert.status === "active"
      ? Colors.red
      : alert.status === "responding"
      ? Colors.amber
      : Colors.green;
  const statusLabel =
    alert.status === "active"
      ? "ACTIVE"
      : alert.status === "responding"
      ? "RESPONDING"
      : "RESOLVED";

  return (
    <Animated.View
      style={[
        styles.card,
        alert.status === "active" && styles.activeCard,
        { transform: [{ scale: pulseAnim }] },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: meta.color + "22" }]}>
          <Feather name={meta.icon as any} size={18} color={meta.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.category}>{meta.label}</Text>
          <Text style={styles.location} numberOfLines={1}>
            {alert.location}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{alert.description}</Text>

      <View style={styles.bottomRow}>
        <View style={styles.timeMeta}>
          <Feather name="clock" size={11} color={Colors.textMuted} />
          <Text style={styles.time}>{timeAgo(alert.triggeredAt)}</Text>
          {alert.respondingWorker && (
            <>
              <Text style={styles.sep}>•</Text>
              <Feather name="user" size={11} color={Colors.textMuted} />
              <Text style={styles.time}>{alert.respondingWorker}</Text>
            </>
          )}
        </View>
        {alert.status === "active" && onResolve && (
          <Pressable style={styles.resolveBtn} onPress={onResolve}>
            <Text style={styles.resolveBtnText}>Mark Resolved</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  activeCard: {
    borderColor: Colors.red + "50",
    backgroundColor: "#1A1014",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  category: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  location: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },
  time: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  sep: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  resolveBtn: {
    backgroundColor: Colors.greenBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  resolveBtnText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.green,
  },
});
