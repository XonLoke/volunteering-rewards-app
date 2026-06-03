import { useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getLocalPointsHistoryKey = (userId: number | string) =>
  `localPointsHistory:${userId}`;

interface LocalPointsHistoryItem {
  id: string;
  title: string;
  description: string;
  points: number;
  type: "redeem";
  created_at: string;
}

export default function RedeemSuccess() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  const title =
    typeof params.title === "string" && params.title.trim() !== ""
      ? params.title
      : "Coupon";

  const remainingPoints =
    typeof params.remainingPoints === "string" &&
    params.remainingPoints.trim() !== ""
      ? params.remainingPoints
      : "0";

  const pointsCost =
    typeof params.pointsCost === "string" && params.pointsCost.trim() !== ""
      ? params.pointsCost
      : "0";

  const pin =
    typeof params.pin === "string" && params.pin.trim() !== ""
      ? params.pin
      : "";

  const safeRemainingPoints = Number.isNaN(Number(remainingPoints))
    ? 0
    : Number(remainingPoints);

  const safePointsCost = Number.isNaN(Number(pointsCost))
    ? 0
    : Number(pointsCost);

  const redeemedAt = new Date().toLocaleString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    saveRedeemHistory();
  }, []);

  const saveRedeemHistory = async () => {
    try {
      await AsyncStorage.setItem("userPoints", String(safeRemainingPoints));

      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        return;
      }

      const user = JSON.parse(storedUser);

      const updatedUser = {
        ...user,
        points: safeRemainingPoints,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      // Remove old shared history so old user's redeemed records do not show for new users
      await AsyncStorage.removeItem("localPointsHistory");

      const userHistoryKey = getLocalPointsHistoryKey(user.id);

      const storedLocalHistory = await AsyncStorage.getItem(userHistoryKey);

      const localHistory: LocalPointsHistoryItem[] = storedLocalHistory
        ? JSON.parse(storedLocalHistory)
        : [];

      const alreadySaved = localHistory.some(
        (item) =>
          item.title === title &&
          item.points === safePointsCost &&
          item.type === "redeem"
      );

      if (alreadySaved) return;

      const redeemRecord: LocalPointsHistoryItem = {
        id: `redeem-${user.id}-${Date.now()}`,
        title,
        description: "Coupon redemption",
        points: safePointsCost,
        type: "redeem",
        created_at: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        userHistoryKey,
        JSON.stringify([redeemRecord, ...localHistory].slice(0, 50))
      );
    } catch (error) {
      console.error("Failed to save redeem history:", error);
    }
  };

  const goToPinDisplay = () => {
    router.push({
      pathname: "/pin-display",
      params: {
        title,
        pin,
      },
    });
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.decorOne} />
        <View style={styles.decorTwo} />

        <View style={styles.heroSection}>
          <View style={styles.successGlow}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={64} color="#fff" />
            </View>
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            Redeemed Successfully
          </Text>

          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Your coupon is now active and ready to use from My Coupons.
          </Text>
        </View>

        <View
          style={[
            styles.couponCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.couponHeader}>
            <View
              style={[
                styles.couponIconBox,
                { backgroundColor: theme.colors.primary + "18" },
              ]}
            >
              <Ionicons
                name="ticket-outline"
                size={30}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.couponTextWrap}>
              <Text
                style={[
                  styles.couponMini,
                  { color: theme.colors.textSecondary },
                ]}
              >
                New coupon
              </Text>

              <Text
                style={[styles.couponTitle, { color: theme.colors.text }]}
                numberOfLines={2}
              >
                {title}
              </Text>
            </View>

            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </View>

          <View style={[styles.dashedLine, { borderColor: theme.colors.border }]} />

          <View style={styles.ticketBody}>
            <View
              style={[
                styles.pointsPanel,
                { backgroundColor: theme.colors.primary + "12" },
              ]}
            >
              <Text
                style={[
                  styles.pointsPanelLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Points used
              </Text>

              <Text style={styles.pointsDeducted}>
                -{safePointsCost.toLocaleString()}
              </Text>
            </View>

            <View style={[styles.pointsPanel, { backgroundColor: "#10b98112" }]}>
              <Text
                style={[
                  styles.pointsPanelLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Balance left
              </Text>

              <Text style={[styles.pointsBalance, { color: theme.colors.text }]}>
                {safeRemainingPoints.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.detailList}>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Redeemed
                </Text>
              </View>

              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {redeemedAt}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons
                  name="wallet-outline"
                  size={18}
                  color={theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.detailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Remaining
                </Text>
              </View>

              <Text style={[styles.detailValueBold, { color: theme.colors.text }]}>
                {safeRemainingPoints.toLocaleString()} pts
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: "#10b98114",
                borderColor: "#10b98144",
              },
            ]}
          >
            <Ionicons
              name={pin ? "lock-closed-outline" : "shield-checkmark-outline"}
              size={22}
              color="#10b981"
            />

            <Text style={styles.infoText}>
              {pin
                ? "Coupon PIN generated securely. View it from the PIN display screen when needed."
                : "Coupon saved. Open My Coupons when you want to use it."}
            </Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          {pin ? (
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={goToPinDisplay}
              activeOpacity={0.86}
            >
              <Ionicons name="key-outline" size={19} color="#fff" />
              <Text style={styles.primaryButtonText}>View Coupon PIN</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => router.replace("/my-coupons" as any)}
              activeOpacity={0.86}
            >
              <Ionicons name="ticket-outline" size={19} color="#fff" />
              <Text style={styles.primaryButtonText}>View My Coupons</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => router.replace("/my-coupons" as any)}
            activeOpacity={0.86}
          >
            <Ionicons name="ticket-outline" size={19} color={theme.colors.text} />
            <Text
              style={[styles.secondaryButtonText, { color: theme.colors.text }]}
            >
              My Coupons
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.ghostButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => router.replace("/home" as any)}
            activeOpacity={0.86}
          >
            <Ionicons name="home-outline" size={19} color={theme.colors.text} />
            <Text style={[styles.ghostButtonText, { color: theme.colors.text }]}>
              Back to Home
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

  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 42,
    paddingBottom: 32,
    justifyContent: "space-between",
    gap: 18,
  },

  decorOne: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(16,185,129,0.08)",
    top: -95,
    right: -95,
  },

  decorTwo: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(99,102,241,0.08)",
    bottom: 70,
    left: -80,
  },

  heroSection: {
    alignItems: "center",
  },

  successGlow: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#10b98122",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  successCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 8,
  },

  title: {
    fontSize: 31,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.9,
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 310,
  },

  couponCard: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 34,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  couponHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  couponIconBox: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  couponTextWrap: {
    flex: 1,
  },

  couponMini: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },

  couponTitle: {
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
  },

  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b98120",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginLeft: 8,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 6,
  },

  activeBadgeText: {
    color: "#10b981",
    fontSize: 11,
    fontWeight: "900",
  },

  dashedLine: {
    borderStyle: "dashed",
    borderTopWidth: 1,
    marginVertical: 20,
  },

  ticketBody: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },

  pointsPanel: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: "center",
  },

  pointsPanelLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },

  pointsDeducted: {
    color: "#ef4444",
    fontSize: 26,
    fontWeight: "900",
  },

  pointsBalance: {
    fontSize: 26,
    fontWeight: "900",
  },

  detailList: {
    marginBottom: 16,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    marginBottom: 13,
  },

  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  detailLabel: {
    fontSize: 13,
    fontWeight: "800",
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "800",
    flexShrink: 1,
    textAlign: "right",
  },

  detailValueBold: {
    fontSize: 15,
    fontWeight: "900",
  },

  infoCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  infoText: {
    flex: 1,
    color: "#10b981",
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 18,
  },

  actionContainer: {
    gap: 12,
  },

  primaryButton: {
    height: 57,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },

  secondaryButton: {
    height: 57,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },

  ghostButton: {
    height: 57,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
  },

  ghostButtonText: {
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },
});