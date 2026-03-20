import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Animated,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { LogoAnimation } from "@/components/LogoAnimation";
import Colors from "@/constants/colors";

function MenuRow({
  icon,
  label,
  sub,
  onPress,
  color,
  badge,
  dangerous,
}: {
  icon: string;
  label: string;
  sub?: string;
  onPress: () => void;
  color?: string;
  badge?: string;
  dangerous?: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
    >
      <View style={[styles.menuIcon, { backgroundColor: (color || Colors.green) + "20" }]}>
        <Feather name={icon as any} size={18} color={dangerous ? Colors.red : color || Colors.green} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, dangerous && { color: Colors.red }]}>{label}</Text>
        {sub && <Text style={styles.menuSub}>{sub}</Text>}
      </View>
      {badge && (
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {!dangerous && (
        <Feather name="chevron-right" size={16} color={Colors.textMuted} />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, isAdmin } = useAuth();
  const { complaints, getStats } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const stats = getStats();
  const myComplaints = complaints.filter((c) => c.citizenPhone === user?.phone).length;
  const myResolved = complaints.filter((c) => c.citizenPhone === user?.phone && (c.status === "resolved" || c.status === "closed")).length;

  const handleLogout = () => {
    if (Platform.OS === "web") {
      logout().then(() => router.replace("/(auth)/login"));
    } else {
      Alert.alert(
        "Sign Out",
        "Are you sure you want to sign out of SANKALP AI?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign Out",
            style: "destructive",
            onPress: async () => {
              await logout();
              router.replace("/(auth)/login");
            },
          },
        ]
      );
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset + 80 }]}
      >
        {/* Profile Header */}
        <Animated.View
          style={[
            styles.profileHeader,
            { opacity: headerFade, transform: [{ translateY: headerSlide }] },
          ]}
        >
          <LinearGradient
            colors={["#0D2718", "#0A1A2F"]}
            style={styles.profileHeaderGrad}
          >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[Colors.green, Colors.greenDim]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>
              {isAdmin && (
                <View style={styles.adminCrown}>
                  <Feather name="shield" size={12} color={Colors.amber} />
                </View>
              )}
            </View>

            <Text style={styles.userName}>{user?.name || "Citizen"}</Text>
            <Text style={styles.userPhone}>+91 {user?.phone}</Text>

            {isAdmin ? (
              <View style={styles.roleBadge}>
                <Feather name="shield" size={11} color={Colors.amber} />
                <Text style={[styles.roleText, { color: Colors.amber }]}>ADMIN</Text>
              </View>
            ) : (
              <View style={[styles.roleBadge, { backgroundColor: Colors.greenBg, borderColor: Colors.green + "40" }]}>
                <Feather name="user" size={11} color={Colors.green} />
                <Text style={[styles.roleText, { color: Colors.green }]}>CITIZEN</Text>
              </View>
            )}

            {/* Mini stats */}
            <View style={styles.miniStats}>
              {[
                { label: "Reports Filed", value: myComplaints, color: Colors.blue },
                { label: "Resolved", value: myResolved, color: Colors.green },
                { label: "City Health", value: `${stats.avgHealthScore}`, color: Colors.cyan },
              ].map((s) => (
                <View key={s.label} style={styles.miniStat}>
                  <Text style={[styles.miniStatValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.miniStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Logo mini */}
        <View style={styles.logoSection}>
          <LogoAnimation size="sm" showText />
        </View>

        {/* Admin Section */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Access</Text>
            <View style={styles.menuCard}>
              <MenuRow
                icon="shield"
                label="Command Center"
                sub="Full admin dashboard"
                color={Colors.amber}
                onPress={() => router.push("/admin")}
              />
              <View style={styles.divider} />
              <MenuRow
                icon="file-text"
                label="All Reports"
                sub={`${stats.total} total complaints`}
                color={Colors.blue}
                onPress={() => router.push("/admin/reports" as any)}
              />
              <View style={styles.divider} />
              <MenuRow
                icon="bell"
                label="Emergency Alerts"
                sub="Monitor SOS incidents"
                color={Colors.red}
                badge={stats.sos > 0 ? `${stats.sos} active` : undefined}
                onPress={() => router.push("/admin/alerts" as any)}
              />
              <View style={styles.divider} />
              <MenuRow
                icon="users"
                label="Worker Management"
                sub="20 field workers"
                color={Colors.purple}
                onPress={() => router.push("/admin/workers" as any)}
              />
            </View>
          </View>
        )}

        {/* Citizen Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.menuCard}>
            <MenuRow
              icon="plus-circle"
              label="File a Complaint"
              sub="Report a civic issue"
              color={Colors.green}
              onPress={() => router.push("/(tabs)/complaints")}
            />
            <View style={styles.divider} />
            <MenuRow
              icon="alert-triangle"
              label="SOS Emergency"
              sub="Report urgent situation"
              color={Colors.red}
              onPress={() => router.push("/(tabs)/sos")}
            />
            <View style={styles.divider} />
            <MenuRow
              icon="bar-chart-2"
              label="City Analytics"
              sub="Delhi-wide statistics"
              color={Colors.cyan}
              onPress={() => router.push("/(tabs)/analytics")}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.menuCard}>
            <View style={styles.infoRow}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.green + "20" }]}>
                <Feather name="info" size={18} color={Colors.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>SANKALP AI</Text>
                <Text style={styles.menuSub}>Version 1.0.0 · Delhi Municipal Corporation</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.blue + "20" }]}>
                <Feather name="users" size={18} color={Colors.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>20 Million Citizens</Text>
                <Text style={styles.menuSub}>Delhi's Civic Nervous System</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <View style={styles.menuCard}>
            <MenuRow
              icon="log-out"
              label="Sign Out"
              dangerous
              onPress={handleLogout}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 16, gap: 0 },
  profileHeader: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.green + "20",
  },
  profileHeaderGrad: {
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  adminCrown: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.amberBg,
    borderWidth: 2,
    borderColor: Colors.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    marginTop: 4,
  },
  userPhone: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.amberBg,
    borderWidth: 1,
    borderColor: Colors.amber + "40",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    marginTop: 4,
  },
  roleText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  miniStats: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: "100%",
    justifyContent: "space-around",
  },
  miniStat: { alignItems: "center", gap: 2 },
  miniStatValue: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  miniStatLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  logoSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuRowPressed: { backgroundColor: Colors.bgCardAlt },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  menuSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 1,
  },
  badgeWrap: {
    backgroundColor: Colors.redBg,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: Colors.red,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 66 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
});
