import { Text, View, TouchableOpacity, StyleSheet, Dimensions, Platform } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Svg, Path, Circle } from "react-native-svg";
import { useTheme } from "../contexts/ThemeContext";
import { useEffect } from "react";

const { width, height } = Dimensions.get("window");

// Scale all sizes to the smaller dimension so content always fits
const scale = Math.min(width / 430, height / 800, 1);
const RF = (size: number) => Math.max(Math.round(size * scale), 10);

function ArrowIcon({ color }: { color: string }) {
  return (
    <Svg width={RF(18)} height={RF(18)} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function StatItem({ value, label, textColor, secondaryColor }: { value: string; label: string; textColor: string; secondaryColor: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: secondaryColor }]}>{label}</Text>
    </View>
  );
}

export default function Index() {
  const router = useRouter();
  const { theme, themeType } = useTheme();
  const isDark = themeType === "dark";

  // Enable native page scrolling on web (overrides expo-reset overflow:hidden)
  useEffect(() => {
    if (Platform.OS === "web") {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }
  }, []);

  return (
    <LinearGradient
      colors={isDark
        ? ["#1a0a3c", "#2d1060", "#1a2a6c", "#0f4c81"]
        : ["#6366f1", "#7c3aed", "#4f46e5", "#3b2fa8"]
      }
      locations={[0, 0.4, 0.7, 1]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.container}
    >
      {/* Brand row at top */}
      <View style={styles.brandRow}>
        <View style={[styles.brandIconBox, { borderColor: "rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Svg width={RF(18)} height={RF(18)} viewBox="0 0 24 24" fill="none">
            <Path d="M12 21c-4.97-3.6-8-7.4-8-10.5a8 8 0 0 1 16 0c0 3.1-3.03 6.9-8 10.5z" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={12} cy={10.5} r={2} stroke="#fff" strokeWidth={2.2} />
          </Svg>
        </View>
        <Text style={[styles.brandName, { color: "#fff" }]}>VolunteerRewards</Text>
      </View>

      {/* Main content — natural flow, no flex centering */}
      <View style={styles.main}>
        {/* Star icon */}
        <View style={[styles.iconCard, { borderColor: "rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <LinearGradient
            colors={["rgba(255,120,80,0.4)", "rgba(100,80,255,0.4)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Svg width={RF(40)} height={RF(40)} viewBox="0 0 24 24" fill="none">
            <Path d="M12 20.94c-1.2-.8-7-5-7-9.94a7 7 0 0 1 14 0c0 4.94-5.8 9.14-7 9.94z" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 11l-1.5 2h3L12 16" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={12} cy={8.5} r={1.5} fill="#fff" />
          </Svg>
        </View>

        {/* Pill */}
        <View style={[styles.pill, { backgroundColor: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.3)" }]}>
          <View style={[styles.pillDot, { backgroundColor: "#ff7850" }]} />
          <Text style={[styles.pillText, { color: "#fff" }]}>Give back, get rewarded</Text>
        </View>

        {/* Headline */}
        <Text style={[styles.headline, { color: "#fff" }]}>
          {"Volunteer.\nEarn Points.\n"}
          <Text style={{ color: "#ff9d80" }}>Get Rewarded.</Text>
        </Text>

        {/* Subtext */}
        <Text style={[styles.subtext, { color: "rgba(255,255,255,0.75)" }]}>
          Scan QR codes at events, rack up points, and unlock exclusive rewards from partner merchants.
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatItem value="1.2k+" label="Volunteers" textColor="#fff" secondaryColor="rgba(255,255,255,0.65)" />
          <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.25)" }]} />
          <StatItem value="80+" label="Events" textColor="#fff" secondaryColor="rgba(255,255,255,0.65)" />
          <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.25)" }]} />
          <StatItem value="40+" label="Merchants" textColor="#fff" secondaryColor="rgba(255,255,255,0.65)" />
        </View>

        {/* CTA */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push("/login")} style={styles.ctaWrap}>
          <LinearGradient colors={["#ff7850", "#ff4d20"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaButton}>
            <Text style={styles.ctaText}>Get Started</Text>
            <ArrowIcon color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Sign in */}
        <Text style={[styles.signInText, { color: "rgba(255,255,255,0.6)" }]}>
          Already have an account?{" "}
          <Text style={[styles.signInLink, { color: "#fff" }]}>Sign in</Text>
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: RF(28),
    paddingTop: RF(28),
    paddingBottom: RF(24),
    minHeight: height,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: RF(10),
    marginBottom: RF(10),
  },
  brandIconBox: {
    width: RF(36),
    height: RF(36),
    borderRadius: RF(10),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
  },
  brandName: {
    fontSize: RF(14),
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: RF(8),
  },
  iconCard: {
    width: RF(80),
    height: RF(80),
    borderRadius: RF(22),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1.5,
    marginBottom: RF(18),
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: RF(6),
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: RF(14),
    paddingVertical: RF(3),
    marginBottom: RF(12),
  },
  pillDot: { width: RF(6), height: RF(6), borderRadius: 3 },
  pillText: { fontSize: RF(11), fontWeight: "500", letterSpacing: 0.5 },
  headline: {
    fontSize: RF(28),
    fontWeight: "700",
    lineHeight: RF(36),
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: RF(10),
  },
  subtext: {
    fontSize: RF(13),
    lineHeight: RF(20),
    textAlign: "center",
    paddingHorizontal: RF(4),
    marginBottom: RF(16),
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: RF(20),
    gap: RF(20),
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: RF(18), fontWeight: "700" },
  statLabel: { fontSize: RF(11) },
  statDivider: { width: 1, height: RF(28) },
  ctaWrap: {
    alignSelf: "stretch",
  },
  ctaButton: {
    width: "100%",
    paddingVertical: RF(14),
    borderRadius: RF(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: RF(8),
    marginBottom: RF(12),
  },
  ctaText: { fontSize: RF(15), fontWeight: "700", letterSpacing: 0.2, color: "#fff" },
  signInText: { fontSize: RF(12), textAlign: "center" },
  signInLink: { fontWeight: "500" },
});
