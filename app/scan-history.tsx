import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://vol-rewards-api.onrender.com/api";

interface ScanRecord {
  id: number;
  event_id?: number;
  event_title?: string;
  eventName?: string;
  location?: string;
  points_awarded?: number;
  pointsEarned?: number;
  points_earned?: number;
  scanned_at?: string;
  created_at?: string;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "Unknown date";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-SG", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
};

const formatTime = (dateStr?: string) => {
  if (!dateStr) return "Unknown time";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" });
};

export default function ScanHistory() {
  const router = useRouter();
  const { theme } = useTheme();

  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  const loadScans = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const stored = await AsyncStorage.getItem("user");
      if (!stored) {
        router.replace("/login");
        return;
      }

      const user = JSON.parse(stored);
      const token = await AsyncStorage.getItem("token"); // ← added

      // try /me/events first (John's API)
      try {
        const res = await fetch(`${BASE_URL}/me/events`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        console.log("Scan history /me/events response:", JSON.stringify(data));

        if (res.ok) {
          const records = data.events || data.attendance || data.data || [];
          if (Array.isArray(records) && records.length > 0) {
            const mapped: ScanRecord[] = records.map((item: any) => ({
              id: item.id,
              event_id: item.event_id,
              event_title: item.event_title || item.title || "Volunteer Event",
              location: item.location || "Location TBA",
              points_awarded: Number(item.points_awarded ?? item.points_earned ?? item.points_value ?? 0),
              scanned_at: item.scanned_at || item.attended_at || item.created_at,
            }));

            const earned = mapped.reduce((sum, s) => sum + Number(s.points_awarded ?? 0), 0);
            setScans(mapped);
            setTotalPoints(earned);
            return;
          }
        }
      } catch (meErr) {
        console.log("/me/events skipped:", meErr);
      }

      // fallback to /attendance
      try {
        const res = await fetch(`${BASE_URL}/attendance?user_id=${user.id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        console.log("Scan history /attendance response:", JSON.stringify(data));

        if (res.ok) {
          const records = data.scans || data.attendance || data.data || [];
          const mapped: ScanRecord[] = records.map((item: any) => ({
            id: item.id,
            event_id: item.event_id,
            event_title: item.event_title || item.eventName || "Volunteer Event",
            location: item.location || "Location TBA",
            points_awarded: Number(item.points_awarded ?? item.pointsEarned ?? item.points_earned ?? 0),
            scanned_at: item.scanned_at || item.created_at,
          }));

          const earned = mapped.reduce((sum, s) => sum + Number(s.points_awarded ?? 0), 0);
          setScans(mapped);
          setTotalPoints(earned);
        }
      } catch (attendanceErr) {
        console.log("/attendance skipped:", attendanceErr);
      }
    } catch (err) {
      console.error("Failed to load scan history:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadScans(true); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    loadScans(false);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerMini, { color: theme.colors.textSecondary }]}>Attendance</Text>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Scan History</Text>
        </View>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.summaryDecorOne} />
          <View style={styles.summaryDecorTwo} />
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>TOTAL EARNED</Text>
              <Text style={styles.summaryPoints}>{totalPoints.toLocaleString()}</Text>
              <Text style={styles.summaryCaption}>Points from volunteer attendance</Text>
            </View>
            <View style={styles.summaryIconBox}>
              <Ionicons name="qr-code-outline" size={30} color="#fff" />
            </View>
          </View>
          <View style={styles.summaryStatsRow}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{scans.length}</Text>
              <Text style={styles.summaryStatLabel}>Events</Text>
            </View>
            <View style={styles.summaryStatDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>
                {scans.length > 0 ? Math.round(totalPoints / scans.length) : 0}
              </Text>
              <Text style={styles.summaryStatLabel}>Avg pts</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Attendance Records</Text>
          <Text style={[styles.sectionSub, { color: theme.colors.textSecondary }]}>
            {scans.length} record{scans.length !== 1 ? "s" : ""} found
          </Text>
        </View>

        {loading ? (
          <View style={[styles.loadingCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>Loading scan history</Text>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Fetching your attendance records...
            </Text>
          </View>
        ) : scans.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.emptyIconBox, { backgroundColor: theme.colors.primary + "18" }]}>
              <Ionicons name="qr-code-outline" size={42} color={theme.colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No scans yet</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Attend volunteer events and scan your QR code to earn points.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push("/events")}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyBtnText}>Browse Events</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.scanList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {scans.map((scan, index) => (
              <View
                key={`${scan.id}-${index}`}
                style={[
                  styles.scanRow,
                  index < scans.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                ]}
              >
                <View style={[styles.scanIconBox, { backgroundColor: theme.colors.primary + "18" }]}>
                  <Ionicons name="checkmark-circle-outline" size={22} color={theme.colors.primary} />
                </View>

                <View style={styles.scanInfo}>
                  <Text style={[styles.scanTitle, { color: theme.colors.text }]} numberOfLines={1}>
                    {scan.event_title || scan.eventName || "Volunteer Event"}
                  </Text>
                  <Text style={[styles.scanLocation, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                    {scan.location || "Location TBA"}
                  </Text>
                  <Text style={[styles.scanDate, { color: theme.colors.textSecondary }]}>
                    {formatDate(scan.scanned_at || scan.created_at)} · {formatTime(scan.scanned_at || scan.created_at)}
                  </Text>
                </View>

                <View style={[styles.pointsPill, { backgroundColor: "#10b98118" }]}>
                  <Text style={styles.scanPoints}>
                    +{Number(scan.points_awarded ?? scan.pointsEarned ?? scan.points_earned ?? 0)}
                  </Text>
                  <Text style={styles.scanPts}>pts</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  backBtn: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  headerCenter: { flex: 1, alignItems: "center", paddingHorizontal: 12 },
  headerMini: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.9, marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  scroll: { paddingHorizontal: 20, paddingBottom: 36 },
  summaryCard: { borderRadius: 30, padding: 22, marginTop: 8, marginBottom: 22, overflow: "hidden", position: "relative" },
  summaryDecorOne: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.09)", top: -70, right: -55 },
  summaryDecorTwo: { position: "absolute", width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(255,255,255,0.07)", bottom: -40, left: 18 },
  summaryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", zIndex: 1 },
  summaryLabel: { color: "rgba(255,255,255,0.72)", fontSize: 11, fontWeight: "900", letterSpacing: 1.3, marginBottom: 8 },
  summaryPoints: { color: "#fff", fontSize: 46, fontWeight: "900", lineHeight: 52 },
  summaryCaption: { color: "rgba(255,255,255,0.82)", fontSize: 13, fontWeight: "600", marginTop: 6 },
  summaryIconBox: { width: 58, height: 58, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  summaryStatsRow: { flexDirection: "row", marginTop: 20, backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 18, paddingVertical: 12, zIndex: 1 },
  summaryStat: { flex: 1, alignItems: "center" },
  summaryStatValue: { color: "#fff", fontSize: 18, fontWeight: "900" },
  summaryStatLabel: { color: "rgba(255,255,255,0.72)", fontSize: 11, fontWeight: "800", marginTop: 2 },
  summaryStatDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.22)" },
  sectionHeader: { marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "900" },
  sectionSub: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  loadingCard: { borderWidth: 1, borderRadius: 24, padding: 28, alignItems: "center", gap: 12 },
  loadingTitle: { fontSize: 17, fontWeight: "900" },
  loadingText: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  emptyCard: { borderWidth: 1, borderRadius: 24, padding: 28, alignItems: "center" },
  emptyIconBox: { width: 76, height: 76, borderRadius: 25, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 19, fontWeight: "900", marginBottom: 6 },
  emptyText: { fontSize: 14, fontWeight: "600", textAlign: "center", lineHeight: 20, marginBottom: 18 },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 18 },
  emptyBtnText: { color: "#fff", fontSize: 13, fontWeight: "900" },
  scanList: { borderWidth: 1, borderRadius: 24, overflow: "hidden" },
  scanRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  scanIconBox: { width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  scanInfo: { flex: 1 },
  scanTitle: { fontSize: 14, fontWeight: "900", marginBottom: 3 },
  scanLocation: { fontSize: 12, fontWeight: "600", marginBottom: 3 },
  scanDate: { fontSize: 11, fontWeight: "700" },
  pointsPill: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8, alignItems: "center", minWidth: 58 },
  scanPoints: { color: "#10b981", fontSize: 14, fontWeight: "900" },
  scanPts: { color: "#10b981", fontSize: 10, fontWeight: "800" },
});