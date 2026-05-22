import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function RedeemConfirmation() {
  const router = useRouter();
  const { theme } = useTheme();

  const coupon = {
    title: "Coffee Shop $5 Voucher",
    subtitle: "$5 off your purchase",
    pointsCost: 200,
    currentBalance: 2450,
  };

  const newBalance = coupon.currentBalance - coupon.pointsCost;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topSpacer} />

        <View style={[styles.avatarContainer, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <Text style={styles.avatarEmoji}>🎁</Text>
        </View>

        <View style={styles.titleSection}>
          <Text style={[styles.titleText, { color: theme.colors.text }]}>Confirm Redemption</Text>
          <Text style={[styles.subtitleText, { color: theme.colors.textSecondary }]}>You are about to redeem:</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={[styles.cardHeader, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.cardTitle}>{coupon.title}</Text>
          </View>
          <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>{coupon.subtitle}</Text>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Points to deduct:</Text>
            <View style={[styles.summaryValue, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.summaryValueText}>-{coupon.pointsCost}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Current balance:</Text>
            <View style={[styles.summaryValue, { backgroundColor: theme.colors.surfaceSecondary }]}>
              <Text style={[styles.summaryValueText, { color: theme.colors.text }]}>{coupon.currentBalance.toLocaleString()}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.text, fontWeight: "700" }]}>New balance:</Text>
            <View style={[styles.summaryValue, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.summaryValueText}>{newBalance.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>CANCEL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push("/redeem-success")}
          >
            <Text style={styles.confirmText}>CONFIRM</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
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
  avatarEmoji: { fontSize: 38 },
  titleSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 15,
    textAlign: "center",
  },
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
  },
  cardSubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  summaryValue: {
    minWidth: 100,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryValueText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 14,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});