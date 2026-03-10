import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useApp, SOSCategory, SOS_META } from "@/context/AppContext";
import Colors from "@/constants/colors";
import { SOSAlertCard } from "@/components/SOSAlertCard";

const SOS_CATEGORIES: { key: SOSCategory; label: string; icon: string; color: string; desc: string }[] = [
  { key: "gas_leak", label: "Gas Leak", icon: "wind", color: "#F59E0B", desc: "Dangerous gas smell detected" },
  { key: "water_burst", label: "Water Burst", icon: "droplet", color: "#3B82F6", desc: "Major pipeline rupture" },
  { key: "electric_hazard", label: "Electric Hazard", icon: "zap", color: "#F59E0B", desc: "Exposed wires or sparking" },
  { key: "fire_risk", label: "Fire Risk", icon: "alert-octagon", color: "#EF4444", desc: "Fire or smoke visible" },
  { key: "road_accident", label: "Road Accident", icon: "truck", color: "#EF4444", desc: "Major accident blocking road" },
  { key: "infrastructure", label: "Infrastructure", icon: "alert-triangle", color: "#8B5CF6", desc: "Collapsed structure or debris" },
];

function PulsingSOSButton({ onPress }: { onPress: () => void }) {
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const scale3 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0.5)).current;
  const opacity2 = useRef(new Animated.Value(0.3)).current;
  const opacity3 = useRef(new Animated.Value(0.15)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createRingAnim = (
      scaleVal: Animated.Value,
      opacityVal: Animated.Value,
      delay: number
    ) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scaleVal, {
              toValue: 1.8,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityVal, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleVal, { toValue: 1, duration: 0, useNativeDriver: true }),
            Animated.timing(opacityVal, { toValue: delay === 0 ? 0.5 : delay === 600 ? 0.3 : 0.15, duration: 0, useNativeDriver: true }),
          ]),
        ])
      );

    const a1 = createRingAnim(scale1, opacity1, 0);
    const a2 = createRingAnim(scale2, opacity2, 600);
    const a3 = createRingAnim(scale3, opacity3, 1200);
    a1.start();
    a2.start();
    a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <View style={sos.sosContainer}>
      <Animated.View style={[sos.ring, { transform: [{ scale: scale3 }], opacity: opacity3 }]} />
      <Animated.View style={[sos.ring, sos.ring2, { transform: [{ scale: scale2 }], opacity: opacity2 }]} />
      <Animated.View style={[sos.ring, sos.ring3, { transform: [{ scale: scale1 }], opacity: opacity1 }]} />
      <Pressable onPress={handlePress}>
        <Animated.View style={[sos.sosButton, { transform: [{ scale: buttonScale }] }]}>
          <LinearGradient
            colors={["#FF3B3B", "#CC0000"]}
            style={sos.sosGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={sos.sosLabel}>SOS</Text>
            <Text style={sos.sosSub}>EMERGENCY</Text>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  );
}

