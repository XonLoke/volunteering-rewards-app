import { useEffect, useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ScanHistoryItem {
  id: string;
  event_id?: number;
  event_title: string;
  location?: string;
  points_value: number;
  points_awarded: number;
  scanned_at: string;
  source: "local" | "backend";
}

const SCAN_HISTORY_KEY = "scanHistory";

export default function ScanSuccess() {
  const router = useRouter();
  const { theme } = useTheme();

  const params = useLocalSearchParams<{
    eventName?: string;
    pointsEarned?: string;
    totalPoints?: string;
    location?: string;
    eventId?: string;
  }>();

  const eventName =
    typeof params.eventName === "string" && params.eventName.trim() !== ""
      ? params.eventName
      : "Volunteer Event";

  const location =
    typeof params.location === "string" && params.location.trim() !== ""
      ? params.location
      : "Attendance confirmed";

  const pointsEarnedNumber = Number(params.pointsEarned ?? 0);
  const safePointsEarned = Number.isNaN(pointsEarnedNumber)
    ? 0
    : pointsEarnedNumber;

  const totalPointsNumber = Number(params.totalPoints ?? 0);
  const safeTotalPoints = Number.isNaN(totalPointsNumber)
    ? 0
    : totalPointsNumber;

  const formattedTotalPoints = safeTotalPoints.toLocaleString();

  const eventIdNumber = Number(params.eventId ?? 0);
  const safeEventId = Number.isNaN(eventIdNumber) ? undefined : eventIdNumber;

  const scanTime = useMemo(() => {
    return new Date().toLocaleString("en-SG", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  useEffect(() => {
    saveSuccessData();
  }, []);

  const saveSuccessData = async () => {
    try {
      await AsyncStorage.setItem("userPoints", String(safeTotalPoints));

      const storedUser = await AsyncStorage.getItem("user");

      if (storedUser) {
        const user = JSON.parse(storedUser);

        const updatedUser = {
          ...user,
          points: safeTotalPoints,
        };

        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      }

      const storedHistory = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
      const existingHistory: ScanHistoryItem[] = storedHistory
        ? JSON.parse(storedHistory)
        : [];

      const newHistoryItem: ScanHistoryItem = {
        id: `${Date.now()}`,
        event_id: safeEventId,
        event_title: eventName,
        location,
        points_value: safePointsEarned,
        points_awarded: safePointsEarned,
        scanned_at: new Date().toISOString(),
        source: "local",
      };

      await AsyncStorage.setItem(
        SCAN_HISTORY_KEY,
        JSON.stringify([newHistoryItem, ...existingHistory].slice(0, 50))
      );
    } catch (error) {
      console.error("Failed to save scan success data:", error);
    }
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.heroSection}>
          <View style={styles.successGlow}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={64} color="#fff" />
            </View>
          </View>

          <Text style={[styles.successTitle, { color: theme.colors.text }]}>
            Attendance Confirmed
          </Text>

          <Text
            style={[
              styles.successSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Your event attendance has been recorded and your reward points have
            been updated.
          </Text>
        </View>

        <View
          style={[
            styles.rewardCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.rewardHeader}>
            <View
              style={[
                styles.rewardIconBox,
                { backgroundColor: theme.colors.primary + "18" },
              ]}
            >
              <Ionicons
                name="sparkles-outline"
                size={26}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.rewardHeaderText}>
              <Text
                style={[
                  styles.rewardMini,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Reward earned
              </Text>

              <Text style={[styles.rewardEvent, { color: theme.colors.text }]}>
                {eventName}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.pointsPanel,
              { backgroundColor: theme.colors.primary + "12" },
            ]}
          >
            <Text style={[styles.pointsValue, { color: theme.colors.primary }]}>
              +{safePointsEarned}
            </Text>

            <Text
              style={[
                styles.pointsLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              points added
            </Text>
          </View>

          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons
                name="location-outline"
                size={18}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Location
              </Text>
            </View>

            <Text
              style={[styles.detailValue, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {location}
            </Text>
          </View>

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
                Scanned
              </Text>
            </View>

            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {scanTime}
            </Text>
          </View>

          <View style={[styles.detailRow, { marginBottom: 0 }]}>
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
                New Balance
              </Text>
            </View>

            <Text style={[styles.balanceValue, { color: theme.colors.text }]}>
              {formattedTotalPoints} pts
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: "#10b98118",
              borderColor: "#10b98144",
            },
          ]}
        >
          <Ionicons name="shield-checkmark-outline" size={22} color="#10b981" />
          <Text style={styles.statusText}>
            Verified scan saved to your history
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => router.replace("/home" as any)}
            activeOpacity={0.86}
          >
            <Ionicons name="home-outline" size={19} color="#fff" />
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => router.push("/scan-history" as any)}
            activeOpacity={0.86}
          >
            <Ionicons name="time-outline" size={19} color={theme.colors.text} />
            <Text
              style={[
                styles.secondaryButtonText,
                { color: theme.colors.text },
              ]}
            >
              View Scan History
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

  heroSection: {
    alignItems: "center",
  },

  successGlow: {
    width: 152,
    height: 152,
    borderRadius: 76,
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

  successTitle: {
    fontSize: 31,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.9,
    marginBottom: 10,
  },

  successSubtitle: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 310,
  },

  rewardCard: {
    borderWidth: 1,
    borderRadius: 34,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  rewardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  rewardIconBox: {
    width: 56,
    height: 56,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  rewardHeaderText: {
    flex: 1,
  },

  rewardMini: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },

  rewardEvent: {
    fontSize: 18,
    fontWeight: "900",
  },

  pointsPanel: {
    borderRadius: 26,
    paddingVertical: 24,
    alignItems: "center",
  },

  pointsValue: {
    fontSize: 52,
    fontWeight: "900",
    lineHeight: 58,
  },

  pointsLabel: {
    fontSize: 13,
    fontWeight: "800",
  },

  divider: {
    height: 1,
    marginVertical: 18,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
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

  balanceValue: {
    fontSize: 16,
    fontWeight: "900",
  },

  statusCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  statusText: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "900",
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
});