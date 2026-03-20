import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useApp, SOS_META, SOSCategory } from "@/context/AppContext";
import { SOSAlertCard } from "@/components/SOSAlertCard";
import Colors from "@/constants/colors";

export default function AdminAlerts() {
  const insets = useSafeAreaInsets();
  const { sosAlerts, resolveSOS } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const active = sosAlerts.filter((s) => s.status === "active");
  const responding = sosAlerts.filter((s) => s.status === "responding");
  const resolved = sosAlerts.filter((s) => s.status === "resolved");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (active.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [active.length]);

  const cats = Object.keys(SOS_META) as SOSCategory[];
  const catCounts = cats.map((c) => ({
    cat: c,
    count: sosAlerts.filter((s) => s.category === c).length,
    meta: SOS_META[c],
  })).filter((x) => x.count > 0);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={Colors.textSecondary} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Emergency Alerts</Text>
          <Text style={styles.headerSub}>Real-time SOS Monitoring</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Overview */}
        <View style={styles.statusRow}>
          <Animated.View style={[styles.statusCard, styles.activeCard, { transform: [{ scale: active.length > 0 ? pulseAnim : new Animated.Value(1) }] }]}>
            <LinearGradient colors={["#1A0808", Colors.bgCard]} style={styles.statusGrad}>
              <Text style={[styles.statusCount, { color: Colors.red }]}>{active.length}</Text>
              <Text style={styles.statusLabel}>Active</Text>
            </LinearGradient>
          </Animated.View>
          <View style={[styles.statusCard, { borderColor: Colors.amber + "40" }]}>
            <View style={styles.statusGrad}>
              <Text style={[styles.statusCount, { color: Colors.amber }]}>{responding.length}</Text>
              <Text style={styles.statusLabel}>Responding</Text>
            </View>
          </View>
          <View style={[styles.statusCard, { borderColor: Colors.green + "40" }]}>
            <View style={styles.statusGrad}>
              <Text style={[styles.statusCount, { color: Colors.green }]}>{resolved.length}</Text>
              <Text style={styles.statusLabel}>Resolved</Text>
            </View>
          </View>
        </View>

        {/* Category breakdown */}
        {catCounts.length > 0 && (
          <View style={styles.catCard}>
            <Text style={styles.catTitle}>Emergency Type Breakdown</Text>
            {catCounts.map(({ cat, count, meta }) => (
              <View key={cat} style={styles.catRow}>
                <View style={[styles.catIcon, { backgroundColor: meta.color + "22" }]}>
                  <Feather name={meta.icon as any} size={13} color={meta.color} />
                </View>
                <Text style={styles.catLabel}>{meta.label}</Text>
                <View style={styles.catBarTrack}>
                  <View style={[styles.catBarFill, { width: `${(count / sosAlerts.length) * 100}%`, backgroundColor: meta.color }]} />
                </View>
                <Text style={[styles.catCount, { color: meta.color }]}>{count}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Active */}
        {active.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.flashingDot} />
                <Text style={[styles.sectionTitle, { color: Colors.red }]}>ACTIVE — Requires Immediate Response</Text>
              </View>
            </View>
            {active.map((a) => (
              <SOSAlertCard key={a.id} alert={a} onResolve={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                resolveSOS(a.id);
              }} />
            ))}
          </>
        )}

        {active.length === 0 && (
          <View style={styles.allClearBox}>
            <Feather name="shield" size={40} color={Colors.green} />
            <Text style={styles.allClearTitle}>All Clear</Text>
            <Text style={styles.allClearSub}>No active civic emergencies at this time</Text>
          </View>
        )}

        {/* Responding */}
        {responding.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: Colors.amber }]}>RESPONDING — Teams Deployed</Text>
            </View>
            {responding.map((a) => (
              <SOSAlertCard key={a.id} alert={a} onResolve={() => resolveSOS(a.id)} />
            ))}
          </>
        )}

        {/* Resolved */}
        {resolved.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Resolved — Recent History</Text>
            </View>
            {resolved.map((a) => (
              <SOSAlertCard key={a.id} alert={a} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 8,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, gap: 0 },
  statusRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statusCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeCard: { borderColor: Colors.red + "40" },
  statusGrad: { padding: 14, alignItems: "center", gap: 4, backgroundColor: Colors.bgCard, flex: 1 },
  statusCount: { fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  statusLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  catCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
    gap: 10,
  },
  catTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary, marginBottom: 4 },
  catRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  catIcon: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  catLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary, width: 100 },
  catBarTrack: { flex: 1, height: 5, backgroundColor: Colors.bgCardAlt, borderRadius: 3, overflow: "hidden" },
  catBarFill: { height: 5, borderRadius: 3 },
  catCount: { fontSize: 13, fontFamily: "Inter_700Bold", width: 20, textAlign: "right" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  flashingDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.red,
  },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  allClearBox: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.green + "30",
    marginBottom: 16,
  },
  allClearTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold", color: Colors.green },
  allClearSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
});
