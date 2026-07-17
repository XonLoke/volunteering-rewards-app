import {
  ActivityIndicator,
  Alert,
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

interface DownlineMember {
  id: number;
  name: string;
  email: string;
  points: number;
  joined_at: string;
}

interface SponsorshipProfile {
  referral_code?: string;
  sponsor?: {
    id: number;
    name: string;
    email: string;
  } | null;
  downline?: DownlineMember[];
  total_referrals?: number;
  referral_points_earned?: number;
  referral_points?: number;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-SG", {
    day: "numeric", month: "short", year: "numeric",
  });
};

export default function Referral() {
  const router = useRouter();
  const { theme } = useTheme();

  const [profile, setProfile] = useState<SponsorshipProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDownline, setShowDownline] = useState(false);

  const loadProfile = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      const stored = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (!stored) {
        Alert.alert("Login required", "Please login again.");
        router.replace("/login");
        return;
      }

      // ← changed to /referral/sponsorship-profile
      const res = await fetch(`${BASE_URL}/referral/sponsorship-profile`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      console.log("Referral status:", res.status);
      console.log("Referral response:", JSON.stringify(data));

      if (!res.ok) {
        if (res.status === 401) {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          Alert.alert("Session expired", "Please login again.");
          router.replace("/login");
          return;
        }
        throw new Error(data.error?.message || data.message || "Failed to load referral profile.");
      }

      setProfile(data);
    } catch (err: any) {
      console.error("Referral error:", err);
      setError(err.message || "Failed to load referral profile.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadProfile(true); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile(false);
  };

  const downline = profile?.downline || [];
  const totalReferrals = profile?.total_referrals ?? downline.length;
  const referralPoints = profile?.referral_points_earned ?? profile?.referral_points ?? 0;

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
          <Text style={[styles.headerMini, { color: theme.colors.textSecondary }]}>Rewards</Text>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Sponsorship</Text>
        </View>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>Loading referral info</Text>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Fetching your sponsorship profile...
            </Text>
          </View>
        ) : error ? (
          <View style={[styles.errorCard, { backgroundColor: "#ef444418", borderColor: "#ef444440" }]}>
            <Ionicons name="alert-circle-outline" size={28} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => loadProfile(true)}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Referral Code Card */}
            <View style={[styles.codeCard, { backgroundColor: theme.colors.primary }]}>
              <View style={styles.codeDecorOne} />
              <View style={styles.codeDecorTwo} />
              <View style={styles.codeTop}>
                <View>
                  <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
                  <Text style={styles.codeValue}>
                    {profile?.referral_code || "N/A"}
                  </Text>
                  <Text style={styles.codeCaption}>
                    Share this code to invite others to volunteer
                  </Text>
                </View>
                <View style={styles.codeIconBox}>
                  <Ionicons name="people-outline" size={30} color="#fff" />
                </View>
              </View>

              <View style={styles.codeStatsRow}>
                <View style={styles.codeStat}>
                  <Text style={styles.codeStatValue}>{totalReferrals}</Text>
                  <Text style={styles.codeStatLabel}>Referrals</Text>
                </View>
                <View style={styles.codeStatDivider} />
                <View style={styles.codeStat}>
                  <Text style={styles.codeStatValue}>+{referralPoints}</Text>
                  <Text style={styles.codeStatLabel}>Pts Earned</Text>
                </View>
              </View>
            </View>

            {/* Sponsor Section */}
            {profile?.sponsor && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Sponsor</Text>
                <View style={[styles.sponsorCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <View style={[styles.sponsorAvatar, { backgroundColor: theme.colors.primary + "22" }]}>
                    <Text style={[styles.sponsorInitial, { color: theme.colors.primary }]}>
                      {profile.sponsor.name?.[0]?.toUpperCase() || "V"}
                    </Text>
                  </View>
                  <View style={styles.sponsorInfo}>
                    <Text style={[styles.sponsorName, { color: theme.colors.text }]}>
                      {profile.sponsor.name}
                    </Text>
                    <Text style={[styles.sponsorEmail, { color: theme.colors.textSecondary }]}>
                      {profile.sponsor.email}
                    </Text>
                  </View>
                  <View style={[styles.sponsorBadge, { backgroundColor: theme.colors.primary + "18" }]}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.primary} />
                    <Text style={[styles.sponsorBadgeText, { color: theme.colors.primary }]}>Sponsor</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Downline Section */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.sectionTitleRow}
                onPress={() => setShowDownline(!showDownline)}
                activeOpacity={0.8}
              >
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Referred Volunteers ({downline.length})
                </Text>
                <Ionicons
                  name={showDownline ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>

              {downline.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <Ionicons name="people-outline" size={36} color={theme.colors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No referrals yet</Text>
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    Share your referral code to invite volunteers and earn bonus points!
                  </Text>
                </View>
              ) : showDownline ? (
                <View style={[styles.downlineList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  {downline.map((member, index) => (
                    <View
                      key={member.id}
                      style={[
                        styles.downlineRow,
                        index < downline.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                      ]}
                    >
                      <View style={[styles.downlineAvatar, { backgroundColor: theme.colors.primary + "18" }]}>
                        <Text style={[styles.downlineInitial, { color: theme.colors.primary }]}>
                          {member.name?.[0]?.toUpperCase() || "V"}
                        </Text>
                      </View>
                      <View style={styles.downlineInfo}>
                        <Text style={[styles.downlineName, { color: theme.colors.text }]}>{member.name}</Text>
                        <Text style={[styles.downlineEmail, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                          {member.email}
                        </Text>
                        <Text style={[styles.downlineDate, { color: theme.colors.textSecondary }]}>
                          Joined {formatDate(member.joined_at)}
                        </Text>
                      </View>
                      <View style={[styles.downlinePoints, { backgroundColor: "#10b98118" }]}>
                        <Text style={styles.downlinePointsValue}>{member.points}</Text>
                        <Text style={styles.downlinePointsLabel}>pts</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.showBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={() => setShowDownline(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="eye-outline" size={18} color={theme.colors.primary} />
                  <Text style={[styles.showBtnText, { color: theme.colors.primary }]}>
                    Show {downline.length} referred volunteer{downline.length !== 1 ? "s" : ""}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
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
  loadingContainer: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 },
  loadingTitle: { fontSize: 17, fontWeight: "900" },
  loadingText: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  errorCard: { borderWidth: 1, borderRadius: 22, padding: 24, alignItems: "center", gap: 12, marginTop: 20 },
  errorText: { color: "#ef4444", fontSize: 14, fontWeight: "600", textAlign: "center" },
  retryBtn: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24 },
  retryText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  codeCard: { borderRadius: 30, padding: 22, marginTop: 8, marginBottom: 24, overflow: "hidden", position: "relative" },
  codeDecorOne: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.09)", top: -70, right: -55 },
  codeDecorTwo: { position: "absolute", width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(255,255,255,0.07)", bottom: -40, left: 18 },
  codeTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", zIndex: 1 },
  codeLabel: { color: "rgba(255,255,255,0.72)", fontSize: 11, fontWeight: "900", letterSpacing: 1.3, marginBottom: 8 },
  codeValue: { color: "#fff", fontSize: 36, fontWeight: "900", letterSpacing: 2, marginBottom: 6 },
  codeCaption: { color: "rgba(255,255,255,0.82)", fontSize: 12, fontWeight: "600", maxWidth: 220 },
  codeIconBox: { width: 58, height: 58, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  codeStatsRow: { flexDirection: "row", marginTop: 20, backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 18, paddingVertical: 12, zIndex: 1 },
  codeStat: { flex: 1, alignItems: "center" },
  codeStatValue: { color: "#fff", fontSize: 20, fontWeight: "900" },
  codeStatLabel: { color: "rgba(255,255,255,0.72)", fontSize: 11, fontWeight: "800", marginTop: 2 },
  codeStatDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.22)" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "900", marginBottom: 12 },
  sectionTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sponsorCard: { borderWidth: 1, borderRadius: 22, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  sponsorAvatar: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  sponsorInitial: { fontSize: 20, fontWeight: "900" },
  sponsorInfo: { flex: 1 },
  sponsorName: { fontSize: 15, fontWeight: "800" },
  sponsorEmail: { fontSize: 12, fontWeight: "600", marginTop: 3 },
  sponsorBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  sponsorBadgeText: { fontSize: 11, fontWeight: "800" },
  emptyCard: { borderWidth: 1, borderRadius: 22, padding: 24, alignItems: "center", gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: "900" },
  emptyText: { fontSize: 13, fontWeight: "600", textAlign: "center", lineHeight: 19 },
  downlineList: { borderWidth: 1, borderRadius: 22, overflow: "hidden" },
  downlineRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  downlineAvatar: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  downlineInitial: { fontSize: 16, fontWeight: "900" },
  downlineInfo: { flex: 1 },
  downlineName: { fontSize: 14, fontWeight: "800" },
  downlineEmail: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  downlineDate: { fontSize: 11, fontWeight: "700", marginTop: 2 },
  downlinePoints: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, alignItems: "center" },
  downlinePointsValue: { color: "#10b981", fontSize: 14, fontWeight: "900" },
  downlinePointsLabel: { color: "#10b981", fontSize: 10, fontWeight: "800" },
  showBtn: { borderWidth: 1, borderRadius: 18, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  showBtnText: { fontSize: 14, fontWeight: "700" },
});