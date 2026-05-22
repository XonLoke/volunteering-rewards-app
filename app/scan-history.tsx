import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

const scans = [
  { id: "1", event: "Beach Cleanup", location: "East Coast Park", date: "May 12, 2026", time: "9:14 AM", points: 50, color: "#10b981" },
  { id: "2", event: "Food Bank Volunteer", location: "Downtown Food Bank", date: "May 8, 2026", time: "2:30 PM", points: 40, color: "#f97316" },
  { id: "3", event: "Park Restoration", location: "Botanic Gardens", date: "May 3, 2026", time: "8:00 AM", points: 60, color: "#6366f1" },
  { id: "4", event: "Youth Tutoring", location: "Toa Payoh CC", date: "Apr 20, 2026", time: "11:45 AM", points: 30, color: "#ec4899" },
];

export default function ScanHistory() {
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
            onPress={() => router.push("/home")}
          >
            <Text style={[styles.backText, { color: theme.colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Scan History</Text>
          <View style={styles.spacer} />
        </View>

        {/* Count pill */}
        <View style={styles.countRow}>
          <View style={[styles.countPill, { backgroundColor: accent + "20", borderColor: accent + "40" }]}>
            <Text style={[styles.countText, { color: accent }]}>🔍  {scans.length} total scans</Text>
          </View>
        </View>

        {/* Scan list */}
        <View style={styles.listSection}>
          {scans.map((scan) => (
            <View
              key={scan.id}
              style={[styles.scanCard, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderLeftColor: scan.color,
              }]}
            >
              <View style={styles.scanTop}>
                <Text style={[styles.scanEvent, { color: theme.colors.text }]}>{scan.event}</Text>
                <Text style={[styles.scanPoints, { color: scan.color }]}>+{scan.points} pts</Text>
              </View>
              <Text style={[styles.scanLocation, { color: theme.colors.textSecondary }]}>📍 {scan.location}</Text>
              <Text style={[styles.scanDate, { color: theme.colors.textTertiary }]}>{scan.date} · {scan.time}</Text>
            </View>
          ))}
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
  countRow: { paddingHorizontal: 20, marginBottom: 20 },
  countPill: {
    alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 20, borderWidth: 1,
  },
  countText: { fontSize: 13, fontWeight: "700" },
  listSection: { paddingHorizontal: 20, gap: 12 },
  scanCard: {
    borderRadius: 18, borderWidth: 1, borderLeftWidth: 4,
    padding: 16, gap: 4,
  },
  scanTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 4,
  },
  scanEvent: { fontSize: 15, fontWeight: "800" },
  scanPoints: { fontSize: 14, fontWeight: "800" },
  scanLocation: { fontSize: 12, fontWeight: "500" },
  scanDate: { fontSize: 11, fontWeight: "500", marginTop: 2 },
});