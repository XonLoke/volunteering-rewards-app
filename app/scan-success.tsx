import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function ScanSuccess() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        <View style={styles.checkmarkContainer}>
          <View style={[styles.checkmarkCircle, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.checkmark, { color: theme.colors.text }]}>✓</Text>
          </View>
        </View>

        <Text style={[styles.successTitle, { color: theme.colors.text }]}>Scan Successful!</Text>
        <Text style={[styles.successSubtitle, { color: theme.colors.textSecondary }]}>Points added to your account</Text>

        <View style={[styles.earnedSection, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.earnedLabel, { color: theme.colors.textSecondary }]}>You Earned</Text>
          <Text style={[styles.earnedPoints, { color: theme.colors.primaryLight }]}>+50</Text>
          <Text style={[styles.pointsText, { color: theme.colors.textSecondary }]}>points</Text>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Event:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>Food Bank Volunteer</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>New Balance:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>2,500 pts</Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity style={[styles.continueButton, { backgroundColor: theme.colors.primary }]} onPress={() => router.push('/home')}>
            <Text style={[styles.continueText, { color: theme.colors.text }]}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.historyButton, { backgroundColor: theme.colors.surfaceSecondary }]} onPress={() => router.push('/scan-history')}>
            <Text style={[styles.historyText, { color: theme.colors.primaryLight }]}>View History</Text>
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
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 56,
    fontWeight: "800",
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
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
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