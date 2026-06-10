import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
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
  const [profile, setProfile] = useState<any>(null);

  const loadProfile = useCallback(async () => {
    try {
      setError(null);
      const data = await apiAuthGet("/me/sponsorship-profile");
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "Failed to load sponsorship data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { setLoading(true); loadProfile(); }, [loadProfile])
  );

  const onRefresh = () => { setRefreshing(true); loadProfile(); };

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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Sponsorship</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadProfile} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {profile && (
          <>
            {/* My Upline */}
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>My Upline</Text>
              <View style={styles.row}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Direct Sponsor:</Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>{profile.upline_2_email || '(none)'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Parent Sponsor:</Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>{profile.upline_1_email || '(none)'}</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.statValue, { color: COLORS[0] }]}>{profile.downline_1st_level_count}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Level 1</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.statValue, { color: COLORS[1] }]}>{profile.downline_2nd_level_count}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Level 2</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.statValue, { color: COLORS[2] }]}>{profile.total_sponsorship_points}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Points Earned</Text>
              </View>
            </View>

            {/* Downline Level 1 */}
            {profile.downline_1st_level ? (
              <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Downline Level 1 — {profile.downline_1st_level_count}</Text>
                <Text style={[styles.downlineText, { color: theme.colors.textSecondary }]}>{profile.downline_1st_level}</Text>
              </View>
            ) : null}

            {/* Downline Level 2 */}
            {profile.downline_2nd_level ? (
              <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Downline Level 2 — {profile.downline_2nd_level_count}</Text>
                <Text style={[styles.downlineText, { color: theme.colors.textSecondary }]}>{profile.downline_2nd_level}</Text>
              </View>
            ) : null}

            {/* How it works */}
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>How Sponsorship Works</Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                • Recruit someone directly: earn 10 pts{"\n"}
                • Recruit with upline help: earn 4 pts (upline gets 6){"\n"}
                • Help your downline recruit: earn 6 pts{"\n"}
                • New volunteers can enter upline emails when registering
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
  card: { borderRadius: 12, padding: 16, marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: "500" },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statBox: { flex: 1, borderRadius: 12, padding: 16, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "700" },
  statLabel: { fontSize: 12, marginTop: 4 },
  section: { borderRadius: 12, padding: 16, marginBottom: 12 },
  downlineText: { fontSize: 13, lineHeight: 20 },
  infoText: { fontSize: 13, lineHeight: 20 },
});
