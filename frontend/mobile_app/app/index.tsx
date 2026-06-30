import { Text, View, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Svg, Path, Circle } from "react-native-svg";
import { useTheme } from "../contexts/ThemeContext";

const { width, height } = Dimensions.get("window");
const isSmallScreen = height < 700;

function StarIcon({ color }: { color: string }) {
  return (
    <Svg width={52} height={52} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20.94c-1.2-.8-7-5-7-9.94a7 7 0 0 1 14 0c0 4.94-5.8 9.14-7 9.94z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 11l-1.5 2h3L12 16"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={8.5} r={1.5} fill={color} />
    </Svg>
  );
}

function ArrowIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h14M12 5l7 7-7 7"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
      {/* Glow blobs */}
      <View style={[styles.glow1, { backgroundColor: isDark ? "rgba(255,120,80,0.22)" : "rgba(255,120,80,0.25)" }]} />
      <View style={[styles.glow2, { backgroundColor: isDark ? "rgba(100,80,255,0.18)" : "rgba(255,255,255,0.12)" }]} />
      <View style={[styles.glow3, { backgroundColor: isDark ? "rgba(0,200,180,0.12)" : "rgba(0,200,180,0.15)" }]} />

      {/* Top brand row */}
      <View style={styles.brandRow}>
        <View style={[styles.brandIconBox, { borderColor: "rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 21c-4.97-3.6-8-7.4-8-10.5a8 8 0 0 1 16 0c0 3.1-3.03 6.9-8 10.5z"
              stroke="#fff"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx={12} cy={10.5} r={2} stroke="#fff" strokeWidth={2.2} />
          </Svg>
        </View>
        <Text style={[styles.brandName, { color: "#fff" }]}>VolunteerRewards</Text>
      </View>

      {/* Scrollable centre + bottom */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Centre content */}
        <View style={styles.centre}>
          {/* Icon card */}
          <View style={[styles.iconCard, { borderColor: "rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <LinearGradient
              colors={["rgba(255,120,80,0.4)", "rgba(100,80,255,0.4)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <StarIcon color="#fff" />
          </View>

          {/* Pill badge */}
          <View style={[styles.pill, {
            backgroundColor: "rgba(255,255,255,0.15)",
            borderColor: "rgba(255,255,255,0.3)",
          }]}>
            <View style={[styles.pillDot, { backgroundColor: "#ff7850" }]} />
            <Text style={[styles.pillText, { color: "#fff" }]}>Give back, get rewarded</Text>
          </View>

          {/* Headline */}
          <Text style={[styles.headline, { color: "#fff" }]}>
            {"Volunteer.\nEarn Points.\n"}
            <Text style={[styles.headlineAccent, { color: "#ff9d80" }]}>Get Rewarded.</Text>
          </Text>

          {/* Subtext */}
          <Text style={[styles.subtext, { color: "rgba(255,255,255,0.75)" }]}>
            Scan QR codes at events, rack up points, and unlock exclusive rewards
            from partner merchants.
          </Text>
        </View>

        {/* Bottom section */}
        <View style={styles.bottom}>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatItem value="1.2k+" label="Volunteers" textColor="#fff" secondaryColor="rgba(255,255,255,0.65)" />
            <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.25)" }]} />
            <StatItem value="80+" label="Events" textColor="#fff" secondaryColor="rgba(255,255,255,0.65)" />
            <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.25)" }]} />
            <StatItem value="40+" label="Merchants" textColor="#fff" secondaryColor="rgba(255,255,255,0.65)" />
          </View>

          {/* CTA */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/login")}
          >
            <LinearGradient
              colors={["#ff7850", "#ff4d20"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaText}>Get Started</Text>
              <ArrowIcon color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Sign in link */}
          <Text style={[styles.signInText, { color: "rgba(255,255,255,0.6)" }]}>
            Already have an account?{" "}
            <Text style={[styles.signInLink, { color: "#fff" }]}>Sign in</Text>
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: isSmallScreen ? 20 : 44,
  },
  glow1: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  glow2: {
    position: "absolute",
    bottom: 160,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  glow3: {
    position: "absolute",
    top: 220,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 1,
    marginBottom: isSmallScreen ? 8 : 16,
  },
  brandIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
  },
  brandName: {
    fontSize: isSmallScreen ? 14 : 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  centre: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isSmallScreen ? 12 : 24,
  },
  iconCard: {
    width: isSmallScreen ? 90 : 110,
    height: isSmallScreen ? 90 : 110,
    borderRadius: isSmallScreen ? 24 : 28,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1.5,
    marginBottom: isSmallScreen ? 20 : 28,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: isSmallScreen ? 14 : 20,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: isSmallScreen ? 28 : 34,
    fontWeight: "700",
    lineHeight: isSmallScreen ? 34 : 42,
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: isSmallScreen ? 10 : 14,
  },
  headlineAccent: {},
  subtext: {
    fontSize: isSmallScreen ? 13 : 15,
    lineHeight: isSmallScreen ? 20 : 24,
    textAlign: "center",
    paddingHorizontal: isSmallScreen ? 4 : 8,
  },
  bottom: {
    paddingBottom: isSmallScreen ? 8 : 0,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: isSmallScreen ? 20 : 28,
    gap: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: isSmallScreen ? 18 : 22,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: isSmallScreen ? 28 : 36,
  },
  ctaButton: {
    width: "100%",
    paddingVertical: isSmallScreen ? 14 : 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 14,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: "#fff",
  },
  signInText: {
    fontSize: 13,
    textAlign: "center",
    paddingBottom: 8,
  },
  signInLink: {
    fontWeight: "500",
  },
});
