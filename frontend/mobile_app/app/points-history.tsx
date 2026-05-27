import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

const history = [
  { id: "1", label: "Beach Cleanup", date: "May 12, 2026", points: +50, type: "earn" },
  { id: "2", label: "Coffee Voucher Redeemed", date: "May 10, 2026", points: -200, type: "spend" },
  { id: "3", label: "Food Bank Volunteer", date: "May 8, 2026", points: +40, type: "earn" },
  { id: "4", label: "Park Restoration", date: "May 3, 2026", points: +60, type: "earn" },
  { id: "5", label: "Movie Ticket Redeemed", date: "Apr 28, 2026", points: -150, type: "spend" },
  { id: "6", label: "Youth Tutoring", date: "Apr 20, 2026", points: +30, type: "earn" },
];

export default function PointsHistory() {
  const router = useRouter();
  const { theme } = useTheme();
  const accent = "#22d3a5";

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backText, { color: theme.colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Points History</Text>
          <View style={styles.spacer} />
        </View>

        {/* Total */}
        <View style={[styles.totalCard, { backgroundColor: accent }]}>
          <Text style={styles.totalLabel}>TOTAL POINTS</Text>
          <Text style={styles.totalNum}>2,450</Text>
          <View style={styles.totalDecor} />
        </View>

        {/* List */}
        <View style={styles.listSection}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Recent Activity</Text>
          <View style={[styles.listCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {history.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.historyRow,
                  index < history.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                ]}
              >
                <View style={[styles.historyIcon, { backgroundColor: item.type === "earn" ? accent + "20" : "#ef444420" }]}>
                  <Text style={styles.historyEmoji}>{item.type === "earn" ? "⬆️" : "⬇️"}</Text>
                </View>
                <View style={styles.historyText}>
                  <Text style={[styles.historyLabel, { color: theme.colors.text }]}>{item.label}</Text>
                  <Text style={[styles.historyDate, { color: theme.colors.textSecondary }]}>{item.date}</Text>
                </View>
                <Text style={[styles.historyPoints, { color: item.type === "earn" ? accent : "#ef4444" }]}>
                  {item.points > 0 ? `+${item.points}` : item.points} pts
                </Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: 48 },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  backText: { fontSize: 18, fontWeight: "700" },
  pageTitle: { fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
  spacer: { width: 40, height: 40 },
  totalCard: {
    marginHorizontal: 20, borderRadius: 24, padding: 28,
    marginBottom: 28, overflow: "hidden", position: "relative",
  },
  totalLabel: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: "700", letterSpacing: 1.2, marginBottom: 8 },
  totalNum: { color: "#fff", fontSize: 48, fontWeight: "900" },
  totalDecor: {
    position: "absolute", width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.12)", bottom: -30, right: -20,
  },
  listSection: { paddingHorizontal: 20 },
  sectionLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 },
  listCard: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  historyRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  historyIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  historyEmoji: { fontSize: 16 },
  historyText: { flex: 1 },
  historyLabel: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  historyDate: { fontSize: 11, fontWeight: "500" },
  historyPoints: { fontSize: 14, fontWeight: "800" },
});