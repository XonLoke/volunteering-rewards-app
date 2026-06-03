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

const BASE_URL = "http://192.168.72.201:3000/api";

export default function RedeemConfirmation() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  const [confirming, setConfirming] = useState(false);

  const coupon = {
    couponId: Number(params.couponId),
    title:
      typeof params.title === "string" && params.title.trim() !== ""
        ? params.title
        : "Coupon",
    description:
      typeof params.description === "string" && params.description.trim() !== ""
        ? params.description
        : "Redeem this reward using your volunteer points.",
    pointsCost: Number(params.pointsCost) || 0,
    currentBalance: Number(params.currentBalance) || 0,
    color:
      typeof params.color === "string" && params.color.trim() !== ""
        ? params.color
        : theme.colors.primary,
    emoji:
      typeof params.emoji === "string" && params.emoji.trim() !== ""
        ? params.emoji
        : "gift-outline",
    validUntil:
      typeof params.validUntil === "string" && params.validUntil.trim() !== ""
        ? params.validUntil
        : "31 Dec 2026",
  };

  const newBalance = coupon.currentBalance - coupon.pointsCost;
  const canRedeem = coupon.currentBalance >= coupon.pointsCost;
  const shortfall = Math.max(coupon.pointsCost - coupon.currentBalance, 0);

  const handleConfirmRedeem = async () => {
    if (!canRedeem) {
      Alert.alert(
        "Not enough points",
        `You need ${coupon.pointsCost.toLocaleString()} points, but you only have ${coupon.currentBalance.toLocaleString()} points.`
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

      const response = await fetch(`${BASE_URL}/redeem`, {
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
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.headerButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => router.back()}
          disabled={confirming}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <Text style={[styles.headerMini, { color: theme.colors.textSecondary }]}>
            Rewards
          </Text>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Confirm Redemption
          </Text>
        </View>

        <View
          style={[
            styles.headerButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color={coupon.color} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: coupon.color,
            },
          ]}
        >
          <View style={styles.heroDecorOne} />
          <View style={styles.heroDecorTwo} />

          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>YOU ARE REDEEMING</Text>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {coupon.title}
              </Text>
            </View>

            <View style={styles.heroIconBox}>
              <Ionicons name={coupon.emoji as any} size={34} color="#fff" />
            </View>
          </View>

          <Text style={styles.heroDescription} numberOfLines={3}>
            {coupon.description}
          </Text>

          <View style={styles.heroFooter}>
            <View style={styles.heroPill}>
              <Ionicons name="calendar-outline" size={15} color="#fff" />
              <Text style={styles.heroPillText}>Valid until {coupon.validUntil}</Text>
            </View>

            <View style={styles.heroPill}>
              <Ionicons name="ticket-outline" size={15} color="#fff" />
              <Text style={styles.heroPillText}>Active after redeem</Text>
            </View>
          </View>
        </View>

        <View style={styles.balanceGrid}>
          <View
            style={[
              styles.balanceCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.balanceIconBox,
                { backgroundColor: theme.colors.primary + "18" },
              ]}
            >
              <Ionicons
                name="wallet-outline"
                size={22}
                color={theme.colors.primary}
              />
            </View>

            <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
              Current
            </Text>

            <Text style={[styles.balanceValue, { color: theme.colors.text }]}>
              {coupon.currentBalance.toLocaleString()}
            </Text>
          </View>

          <View
            style={[
              styles.balanceCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={[styles.balanceIconBox, { backgroundColor: "#ef444422" }]}>
              <Ionicons name="remove-circle-outline" size={22} color="#ef4444" />
            </View>

            <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
              Cost
            </Text>

            <Text style={styles.costValue}>
              -{coupon.pointsCost.toLocaleString()}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.summaryHeader}>
            <View>
              <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
                Redemption Summary
              </Text>
              <Text
                style={[
                  styles.summarySub,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Review your points before confirming.
              </Text>
            </View>

            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: canRedeem ? "#10b98118" : "#ef444418",
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: canRedeem ? "#10b981" : "#ef4444" },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: canRedeem ? "#10b981" : "#ef4444" },
                ]}
              >
                {canRedeem ? "Ready" : "Not enough"}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <Ionicons
                name="gift-outline"
                size={18}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Reward
              </Text>
            </View>

            <Text
              style={[styles.summaryValueText, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {coupon.title}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <Ionicons
                name="sparkles-outline"
                size={18}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Points deducted
              </Text>
            </View>

            <Text style={styles.deductText}>
              -{coupon.pointsCost.toLocaleString()} pts
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <Ionicons
                name="wallet-outline"
                size={18}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                New balance
              </Text>
            </View>

            <Text
              style={[
                styles.newBalanceText,
                { color: canRedeem ? theme.colors.text : "#ef4444" },
              ]}
            >
              {canRedeem ? `${newBalance.toLocaleString()} pts` : "Insufficient"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.noticeCard,
            {
              backgroundColor: canRedeem ? "#10b98114" : "#ef444414",
              borderColor: canRedeem ? "#10b98144" : "#ef444444",
            },
          ]}
        >
          <Ionicons
            name={canRedeem ? "shield-checkmark-outline" : "alert-circle-outline"}
            size={23}
            color={canRedeem ? "#10b981" : "#ef4444"}
          />

          <Text
            style={[
              styles.noticeText,
              { color: canRedeem ? "#10b981" : "#ef4444" },
            ]}
          >
            {canRedeem
              ? "Once confirmed, this coupon will be added to My Coupons and your points will be deducted."
              : `You need ${shortfall.toLocaleString()} more points to redeem this reward.`}
          </Text>
        </View>

        <View style={styles.buttonColumn}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              {
                backgroundColor: canRedeem ? coupon.color : theme.colors.border,
                opacity: confirming ? 0.75 : 1,
              },
            ]}
            onPress={handleConfirmRedeem}
            disabled={!canRedeem || confirming}
            activeOpacity={0.86}
          >
            {confirming ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.confirmText}>Confirm Redemption</Text>
              </>
            )}
          </TouchableOpacity>

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
            activeOpacity={0.86}
          >
            <Ionicons name="close-circle-outline" size={20} color={theme.colors.text} />
            <Text style={[styles.cancelText, { color: theme.colors.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },

  headerButton: {
    width: 46,
    height: 46,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextWrap: {
    flex: 1,
    paddingHorizontal: 14,
  },

  headerMini: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 2,
  },

  headerTitle: {
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 34,
  },

  heroCard: {
    borderRadius: 34,
    padding: 24,
    marginBottom: 14,
    overflow: "hidden",
    position: "relative",
  },

  heroDecorOne: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.09)",
    top: -85,
    right: -60,
  },

  heroDecorTwo: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -45,
    left: 20,
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    zIndex: 1,
  },

  heroLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 8,
  },

  heroTitle: {
    color: "#fff",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.7,
    maxWidth: 230,
    lineHeight: 32,
  },

  heroIconBox: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroDescription: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 14,
    zIndex: 1,
  },

  heroFooter: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 18,
    zIndex: 1,
  },

  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  heroPillText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },

  balanceGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },

  balanceCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },

  balanceIconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  balanceLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 3,
  },

  balanceValue: {
    fontSize: 22,
    fontWeight: "900",
  },

  costValue: {
    color: "#ef4444",
    fontSize: 22,
    fontWeight: "900",
  },

  summaryCard: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  summarySub: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "900",
  },

  divider: {
    height: 1,
    marginVertical: 16,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },

  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },

  summaryLabel: {
    fontSize: 13,
    fontWeight: "800",
  },

  summaryValueText: {
    fontSize: 13,
    fontWeight: "900",
    flexShrink: 1,
    textAlign: "right",
    maxWidth: 150,
  },

  deductText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "900",
  },

  newBalanceText: {
    fontSize: 15,
    fontWeight: "900",
  },

  noticeCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },

  noticeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 18,
  },

  buttonColumn: {
    gap: 12,
  },

  confirmButton: {
    height: 57,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  confirmText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },

  cancelButton: {
    height: 57,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },
});