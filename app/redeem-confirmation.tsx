import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://vol-rewards-api.onrender.com/api";

export default function RedeemConfirmation() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(false);

  const coupon = {
    couponId: Number(params.couponId),
    title: typeof params.title === "string" ? params.title : "Reward Coupon",
    description: typeof params.description === "string" ? params.description : "",
    pointsCost: Number(params.pointsCost) || 0,
    currentBalance: Number(params.currentBalance) || 0,
    color: typeof params.color === "string" ? params.color : "#6366f1",
    icon: typeof params.emoji === "string" ? params.emoji : "gift-outline",
    validUntil: typeof params.validUntil === "string" ? params.validUntil : "",
  };

  const newBalance = coupon.currentBalance - coupon.pointsCost;

  const handleConfirmRedeem = async () => {
    try {
      setLoading(true);

      const stored = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (!stored) {
        Alert.alert("Login required", "Please login again.");
        router.replace("/login");
        return;
      }

      const user = JSON.parse(stored);

      // ← changed to /rewards/:id/redeem with token
      const response = await fetch(`${BASE_URL}/rewards/${coupon.couponId}/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          user_id: user.id,
        }),
      });

      const data = await response.json().catch(() => ({}));
      console.log("Redeem status:", response.status);
      console.log("Redeem response:", JSON.stringify(data));

      if (!response.ok) {
        throw new Error(
          data.error?.message || data.message || "Failed to redeem reward."
        );
      }

      // update points in storage
      const newPoints = Number(
        data.points_balance ?? data.remaining_points ?? data.new_balance ?? newBalance
      );
      await AsyncStorage.setItem("userPoints", String(newPoints));

      const updatedUser = {
        ...user,
        points: newPoints,
        points_balance: newPoints,
      };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      // get the pin from response
      const pin =
        data.pin ||
        data.coupon?.pin ||
        data.coupon?.pin_hash ||
        data.pin_hash ||
        "------";

      router.replace({
        pathname: "/pin-display",
        params: {
          pin,
          title: coupon.title,
          description: coupon.description,
          color: coupon.color,
          emoji: coupon.icon,
          validUntil: coupon.validUntil,
          code: `VR-${pin}`,
          userCouponId: String(data.coupon?.id || data.id || ""),
          newBalance: String(newPoints),
        },
      } as any);
    } catch (err: any) {
      console.error("Redeem error:", err);
      Alert.alert("Redemption failed", err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Confirm Redemption</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Review before redeeming
          </Text>
        </View>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.couponPreview, { backgroundColor: coupon.color }]}>
          <View style={styles.previewDecorOne} />
          <View style={styles.previewDecorTwo} />
          <View style={styles.previewIconCircle}>
            <Ionicons name={coupon.icon as any} size={36} color={coupon.color} />
          </View>
          <Text style={styles.previewTitle}>{coupon.title}</Text>
          <Text style={styles.previewDesc}>{coupon.description}</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Redemption Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Points required</Text>
            <Text style={[styles.summaryValue, { color: coupon.color }]}>-{coupon.pointsCost} pts</Text>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Current balance</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{coupon.currentBalance.toLocaleString()} pts</Text>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Balance after</Text>
            <Text style={[styles.summaryValue, { color: newBalance >= 0 ? "#10b981" : "#ef4444" }]}>
              {newBalance.toLocaleString()} pts
            </Text>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Valid until</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{coupon.validUntil}</Text>
          </View>
        </View>

        <View style={[styles.warningCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.warningText, { color: theme.colors.textSecondary }]}>
            Once redeemed, this action cannot be undone. Your PIN will be shown after confirmation.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.cancelBtn, { borderColor: theme.colors.border }]}
          onPress={() => router.back()}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={[styles.cancelBtnText, { color: theme.colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: coupon.color, opacity: loading ? 0.75 : 1 }]}
          onPress={handleConfirmRedeem}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.confirmBtnText}>Confirm Redeem</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14 },
  backBtn: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "900" },
  headerSubtitle: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
  couponPreview: { borderRadius: 28, padding: 28, alignItems: "center", marginBottom: 20, overflow: "hidden", position: "relative" },
  previewDecorOne: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.1)", top: -70, right: -50 },
  previewDecorTwo: { position: "absolute", width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(255,255,255,0.08)", bottom: -40, left: -20 },
  previewIconCircle: { width: 72, height: 72, borderRadius: 24, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginBottom: 14, zIndex: 1 },
  previewTitle: { color: "#fff", fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 6, zIndex: 1 },
  previewDesc: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600", textAlign: "center", zIndex: 1 },
  summaryCard: { borderRadius: 22, borderWidth: 1, padding: 18, marginBottom: 14 },
  summaryTitle: { fontSize: 16, fontWeight: "900", marginBottom: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  summaryLabel: { fontSize: 14, fontWeight: "600" },
  summaryValue: { fontSize: 14, fontWeight: "800" },
  summaryDivider: { height: 1 },
  warningCard: { borderRadius: 18, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  warningText: { flex: 1, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1, flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: "center", borderWidth: 1 },
  cancelBtnText: { fontSize: 15, fontWeight: "700" },
  confirmBtn: { flex: 2, borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  confirmBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});