import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.72.201:3000/api";

interface Scan {
  id: number;
  event_id: number;
  event_title: string;
  location: string;
  points_value: number;
  points_awarded: number;
  scanned_at: string;
}

const colors = ["#10b981", "#f97316", "#6366f1", "#ec4899", "#a855f7", "#06b6d4"];

export default function ScanHistory() {
  const router = useRouter();
  const { theme } = useTheme();
  const accent = "#22d3a5";
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const stored = await AsyncStorage.getItem("user");
        if (!stored) return;
        const user = JSON.parse(stored);

        const response = await fetch(`${BASE_URL}/scans?user_id=${user.id}`);
        const data = await response.json();
        setScans(data.scans || []);
      } catch (err) {
        console.error("Failed to fetch scans:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => router.push("/home")}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Scan History</Text>
          <View style={styles.spacer} />
        </View>

        {/* Count pill */}
        <View style={styles.countRow}>
          <View style={[styles.countPill, { backgroundColor: accent + "20", borderColor: accent + "40" }]}>
            <Ionicons name="scan-outline" size={14} color={accent} />
            <Text style={[styles.countText, { color: accent }]}>{scans.length} total scans</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : scans.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="scan-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No scans yet</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Start scanning to earn points!</Text>
          </View>
        ) : (
          <View style={styles.listSection}>
            {scans.map((scan, index) => {
              const color = colors[index % colors.length];
              const date = new Date(scan.scanned_at);
              return (
                <View
                  key={scan.id}
                  style={[styles.scanCard, {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderLeftColor: color,
                  }]}
                >
                  <View style={styles.scanTop}>
                    <Text style={[styles.scanEvent, { color: theme.colors.text }]}>{scan.event_title}</Text>
                    <Text style={[styles.scanPoints, { color }]}>+{scan.points_awarded || scan.points_value} pts</Text>
                  </View>
                  <View style={styles.scanRow}>
                    <Ionicons name="location-outline" size={12} color={theme.colors.textSecondary} />
                    <Text style={[styles.scanLocation, { color: theme.colors.textSecondary }]}>{scan.location}</Text>
                  </View>
                  <Text style={[styles.scanDate, { color: theme.colors.textTertiary }]}>
                    {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

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
  countRow: { paddingHorizontal: 20, marginBottom: 20 },
  countPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
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
  scanRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  scanLocation: { fontSize: 12, fontWeight: "500" },
  scanDate: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  empty: { alignItems: "center", marginTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginTop: 16, marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: "center" },
});