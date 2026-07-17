import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useMemo, useState } from "react";

const BASE_URL = "https://vol-rewards-api.onrender.com/api";

interface LeaderboardUser {
  id: number;
  name: string;
  email: string;
  points: number;
  rank: number;
}

export default function HallOfFame() {
  const router = useRouter();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const handleSessionExpired = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("userPoints");
    await AsyncStorage.removeItem("bookedEvents");

    setLeaderboard([]);
    setMyRank(null);
    setCurrentUserId(null);

    Alert.alert(
      "Session expired",
      "Your account session is no longer valid. Please log in again.",
      [{ text: "OK", onPress: () => router.replace("/login") }]
    );
  };

  const loadLeaderboard = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const stored = await AsyncStorage.getItem("user");

      if (!stored) {
        Alert.alert("Login required", "Please login again.");
        router.replace("/login");
        return;
      }

      const user = JSON.parse(stored);
      setCurrentUserId(Number(user.id));

      const token = await AsyncStorage.getItem("token"); // ← added

      const response = await fetch(`${BASE_URL}/leaderboard?user_id=${user.id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data.error?.message || data.message || data.error || "Failed to fetch leaderboard.";

        if (
          response.status === 401 ||
          response.status === 403 ||
          response.status === 404 ||
          message.toLowerCase().includes("user") ||
          message.toLowerCase().includes("not found") ||
          message.toLowerCase().includes("unauthorized") ||
          message.toLowerCase().includes("invalid")
        ) {
          await handleSessionExpired();
          return;
        }

        throw new Error(message);
      }

      setLeaderboard(data.leaderboard || []);
      setMyRank(data.my_rank || null);
    } catch (error: any) {
      console.error("Leaderboard error:", error);

      const message = error.message || "Failed to load Hall of Fame.";

      if (
        message.toLowerCase().includes("user") ||
        message.toLowerCase().includes("not found") ||
        message.toLowerCase().includes("unauthorized") ||
        message.toLowerCase().includes("invalid")
      ) {
        await handleSessionExpired();
        return;
      }

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLeaderboard(true);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboard(false);
  };

  const topThree = useMemo(() => {
    return leaderboard.filter((user) => Number(user.rank) <= 3);
  }, [leaderboard]);

  const restLeaderboard = useMemo(() => {
    return leaderboard.filter((user) => Number(user.rank) > 3);
  }, [leaderboard]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return "#f59e0b";
    if (rank === 2) return "#94a3b8";
    if (rank === 3) return "#f97316";
    return theme.colors.primary;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "trophy";
    if (rank === 2) return "medal";
    if (rank === 3) return "ribbon";
    return "person";
  };

  const getInitials = (name?: string, email?: string) => {
    const display = name || email || "Volunteer";
    const parts = display.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return display.slice(0, 2).toUpperCase();
  };

  const renderHeader = () => {
    return (
      <View>
        {myRank && (
          <View style={[styles.myRankCard, { backgroundColor: theme.colors.primary }]}>
            <View style={styles.rankDecorOne} />
            <View style={styles.rankDecorTwo} />

            <View style={styles.myRankTop}>
              <View>
                <Text style={styles.myRankLabel}>YOUR POSITION</Text>
                <Text style={styles.myRankTitle}>#{myRank.rank}</Text>
                <Text style={styles.myRankSub}>
                  {Number(myRank.points || 0).toLocaleString()} points earned
                </Text>
              </View>
              <View style={styles.myRankIcon}>
                <Ionicons name="trophy-outline" size={32} color="#fff" />
              </View>
            </View>

            <View style={styles.rankStatsRow}>
              <View style={styles.rankStatBox}>
                <Text style={styles.rankStatValue}>{leaderboard.length}</Text>
                <Text style={styles.rankStatLabel}>Volunteers</Text>
              </View>
              <View style={styles.rankStatBox}>
                <Text style={styles.rankStatValue}>{myRank.rank <= 3 ? "Top 3" : "Active"}</Text>
                <Text style={styles.rankStatLabel}>Status</Text>
              </View>
            </View>
          </View>
        )}

        {topThree.length > 0 && (
          <View style={[styles.podiumCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Top Volunteers</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                  Highest points earned so far
                </Text>
              </View>
              <View style={[styles.monthPill, { backgroundColor: theme.colors.primary + "14" }]}>
                <Text style={[styles.monthPillText, { color: theme.colors.primary }]}>Overall</Text>
              </View>
            </View>

            <View style={styles.podiumRow}>
              {topThree.map((user) => {
                const color = getRankColor(Number(user.rank));
                const isMe = Number(user.id) === Number(currentUserId);
                return (
                  <View key={user.id} style={styles.podiumItem}>
                    <View style={[styles.podiumAvatar, { backgroundColor: color + "20", borderColor: color + "66" }]}>
                      <Text style={[styles.podiumInitials, { color }]}>
                        {getInitials(user.name, user.email)}
                      </Text>
                      <View style={[styles.podiumRankBadge, { backgroundColor: color }]}>
                        <Text style={styles.podiumRankText}>#{user.rank}</Text>
                      </View>
                    </View>
                    <Text style={[styles.podiumName, { color: theme.colors.text }]} numberOfLines={1}>
                      {isMe ? "You" : user.name || "Volunteer"}
                    </Text>
                    <Text style={[styles.podiumPoints, { color: theme.colors.textSecondary }]}>
                      {Number(user.points || 0).toLocaleString()} pts
                    </Text>
                    <Ionicons name={getRankIcon(Number(user.rank)) as any} size={20} color={color} style={{ marginTop: 4 }} />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {leaderboard.length > 0 && (
          <View style={styles.listTitleRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Leaderboard</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                Keep volunteering to climb the ranks
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.refreshBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => loadLeaderboard(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={18} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderUser = ({ item }: { item: LeaderboardUser }) => {
    const color = getRankColor(Number(item.rank));
    const isMe = Number(item.id) === Number(currentUserId);

    return (
      <View
        style={[
          styles.rankCard,
          {
            backgroundColor: isMe ? theme.colors.primary + "10" : theme.colors.surface,
            borderColor: isMe ? theme.colors.primary + "66" : theme.colors.border,
          },
        ]}
      >
        <View style={[styles.rankNumberBox, { backgroundColor: color + "18" }]}>
          <Text style={[styles.rankNumberText, { color }]}>#{item.rank}</Text>
        </View>

        <View style={[styles.avatarCircle, { backgroundColor: color + "16" }]}>
          <Text style={[styles.avatarText, { color }]}>{getInitials(item.name, item.email)}</Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.userName, { color: theme.colors.text }]} numberOfLines={1}>
              {isMe ? "You" : item.name || "Volunteer"}
            </Text>
            {isMe && (
              <View style={[styles.youBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.youBadgeText}>YOU</Text>
              </View>
            )}
          </View>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {item.email}
          </Text>
        </View>

        <View style={styles.pointsWrap}>
          <Text style={[styles.pointsText, { color }]}>{Number(item.points || 0).toLocaleString()}</Text>
          <Text style={[styles.pointsLabel, { color: theme.colors.textSecondary }]}>pts</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Hall of Fame</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Volunteer leaderboard</Text>
        </View>

        <View style={styles.spacer} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>Loading leaderboard</Text>
          <Text style={[styles.loadingSub, { color: theme.colors.textSecondary }]}>
            Ranking volunteers by total points...
          </Text>
        </View>
      ) : (
        <FlatList
          data={restLeaderboard}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderUser}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[styles.list, leaderboard.length === 0 && styles.emptyList]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            leaderboard.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: theme.colors.primary + "18" }]}>
                  <Ionicons name="trophy-outline" size={42} color={theme.colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No ranking yet</Text>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  Volunteer points will appear here once users start earning.
                </Text>
                <TouchableOpacity
                  style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => router.push("/events")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyButtonText}>Browse Events</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 },
  backButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  headerText: { flex: 1, alignItems: "center" },
  title: { fontSize: 22, fontWeight: "900" },
  subtitle: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  spacer: { width: 42 },
  list: { paddingHorizontal: 20, paddingBottom: 34 },
  emptyList: { flexGrow: 1 },
  myRankCard: { borderRadius: 30, padding: 22, marginBottom: 18, overflow: "hidden", position: "relative" },
  rankDecorOne: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.08)", top: -70, right: -60 },
  rankDecorTwo: { position: "absolute", width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(255,255,255,0.07)", bottom: -35, left: 18 },
  myRankTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  myRankLabel: { fontSize: 11, fontWeight: "900", color: "rgba(255,255,255,0.72)", letterSpacing: 1.2 },
  myRankTitle: { fontSize: 46, fontWeight: "900", color: "#fff", marginTop: 6 },
  myRankSub: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.8)", marginTop: 2 },
  myRankIcon: { width: 60, height: 60, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  rankStatsRow: { flexDirection: "row", gap: 10, marginTop: 22 },
  rankStatBox: { backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14, minWidth: 96 },
  rankStatValue: { color: "#fff", fontSize: 17, fontWeight: "900" },
  rankStatLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "800", marginTop: 2 },
  podiumCard: { borderRadius: 26, padding: 18, borderWidth: 1, marginBottom: 22 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  sectionTitle: { fontSize: 18, fontWeight: "900" },
  sectionSubtitle: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  monthPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  monthPillText: { fontSize: 12, fontWeight: "900" },
  podiumRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  podiumItem: { flex: 1, alignItems: "center" },
  podiumAvatar: { width: 68, height: 68, borderRadius: 24, borderWidth: 1, alignItems: "center", justifyContent: "center", position: "relative", marginBottom: 10 },
  podiumInitials: { fontSize: 18, fontWeight: "900" },
  podiumRankBadge: { position: "absolute", right: -5, bottom: -5, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  podiumRankText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  podiumName: { fontSize: 13, fontWeight: "900", textAlign: "center", maxWidth: 92 },
  podiumPoints: { fontSize: 11, fontWeight: "700", marginTop: 3 },
  listTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  refreshBtn: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  rankCard: { borderRadius: 22, padding: 14, marginBottom: 12, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 11 },
  rankNumberBox: { minWidth: 44, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  rankNumberText: { fontSize: 12, fontWeight: "900" },
  avatarCircle: { width: 46, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 14, fontWeight: "900" },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  userName: { fontSize: 15, fontWeight: "900", flexShrink: 1 },
  youBadge: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  youBadgeText: { color: "#fff", fontSize: 9, fontWeight: "900" },
  userEmail: { fontSize: 11, fontWeight: "600", marginTop: 3 },
  pointsWrap: { alignItems: "flex-end" },
  pointsText: { fontSize: 15, fontWeight: "900" },
  pointsLabel: { fontSize: 10, fontWeight: "700", marginTop: 1 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  loadingTitle: { marginTop: 14, fontSize: 17, fontWeight: "900" },
  loadingSub: { marginTop: 5, fontSize: 13, fontWeight: "600", textAlign: "center" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30, paddingTop: 40 },
  emptyIcon: { width: 82, height: 82, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyTitle: { fontSize: 20, fontWeight: "900", marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 18 },
  emptyButton: { borderRadius: 16, paddingVertical: 13, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  emptyButtonText: { color: "#fff", fontSize: 14, fontWeight: "900" },
});