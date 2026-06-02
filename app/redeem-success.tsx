import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

export default function RedeemSuccess() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  const title = typeof params.title === "string" ? params.title : "Coupon";
  const remainingPoints =
    typeof params.remainingPoints === "string" ? params.remainingPoints : "0";
  const pointsCost =
    typeof params.pointsCost === "string" ? params.pointsCost : "0";
  const pin = typeof params.pin === "string" ? params.pin : "";

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.decor1} />
      <View style={styles.decor2} />

      <View style={styles.tickOuter}>
        <View style={styles.tickInner}>
          <Ionicons name="checkmark" size={60} color="#fff" />
        </View>
      </View>

      <Text style={[styles.title, { color: theme.colors.text }]}>
        Redeemed!
      </Text>

      <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
        Your coupon has been redeemed successfully.
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <View style={styles.cardIconBox}>
          <Ionicons name="ticket-outline" size={32} color="#10b981" />
        </View>

        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
            Added to My Coupons
          </Text>
        </View>

        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>Active</Text>
        </View>
      </View>

      <View
        style={[
          styles.balanceCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <View style={styles.balanceRow}>
          <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
            Points deducted
          </Text>
          <Text style={[styles.balanceValue, { color: "#ef4444" }]}>
            -{Number(pointsCost).toLocaleString()}
          </Text>
        </View>

        <View style={styles.balanceRow}>
          <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
            Remaining balance
          </Text>
          <Text style={[styles.balanceValue, { color: theme.colors.text }]}>
            {Number(remainingPoints).toLocaleString()} pts
          </Text>
        </View>

        {pin ? (
          <Text style={[styles.pinNote, { color: theme.colors.textSecondary }]}>
            PIN generated. Tap View My Coupons to use it.
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => router.replace("/home")}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Back to Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryBtn, { borderColor: theme.colors.border }]}
        onPress={() => router.replace("/my-coupons" as any)}
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
    marginBottom: 28,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  cardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(16,185,129,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
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
  balanceCard: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 28,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: "800",
  },
  pinNote: {
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
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