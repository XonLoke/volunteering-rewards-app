import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

export default function ScanSuccess() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  const eventName =
    typeof params.eventName === "string" && params.eventName.trim() !== ""
      ? params.eventName
      : "Volunteer Event";

  const pointsEarned =
    typeof params.pointsEarned === "string" && params.pointsEarned.trim() !== ""
      ? params.pointsEarned
      : "0";

  const totalPoints =
    typeof params.totalPoints === "string" && params.totalPoints.trim() !== ""
      ? params.totalPoints
      : "0";

  const formattedTotalPoints = Number.isNaN(Number(totalPoints))
    ? "0"
    : Number(totalPoints).toLocaleString();

  useEffect(() => {
    const saveUpdatedPoints = async () => {
      try {
        const safeTotalPoints = Number.isNaN(Number(totalPoints))
          ? 0
          : Number(totalPoints);

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
      } catch (error) {
        console.error("Failed to save updated points:", error);
      }
    };

    saveUpdatedPoints();
  }, [totalPoints]);

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.container}>
        <View style={styles.checkmarkContainer}>
          <View
            style={[
              styles.checkmarkCircle,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Ionicons name="checkmark" size={56} color="#fff" />
          </View>
        </View>

        <Text style={[styles.successTitle, { color: theme.colors.text }]}>
          Scan Successful!
        </Text>

        <Text
          style={[
            styles.successSubtitle,
            { color: theme.colors.textSecondary },
          ]}
        >
          Points added to your account
        </Text>

        <View
          style={[
            styles.earnedSection,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[styles.earnedLabel, { color: theme.colors.textSecondary }]}
          >
            You Earned
          </Text>

          <Text
            style={[styles.earnedPoints, { color: theme.colors.primaryLight }]}
          >
            +{pointsEarned}
          </Text>

          <Text
            style={[styles.pointsText, { color: theme.colors.textSecondary }]}
          >
            points
          </Text>
        </View>

        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.detailRow}>
            <Text
              style={[styles.detailLabel, { color: theme.colors.textSecondary }]}
            >
              Event:
            </Text>

            <Text
              style={[styles.detailValue, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {eventName}
            </Text>
          </View>

          <View style={[styles.detailRow, { marginBottom: 0 }]}>
            <Text
              style={[styles.detailLabel, { color: theme.colors.textSecondary }]}
            >
              New Balance:
            </Text>

            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {formattedTotalPoints} pts
            </Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => router.replace("/home")}
          >
            <Text style={[styles.continueText, { color: "#fff" }]}>
              Continue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.historyButton,
              {
                backgroundColor: theme.colors.surfaceSecondary,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => router.push("/scan-history")}
          >
            <Text
              style={[
                styles.historyText,
                { color: theme.colors.primaryLight },
              ]}
            >
              View History
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkContainer: {
    marginBottom: 32,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 15,
    marginBottom: 32,
    textAlign: "center",
  },
  earnedSection: {
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 1,
    width: "100%",
  },
  earnedLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  earnedPoints: {
    fontSize: 48,
    fontWeight: "800",
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 14,
  },
  detailsCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 32,
    borderWidth: 1,
    width: "100%",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
  },
  actionContainer: {
    width: "100%",
    gap: 12,
  },
  continueButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueText: {
    fontSize: 15,
    fontWeight: "700",
  },
  historyButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  historyText: {
    fontSize: 15,
    fontWeight: "700",
  },
});