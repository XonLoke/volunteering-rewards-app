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

const getLocalPointsHistoryKey = (userId: number | string) =>
  `localPointsHistory:${userId}`;

type HistoryType = "earn" | "redeem";

interface HistoryItem {
  id: number | string;
  title: string;
  description?: string;
  points: number;
  type: HistoryType;
  created_at: string;
}

interface User {
  id: number;
  name?: string;
  email?: string;
  points?: number;
  points_balance?: number;
}

const formatDate = (value?: string) => {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-SG", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
};

const formatTime = (value?: string) => {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" });
};

export default function PointsHistory() {
  const router = useRouter();
  const { theme } = useTheme();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [redeemedPoints, setRedeemedPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    try {
      setLoading(true);

      const stored = await AsyncStorage.getItem("user");
      if (!stored) {
        setHistory([]); setTotalPoints(0); setEarnedPoints(0); setRedeemedPoints(0);
        return;
      }

      const user: User = JSON.parse(stored);
      const token = await AsyncStorage.getItem("token");

      await AsyncStorage.removeItem("localPointsHistory");

      const storedPoints = await AsyncStorage.getItem("userPoints");
      const currentPoints = Number(storedPoints ?? user.points_balance ?? user.points ?? 0);
      setTotalPoints(Number.isNaN(currentPoints) ? 0 : currentPoints);

      let backendHistory: HistoryItem[] = [];

      // try /me/points first (John's API)
      try {
        const pointsRes = await fetch(`${BASE_URL}/me/points`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const pointsData = await pointsRes.json();
        console.log("Points history response:", JSON.stringify(pointsData));

        if (pointsRes.ok) {
          const historyArr = pointsData.history || pointsData.transactions || pointsData.data || [];
          if (Array.isArray(historyArr) && historyArr.length > 0) {
            backendHistory = historyArr.map((item: any) => ({
              id: `backend-${item.id}`,
              title: item.title || item.event_title || item.coupon_title || "Points Activity",
              description: item.description ||
                (item.type === "redeem" ? "Coupon redemption" : "Volunteer attendance reward"),
              points: Number(item.points ?? item.points_awarded ?? 0),
              type: item.type === "redeem" ? "redeem" : "earn",
              created_at: item.created_at || item.scanned_at || item.redeemed_at,
            }));
          }
        }
      } catch (pointsErr) {
        console.log("Points history /me/points skipped:", pointsErr);
      }

      // fallback to /points-history
      if (backendHistory.length === 0) {
        try {
          const pointsRes = await fetch(`${BASE_URL}/points-history?user_id=${user.id}`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          const pointsData = await pointsRes.json();

          if (pointsRes.ok && Array.isArray(pointsData.history)) {
            backendHistory = pointsData.history.map((item: any) => ({
              id: `backend-${item.id}`,
              title: item.title || item.event_title || item.coupon_title || "Points Activity",
              description: item.description ||
                (item.type === "redeem" ? "Coupon redemption" : "Volunteer attendance reward"),
              points: Number(item.points ?? item.points_awarded ?? 0),
              type: item.type === "redeem" ? "redeem" : "earn",
              created_at: item.created_at || item.scanned_at || item.redeemed_at,
            }));
          }
        } catch (pointsHistoryErr) {
          console.log("Full points history endpoint skipped:", pointsHistoryErr);
        }
      }

      // fallback to attendance scans
      if (backendHistory.length === 0) {
        try {
          const scansRes = await fetch(`${BASE_URL}/attendance?user_id=${user.id}`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          const scansData = await scansRes.json();

          if (scansRes.ok) {
            const scansArr = scansData.scans || scansData.attendance || scansData.data || [];
            if (Array.isArray(scansArr)) {
              backendHistory = scansArr.map((scan: any) => ({
                id: `scan-${scan.id}`,
                title: scan.event_title || "Volunteer Event",
                description: scan.location || "Attendance scan reward",
                points: Number(scan.points_awarded ?? scan.points_value ?? 0),
                type: "earn" as const,
                created_at: scan.scanned_at,
              }));
            }
          }
        } catch (scanErr) {
          console.log("Scan history fallback skipped:", scanErr);
        }
      }

      const storedLocalHistory = await AsyncStorage.getItem(getLocalPointsHistoryKey(user.id));
      const localHistory: HistoryItem[] = storedLocalHistory ? JSON.parse(storedLocalHistory) : [];

      const combinedHistory = [...localHistory, ...backendHistory];

      const uniqueHistory = combinedHistory.filter((item, index, self) => {
        return index === self.findIndex(
          (other) =>
            String(other.id) === String(item.id) ||
            (other.title === item.title &&
              other.type === item.type &&
              Number(other.points) === Number(item.points) &&
              other.created_at === item.created_at)
        );
      });

      uniqueHistory.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const earned = uniqueHistory
        .filter((item) => item.type === "earn")
        .reduce((sum, item) => sum + Math.abs(Number(item.points || 0)), 0);

      const redeemed = uniqueHistory
        .filter((item) => item.type === "redeem")
        .reduce((sum, item) => sum + Math.abs(Number(item.points || 0)), 0);

      setHistory(uniqueHistory);
      setEarnedPoints(earned);
      setRedeemedPoints(redeemed);
    } catch (err) {
      console.error("Failed to load points history:", err);
      setHistory([]); setEarnedPoints(0); setRedeemedPoints(0);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerMini, { color: theme.colors.textSecondary }]}>Wallet</Text>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Points History</Text>
        </View>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={onRefresh}
          activeOpacity={0.85}
        >
          <Ionicons name="refresh" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        <View style={[styles.totalCard, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.totalDecorOne} />
          <View style={styles.totalDecorTwo} />
          <View style={styles.totalTop}>
            <View>
              <Text style={styles.totalLabel}>CURRENT BALANCE</Text>
              <Text style={styles.totalNum}>{totalPoints.toLocaleString()}</Text>
              <Text style={styles.totalCaption}>Points available for rewards redemption</Text>
            </View>
            <View style={styles.totalIconBox}>
              <Ionicons name="wallet-outline" size={31} color="#fff" />
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: "#10b98118" }]}>
              <Ionicons name="arrow-up-outline" size={22} color="#10b981" />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>+{earnedPoints.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Earned</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: "#ef444418" }]}>
              <Ionicons name="arrow-down-outline" size={22} color="#ef4444" />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>-{redeemedPoints.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Redeemed</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Activity</Text>
            <Text style={[styles.sectionSub, { color: theme.colors.textSecondary }]}>Earned and redeemed points</Text>
          </View>
          <View style={[styles.countPill, { backgroundColor: theme.colors.primary + "18" }]}>
            <Ionicons name="receipt-outline" size={15} color={theme.colors.primary} />
            <Text style={[styles.countText, { color: theme.colors.primary }]}>{history.length}</Text>
          </View>
        </View>

        {loading ? (
          <View style={[styles.loadingCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>Loading points history</Text>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Checking your latest points activity.
            </Text>
          </View>
        ) : history.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.emptyIconBox, { backgroundColor: theme.colors.primary + "18" }]}>
              <Ionicons name="stats-chart-outline" size={38} color={theme.colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No activity yet</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Complete volunteer events to earn points, then redeem them for rewards.
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push("/events" as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.emptyButtonText}>Browse Events</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.historyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {history.map((item, index) => {
              const isEarn = item.type === "earn";
              const color = isEarn ? "#10b981" : "#ef4444";
              const iconName = isEarn ? "arrow-up-outline" : "arrow-down-outline";

              return (
                <View
                  key={`${item.id}-${index}`}
                  style={[
                    styles.historyRow,
                    index < history.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                  ]}
                >
                  <View style={[styles.historyIcon, { backgroundColor: color + "18" }]}>
                    <Ionicons name={iconName as any} size={19} color={color} />
                  </View>
                  <View style={styles.historyText}>
                    <Text style={[styles.historyLabel, { color: theme.colors.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.historyDescription, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                      {item.description || (isEarn ? "Points earned" : "Points redeemed")}
                    </Text>
                    <Text style={[styles.historyDate, { color: theme.colors.textSecondary }]}>
                      {formatDate(item.created_at)} · {formatTime(item.created_at)}
                    </Text>
                  </View>
                  <View style={[styles.pointsPill, { backgroundColor: color + "14" }]}>
                    <Text style={[styles.historyPoints, { color }]}>
                      {isEarn ? "+" : "-"}{Math.abs(Number(item.points || 0)).toLocaleString()}
                    </Text>
                    <Text style={[styles.pointsText, { color }]}>pts</Text>
                  </View>
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  iconButton: { width: 46, height: 46, borderRadius: 17, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, paddingHorizontal: 14 },
  headerMini: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.9, marginBottom: 2 },
  headerTitle: { fontSize: 23, fontWeight: "900", letterSpacing: -0.6 },
  scroll: { paddingHorizontal: 20, paddingBottom: 38 },
  totalCard: { borderRadius: 34, padding: 24, marginTop: 8, marginBottom: 14, overflow: "hidden", position: "relative" },
  totalDecorOne: { position: "absolute", width: 190, height: 190, borderRadius: 95, backgroundColor: "rgba(255,255,255,0.09)", top: -85, right: -60 },
  totalDecorTwo: { position: "absolute", width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.08)", bottom: -45, left: 22 },
  totalTop: { flexDirection: "row", justifyContent: "space-between", zIndex: 1 },
  totalLabel: { color: "rgba(255,255,255,0.72)", fontSize: 11, fontWeight: "900", letterSpacing: 1.3, marginBottom: 8 },
  totalNum: { color: "#fff", fontSize: 52, fontWeight: "900", lineHeight: 58 },
  totalCaption: { color: "rgba(255,255,255,0.82)", fontSize: 13, fontWeight: "600", lineHeight: 19, marginTop: 8, maxWidth: 235 },
  totalIconBox: { width: 60, height: 60, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  statsGrid: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 24, padding: 16 },
  statIconBox: { width: 46, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: "900", marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: "700" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 19, fontWeight: "900", letterSpacing: -0.3 },
  sectionSub: { fontSize: 12, fontWeight: "700", marginTop: 2 },
  countPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, gap: 6 },
  countText: { fontSize: 12, fontWeight: "900" },
  loadingCard: { borderWidth: 1, borderRadius: 30, padding: 28, alignItems: "center" },
  loadingTitle: { fontSize: 18, fontWeight: "900", marginTop: 16, marginBottom: 6 },
  loadingText: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  emptyCard: { borderWidth: 1, borderRadius: 30, padding: 28, alignItems: "center" },
  emptyIconBox: { width: 76, height: 76, borderRadius: 25, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  emptyTitle: { fontSize: 20, fontWeight: "900", marginBottom: 8 },
  emptyText: { fontSize: 14, fontWeight: "600", lineHeight: 21, textAlign: "center", marginBottom: 20 },
  emptyButton: { height: 50, borderRadius: 18, paddingHorizontal: 20, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  emptyButtonText: { color: "#fff", fontSize: 14, fontWeight: "900", marginLeft: 8 },
  historyCard: { borderWidth: 1, borderRadius: 28, overflow: "hidden" },
  historyRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 15 },
  historyIcon: { width: 45, height: 45, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 12 },
  historyText: { flex: 1 },
  historyLabel: { fontSize: 14, fontWeight: "900", marginBottom: 3 },
  historyDescription: { fontSize: 12, fontWeight: "600", marginBottom: 3 },
  historyDate: { fontSize: 11, fontWeight: "700" },
  pointsPill: { borderRadius: 18, paddingHorizontal: 10, paddingVertical: 8, alignItems: "center", minWidth: 64 },
  historyPoints: { fontSize: 14, fontWeight: "900" },
  pointsText: { fontSize: 10, fontWeight: "800" },
});