import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useApp } from "@/context/AppContext";
import Colors from "@/constants/colors";

type WorkerStatus = "all" | "active" | "idle" | "on_leave";

export default function AdminWorkers() {
  const insets = useSafeAreaInsets();
  const { workers } = useApp();
  const [filter, setFilter] = useState<WorkerStatus>("all");
  const [sortBy, setSortBy] = useState<"score" | "resolved" | "rating">("score");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const filtered = workers
    .filter((w) => filter === "all" || w.status === filter)
    .sort((a, b) => {
      if (sortBy === "resolved") return b.totalResolved - a.totalResolved;
      if (sortBy === "rating") return b.avgRating - a.avgRating;
      return b.score - a.score;
    });

  const active = workers.filter((w) => w.status === "active").length;
  const idle = workers.filter((w) => w.status === "idle").length;
  const onLeave = workers.filter((w) => w.status === "on_leave").length;
  const avgScore = workers.length > 0 ? Math.round(workers.reduce((s, w) => s + w.score, 0) / workers.length) : 0;

  const renderWorker = ({ item: w, index }: { item: any; index: number }) => {
    const statusColor = w.status === "active" ? Colors.green : w.status === "idle" ? Colors.amber : Colors.textMuted;
    const scoreColor = w.score >= 80 ? Colors.green : w.score >= 60 ? Colors.amber : Colors.red;
    return (
      <View style={styles.workerCard}>
        <View style={styles.rank}>
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {w.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </Text>
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
        </View>
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{w.name}</Text>
          <Text style={styles.workerWard}>{w.ward}</Text>
          {w.currentTask && (
            <View style={styles.taskRow}>
              <Feather name="tool" size={10} color={Colors.cyan} />
              <Text style={styles.taskText} numberOfLines={1}>{w.currentTask}</Text>
            </View>
          )}
        </View>
        <View style={styles.workerStats}>
          <Text style={[styles.bigScore, { color: scoreColor }]}>{w.score}</Text>
          <Text style={styles.scoreLabel}>score</Text>
        </View>
        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <Feather name="check" size={10} color={Colors.green} />
            <Text style={styles.metaVal}>{w.resolvedToday}</Text>
            <Text style={styles.metaLbl}>today</Text>
          </View>
          <View style={styles.metaRow}>
            <Feather name="archive" size={10} color={Colors.blue} />
            <Text style={styles.metaVal}>{w.totalResolved}</Text>
            <Text style={styles.metaLbl}>total</Text>
          </View>
          <View style={styles.metaRow}>
            <Feather name="star" size={10} color={Colors.amber} />
            <Text style={styles.metaVal}>{w.avgRating.toFixed(1)}</Text>
            <Text style={styles.metaLbl}>rating</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={Colors.textSecondary} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Worker Management</Text>
          <Text style={styles.headerSub}>{workers.length} field workers</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: "Active", value: active, color: Colors.green },
          { label: "Idle", value: idle, color: Colors.amber },
          { label: "On Leave", value: onLeave, color: Colors.textMuted },
          { label: "Avg Score", value: avgScore, color: Colors.cyan },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {(["all", "active", "idle", "on_leave"] as WorkerStatus[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all" ? "All" : f === "on_leave" ? "On Leave" : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
        <View style={styles.filterDivider} />
        <Text style={styles.sortLabel}>Sort:</Text>
        {([
          { key: "score", label: "Score" },
          { key: "resolved", label: "Resolved" },
          { key: "rating", label: "Rating" },
        ] as { key: "score" | "resolved" | "rating"; label: string }[]).map((s) => (
          <Pressable
            key={s.key}
            onPress={() => setSortBy(s.key)}
            style={[styles.filterChip, sortBy === s.key && styles.sortChipActive]}
          >
            <Text style={[styles.filterText, sortBy === s.key && styles.sortTextActive]}>{s.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderWorker}
        contentContainerStyle={[styles.list, { paddingBottom: bottomInset + 40 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="users" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No workers found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    gap: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.bgCard, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  statCard: { flex: 1, alignItems: "center", padding: 12, gap: 2 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  filterRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 6, alignItems: "center" },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.greenBg, borderColor: Colors.green + "60" },
  sortChipActive: { backgroundColor: Colors.blueBg, borderColor: Colors.blue + "60" },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  filterTextActive: { color: Colors.green, fontFamily: "Inter_600SemiBold" },
  sortTextActive: { color: Colors.blue, fontFamily: "Inter_600SemiBold" },
  filterDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 4 },
  sortLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  workerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    gap: 10,
  },
  rank: { width: 24 },
  rankText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.textMuted },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.blueBg, alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.blue },
  statusIndicator: {
    position: "absolute", bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 2, borderColor: Colors.bgCard,
  },
  workerInfo: { flex: 1 },
  workerName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  workerWard: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  taskText: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.cyan, flex: 1 },
  workerStats: { alignItems: "center" },
  bigScore: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  scoreLabel: { fontSize: 9, fontFamily: "Inter_400Regular", color: Colors.textMuted, textTransform: "uppercase" },
  metaBlock: { gap: 3, alignItems: "flex-end" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaVal: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  metaLbl: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textMuted },
});
