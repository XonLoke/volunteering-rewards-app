import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, Alert, Clipboard } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { authFetch } from "./api";

const BASE_URL = "https://vol-rewards-api.onrender.com/api";

export default function PINDisplay() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  const coupon = {
    icon: (params.emoji as string) || "ticket-outline",
    title: (params.title as string) || "Voucher",
    description: (params.description as string) || "Show this PIN at checkout",
    validUntil: (params.validUntil as string) || "Dec 31, 2026",
    code: (params.code as string) || "VR-000000",
    color: (params.color as string) || "#f97316",
  };

  const pinString = (params.pin as string) || "000000";
  const PIN = pinString.split("");
  const remainingPoints = (params.newBalance as string) || "0";
  const pointsCost = (params.pointsCost as string) || "0";
  const userCouponId = (params.userCouponId as string) || "";

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigatedRef = useRef(false);

  // ← Poll every 6 seconds — auto-navigate to success when cashier redeems PIN
  useEffect(() => {
    if (!userCouponId) return;

    const checkCouponStatus = async () => {
      if (navigatedRef.current) return;

      try {
        const response = await authFetch(`${BASE_URL}/me/coupons`);
        const data = await response.json();

        if (!response.ok) return;

        const coupons = data.coupons || data.data || [];
        const thisCoupon = coupons.find(
          (c: any) => String(c.id) === String(userCouponId)
        );

        if (thisCoupon && thisCoupon.status === "used") {
          navigatedRef.current = true;
          if (pollingRef.current) clearInterval(pollingRef.current);

          router.replace({
            pathname: "/redeem-success",
            params: {
              title: coupon.title,
              pin: pinString,
              remainingPoints,
              pointsCost,
            },
          });
        }
      } catch (err) {
        console.log("Coupon status poll error:", err);
      }
    };

    checkCouponStatus();
    pollingRef.current = setInterval(checkCouponStatus, 6000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleCopyPIN = () => {
    Clipboard.setString(pinString);
    Alert.alert("Copied!", "PIN copied to clipboard.");
  };

  const handleLocations = () => {
    Alert.alert("Locations", "Find participating locations near you.");
  };

  const handleDone = () => {
    router.push({
      pathname: "/redeem-success",
      params: {
        title: coupon.title,
        pin: pinString,
        remainingPoints,
        pointsCost,
      },
    });
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: coupon.color + "22" }]}>
          <Ionicons name={coupon.icon as any} size={52} color={coupon.color} />
        </View>

        {/* Title */}
        <View style={[styles.titleBox, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.titleText}>{coupon.title}</Text>
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {coupon.description}
        </Text>

        {/* PIN Label */}
        <Text style={[styles.pinLabel, { color: theme.colors.textSecondary }]}>
          6-Digit Redemption PIN
        </Text>

        {/* PIN Boxes */}
        <View style={styles.pinRow}>
          {PIN.map((digit, index) => (
            <View key={index} style={[styles.pinBox, { backgroundColor: theme.colors.text }]}>
              <Text style={[styles.pinDigit, { color: theme.colors.background }]}>{digit}</Text>
            </View>
          ))}
        </View>

        {/* Waiting indicator */}
        {userCouponId ? (
          <View style={[styles.waitingCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.waitingText, { color: theme.colors.textSecondary }]}>
              Waiting for merchant to scan PIN...
            </Text>
          </View>
        ) : null}

        {/* Details card */}
        <View style={[styles.detailsCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Valid Until:</Text>
            <View style={[styles.detailValue, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.detailValueText}>{coupon.validUntil}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Coupon Code:</Text>
            <View style={[styles.detailValue, { backgroundColor: theme.colors.surfaceSecondary }]}>
              <Text style={[styles.detailValueText, { color: theme.colors.text }]}>{coupon.code}</Text>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={handleCopyPIN}
          >
            <Ionicons name="copy-outline" size={18} color={theme.colors.text} />
            <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>Copy PIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={handleLocations}
          >
            <Ionicons name="location-outline" size={18} color={theme.colors.text} />
            <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>Locations</Text>
          </TouchableOpacity>
        </View>

        {/* Done button */}
        <TouchableOpacity
          style={[styles.doneBtn, { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border }]}
          onPress={handleDone}
          activeOpacity={0.85}
        >
          <Text style={[styles.doneBtnText, { color: theme.colors.text }]}>DONE</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  scroll: { paddingHorizontal: 24, paddingBottom: 40, alignItems: "center" },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: "center", justifyContent: "center",
    marginBottom: 20, marginTop: 10,
  },
  titleBox: {
    paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 12, marginBottom: 10,
    width: "100%", alignItems: "center",
  },
  titleText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  subtitle: { fontSize: 14, marginBottom: 28, textAlign: "center" },
  pinLabel: { fontSize: 13, fontWeight: "600", marginBottom: 16 },
  pinRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  pinBox: {
    width: 48, height: 58, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  pinDigit: { fontSize: 24, fontWeight: "900" },
  waitingCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderRadius: 12, padding: 12,
    marginBottom: 16, width: "100%",
  },
  waitingText: { fontSize: 12, fontWeight: "600", flex: 1 },
  detailsCard: {
    width: "100%", borderRadius: 16, padding: 16,
    borderWidth: 1, marginBottom: 20, gap: 12,
  },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailLabel: { fontSize: 14, fontWeight: "600" },
  detailValue: {
    paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 10, minWidth: 120, alignItems: "center",
  },
  detailValueText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  actionRow: { flexDirection: "row", gap: 12, width: "100%", marginBottom: 20 },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    paddingVertical: 16, borderRadius: 14, borderWidth: 1,
  },
  actionBtnText: { fontSize: 14, fontWeight: "600" },
  doneBtn: {
    width: "100%", paddingVertical: 18,
    borderRadius: 16, alignItems: "center", borderWidth: 1,
  },
  doneBtnText: { fontSize: 15, fontWeight: "700", letterSpacing: 1 },
});