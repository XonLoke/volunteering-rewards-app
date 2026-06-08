import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Svg, Path, Circle } from "react-native-svg";
import { useTheme } from "@/contexts/ThemeContext";

const { width } = Dimensions.get("window");

function StarIcon({ color }: { color: string }) {
  return (
    <Svg width={54} height={54} viewBox="0 0 24 24" fill="none">
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

function UserPlusIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={9.5} cy={7} r={4} stroke={color} strokeWidth={2.2} />
      <Path
        d="M19 8v6M22 11h-6"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MiniFeature({
  value,
  label,
  textColor,
  secondaryColor,
}: {
  value: string;
  label: string;
  textColor: string;
  secondaryColor: string;
}) {
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

  const goToLogin = () => {
    router.push("/login");
  };

  const goToRegister = () => {
    router.push("/register");
  };

  return (
    <LinearGradient
      colors={
        isDark
          ? ["#13072E", "#25105A", "#172A6A", "#0B4D78"]
          : ["#6366F1", "#7C3AED", "#4F46E5", "#312E81"]
      }
      locations={[0, 0.38, 0.72, 1]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.container}
    >
      <View
        style={[
          styles.glowOne,
          {
            backgroundColor: isDark
              ? "rgba(255,120,80,0.22)"
              : "rgba(255,120,80,0.25)",
          },
        ]}
      />

      <View
        style={[
          styles.glowTwo,
          {
            backgroundColor: isDark
              ? "rgba(100,80,255,0.18)"
              : "rgba(255,255,255,0.12)",
          },
        ]}
      />

      <View
        style={[
          styles.glowThree,
          {
            backgroundColor: isDark
              ? "rgba(0,200,180,0.12)"
              : "rgba(0,200,180,0.15)",
          },
        ]}
      />

      <View style={styles.brandRow}>
        <View style={styles.brandIconBox}>
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

        <Text style={styles.brandName}>VolunteerRewards</Text>
      </View>

      <View style={styles.centre}>
        <View style={styles.iconShadow}>
          <View style={styles.iconCard}>
            <LinearGradient
              colors={["rgba(255,120,80,0.44)", "rgba(100,80,255,0.42)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <StarIcon color="#fff" />
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
          Join meaningful events, show your attendance QR code, earn points, and
          redeem partner rewards from your volunteer wallet.
        </Text>
      </View>

      <View style={styles.bottom}>
        <View style={styles.featureCard}>
          <MiniFeature
            value="Book"
            label="Events"
            textColor="#fff"
            secondaryColor="rgba(255,255,255,0.68)"
          />

          <View style={styles.statDivider} />

          <MiniFeature
            value="Earn"
            label="Points"
            textColor="#fff"
            secondaryColor="rgba(255,255,255,0.68)"
          />

          <View style={styles.statDivider} />

          <MiniFeature
            value="Redeem"
            label="Rewards"
            textColor="#fff"
            secondaryColor="rgba(255,255,255,0.68)"
          />
        </View>

        <TouchableOpacity activeOpacity={0.88} onPress={goToLogin}>
          <LinearGradient
            colors={["#FF7A50", "#FF4D20"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <ArrowIcon color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={goToRegister}
          activeOpacity={0.85}
        >
          <View style={styles.secondaryIconBox}>
            <UserPlusIcon color="#fff" />
          </View>

          <View style={styles.secondaryTextBox}>
            <Text style={styles.secondaryTitle}>Create an account</Text>
            <Text style={styles.secondarySubtitle}>
              New volunteer? Sign up to start earning points.
            </Text>
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
    paddingHorizontal: 26,
    paddingTop: 60,
    paddingBottom: 36,
  },

  glowOne: {
    position: "absolute",
    top: -90,
    right: -90,
    width: 300,
    height: 300,
    borderRadius: 150,
  },

  glowTwo: {
    position: "absolute",
    bottom: 140,
    left: -70,
    width: 230,
    height: 230,
    borderRadius: 115,
  },

  glowThree: {
    position: "absolute",
    top: 220,
    right: -45,
    width: 185,
    height: 185,
    borderRadius: 92.5,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 1,
  },

  brandIconBox: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  brandName: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.25,
    color: "#fff",
  },

  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },

  iconShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },

  iconCard: {
    width: 112,
    height: 112,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "rgba(255,255,255,0.16)",
    marginBottom: 28,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.32)",
  },

  pillDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#FF7A50",
  },

  pillText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.35,
    color: "#fff",
  },

  headline: {
    fontSize: width < 370 ? 31 : 35,
    fontWeight: "900",
    lineHeight: width < 370 ? 39 : 43,
    textAlign: "center",
    letterSpacing: -0.7,
    marginBottom: 14,
    color: "#fff",
  },

  headlineAccent: {
    color: "#FFA486",
  },

  subtext: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 6,
    color: "rgba(255,255,255,0.78)",
    fontWeight: "500",
  },

  bottom: {
    zIndex: 1,
  },

  featureCard: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    gap: 17,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  statItem: {
    alignItems: "center",
    minWidth: 62,
  },

  statValue: {
    fontSize: 19,
    fontWeight: "900",
  },

  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },

  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  primaryButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.2,
    color: "#fff",
  },

  secondaryButton: {
    width: "100%",
    minHeight: 66,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },

  secondaryIconBox: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  secondaryTextBox: {
    flex: 1,
  },

  secondaryTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 3,
  },

  secondarySubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.68)",
    lineHeight: 16,
  },
});