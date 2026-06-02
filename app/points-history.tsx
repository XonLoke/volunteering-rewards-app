import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.72.201:3000/api";

interface HistoryItem {
  id: number;
  event_title: string;
  points_awarded: number;
  scanned_at: string;
  type: "earn";
}

export default function PointsHistory() {
  const router = useRouter();
  const { theme } = useTheme();
  const accent = "#22d3a5";
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem("user");
        if (!stored) return;
        const user = JSON.parse(stored);
        setTotalPoints(user.points || 0);

        const res = await fetch(`${BASE_URL}/scans?user_id=${user.id}`);
        const data = await res.json();
        const scans = (data.scans || []).map((s: any) => ({
          id: s.id,
          event_title: s.event_title,
          points_awarded: s.points_awarded,
          scanned_at: s.scanned_at,
          type: "earn",
        }));
        setHistory(scans);
      } catch (err) {
        console.error("Failed to load points history:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Points History</Text>
          <View style={styles.spacer} />
        </View>

        {/* Total */}
        <View style={[styles.totalCard, { backgroundColor: accent }]}>
          <Text style={styles.totalLabel}>TOTAL POINTS</Text>
          <Text style={styles.totalNum}>{totalPoints.toLocaleString()}</Text>
          <View style={styles.totalDecor} />
        </View>

        {/* List */}
        <View style={styles.listSection}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Recent Activity</Text>

          {loading ? (
            <ActivityIndicator size="large" color={accent} style={{ marginTop: 40 }} />
          ) : history.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="stats-chart-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No activity yet</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Start scanning events to earn points!</Text>
            </View>
          ) : (
            <View style={[styles.listCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              {history.map((item, index) => {
                const date = new Date(item.scanned_at);
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.historyRow,
                      index < history.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                    ]}
                  >
                    <View style={[styles.historyIcon, { backgroundColor: accent + "20" }]}>
                      <Ionicons name="arrow-up-outline" size={18} color={accent} />
                    </View>
                    <View style={styles.historyText}>
                      <Text style={[styles.historyLabel, { color: theme.colors.text }]}>{item.event_title}</Text>
                      <Text style={[styles.historyDate, { color: theme.colors.textSecondary }]}>
                        {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </View>
                    <Text style={[styles.historyPoints, { color: accent }]}>
                      +{item.points_awarded} pts
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
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
  historyText: { flex: 1 },
  historyLabel: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  historyDate: { fontSize: 11, fontWeight: "500" },
  historyPoints: { fontSize: 14, fontWeight: "800" },
  empty: { alignItems: "center", marginTop: 40, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginTop: 16, marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: "center" },
});