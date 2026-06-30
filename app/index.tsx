import { Text, View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Svg, Path, Circle } from "react-native-svg";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect } from "react";

const { width, height } = Dimensions.get("window");

// Scale all sizes to fit the smaller screen dimension
const scale = Math.min(width / 430, height / 800, 1);
const RF = (size: number) => Math.max(Math.round(size * scale), 10);

function ArrowIcon({ color }: { color: string }) {
  return (
    <Svg width={RF(18)} height={RF(18)} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function UserPlusIcon({ color }: { color: string }) {
  return (
    <Svg width={RF(18)} height={RF(18)} viewBox="0 0 24 24" fill="none">
      <Path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={9.5} cy={7} r={4} stroke={color} strokeWidth={2.2} />
      <Path d="M19 8v6M22 11h-6" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MiniFeature({ value, label, textColor, secondaryColor }: { value: string; label: string; textColor: string; secondaryColor: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: secondaryColor }]}>{label}</Text>
    </View>
  );
}

export default function Index() {
  const router = useRouter();
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  // Enable native scrolling on web
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }
  }, []);

  return (
    <LinearGradient
      colors={isDark ? ["#13072E", "#25105A", "#172A6A", "#0B4D78"] : ["#6366F1", "#7C3AED", "#4F46E5", "#312E81"]}
      locations={[0, 0.38, 0.72, 1]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.container}
    >
      {/* Brand row */}
      <View style={styles.brandRow}>
        <View style={styles.brandIconBox}>
          <Svg width={RF(18)} height={RF(18)} viewBox="0 0 24 24" fill="none">
            <Path d="M12 21c-4.97-3.6-8-7.4-8-10.5a8 8 0 0 1 16 0c0 3.1-3.03 6.9-8 10.5z" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={12} cy={10.5} r={2} stroke="#fff" strokeWidth={2.2} />
          </Svg>
        </View>
        <Text style={styles.brandName}>VolunteerRewards</Text>
      </View>

      {/* Centre — natural flow */}
      <View style={styles.centre}>
        <View style={styles.iconShadow}>
          <View style={styles.iconCard}>
            <LinearGradient
              colors={["rgba(255,120,80,0.44)", "rgba(100,80,255,0.42)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Svg width={RF(44)} height={RF(44)} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </View>
        </View>

        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText}>Volunteer. Track. Redeem.</Text>
        </View>

        <Text style={styles.headline}>
          {"Make every\nhour count.\n"}
          <Text style={styles.headlineAccent}>Earn rewards.</Text>
        </Text>

        <Text style={styles.subtext}>
          Join meaningful events, show your attendance QR code, earn points, and redeem partner rewards from your volunteer wallet.
        </Text>
      </View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <View style={styles.featureCard}>
          <MiniFeature value="Book" label="Events" textColor="#fff" secondaryColor="rgba(255,255,255,0.68)" />
          <View style={styles.statDivider} />
          <MiniFeature value="Earn" label="Points" textColor="#fff" secondaryColor="rgba(255,255,255,0.68)" />
          <View style={styles.statDivider} />
          <MiniFeature value="Redeem" label="Rewards" textColor="#fff" secondaryColor="rgba(255,255,255,0.68)" />
        </View>

        <TouchableOpacity activeOpacity={0.88} onPress={() => router.push("/login")}>
          <LinearGradient colors={["#FF7A50", "#FF4D20"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <ArrowIcon color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/register")} activeOpacity={0.85}>
          <View style={styles.secondaryIconBox}>
            <UserPlusIcon color="#fff" />
          </View>
          <View style={styles.secondaryTextBox}>
            <Text style={styles.secondaryTitle}>Create an account</Text>
            <Text style={styles.secondarySubtitle}>New volunteer? Sign up to start earning points.</Text>
          </View>
          <ArrowIcon color="rgba(255,255,255,0.82)" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: RF(26),
    paddingTop: RF(48),
    paddingBottom: RF(28),
    minHeight: height,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: RF(10),
    marginBottom: RF(8),
  },
  brandIconBox: {
    width: RF(38),
    height: RF(38),
    borderRadius: RF(13),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  brandName: {
    fontSize: RF(15),
    fontWeight: "800",
    letterSpacing: 0.25,
    color: "#fff",
  },
  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: RF(8),
  },
  iconShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  iconCard: {
    width: RF(90),
    height: RF(90),
    borderRadius: RF(26),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "rgba(255,255,255,0.16)",
    marginBottom: RF(22),
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: RF(7),
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: RF(15),
    paddingVertical: RF(5),
    marginBottom: RF(16),
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.32)",
  },
  pillDot: {
    width: RF(7),
    height: RF(7),
    borderRadius: RF(3.5),
    backgroundColor: "#FF7A50",
  },
  pillText: {
    fontSize: RF(12),
    fontWeight: "800",
    letterSpacing: 0.35,
    color: "#fff",
  },
  headline: {
    fontSize: RF(30),
    fontWeight: "900",
    lineHeight: RF(38),
    textAlign: "center",
    letterSpacing: -0.7,
    marginBottom: RF(12),
    color: "#fff",
  },
  headlineAccent: { color: "#FFA486" },
  subtext: {
    fontSize: RF(14),
    lineHeight: RF(22),
    textAlign: "center",
    paddingHorizontal: RF(4),
    color: "rgba(255,255,255,0.78)",
    fontWeight: "500",
  },
  bottom: {
    marginTop: RF(16),
  },
  featureCard: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: RF(16),
    gap: RF(17),
    paddingVertical: RF(14),
    paddingHorizontal: RF(14),
    borderRadius: RF(24),
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  statItem: { alignItems: "center", minWidth: RF(62) },
  statValue: { fontSize: RF(18), fontWeight: "900" },
  statLabel: { fontSize: RF(11), fontWeight: "700", marginTop: RF(3) },
  statDivider: { width: 1, height: RF(30), backgroundColor: "rgba(255,255,255,0.22)" },
  primaryButton: {
    width: "100%",
    paddingVertical: RF(16),
    borderRadius: RF(20),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: RF(10),
    marginBottom: RF(12),
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  primaryButtonText: { fontSize: RF(16), fontWeight: "900", letterSpacing: 0.2, color: "#fff" },
  secondaryButton: {
    width: "100%",
    minHeight: RF(60),
    borderRadius: RF(20),
    paddingHorizontal: RF(15),
    paddingVertical: RF(12),
    flexDirection: "row",
    alignItems: "center",
    gap: RF(12),
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  secondaryIconBox: {
    width: RF(42),
    height: RF(42),
    borderRadius: RF(15),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  secondaryTextBox: { flex: 1 },
  secondaryTitle: { fontSize: RF(14), fontWeight: "900", color: "#fff", marginBottom: RF(3) },
  secondarySubtitle: { fontSize: RF(12), fontWeight: "600", color: "rgba(255,255,255,0.68)", lineHeight: RF(16) },
});
