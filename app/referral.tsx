import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.72.201:3000/api";

const COLORS = ["#8b5cf6", "#6366f1", "#10b981", "#f59e0b", "#ef4444"];

async function apiAuthGet(path: string) {
  const stored = await AsyncStorage.getItem("user");
  if (!stored) throw new Error("Not logged in");
  const user = JSON.parse(stored);
  const resp = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || data.message || "Request failed");
  return data;
}

export default function Referral() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState<any>(null);

  const loadStats = useCallback(async () => {
    try {
      setError(null);
      const [codeData, statsData] = await Promise.all([
        apiAuthGet("/me/referral-code"),
        apiAuthGet("/me/referral-stats"),
      ]);
      setReferralCode(codeData.referral_code || "");
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Failed to load referral data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { setLoading(true); loadStats(); }, [loadStats])
  );

  const onRefresh = () => { setRefreshing(true); loadStats(); };

  const copyCode = () => {
    if (referralCode) {
      Alert.alert("Referral Code", `Your code: ${referralCode}\n\nShare this code with friends!`);
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={COLORS[0]} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Referral Program</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadStats} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Referral Code Card */}
        <View style={[styles.card, { backgroundColor: COLORS[0] }]}>
          <Text style={styles.cardLabel}>Your Referral Code</Text>
          <Text style={styles.cardCode}>{referralCode || "------"}</Text>
          <Text style={styles.cardSub}>Share this code with friends to earn bonus points!</Text>
          <TouchableOpacity style={styles.copyBtn} onPress={copyCode}>
            <Ionicons name="copy-outline" size={16} color="#fff" />
            <Text style={styles.copyText}>Tap to view</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {stats && (
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.statValue, { color: COLORS[0] }]}>{stats.level_1_count}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Level 1</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.statValue, { color: COLORS[1] }]}>{stats.level_2_count}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Level 2</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.statValue, { color: COLORS[2] }]}>{stats.total_points_earned}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Points Earned</Text>
              </View>
            </View>

            {/* Downline Level 1 */}
            {stats.downline_1st_level && (
              <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Level 1 Downline</Text>
                <Text style={[styles.downlineText, { color: theme.colors.textSecondary }]}>{stats.downline_1st_level}</Text>
              </View>
            )}

            {/* Downline Level 2 */}
            {stats.downline_2nd_level && (
              <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Level 2 Downline</Text>
                <Text style={[styles.downlineText, { color: theme.colors.textSecondary }]}>{stats.downline_2nd_level}</Text>
              </View>
            )}

            {/* How it works */}
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>How It Works</Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                1. Share your referral code with friends{"\n"}
                2. They enter it when registering{"\n"}
                3. You earn 50 points when they attend their first event{"\n"}
                4. You earn 25 points for their referrals too!
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  content: { padding: 16 },
  errorBox: { backgroundColor: "#fef2f2", borderRadius: 12, padding: 16, marginBottom: 16, alignItems: "center" },
  errorText: { color: "#dc2626", fontSize: 14, marginBottom: 8 },
  retryBtn: { padding: 8 },
  retryText: { color: "#6366f1", fontWeight: "600" },
  card: { borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 20 },
  cardLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 8 },
  cardCode: { color: "#fff", fontSize: 32, fontWeight: "700", letterSpacing: 4, marginBottom: 8 },
  cardSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, textAlign: "center", marginBottom: 12 },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  copyText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statBox: { flex: 1, borderRadius: 12, padding: 16, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "700" },
  statLabel: { fontSize: 12, marginTop: 4 },
  section: { borderRadius: 12, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  downlineText: { fontSize: 13, lineHeight: 20 },
  infoText: { fontSize: 13, lineHeight: 20 },
});
