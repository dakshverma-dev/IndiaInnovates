import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Animated,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { useApp, CATEGORY_META, ComplaintCategory } from "@/context/AppContext";
import { SOSAlertCard } from "@/components/SOSAlertCard";
import Colors from "@/constants/colors";

function AdminStatCard({
  label,
  value,
  icon,
  color,
  bg,
  sub,
}: {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  bg: string;
  sub?: string;
}) {
  const scale = useRef(new Animated.Value(0.85)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[adm.card, { transform: [{ scale }] }]}>
      <LinearGradient
        colors={[bg + "FF", bg + "88"]}
        style={adm.cardGrad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[adm.iconWrap, { backgroundColor: color + "25" }]}>
          <Feather name={icon as any} size={18} color={color} />
        </View>
        <Text style={[adm.value, { color }]}>{value}</Text>
        <Text style={adm.label}>{label}</Text>
        {sub && <Text style={adm.sub}>{sub}</Text>}
      </LinearGradient>
    </Animated.View>
  );
}

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { complaints, sosAlerts, wards, workers, resolveSOS, getStats } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const stats = getStats();
  const inProgress = complaints.filter((c) => c.status === "in_progress").length;
  const clusters = complaints.filter((c) => c.isCluster).length;
  const p1Count = complaints.filter((c) => c.priority === "P1").length;
  const avgAiScore = complaints.length > 0 ? Math.round(complaints.reduce((s, c) => s + c.aiScore, 0) / complaints.length) : 0;
  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  const activeSOS = sosAlerts.filter((s) => s.status === "active" || s.status === "responding");
  const criticalComplaints = complaints.filter((c) => c.priority === "P1" && c.status !== "resolved" && c.status !== "closed");
  const cats = Object.keys(CATEGORY_META) as ComplaintCategory[];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={["#0A0F1C", "transparent"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerTop}>
          <View>
            <View style={styles.adminBadge}>
              <Feather name="shield" size={11} color={Colors.amber} />
              <Text style={styles.adminBadgeText}>SECRET ADMIN</Text>
            </View>
            <Text style={styles.headerTitle}>Command Center</Text>
            <Text style={styles.headerSub}>Welcome, {user?.name}</Text>
          </View>
          <Pressable onPress={handleLogout} style={styles.logoutBtn}>
            <Feather name="log-out" size={18} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* Quick nav */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickNav} contentContainerStyle={styles.quickNavContent}>
          {[
            { label: "Reports", icon: "file-text", route: "/admin/reports" },
            { label: "Alerts", icon: "bell", route: "/admin/alerts", badge: activeSOS.length },
            { label: "Workers", icon: "users", route: "/admin/workers" },
            { label: "Citizen App", icon: "home", route: "/(tabs)" },
          ].map((item) => (
            <Pressable
              key={item.label}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.route as any);
              }}
              style={styles.quickBtn}
            >
              <View style={styles.quickIconWrap}>
                <Feather name={item.icon as any} size={16} color={Colors.green} />
                {item.badge ? (
                  <View style={styles.badgeDot}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green} />}
      >
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <AdminStatCard label="Total Complaints" value={stats.total} icon="inbox" color={Colors.blue} bg={Colors.bgCard} />
          <AdminStatCard label="Pending" value={stats.pending} icon="clock" color={Colors.amber} bg={Colors.bgCard} sub="Need attention" />
          <AdminStatCard label="Resolved" value={stats.resolved} icon="check-circle" color={Colors.green} bg={Colors.bgCard} sub="All time" />
          <AdminStatCard label="Active SOS" value={stats.sos} icon="alert-octagon" color={Colors.red} bg={Colors.bgCard} sub="Live emergencies" />
          <AdminStatCard label="Civic Health" value={`${stats.avgHealthScore}`} icon="heart" color={Colors.cyan} bg={Colors.bgCard} sub="Avg across wards" />
          <AdminStatCard label="Today" value={stats.todayComplaints} icon="calendar" color={Colors.purple} bg={Colors.bgCard} sub="New reports" />
        </View>

        {/* AI Intelligence Panel */}
        <View style={styles.aiPanel}>
          <LinearGradient
            colors={["#0D2718", "#0A1A1F"]}
            style={styles.aiPanelGrad}
          >
            <View style={styles.aiHeader}>
              <View style={styles.aiIconWrap}>
                <Feather name="cpu" size={16} color={Colors.cyan} />
              </View>
              <Text style={styles.aiTitle}>AI Intelligence Engine</Text>
              <View style={styles.aiLive}>
                <View style={styles.aiLiveDot} />
                <Text style={styles.aiLiveText}>ACTIVE</Text>
              </View>
            </View>
            <View style={styles.aiStats}>
              {[
                { label: "Avg AI Score", value: `${stats.total > 0 ? Math.round(complaints.reduce((s, c) => s + c.aiScore, 0) / complaints.length) : 0}%`, color: Colors.cyan },
                { label: "Clusters Detected", value: `${complaints.filter((c) => c.isCluster).length}`, color: Colors.purple },
                { label: "P1 Critical", value: `${criticalComplaints.length}`, color: Colors.red },
                { label: "Resolution Rate", value: `${stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%`, color: Colors.green },
              ].map((ai) => (
                <View key={ai.label} style={styles.aiStat}>
                  <Text style={[styles.aiStatValue, { color: ai.color }]}>{ai.value}</Text>
                  <Text style={styles.aiStatLabel}>{ai.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Critical Complaints */}
        {criticalComplaints.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.critDot} />
                <Text style={[styles.sectionTitle, { color: Colors.red }]}>Critical P1 Complaints</Text>
              </View>
              <Text style={styles.sectionCount}>{criticalComplaints.length}</Text>
            </View>
            {criticalComplaints.slice(0, 3).map((c) => (
              <View key={c.id} style={styles.critCard}>
                <View style={styles.critTop}>
                  <View style={styles.critBadge}>
                    <Feather name="alert-triangle" size={12} color={Colors.red} />
                    <Text style={styles.critBadgeText}>P1 CRITICAL</Text>
                  </View>
                  <Text style={styles.critTicket}>{c.ticketId}</Text>
                </View>
                <Text style={styles.critDesc} numberOfLines={2}>{c.description}</Text>
                <Text style={styles.critLocation}>{c.location}</Text>
              </View>
            ))}
          </>
        )}

        {/* Active SOS */}
        {activeSOS.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.critDot, { backgroundColor: Colors.amber }]} />
                <Text style={styles.sectionTitle}>Active Emergencies</Text>
              </View>
            </View>
            {activeSOS.slice(0, 3).map((a) => (
              <SOSAlertCard key={a.id} alert={a} onResolve={() => resolveSOS(a.id)} />
            ))}
          </>
        )}

        {/* Ward Summary */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ward Health Summary</Text>
          <Pressable onPress={() => router.push("/admin/reports" as any)}>
            <Text style={styles.seeAll}>Full Report →</Text>
          </Pressable>
        </View>
        <View style={styles.wardGrid}>
          {[...wards].sort((a, b) => b.healthScore - a.healthScore).map((ward) => {
            const color = ward.healthScore >= 70 ? Colors.green : ward.healthScore >= 45 ? Colors.amber : Colors.red;
            return (
              <View key={ward.id} style={styles.wardChip}>
                <View style={[styles.wardDot, { backgroundColor: color }]} />
                <Text style={styles.wardName} numberOfLines={1}>{ward.name}</Text>
                <Text style={[styles.wardScore, { color }]}>{ward.healthScore}</Text>
              </View>
            );
          })}
        </View>

        {/* Category Breakdown */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Issue Category Breakdown</Text>
        </View>
        <View style={styles.catBreakdown}>
          {cats.map((cat) => {
            const count = complaints.filter((c) => c.category === cat).length;
            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
            const meta = CATEGORY_META[cat];
            return (
              <View key={cat} style={styles.catRow}>
                <View style={[styles.catDot, { backgroundColor: meta.color }]} />
                <Text style={styles.catLabel}>{meta.label}</Text>
                <View style={styles.catBarTrack}>
                  <View style={[styles.catBarFill, { width: `${pct}%`, backgroundColor: meta.color }]} />
                </View>
                <Text style={styles.catPct}>{count}</Text>
              </View>
            );
          })}
        </View>

        {/* Top Workers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          <Pressable onPress={() => router.push("/admin/workers" as any)}>
            <Text style={styles.seeAll}>All Workers →</Text>
          </Pressable>
        </View>
        {[...workers].sort((a, b) => b.score - a.score).slice(0, 5).map((w) => {
          const color = w.score >= 80 ? Colors.green : w.score >= 60 ? Colors.amber : Colors.red;
          return (
            <View key={w.id} style={styles.workerRow}>
              <View style={styles.workerAvatar}>
                <Text style={styles.workerAvatarText}>
                  {w.name.split(" ").map((n) => n[0]).join("")}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.workerName}>{w.name}</Text>
                <Text style={styles.workerWard}>{w.ward} · {w.resolvedToday} resolved today</Text>
              </View>
              <Text style={[styles.workerScore, { color }]}>{w.score}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 8,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.amberBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.amber + "40",
    marginBottom: 6,
  },
  adminBadgeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    color: Colors.amber,
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickNav: { marginBottom: 0 },
  quickNavContent: {
    gap: 10,
    paddingBottom: 2,
  },
  quickBtn: {
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
  },
  quickIconWrap: { position: "relative" },
  quickLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  badgeDot: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.red,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: Colors.white },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, gap: 0, paddingTop: 8 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  aiPanel: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cyan + "30",
  },
  aiPanelGrad: { padding: 16, gap: 14 },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.cyan + "20",
    alignItems: "center", justifyContent: "center",
  },
  aiTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  aiLive: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: Colors.cyanBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  aiLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.cyan },
  aiLiveText: { fontSize: 9, fontFamily: "Inter_700Bold", color: Colors.cyan, letterSpacing: 1 },
  aiStats: { flexDirection: "row", justifyContent: "space-between" },
  aiStat: { alignItems: "center", flex: 1 },
  aiStatValue: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  aiStatLabel: { fontSize: 9, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center", marginTop: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10, marginTop: 4 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  sectionCount: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.red },
  seeAll: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.green },
  critDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.red },
  critCard: {
    backgroundColor: "#1A0E0E",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.red + "30",
    marginBottom: 8,
    gap: 6,
  },
  critTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  critBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: Colors.redBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100,
  },
  critBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: Colors.red, letterSpacing: 1 },
  critTicket: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  critDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 19 },
  critLocation: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  wardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  wardChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.bgCard, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.border,
  },
  wardDot: { width: 8, height: 8, borderRadius: 4 },
  wardName: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textSecondary, maxWidth: 90 },
  wardScore: { fontSize: 14, fontFamily: "Inter_700Bold" },
  catBreakdown: { backgroundColor: Colors.bgCard, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.border, marginBottom: 14, gap: 10 },
  catRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary, width: 70 },
  catBarTrack: { flex: 1, height: 5, backgroundColor: Colors.bgCardAlt, borderRadius: 3, overflow: "hidden" },
  catBarFill: { height: 5, borderRadius: 3, minWidth: 3 },
  catPct: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.textMuted, width: 28, textAlign: "right" },
  workerRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.bgCard, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 8,
  },
  workerAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.blueBg, alignItems: "center", justifyContent: "center",
  },
  workerAvatarText: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.blue },
  workerName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  workerWard: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1 },
  workerScore: { fontSize: 22, fontFamily: "Inter_700Bold" },
});

const adm = StyleSheet.create({
  card: { width: "47%", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: Colors.border },
  cardGrad: { padding: 14, gap: 4 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  value: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  label: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  sub: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
});
