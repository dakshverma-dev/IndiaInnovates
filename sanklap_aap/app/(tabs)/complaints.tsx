import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  useApp,
  Complaint,
  ComplaintCategory,
  Priority,
  ComplaintStatus,
  CATEGORY_META,
  PRIORITY_META,
} from "@/context/AppContext";
import Colors from "@/constants/colors";
import { ComplaintCard } from "@/components/ComplaintCard";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";

type FilterTab = "all" | "pending" | "in_progress" | "resolved";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "Active" },
  { key: "resolved", label: "Resolved" },
];

function SubmitModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}) {
  const [category, setCategory] = useState<ComplaintCategory>("pothole");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState<Priority>("P3");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const cats = Object.keys(CATEGORY_META) as ComplaintCategory[];
  const priorities: Priority[] = ["P1", "P2", "P3", "P4"];

  const handleSubmit = async () => {
    if (!description.trim() || !location.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ category, description, location, priority });
      setSuccess(`Complaint submitted successfully!`);
      setDescription("");
      setLocation("");
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={modal.container}>
        <View style={modal.handle} />
        <View style={modal.header}>
          <Text style={modal.title}>New Complaint</Text>
          <Pressable onPress={onClose} style={modal.closeBtn}>
            <Feather name="x" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={modal.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {success ? (
              <View style={modal.successBox}>
                <Feather name="check-circle" size={32} color={Colors.green} />
                <Text style={modal.successText}>{success}</Text>
              </View>
            ) : (
              <>
                <Text style={modal.label}>Category</Text>
                <View style={modal.catGrid}>
                  {cats.map((c) => {
                    const meta = CATEGORY_META[c];
                    const sel = category === c;
                    return (
                      <Pressable
                        key={c}
                        onPress={() => setCategory(c)}
                        style={[
                          modal.catBtn,
                          sel && {
                            borderColor: meta.color,
                            backgroundColor: meta.color + "18",
                          },
                        ]}
                      >
                        <Feather
                          name={meta.icon as any}
                          size={16}
                          color={sel ? meta.color : Colors.textMuted}
                        />
                        <Text
                          style={[
                            modal.catBtnText,
                            sel && { color: meta.color },
                          ]}
                        >
                          {meta.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={modal.label}>Priority</Text>
                <View style={modal.priorityRow}>
                  {priorities.map((p) => {
                    const meta = PRIORITY_META[p];
                    const sel = priority === p;
                    return (
                      <Pressable
                        key={p}
                        onPress={() => setPriority(p)}
                        style={[
                          modal.priorityBtn,
                          sel && {
                            borderColor: meta.color,
                            backgroundColor: meta.bg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            modal.priorityBtnText,
                            sel && { color: meta.color },
                          ]}
                        >
                          {p}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={modal.label}>Description *</Text>
                <TextInput
                  style={modal.input}
                  placeholder="Describe the issue in detail..."
                  placeholderTextColor={Colors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <Text style={modal.label}>Location *</Text>
                <TextInput
                  style={[modal.input, modal.inputSingle]}
                  placeholder="Street, landmark, or area..."
                  placeholderTextColor={Colors.textMuted}
                  value={location}
                  onChangeText={setLocation}
                />

                <Pressable
                  style={[
                    modal.submitBtn,
                    (!description.trim() || !location.trim()) &&
                      modal.submitDisabled,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    handleSubmit();
                  }}
                  disabled={loading || !description.trim() || !location.trim()}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Feather name="send" size={16} color={Colors.white} />
                      <Text style={modal.submitText}>Submit Complaint</Text>
                    </>
                  )}
                </Pressable>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function ComplaintDetailModal({
  complaint,
  onClose,
  onResolve,
}: {
  complaint: Complaint | null;
  onClose: () => void;
  onResolve: (id: string) => void;
}) {
  if (!complaint) return null;
  const meta = CATEGORY_META[complaint.category];

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} minutes ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hours ago`;
    const days = Math.floor(hrs / 24);
    return `${days} days ago`;
  }

  return (
    <Modal
      visible={!!complaint}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={detail.container}>
        <View style={detail.handle} />
        <View style={detail.header}>
          <View style={[detail.catIcon, { backgroundColor: meta.color + "22" }]}>
            <Feather name={meta.icon as any} size={20} color={meta.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={detail.category}>{meta.label}</Text>
            <Text style={detail.ticketId}>{complaint.ticketId}</Text>
          </View>
          <Pressable onPress={onClose} style={detail.closeBtn}>
            <Feather name="x" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView style={detail.scroll} showsVerticalScrollIndicator={false}>
          <View style={detail.row}>
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </View>

          <Text style={detail.description}>{complaint.description}</Text>

          <View style={detail.infoGrid}>
            <View style={detail.infoItem}>
              <Feather name="map-pin" size={14} color={Colors.textMuted} />
              <View>
                <Text style={detail.infoLabel}>Location</Text>
                <Text style={detail.infoValue}>{complaint.location}</Text>
              </View>
            </View>
            <View style={detail.infoItem}>
              <Feather name="map" size={14} color={Colors.textMuted} />
              <View>
                <Text style={detail.infoLabel}>Ward</Text>
                <Text style={detail.infoValue}>
                  {complaint.ward} (Ward {complaint.wardNumber})
                </Text>
              </View>
            </View>
            <View style={detail.infoItem}>
              <Feather name="clock" size={14} color={Colors.textMuted} />
              <View>
                <Text style={detail.infoLabel}>Submitted</Text>
                <Text style={detail.infoValue}>
                  {timeAgo(complaint.submittedAt)}
                </Text>
              </View>
            </View>
            {complaint.workerName && (
              <View style={detail.infoItem}>
                <Feather name="user" size={14} color={Colors.textMuted} />
                <View>
                  <Text style={detail.infoLabel}>Assigned Worker</Text>
                  <Text style={detail.infoValue}>{complaint.workerName}</Text>
                </View>
              </View>
            )}
            <View style={detail.infoItem}>
              <Feather name="cpu" size={14} color={Colors.textMuted} />
              <View>
                <Text style={detail.infoLabel}>AI Urgency Score</Text>
                <Text style={[detail.infoValue, { color: Colors.green }]}>
                  {complaint.aiScore}/100
                </Text>
              </View>
            </View>
            <View style={detail.infoItem}>
              <Feather name="arrow-up" size={14} color={Colors.textMuted} />
              <View>
                <Text style={detail.infoLabel}>Citizens Affected</Text>
                <Text style={detail.infoValue}>
                  {complaint.isCluster
                    ? complaint.clusterSize
                    : complaint.upvotes + 1}
                </Text>
              </View>
            </View>
          </View>

          {complaint.isCluster && (
            <View style={detail.clusterInfo}>
              <Feather name="users" size={16} color={Colors.purple} />
              <Text style={detail.clusterText}>
                This is a merged cluster of {complaint.clusterSize} similar
                complaints from the same area.
              </Text>
            </View>
          )}

          {complaint.status === "pending" || complaint.status === "in_progress" ? (
            <Pressable
              style={detail.resolveBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onResolve(complaint.id);
                onClose();
              }}
            >
              <Feather name="check-circle" size={16} color={Colors.white} />
              <Text style={detail.resolveBtnText}>Mark as Resolved</Text>
            </Pressable>
          ) : null}

          {complaint.rating && (
            <View style={detail.ratingRow}>
              <Text style={detail.ratingLabel}>Citizen Rating</Text>
              <View style={detail.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Feather
                    key={star}
                    name="star"
                    size={18}
                    color={
                      star <= (complaint.rating ?? 0) ? Colors.amber : Colors.textMuted
                    }
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function ComplaintsScreen() {
  const insets = useSafeAreaInsets();
  const { complaints, submitComplaint, resolveComplaint, upvoteComplaint } =
    useApp();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedComplaint, setSelectedComplaint] =
    useState<Complaint | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const filtered = complaints.filter((c) => {
    const matchFilter =
      filter === "all" ||
      (filter === "resolved"
        ? c.status === "resolved" || c.status === "closed"
        : c.status === filter);
    const matchSearch =
      !search ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      c.ward.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleSubmit = useCallback(
    async (data: any) => {
      const ward =
        ["Chandni Chowk", "Karol Bagh", "Connaught Place", "Saket", "Rohini"][
          Math.floor(Math.random() * 5)
        ];
      const wardNumber = Math.floor(Math.random() * 10) + 1;
      await submitComplaint({
        ...data,
        ward,
        wardNumber,
        status: "pending",
      });
    },
    [submitComplaint]
  );

  const renderItem = useCallback(
    ({ item }: { item: Complaint }) => (
      <ComplaintCard
        complaint={item}
        onPress={() => setSelectedComplaint(item)}
        onUpvote={() => upvoteComplaint(item.id)}
      />
    ),
    [upvoteComplaint]
  );

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Complaints</Text>
        <Text style={styles.headerSub}>
          {filtered.length} of {complaints.length} complaints
        </Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={15} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search complaints, tickets..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {!!search && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={15} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.filterTab,
              filter === tab.key && styles.filterTabActive,
            ]}
            onPress={() => setFilter(tab.key)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === tab.key && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: bottomInset + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No complaints found</Text>
          </View>
        }
      />

      <Pressable
        style={styles.fab}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowSubmit(true);
        }}
      >
        <LinearGradient
          colors={[Colors.green, Colors.greenDim]}
          style={styles.fabGrad}
        >
          <Feather name="plus" size={24} color={Colors.white} />
        </LinearGradient>
      </Pressable>

      <SubmitModal
        visible={showSubmit}
        onClose={() => setShowSubmit(false)}
        onSubmit={handleSubmit}
      />

      <ComplaintDetailModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onResolve={resolveComplaint}
      />
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
  searchRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.greenBg,
    borderColor: Colors.green + "60",
  },
  filterTabText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textMuted,
  },
  filterTabTextActive: {
    color: Colors.green,
    fontFamily: "Inter_600SemiBold",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 100,
    borderRadius: 100,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGrad: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
});

const modal = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    padding: 20,
    gap: 0,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textMuted,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  priorityBtnText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: Colors.textMuted,
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 14,
    color: Colors.textPrimary,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 100,
  },
  inputSingle: {
    minHeight: 0,
    height: 46,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 24,
    marginBottom: 40,
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },
  successBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  successText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.green,
    textAlign: "center",
  },
});

const detail = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  catIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  category: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  ticketId: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 23,
    marginBottom: 20,
  },
  infoGrid: {
    gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  clusterInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.purpleBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  clusterText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.purple,
    lineHeight: 20,
  },
  resolveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 15,
    marginBottom: 16,
  },
  resolveBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },
  ratingRow: {
    gap: 8,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 40,
  },
  ratingLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stars: {
    flexDirection: "row",
    gap: 4,
  },
});
