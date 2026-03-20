import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  Complaint,
  CATEGORY_META,
} from "@/context/AppContext";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import Colors from "@/constants/colors";

interface Props {
  complaint: Complaint;
  onPress?: () => void;
  onUpvote?: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function ComplaintCard({ complaint, onPress, onUpvote }: Props) {
  const meta = CATEGORY_META[complaint.category];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: meta.color + "22" }]}>
          <Feather name={meta.icon as any} size={16} color={meta.color} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.category}>{meta.label}</Text>
          <Text style={styles.ticketId}>{complaint.ticketId}</Text>
        </View>
        <PriorityBadge priority={complaint.priority} size="sm" />
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {complaint.description}
      </Text>

      <View style={styles.location}>
        <Feather name="map-pin" size={11} color={Colors.textMuted} />
        <Text style={styles.locationText} numberOfLines={1}>
          {complaint.location}
        </Text>
      </View>

      {complaint.isCluster && (
        <View style={styles.clusterBadge}>
          <Feather name="users" size={11} color={Colors.purple} />
          <Text style={styles.clusterText}>
            Cluster of {complaint.clusterSize} similar complaints
          </Text>
        </View>
      )}

      <View style={styles.bottomRow}>
        <StatusBadge status={complaint.status} />
        <View style={styles.meta}>
          <Pressable style={styles.upvote} onPress={onUpvote}>
            <Feather name="arrow-up" size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{complaint.upvotes}</Text>
          </Pressable>
          <Text style={styles.metaText}>{timeAgo(complaint.submittedAt)}</Text>
        </View>
      </View>
    </Pressable>
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
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    flex: 1,
  },
  category: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  ticketId: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 1,
  },
  description: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    flex: 1,
  },
  clusterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.purpleBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  clusterText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.purple,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  upvote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
});
