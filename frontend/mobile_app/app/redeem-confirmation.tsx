import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";
import { api } from "../src/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function RedeemConfirmation() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  const [confirming, setConfirming] = useState(false);

  const coupon = {
    couponId: Number(params.couponId),
    title: typeof params.title === "string" ? params.title : "Coupon",
    description:
      typeof params.description === "string" ? params.description : "",
    pointsCost: Number(params.pointsCost) || 0,
    currentBalance: Number(params.currentBalance) || 0,
    color:
      typeof params.color === "string" ? params.color : theme.colors.primary,
    emoji:
      typeof params.emoji === "string" ? params.emoji : "gift-outline",
    validUntil:
      typeof params.validUntil === "string" ? params.validUntil : "31 Dec 2026",
  };

  const newBalance = coupon.currentBalance - coupon.pointsCost;
  const canRedeem = coupon.currentBalance >= coupon.pointsCost;

  const handleConfirmRedeem = async () => {
    if (!canRedeem) {
      Alert.alert(
        "Not enough points",
        `You need ${coupon.pointsCost} points, but you only have ${coupon.currentBalance} points.`
      );
      return;
    }

    try {
      setConfirming(true);

      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        Alert.alert("Login required", "Please login again.");
        router.replace("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      const response = await api.post("/rewards/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          coupon_id: coupon.couponId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          "Redemption failed",
          data.error || data.message || "Please try again."
        );
        return;
      }

      const remainingPoints =
        typeof data.remainingPoints === "number"
          ? data.remainingPoints
          : newBalance;

      const updatedUser = {
        ...user,
        points: remainingPoints,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      await AsyncStorage.setItem("userPoints", String(remainingPoints));

      router.replace({
        pathname: "/redeem-success",
        params: {
          title: coupon.title,
          pointsCost: String(coupon.pointsCost),
          remainingPoints: String(remainingPoints),
          pin: data.pin ?? "",
          color: coupon.color,
          emoji: coupon.emoji,
          validUntil: coupon.validUntil,
        },
      });
    } catch (error) {
      console.error("Redeem confirm error:", error);
      Alert.alert("Error", "Failed to redeem. Check your connection.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSpacer} />

        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: coupon.color + "22" },
          ]}
        >
          <Ionicons name={coupon.emoji as any} size={48} color={coupon.color} />
        </View>

        <View style={styles.titleSection}>
          <Text style={[styles.titleText, { color: theme.colors.text }]}>
            Confirm Redemption
          </Text>
          <Text
            style={[styles.subtitleText, { color: theme.colors.textSecondary }]}
          >
            Please confirm before redeeming this reward.
          </Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={[styles.cardHeader, { backgroundColor: coupon.color }]}>
            <Text style={styles.cardTitle}>{coupon.title}</Text>
          </View>

          <Text
            style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}
          >
            {coupon.description}
          </Text>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.summaryRow}>
            <Text
              style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}
            >
              Points to deduct:
            </Text>
            <View style={[styles.summaryValue, { backgroundColor: coupon.color }]}>
              <Text style={styles.summaryValueText}>-{coupon.pointsCost}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text
              style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}
            >
              Current balance:
            </Text>
            <View
              style={[
                styles.summaryValue,
                { backgroundColor: theme.colors.surfaceSecondary },
              ]}
            >
              <Text
                style={[styles.summaryValueText, { color: theme.colors.text }]}
              >
                {coupon.currentBalance.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.summaryRow}>
            <Text
              style={[
                styles.summaryLabel,
                { color: theme.colors.text, fontWeight: "700" },
              ]}
            >
              New balance:
            </Text>
            <View
              style={[
                styles.summaryValue,
                {
                  backgroundColor: canRedeem ? coupon.color : theme.colors.border,
                },
              ]}
            >
              <Text style={styles.summaryValueText}>
                {canRedeem ? newBalance.toLocaleString() : "Insufficient"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => router.back()}
            disabled={confirming}
          >
            <Text
              style={[styles.cancelText, { color: theme.colors.textSecondary }]}
            >
              CANCEL
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              {
                backgroundColor: canRedeem ? coupon.color : theme.colors.border,
                opacity: confirming ? 0.7 : 1,
              },
            ]}
            onPress={handleConfirmRedeem}
            disabled={!canRedeem || confirming}
          >
            {confirming ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmText}>CONFIRM</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { paddingHorizontal: 24, paddingBottom: 40 },
  topSpacer: { height: 30 },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  titleSection: { alignItems: "center", marginBottom: 24 },
  titleText: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleText: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 32,
  },
  cardHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  divider: { height: 1, marginHorizontal: 16, marginVertical: 4 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  summaryLabel: { fontSize: 14, fontWeight: "600", flex: 1 },
  summaryValue: {
    minWidth: 100,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryValueText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  buttonRow: { flexDirection: "row", gap: 14 },
  cancelButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    alignItems: "center",
  },
  cancelText: { fontSize: 14, fontWeight: "700", letterSpacing: 0.5 },
  confirmButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: { color: "#fff", fontSize: 14, fontWeight: "700", letterSpacing: 0.5 },
});