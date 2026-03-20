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

const PIN_DIGITS = 6;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminHint, setAdminHint] = useState(false);
  const logoTapCount = useRef(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const cardFade = useRef(new Animated.Value(0)).current;

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardSlide, { toValue: 0, tension: 60, friction: 8, delay: 300, useNativeDriver: false }),
      Animated.timing(cardFade, { toValue: 1, duration: 500, delay: 300, useNativeDriver: false }),
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

  const handleLogoTap = () => {
    logoTapCount.current += 1;
    if (logoTapCount.current >= 5) {
      setAdminHint(true);
      logoTapCount.current = 0;
    }
  };

  const handleLogin = async () => {
    setError("");
    if (!phone.trim()) { setError("Enter your phone number"); shake(); return; }
    if (phone.length !== 10) { setError("Phone must be 10 digits"); shake(); return; }
    if (pin.length !== PIN_DIGITS) { setError("Enter your 6-digit PIN"); shake(); return; }

    setLoading(true);
    try {
      await login(phone.trim(), pin);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      setError(e.message || "Login failed. Check your credentials.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shake();
    } finally {
      setLoading(false);
    }
  };

  const PINInput = () => (
    <View style={styles.pinContainer}>
      {Array.from({ length: PIN_DIGITS }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.pinDot,
            i < pin.length && styles.pinDotFilled,
          ]}
        />
      ))}
      <TextInput
        style={styles.pinHidden}
        value={pin}
        onChangeText={(v) => setPin(v.replace(/\D/g, "").slice(0, PIN_DIGITS))}
        keyboardType="number-pad"
        maxLength={PIN_DIGITS}
        secureTextEntry={!showPin}
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <LinearGradient
        colors={["#060B14", "#0A0F1C", "#0A0F1C"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow orbs */}
      <View style={[styles.glowOrb, styles.glowOrbTop]} />
      <View style={[styles.glowOrb, styles.glowOrbBottom]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo area */}
          <Pressable onPress={handleLogoTap} style={styles.logoArea}>
            <LogoAnimation size="lg" showText />
          </Pressable>

          {/* Admin hint */}
          {adminHint && (
            <View style={styles.adminHintBox}>
              <Feather name="shield" size={13} color={Colors.amber} />
              <Text style={styles.adminHintText}>
                Admin: Phone 9999999999 · PIN 000000
              </Text>
            </View>
          )}

          {/* Card */}
          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ translateY: cardSlide }, { translateX: shakeAnim }],
                opacity: cardFade,
              },
            ]}
          >
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>Sign in to continue to SANKALP AI</Text>

            {/* Phone */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
              <View style={styles.inputWrap}>
                <View style={styles.inputPrefix}>
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
              <View style={styles.pinLabelRow}>
                <Text style={styles.fieldLabel}>6-DIGIT PIN</Text>
                <Pressable onPress={() => setShowPin(!showPin)} style={styles.showPin}>
                  <Feather name={showPin ? "eye-off" : "eye"} size={14} color={Colors.textMuted} />
                  <Text style={styles.showPinText}>{showPin ? "Hide" : "Show"}</Text>
                </Pressable>
              </View>
              {showPin ? (
                <View style={styles.inputWrap}>
                  <Feather name="lock" size={16} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your PIN"
                    placeholderTextColor={Colors.textMuted}
                    value={pin}
                    onChangeText={(v) => { setPin(v.replace(/\D/g, "").slice(0, PIN_DIGITS)); setError(""); }}
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={PIN_DIGITS}
                  />
                </View>
              ) : (
                <PINInput />
              )}
            </View>

            {/* Error */}
            {!!error && (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={13} color={Colors.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Login Button */}
            <Pressable
              style={({ pressed }) => [styles.loginBtn, pressed && styles.btnPressed]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleLogin();
              }}
              disabled={loading}
            >
              <LinearGradient
                colors={[Colors.green, Colors.greenDim]}
                style={styles.loginGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Text style={styles.loginText}>Sign In</Text>
                    <Feather name="arrow-right" size={18} color={Colors.white} />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={styles.registerBtn}
              onPress={() => router.push("/(auth)/register")}
            >
              <Text style={styles.registerText}>New citizen? </Text>
              <Text style={styles.registerLink}>Create Account</Text>
            </Pressable>
          </Animated.View>

          <Text style={styles.footer}>
            SANKALP AI · Empowering Delhi's 20 Million Citizens
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  glowOrb: {
    position: "absolute",
    borderRadius: 200,
    backgroundColor: Colors.green,
    opacity: 0.04,
  },
  glowOrbTop: {
    width: 300,
    height: 300,
    top: -80,
    left: -80,
  },
  glowOrbBottom: {
    width: 250,
    height: 250,
    bottom: 0,
    right: -60,
    backgroundColor: Colors.blue,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: "center",
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 32,
    paddingTop: 10,
  },
  adminHintBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.amberBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.amber + "40",
    width: "100%",
    maxWidth: 380,
  },
  adminHintText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.amber,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: Colors.bgCard,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 0,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
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
  fieldGroup: {
    marginBottom: 16,
  },
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
  inputPrefix: {
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
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    height: 50,
  },
  pinLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  showPin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  showPinText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  pinContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    position: "relative",
    height: 50,
    backgroundColor: Colors.bgCardAlt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.borderLight,
  },
  pinDotFilled: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  pinHidden: {
    position: "absolute",
    opacity: 0,
    width: "100%",
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
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.red + "30",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.red,
    flex: 1,
  },
  loginBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  loginGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
  },
  loginText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  registerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  registerText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  registerLink: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.green,
  },
  footer: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
});
