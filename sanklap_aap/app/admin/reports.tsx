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
import * as Haptics from "expo-haptics";
import { useApp, Complaint, ComplaintCategory, CATEGORY_META } from "@/context/AppContext";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import Colors from "@/constants/colors";

type SortKey = "submittedAt" | "priority" | "upvotes" | "aiScore";
type FilterStatus = "all" | "pending" | "in_progress" | "resolved";

export default function AdminReports() {
  const insets = useSafeAreaInsets();
  const { complaints, wards, getStats } = useApp();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("submittedAt");
  const [filterCat, setFilterCat] = useState<ComplaintCategory | "all">("all");
  const stats = getStats();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const filtered = complaints
    .filter((c) => {
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "resolved" ? c.status === "resolved" || c.status === "closed" : c.status === filterStatus);
      const matchCat = filterCat === "all" || c.category === filterCat;
      return matchStatus && matchCat;
    })
    .sort((a, b) => {
      if (sortKey === "priority") {
        const order = { P1: 0, P2: 1, P3: 2, P4: 3 };
        return order[a.priority] - order[b.priority];
      }
      if (sortKey === "upvotes") return b.upvotes - a.upvotes;
      if (sortKey === "aiScore") return b.aiScore - a.aiScore;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const renderItem = ({ item }: { item: Complaint }) => {
    const meta = CATEGORY_META[item.category];
    return (
      <View style={styles.reportCard}>
        <View style={styles.reportTop}>
          <View style={[styles.catIcon, { backgroundColor: meta.color + "22" }]}>
            <Feather name={meta.icon as any} size={14} color={meta.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reportCategory}>{meta.label}</Text>
            <Text style={styles.reportTicket}>{item.ticketId}</Text>
          </View>
          <PriorityBadge priority={item.priority} size="sm" />
        </View>
        <Text style={styles.reportDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.reportMeta}>
          <StatusBadge status={item.status} />
          <View style={styles.reportRight}>
            <View style={styles.metaItem}>
              <Feather name="cpu" size={10} color={Colors.cyan} />
              <Text style={styles.metaText}>{item.aiScore}%</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="arrow-up" size={10} color={Colors.textMuted} />
              <Text style={styles.metaText}>{item.upvotes}</Text>
            </View>
            <Text style={styles.timeText}>{timeAgo(item.submittedAt)}</Text>
          </View>
        </View>
        {item.isCluster && (
          <View style={styles.clusterBadge}>
            <Feather name="users" size={10} color={Colors.purple} />
            <Text style={styles.clusterText}>Cluster of {item.clusterSize}</Text>
          </View>
        )}
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
          <Text style={styles.headerTitle}>Full Reports</Text>
          <Text style={styles.headerSub}>{filtered.length} of {complaints.length} complaints</Text>
        </View>
        <View style={{ flex: 1 }} />
      </View>

      {/* Stats strip */}
      <View style={styles.statsStrip}>
        {[
          { label: "Total", value: stats.total, color: Colors.blue },
          { label: "Pending", value: stats.pending, color: Colors.amber },
          { label: "Active", value: stats.inProgress, color: Colors.purple },
          { label: "Resolved", value: stats.resolved, color: Colors.green },
        ].map((s) => (
          <View key={s.label} style={styles.stripItem}>
            <Text style={[styles.stripValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.stripLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {(["all", "pending", "in_progress", "resolved"] as FilterStatus[]).map((s) => (
          <Pressable
            key={s}
            onPress={() => setFilterStatus(s)}
            style={[styles.filterChip, filterStatus === s && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filterStatus === s && styles.filterChipTextActive]}>
              {s === "all" ? "All" : s === "in_progress" ? "Active" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </Pressable>
        ))}
        <View style={styles.filterDivider} />
        {(["all", ...Object.keys(CATEGORY_META)] as (ComplaintCategory | "all")[]).map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setFilterCat(cat)}
            style={[styles.filterChip, filterCat === cat && styles.filterChipCat]}
          >
            {cat !== "all" && (
              <Feather name={CATEGORY_META[cat as ComplaintCategory].icon as any} size={12} color={filterCat === cat ? CATEGORY_META[cat as ComplaintCategory].color : Colors.textMuted} />
            )}
            <Text style={[styles.filterChipText, filterCat === cat && { color: cat !== "all" ? CATEGORY_META[cat as ComplaintCategory].color : Colors.green }]}>
              {cat === "all" ? "All" : CATEGORY_META[cat as ComplaintCategory].label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Sort row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort:</Text>
        {([
          { key: "submittedAt", label: "Latest" },
          { key: "priority", label: "Priority" },
          { key: "upvotes", label: "Upvotes" },
          { key: "aiScore", label: "AI Score" },
        ] as { key: SortKey; label: string }[]).map((s) => (
          <Pressable
            key={s.key}
            onPress={() => setSortKey(s.key)}
            style={[styles.sortChip, sortKey === s.key && styles.sortChipActive]}
          >
            <Text style={[styles.sortChipText, sortKey === s.key && styles.sortChipTextActive]}>{s.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: bottomInset + 40 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No complaints match filters</Text>
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
  statsStrip: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  stripItem: { flex: 1, alignItems: "center", gap: 2 },
  stripValue: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  stripLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  filterRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 6 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.greenBg, borderColor: Colors.green + "60" },
  filterChipCat: { backgroundColor: Colors.bgCardAlt, borderColor: Colors.borderLight },
  filterChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  filterChipTextActive: { color: Colors.green, fontFamily: "Inter_600SemiBold" },
  filterDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 4 },
  sortRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 6, alignItems: "center" },
  sortLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  sortChip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
  },
  sortChipActive: { backgroundColor: Colors.blueBg, borderColor: Colors.blue + "60" },
  sortChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  sortChipTextActive: { color: Colors.blue, fontFamily: "Inter_600SemiBold" },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  reportCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    gap: 8,
  },
  reportTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  catIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  reportCategory: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textPrimary },
  reportTicket: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1 },
  reportDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 18 },
  reportMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reportRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  timeText: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  clusterBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: Colors.purpleBg, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 100, alignSelf: "flex-start",
  },
  clusterText: { fontSize: 10, fontFamily: "Inter_500Medium", color: Colors.purple },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textMuted },
});
