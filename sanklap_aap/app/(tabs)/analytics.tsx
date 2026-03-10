import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useApp, CATEGORY_META, ComplaintCategory } from "@/context/AppContext";
import Colors from "@/constants/colors";

function DonutChart({
  percentage,
  color,
  size = 120,
  strokeWidth = 12,
}: {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const animVal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animVal, {
      toValue: percentage,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={{ width: size, height: size, position: "relative", alignItems: "center", justifyContent: "center" }}>
      <Animated.Text
        style={{
          position: "absolute",
          fontSize: 24,
          fontFamily: "Inter_700Bold",
          color,
        }}
      >
        {animVal.interpolate({
          inputRange: [0, 100],
          outputRange: ["0%", `${percentage}%`],
        })}
      </Animated.Text>
      <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: Colors.bgCardAlt, position: "absolute" }} />
      <View
        style={{
          width: size - strokeWidth,
          height: size - strokeWidth,
          borderRadius: (size - strokeWidth) / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRightColor: "transparent",
          borderBottomColor: percentage > 50 ? color : "transparent",
          position: "absolute",
          transform: [{ rotate: `-90deg` }],
          opacity: percentage > 0 ? 1 : 0,
        }}
      />
    </View>
  );
}

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const animations = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      80,
      animations.map((anim, i) =>
        Animated.spring(anim, {
          toValue: data[i].value / (maxVal || 1),
          tension: 80,
          friction: 8,
          useNativeDriver: false,
        })
      )
    ).start();
  }, []);

  return (
    <View style={chart.barContainer}>
      {data.map((item, i) => (
        <View key={item.label} style={chart.barItem}>
          <Text style={chart.barValue}>{item.value}</Text>
          <View style={chart.barTrack}>
            <Animated.View
              style={[
                chart.barFill,
                {
                  height: animations[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [4, 120],
                  }),
                  backgroundColor: item.color,
                },
              ]}
            />
          </View>
          <Text style={chart.barLabel} numberOfLines={1}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function WorkerCard({ worker }: { worker: any }) {
  const barAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: worker.score / 100,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [worker.score]);

  const statusColor =
    worker.status === "active"
      ? Colors.green
      : worker.status === "idle"
      ? Colors.amber
      : Colors.textMuted;

  return (
    <View style={wcard.card}>
      <View style={wcard.top}>
        <View style={wcard.avatar}>
          <Text style={wcard.avatarText}>
            {worker.name.split(" ").map((n: string) => n[0]).join("")}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={wcard.name}>{worker.name}</Text>
          <Text style={wcard.ward}>{worker.ward}</Text>
        </View>
        <View style={wcard.scoreWrap}>
          <Text style={[wcard.score, { color: worker.score >= 80 ? Colors.green : worker.score >= 60 ? Colors.amber : Colors.red }]}>
            {worker.score}
          </Text>
          <Text style={wcard.scoreLabel}>score</Text>
        </View>
      </View>
      <View style={wcard.barTrack}>
        <Animated.View
          style={[
            wcard.barFill,
            {
              flex: barAnim,
              backgroundColor: worker.score >= 80 ? Colors.green : worker.score >= 60 ? Colors.amber : Colors.red,
            },
          ]}
        />
        <Animated.View style={{ flex: barAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }} />
      </View>
      <View style={wcard.stats}>
        <View style={wcard.stat}>
          <Feather name="check" size={11} color={Colors.green} />
          <Text style={wcard.statText}>{worker.resolvedToday} today</Text>
        </View>
        <View style={wcard.stat}>
          <Feather name="star" size={11} color={Colors.amber} />
          <Text style={wcard.statText}>{worker.avgRating.toFixed(1)}</Text>
        </View>
        <View style={[wcard.statusBadge, { backgroundColor: statusColor + "20" }]}>
          <View style={[wcard.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[wcard.statusText, { color: statusColor }]}>
            {worker.status}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { complaints, workers, getStats } = useApp();
  const stats = getStats();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const resolutionRate =
    stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  const cats = Object.keys(CATEGORY_META) as ComplaintCategory[];
  const categoryData = cats.map((c) => ({
    label: CATEGORY_META[c].label,
    value: complaints.filter((x) => x.category === c).length,
    color: CATEGORY_META[c].color,
  }));

  const priorityData = [
    { label: "P1", value: complaints.filter((c) => c.priority === "P1").length, color: Colors.red },
    { label: "P2", value: complaints.filter((c) => c.priority === "P2").length, color: Colors.amber },
    { label: "P3", value: complaints.filter((c) => c.priority === "P3").length, color: Colors.blue },
    { label: "P4", value: complaints.filter((c) => c.priority === "P4").length, color: Colors.textMuted },
  ];

  const sortedWorkers = [...workers].sort((a, b) => b.score - a.score);
  const avgWorkerScore =
    workers.length > 0
      ? Math.round(workers.reduce((s, w) => s + w.score, 0) / workers.length)
      : 0;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSub}>Performance & Intelligence Overview</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <DonutChart percentage={resolutionRate} color={Colors.green} size={100} />
            <Text style={styles.kpiLabel}>Resolution Rate</Text>
          </View>
          <View style={styles.kpiCard}>
            <DonutChart
              percentage={Math.round((stats.inProgress / Math.max(stats.total, 1)) * 100)}
              color={Colors.blue}
              size={100}
            />
            <Text style={styles.kpiLabel}>In Progress</Text>
          </View>
          <View style={styles.kpiCard}>
            <DonutChart percentage={avgWorkerScore} color={Colors.amber} size={100} />
            <Text style={styles.kpiLabel}>Worker Score</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          {[
            { label: "Total Complaints", value: stats.total, icon: "inbox", color: Colors.blue },
            { label: "Avg Cluster Size", value: Math.round(complaints.filter((c) => c.isCluster).reduce((s, c) => s + (c.clusterSize || 0), 0) / Math.max(complaints.filter((c) => c.isCluster).length, 1)), icon: "users", color: Colors.purple },
            { label: "Active Workers", value: workers.filter((w) => w.status === "active").length, icon: "user-check", color: Colors.green },
          ].map((item) => (
            <View key={item.label} style={styles.summaryCard}>
              <Feather name={item.icon as any} size={16} color={item.color} />
              <Text style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Complaints by Category</Text>
          <BarChart data={categoryData} />
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Priority Distribution</Text>
          <View style={styles.priorityRow}>
            {priorityData.map((p) => (
              <View key={p.label} style={styles.priorityItem}>
                <View style={[styles.priorityBar, { backgroundColor: p.color + "20" }]}>
                  <View
                    style={[
                      styles.priorityFill,
                      {
                        height: Math.max(
                          4,
                          (p.value / Math.max(...priorityData.map((x) => x.value), 1)) * 80
                        ),
                        backgroundColor: p.color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.priorityLabel, { color: p.color }]}>{p.label}</Text>
                <Text style={styles.priorityCount}>{p.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Worker Performance</Text>
          <Text style={styles.sectionSub}>Top {Math.min(sortedWorkers.length, 10)}</Text>
        </View>

        {sortedWorkers.slice(0, 10).map((worker, i) => (
          <View key={worker.id} style={{ marginBottom: 8 }}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{i + 1}</Text>
            </View>
            <WorkerCard worker={worker} />
          </View>
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
    paddingBottom: 12,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  kpiRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  kpiLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textMuted,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    textAlign: "center",
  },
  chartCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  chartTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  priorityRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 120,
    paddingTop: 10,
  },
  priorityItem: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  priorityBar: {
    width: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "flex-end",
    height: 90,
    overflow: "hidden",
  },
  priorityFill: {
    width: "100%",
    borderRadius: 8,
    minHeight: 4,
  },
  priorityLabel: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  priorityCount: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.textMuted,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  sectionSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  rankBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 1,
  },
  rankText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textMuted,
  },
});

const chart = StyleSheet.create({
  barContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 150,
  },
  barItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  barTrack: {
    width: 24,
    height: 120,
    backgroundColor: Colors.bgCardAlt,
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 6,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },
  barLabel: {
    fontSize: 8,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    textAlign: "center",
    maxWidth: 30,
  },
});

const wcard = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.blueBg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.blue,
  },
  name: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  ward: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 1,
  },
  scoreWrap: {
    alignItems: "center",
  },
  score: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  scoreLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
  barTrack: {
    height: 4,
    backgroundColor: Colors.bgCardAlt,
    borderRadius: 2,
    flexDirection: "row",
    overflow: "hidden",
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    marginLeft: "auto",
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    textTransform: "capitalize",
  },
});
