import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Svg, Path } from "react-native-svg";
import { useTheme } from "@/contexts/ThemeContext";

function TickIcon() {
  return (
    <Svg width={60} height={60} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 13l4 4L19 7"
        stroke="#fff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function RedeemSuccess() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      {/* Decorative blobs */}
      <View style={styles.decor1} />
      <View style={styles.decor2} />

      {/* Tick */}
      <View style={styles.tickOuter}>
        <View style={styles.tickInner}>
          <TickIcon />
        </View>
      </View>

      {/* Text */}
      <Text style={[styles.title, { color: theme.colors.text }]}>All Done!</Text>
      <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
        Your coupon has been{"\n"}redeemed successfully.
      </Text>

      {/* Coupon card */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={styles.cardEmoji}>☕</Text>
        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Coffee Shop $5 Voucher</Text>
          <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>Show this at checkout</Text>
        </View>
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>Active</Text>
        </View>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => router.push("/home")}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Back to Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryBtn, { borderColor: theme.colors.border }]}
        onPress={() => router.push("/my-coupons" as any)}
        activeOpacity={0.85}
      >
        <Text style={[styles.secondaryBtnText, { color: theme.colors.textSecondary }]}>
          View My Coupons
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  decor1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(16,185,129,0.08)",
    top: -80,
    right: -80,
  },
  decor2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(99,102,241,0.08)",
    bottom: 60,
    left: -60,
  },
  tickOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "rgba(16,185,129,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  tickInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center",
  },
  sub: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 32,
  },
  cardEmoji: { fontSize: 32 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  cardSub: { fontSize: 13 },
  cardBadge: {
    backgroundColor: "rgba(16,185,129,0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  cardBadgeText: { color: "#10b981", fontSize: 12, fontWeight: "700" },
  primaryBtn: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#6366f1",
    marginBottom: 12,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: "600" },
});