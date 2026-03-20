import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { LogoAnimation } from "@/components/LogoAnimation";
import Colors from "@/constants/colors";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const cardSlide = useRef(new Animated.Value(40)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardSlide, { toValue: 0, tension: 60, friction: 8, delay: 200, useNativeDriver: false }),
      Animated.timing(cardFade, { toValue: 1, duration: 500, delay: 200, useNativeDriver: false }),
    ]).start();
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: false }),
    ]).start();
  };

  const handleRegister = async () => {
    setError("");
    if (!name.trim()) { setError("Enter your full name"); shake(); return; }
    if (!phone.trim() || phone.length !== 10) { setError("Enter a valid 10-digit phone number"); shake(); return; }
    if (pin.length !== 6) { setError("PIN must be exactly 6 digits"); shake(); return; }
    if (pin !== confirmPin) { setError("PINs do not match"); shake(); return; }

    setLoading(true);
    try {
      await register(name.trim(), phone.trim(), pin);
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      setError(e.message || "Registration failed. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shake();
    } finally {
      setLoading(false);
    }
  };

  const PINStrength = () => {
    const strength = pin.length === 0 ? 0 : pin.length < 3 ? 1 : pin.length < 6 ? 2 : 3;
    const colors = ["transparent", Colors.red, Colors.amber, Colors.green];
    const labels = ["", "Weak", "Fair", "Strong"];
    return pin.length > 0 ? (
      <View style={reg.strengthRow}>
        {[1, 2, 3].map(i => (
          <View
            key={i}
            style={[reg.strengthBar, { backgroundColor: i <= strength ? colors[strength] : Colors.bgCardAlt }]}
          />
        ))}
        <Text style={[reg.strengthLabel, { color: colors[strength] }]}>{labels[strength]}</Text>
      </View>
    ) : null;
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <LinearGradient
        colors={["#060B14", "#0A0F1C", "#0A0F1C"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.glowOrb, styles.glowOrbTop]} />
      <View style={[styles.glowOrb, styles.glowOrbRight]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={Colors.textSecondary} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.logoSmall}>
            <LogoAnimation size="sm" showText />
          </View>

          <Animated.View
            style={[
              styles.card,
              { transform: [{ translateY: cardSlide }, { translateX: shakeAnim }], opacity: cardFade },
            ]}
          >
            {success ? (
              <View style={styles.successBox}>
                <LinearGradient
                  colors={[Colors.green, Colors.greenDim]}
                  style={styles.successIcon}
                >
                  <Feather name="check" size={32} color={Colors.white} />
                </LinearGradient>
                <Text style={styles.successTitle}>Account Created!</Text>
                <Text style={styles.successSub}>
                  Welcome to SANKALP AI. You're now signed in as a citizen of Delhi.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.cardTitle}>Join SANKALP AI</Text>
                <Text style={styles.cardSub}>Create your citizen account</Text>

                {/* Name */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>FULL NAME</Text>
                  <View style={styles.inputWrap}>
                    <Feather name="user" size={16} color={Colors.textMuted} style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Your full name"
                      placeholderTextColor={Colors.textMuted}
                      value={name}
                      onChangeText={(v) => { setName(v); setError(""); }}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Phone */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
                  <View style={styles.inputWrap}>
                    <View style={styles.prefix}>
                      <Text style={styles.prefixText}>+91</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="10-digit mobile number"
                      placeholderTextColor={Colors.textMuted}
                      value={phone}
                      onChangeText={(v) => { setPhone(v.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                </View>

                {/* PIN */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>CREATE 6-DIGIT PIN</Text>
                  <View style={styles.inputWrap}>
                    <Feather name="lock" size={16} color={Colors.textMuted} style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Create a secure PIN"
                      placeholderTextColor={Colors.textMuted}
                      value={pin}
                      onChangeText={(v) => { setPin(v.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={6}
                    />
                  </View>
                  <PINStrength />
                </View>

                {/* Confirm PIN */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>CONFIRM PIN</Text>
                  <View style={[styles.inputWrap, confirmPin && pin !== confirmPin && styles.inputError]}>
                    <Feather name="check-circle" size={16} color={pin === confirmPin && confirmPin ? Colors.green : Colors.textMuted} style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter your PIN"
                      placeholderTextColor={Colors.textMuted}
                      value={confirmPin}
                      onChangeText={(v) => { setConfirmPin(v.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={6}
                    />
                  </View>
                </View>

                {!!error && (
                  <View style={styles.errorBox}>
                    <Feather name="alert-circle" size={13} color={Colors.red} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <Pressable
                  style={({ pressed }) => [styles.registerBtn, pressed && styles.btnPressed]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    handleRegister();
                  }}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={[Colors.green, Colors.greenDim]}
                    style={styles.btnGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <ActivityIndicator color={Colors.white} />
                    ) : (
                      <>
                        <Text style={styles.registerBtnText}>Create Account</Text>
                        <Feather name="user-check" size={18} color={Colors.white} />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>

                <View style={styles.termsRow}>
                  <Feather name="shield" size={12} color={Colors.textMuted} />
                  <Text style={styles.termsText}>
                    Your data is protected under Digital India guidelines
                  </Text>
                </View>

                <Pressable
                  style={styles.loginRow}
                  onPress={() => router.back()}
                >
                  <Text style={styles.loginText}>Already a citizen? </Text>
                  <Text style={styles.loginLink}>Sign In</Text>
                </Pressable>
              </>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  glowOrb: {
    position: "absolute",
    borderRadius: 200,
    opacity: 0.04,
  },
  glowOrbTop: {
    width: 250,
    height: 250,
    top: -60,
    right: -40,
    backgroundColor: Colors.cyan,
  },
  glowOrbRight: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -60,
    backgroundColor: Colors.green,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  logoSmall: {
    alignItems: "center",
    marginBottom: 24,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginBottom: 24,
  },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCardAlt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 50,
  },
  inputError: {
    borderColor: Colors.red + "60",
  },
  icon: { marginRight: 10 },
  prefix: {
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    marginRight: 10,
    height: 30,
    justifyContent: "center",
  },
  prefixText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    height: 50,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.redBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.red + "30",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.red,
    flex: 1,
  },
  registerBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  btnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  btnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
  },
  registerBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    justifyContent: "center",
  },
  termsText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    flex: 1,
  },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  loginLink: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.green,
  },
  successBox: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 20,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.green,
  },
  successSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
});

const reg = StyleSheet.create({
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    width: 40,
    textAlign: "right",
  },
});