function TriggerModal({
  visible,
  onClose,
  onTrigger,
}: {
  visible: boolean;
  onClose: () => void;
  onTrigger: (cat: SOSCategory, desc: string, loc: string) => Promise<void>;
}) {
  const [selectedCat, setSelectedCat] = useState<SOSCategory | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setSelectedCat(null);
    setDescription("");
    setLocation("");
    setSuccess(false);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleTrigger = async () => {
    if (!selectedCat) return;
    setLoading(true);
    try {
      const cat = SOS_CATEGORIES.find((c) => c.key === selectedCat)!;
      await onTrigger(
        selectedCat,
        description || cat.desc,
        location || "Location shared via GPS"
      );
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={trigger.container}>
        <View style={trigger.handle} />
        <View style={trigger.header}>
          <View style={trigger.warningIcon}>
            <Feather name="alert-triangle" size={20} color={Colors.red} />
          </View>
          <Text style={trigger.title}>Report Emergency</Text>
          <Pressable onPress={handleClose} style={trigger.closeBtn}>
            <Feather name="x" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView style={trigger.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {success ? (
            <View style={trigger.successBox}>
              <View style={trigger.successIcon}>
                <Feather name="check" size={36} color={Colors.white} />
              </View>
              <Text style={trigger.successTitle}>SOS Triggered!</Text>
              <Text style={trigger.successSub}>
                P1 ticket created. Nearest workers are being alerted.
              </Text>
            </View>
          ) : (
            <>
              <Text style={trigger.label}>Emergency Type</Text>
              <View style={trigger.catGrid}>
                {SOS_CATEGORIES.map((cat) => {
                  const sel = selectedCat === cat.key;
                  return (
                    <Pressable
                      key={cat.key}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedCat(cat.key);
                      }}
                      style={[
                        trigger.catBtn,
                        sel && {
                          borderColor: cat.color,
                          backgroundColor: cat.color + "18",
                        },
                      ]}
                    >
                      <Feather
                        name={cat.icon as any}
                        size={20}
                        color={sel ? cat.color : Colors.textMuted}
                      />
                      <Text style={[trigger.catLabel, sel && { color: cat.color }]}>
                        {cat.label}
                      </Text>
                      <Text style={[trigger.catDesc, sel && { color: cat.color + "BB" }]}>
                        {cat.desc}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={trigger.label}>Description (optional)</Text>
              <TextInput
                style={trigger.input}
                placeholder="Add more details..."
                placeholderTextColor={Colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Text style={trigger.label}>Your Location (optional)</Text>
              <TextInput
                style={[trigger.input, trigger.inputSingle]}
                placeholder="Street address or landmark..."
                placeholderTextColor={Colors.textMuted}
                value={location}
                onChangeText={setLocation}
              />

              <View style={trigger.warningBox}>
                <Feather name="alert-circle" size={14} color={Colors.amber} />
                <Text style={trigger.warningText}>
                  Only use SOS for genuine civic emergencies. Misuse may delay
                  real emergencies.
                </Text>
              </View>

              <Pressable
                style={[
                  trigger.triggerBtn,
                  !selectedCat && trigger.triggerDisabled,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  handleTrigger();
                }}
                disabled={!selectedCat || loading}
              >
                <Feather name="alert-octagon" size={18} color={Colors.white} />
                <Text style={trigger.triggerText}>
                  {loading ? "Triggering SOS..." : "TRIGGER SOS ALERT"}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function SOSScreen() {
  const insets = useSafeAreaInsets();
  const { sosAlerts, triggerSOS, resolveSOS } = useApp();
  const [showModal, setShowModal] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const activeSOS = sosAlerts.filter((s) => s.status !== "resolved");
  const resolvedSOS = sosAlerts.filter((s) => s.status === "resolved");

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
        <Text style={styles.headerSub}>Civic Emergency Response System</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sosCenter}>
          <PulsingSOSButton onPress={() => setShowModal(true)} />
          <Text style={styles.sosTapText}>Tap to report a civic emergency</Text>
        </View>

        <View style={styles.catGrid}>
          {SOS_CATEGORIES.map((cat) => (
            <View key={cat.key} style={styles.catChip}>
              <Feather name={cat.icon as any} size={13} color={cat.color} />
              <Text style={[styles.catChipText, { color: cat.color }]}>
                {cat.label}
              </Text>
            </View>
          ))}
        </View>

        {activeSOS.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.pulseDot} />
                <Text style={styles.sectionTitle}>Active Alerts</Text>
              </View>
              <Text style={styles.alertCount}>{activeSOS.length}</Text>
            </View>
            {activeSOS.map((a) => (
              <SOSAlertCard
                key={a.id}
                alert={a}
                onResolve={() => resolveSOS(a.id)}
              />
            ))}
          </>
        )}

        {activeSOS.length === 0 && (
          <View style={styles.noAlerts}>
            <Feather name="shield" size={32} color={Colors.green} />
            <Text style={styles.noAlertsTitle}>All Clear</Text>
            <Text style={styles.noAlertsSub}>
              No active civic emergencies right now
            </Text>
          </View>
        )}

        {resolvedSOS.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Resolutions</Text>
            </View>
            {resolvedSOS.map((a) => (
              <SOSAlertCard key={a.id} alert={a} />
            ))}
          </>
        )}
      </ScrollView>

      <TriggerModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onTrigger={triggerSOS}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 0,
  },
  sosCenter: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 20,
  },
  sosTapText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
    justifyContent: "center",
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pulseDot: {
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
  alertCount: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.red,
  },
  noAlerts: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  noAlertsTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.green,
  },
  noAlertsSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    textAlign: "center",
  },
});

const sos = StyleSheet.create({
  sosContainer: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: Colors.red,
    backgroundColor: "transparent",
  },
  ring2: {
    width: 180,
    height: 180,
    borderColor: Colors.red,
  },
  ring3: {
    width: 180,
    height: 180,
    borderColor: Colors.red,
  },
  sosButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 16,
  },
  sosGrad: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  sosLabel: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
    letterSpacing: 2,
  },
  sosSub: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 2.5,
    marginTop: -4,
  },
});

const trigger = StyleSheet.create({
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
  warningIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.redBg,
    alignItems: "center",
    justifyContent: "center",
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
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 16,
  },
  catGrid: {
    gap: 8,
  },
  catBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
    flex: 1,
  },
  catDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
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
    minHeight: 90,
  },
  inputSingle: {
    minHeight: 0,
    height: 46,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.amberBg,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.amber,
    lineHeight: 18,
  },
  triggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.red,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  triggerDisabled: {
    opacity: 0.4,
  },
  triggerText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  successBox: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.red,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.red,
  },
  successSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 260,
  },
});
