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
import { LinearGradient } from "expo-linear-gradient";
import { useApp, CATEGORY_META } from "@/context/AppContext";
import Colors from "@/constants/colors";
import { ComplaintCard } from "@/components/ComplaintCard";
import { SOSAlertCard } from "@/components/SOSAlertCard";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

function CivicHealthMeter({ score }: { score: number }) {
  const barAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: score / 100,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const color =
    score >= 70 ? Colors.green : score >= 45 ? Colors.amber : Colors.red;

  return (
    <View style={styles.meterCard}>
      <View style={styles.meterHeader}>
        <View>
          <Text style={styles.meterTitle}>Delhi Civic Health Score</Text>
          <Text style={styles.meterSub}>Average across 10 wards</Text>
        </View>
        <Text style={[styles.meterScore, { color }]}>{score}</Text>
      </View>
      <View style={styles.meterTrack}>
        <Animated.View
          style={[
            styles.meterFill,
            {
              flex: barAnim,
              backgroundColor: color,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.meterRemainder,
            {
              flex: barAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          ]}
        />
      </View>
      <View style={styles.meterLabels}>
        <Text style={styles.meterLabelText}>0</Text>
        <Text style={styles.meterLabelText}>25</Text>
        <Text style={styles.meterLabelText}>50</Text>
        <Text style={styles.meterLabelText}>75</Text>
        <Text style={styles.meterLabelText}>100</Text>
      </View>
    </View>
  );
}

function CategoryDistribution() {
  const { complaints } = useApp();
  const cats = Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_META)[];
  const maxCount = Math.max(
    ...cats.map((c) => complaints.filter((x) => x.category === c).length)
  );

  return (
    <View style={styles.catCard}>
      <Text style={styles.sectionTitle}>Complaint Categories</Text>
      <View style={styles.catGrid}>
        {cats.map((cat) => {
          const count = complaints.filter((x) => x.category === cat).length;
          const meta = CATEGORY_META[cat];
          const pct = maxCount > 0 ? count / maxCount : 0;
          return (
            <View key={cat} style={styles.catItem}>
              <View style={[styles.catIconWrap, { backgroundColor: meta.color + "22" }]}>
                <Feather name={meta.icon as any} size={14} color={meta.color} />
              </View>
              <View style={styles.catBarTrack}>
                <Animated.View
                  style={[
                    styles.catBarFill,
                    { width: `${pct * 100}%`, backgroundColor: meta.color },
                  ]}
                />
              </View>
              <Text style={styles.catCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { complaints, sosAlerts, resolveSOS, upvoteComplaint, getStats, isLoading } =
    useApp();
  const stats = getStats();
  const [refreshing, setRefreshing] = React.useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const recentComplaints = complaints.slice(0, 6);
  const activeSOS = sosAlerts.filter((s) => s.status === "active" || s.status === "responding");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={["#0A0F1C", "#0A0F1C"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.headerTitle}>SANKALP AI</Text>
            <Text style={styles.headerSub}>Delhi's Civic Nervous System</Text>
          </View>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 120 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.green}
          />
        }
      >
        {activeSOS.length > 0 && (
          <View style={styles.emergencyStrip}>
            <Feather name="alert-octagon" size={14} color={Colors.red} />
            <Text style={styles.emergencyText}>
              {activeSOS.length} ACTIVE EMERGENCY
              {activeSOS.length > 1 ? " ALERTS" : " ALERT"}
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(tabs)/sos");
              }}
            >
              <Text style={styles.emergencyLink}>View →</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.statsGrid}>
          {[
            {
              label: "Total",
              value: stats.total,
              icon: "inbox",
              color: Colors.blue,
              bg: Colors.blueBg,
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: "clock",
              color: Colors.amber,
              bg: Colors.amberBg,
            },
            {
              label: "Active",
              value: stats.inProgress,
              icon: "activity",
              color: Colors.purple,
              bg: Colors.purpleBg,
            },
            {
              label: "Resolved",
              value: stats.resolved,
              icon: "check-circle",
              color: Colors.green,
              bg: Colors.greenBg,
            },
          ].map((s) => (
            <View key={s.label} style={styles.statCardWrap}>
              <View style={[styles.statCard, { borderColor: s.color + "30" }]}>
                <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                  <Feather name={s.icon as any} size={16} color={s.color} />
                </View>
                <Text style={[styles.statValue, { color: s.color }]}>
                  {s.value}
                </Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.row}>
          <View style={[styles.miniStat, { flex: 1 }]}>
            <Feather name="calendar" size={13} color={Colors.cyan} />
            <Text style={styles.miniStatValue}>{stats.todayComplaints}</Text>
            <Text style={styles.miniStatLabel}>Today</Text>
          </View>
          <View style={[styles.miniStat, { flex: 1 }]}>
            <Feather name="alert-triangle" size={13} color={Colors.red} />
            <Text style={styles.miniStatValue}>{stats.sos}</Text>
            <Text style={styles.miniStatLabel}>Active SOS</Text>
          </View>
          <View style={[styles.miniStat, { flex: 1 }]}>
            <Feather name="percent" size={13} color={Colors.green} />
            <Text style={styles.miniStatValue}>
              {stats.total > 0
                ? Math.round((stats.resolved / stats.total) * 100)
                : 0}
              %
            </Text>
            <Text style={styles.miniStatLabel}>Resolution</Text>
          </View>
        </View>

        <CivicHealthMeter score={stats.avgHealthScore} />

        {activeSOS.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.alertDot} />
                <Text style={[styles.sectionTitle, { color: Colors.red }]}>
                  Active Emergencies
                </Text>
              </View>
            </View>
            {activeSOS.slice(0, 2).map((a) => (
              <SOSAlertCard
                key={a.id}
                alert={a}
                onResolve={() => resolveSOS(a.id)}
              />
            ))}
          </View>
        )}

        <CategoryDistribution />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Complaints</Text>
          <Pressable
            onPress={() => router.push("/(tabs)/complaints")}
            style={styles.seeAll}
          >
            <Text style={styles.seeAllText}>See all →</Text>
          </Pressable>
        </View>

        {recentComplaints.map((c) => (
          <ComplaintCard
            key={c.id}
            complaint={c}
            onUpvote={() => upvoteComplaint(c.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.green,
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.redBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.red + "40",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.red,
  },
  liveText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: Colors.red,
    letterSpacing: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 0,
  },
  emergencyStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.redBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.red + "40",
  },
  emergencyText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: Colors.red,
    letterSpacing: 0.5,
  },
  emergencyLink: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.red,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  statCardWrap: {
    width: "47%",
  },
  statCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 4,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textMuted,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  miniStat: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniStatValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  miniStatLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  meterCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    gap: 10,
  },
  meterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meterTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  meterSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 2,
  },
  meterScore: {
    fontSize: 42,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  meterTrack: {
    height: 10,
    backgroundColor: Colors.bgCardAlt,
    borderRadius: 100,
    flexDirection: "row",
    overflow: "hidden",
  },
  meterFill: {
    height: 10,
    borderRadius: 100,
  },
  meterRemainder: {
    height: 10,
  },
  meterLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meterLabelText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  catCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    gap: 12,
  },
  catGrid: {
    gap: 10,
  },
  catItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  catIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  catBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.bgCardAlt,
    borderRadius: 100,
    overflow: "hidden",
  },
  catBarFill: {
    height: 6,
    borderRadius: 100,
    minWidth: 4,
  },
  catCount: {
    width: 28,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    textAlign: "right",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  seeAll: {},
  seeAllText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.green,
  },
});
