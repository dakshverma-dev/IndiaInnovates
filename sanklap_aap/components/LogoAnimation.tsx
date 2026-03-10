import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

interface Props {
  size?: "sm" | "lg";
  showText?: boolean;
  onAnimationEnd?: () => void;
}

export function LogoAnimation({ size = "lg", showText = true, onAnimationEnd }: Props) {
  const isLarge = size === "lg";
  const logoSize = isLarge ? 100 : 56;
  const iconSize = isLarge ? 44 : 24;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const ring3Scale = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0.6)).current;
  const ring2Opacity = useRef(new Animated.Value(0.4)).current;
  const ring3Opacity = useRef(new Animated.Value(0.2)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const shieldY = useRef(new Animated.Value(12)).current;
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;
  const particle4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: false }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.timing(shieldY, { toValue: 0, duration: 600, useNativeDriver: false }),
    ]).start(() => {
      // Text fade in
      Animated.timing(textFade, { toValue: 1, duration: 400, useNativeDriver: false }).start();

      // Pulse rings
      const pulseRing = (scaleVal: Animated.Value, opacityVal: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(scaleVal, { toValue: 2.2, duration: 1800, useNativeDriver: false }),
              Animated.timing(opacityVal, { toValue: 0, duration: 1800, useNativeDriver: false }),
            ]),
            Animated.parallel([
              Animated.timing(scaleVal, { toValue: 1, duration: 0, useNativeDriver: false }),
              Animated.timing(opacityVal, { toValue: delay === 0 ? 0.6 : delay === 500 ? 0.4 : 0.2, duration: 0, useNativeDriver: false }),
            ]),
          ])
        );

      pulseRing(ring1Scale, ring1Opacity, 0).start();
      pulseRing(ring2Scale, ring2Opacity, 500).start();
      pulseRing(ring3Scale, ring3Opacity, 1000).start();

      // Glow pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 1500, useNativeDriver: false }),
          Animated.timing(glow, { toValue: 0, duration: 1500, useNativeDriver: false }),
        ])
      ).start();

      // Particles orbit
      const orbit = (val: Animated.Value) =>
        Animated.loop(
          Animated.timing(val, { toValue: 1, duration: 3000, useNativeDriver: false })
        );
      orbit(particle1).start();
      setTimeout(() => orbit(particle2).start(), 750);
      setTimeout(() => orbit(particle3).start(), 1500);
      setTimeout(() => orbit(particle4).start(), 2250);

      if (onAnimationEnd) {
        setTimeout(onAnimationEnd, 800);
      }
    });
  }, []);

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] });
  const p1Angle = particle1.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const p2Angle = particle2.interpolate({ inputRange: [0, 1], outputRange: ["90deg", "450deg"] });
  const p3Angle = particle3.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "540deg"] });
  const p4Angle = particle4.interpolate({ inputRange: [0, 1], outputRange: ["270deg", "630deg"] });

  const orbitRadius = isLarge ? 68 : 40;
  const particleSize = isLarge ? 8 : 5;

  const ParticleDot = ({ angle, color }: { angle: Animated.AnimatedInterpolation<string>; color: string }) => (
    <Animated.View
      style={[
        styles.particleWrap,
        { width: orbitRadius * 2, height: orbitRadius * 2, transform: [{ rotate: angle }] },
      ]}
    >
      <View
        style={[
          styles.particle,
          { width: particleSize, height: particleSize, borderRadius: particleSize / 2, backgroundColor: color },
        ]}
      />
    </Animated.View>
  );

  return (
    <View style={[styles.container, !isLarge && styles.containerSm]}>
      <Animated.View
        style={[
          styles.logoWrap,
          { transform: [{ scale: scaleAnim }, { translateY: shieldY }], opacity: fadeAnim },
        ]}
      >
        {/* Pulsing rings */}
        {isLarge && (
          <>
            <Animated.View style={[styles.ring, { width: logoSize, height: logoSize, borderRadius: logoSize / 2, transform: [{ scale: ring1Scale }], opacity: ring1Opacity, borderColor: Colors.green }]} />
            <Animated.View style={[styles.ring, { width: logoSize, height: logoSize, borderRadius: logoSize / 2, transform: [{ scale: ring2Scale }], opacity: ring2Opacity, borderColor: Colors.green }]} />
            <Animated.View style={[styles.ring, { width: logoSize, height: logoSize, borderRadius: logoSize / 2, transform: [{ scale: ring3Scale }], opacity: ring3Opacity, borderColor: Colors.cyan }]} />
          </>
        )}

        {/* Orbit particles */}
        {isLarge && (
          <View style={[styles.orbitContainer, { width: orbitRadius * 2, height: orbitRadius * 2 }]}>
            <ParticleDot angle={p1Angle} color={Colors.green} />
            <ParticleDot angle={p2Angle} color={Colors.cyan} />
            <ParticleDot angle={p3Angle} color={Colors.amber} />
            <ParticleDot angle={p4Angle} color={Colors.green} />
          </View>
        )}

        {/* Glow */}
        {isLarge && (
          <Animated.View
            style={[
              styles.glow,
              { width: logoSize + 20, height: logoSize + 20, borderRadius: (logoSize + 20) / 2, opacity: glowOpacity },
            ]}
          />
        )}

        {/* Logo circle */}
        <LinearGradient
          colors={["#1B3F2E", "#0D2718"]}
          style={[
            styles.logoBg,
            { width: logoSize, height: logoSize, borderRadius: logoSize / 2 },
          ]}
        >
          {/* Inner shield */}
          <View style={[styles.shieldContainer, { width: iconSize, height: iconSize * 1.1 }]}>
            <LinearGradient
              colors={[Colors.green, Colors.greenDim]}
              style={styles.shieldBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.shieldInner}>
                <LinearGradient
                  colors={[Colors.cyan + "80", Colors.green + "40"]}
                  style={styles.shieldHighlight}
                />
              </View>
            </LinearGradient>
          </View>
          {/* Dot grid inside logo */}
          <View style={styles.dotGrid}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={[styles.gridDot, { backgroundColor: i % 2 === 0 ? Colors.green : Colors.cyan, opacity: 0.5 }]} />
            ))}
          </View>
        </LinearGradient>
      </Animated.View>

      {showText && (
        <Animated.View style={[styles.textBlock, { opacity: textFade }]}>
          <Text style={[styles.appName, !isLarge && styles.appNameSm]}>SANKALP AI</Text>
          {isLarge && (
            <Text style={styles.tagline}>Delhi's Civic Nervous System</Text>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 20,
  },
  containerSm: {
    gap: 10,
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  orbitContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  particleWrap: {
    position: "absolute",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  particle: {
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  glow: {
    position: "absolute",
    backgroundColor: Colors.green,
  },
  logoBg: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.green + "60",
    overflow: "visible",
  },
  shieldContainer: {
    borderRadius: 6,
    overflow: "hidden",
  },
  shieldBg: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  shieldInner: {
    width: "70%",
    height: "70%",
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  shieldHighlight: {
    width: "60%",
    height: "60%",
    borderRadius: 3,
  },
  dotGrid: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    width: 10,
    gap: 2,
  },
  gridDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  textBlock: {
    alignItems: "center",
    gap: 4,
  },
  appName: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    letterSpacing: 4,
  },
  appNameSm: {
    fontSize: 18,
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.green,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});
