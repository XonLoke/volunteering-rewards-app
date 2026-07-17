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
// Interfaces match the backend /api/me/sponsorship-profile response shape
interface SponsorshipProfile {
  email: string;
  upline_1_email?: string | null;
  upline_2_email?: string | null;
  downline_1st_level_count: number;
  downline_2nd_level_count: number;
  downline_1st_level?: string | null;
  downline_2nd_level?: string | null;
  total_sponsorship_points: number;
}

const BASE_URL = "https://vol-rewards-api.onrender.com/api";

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

      // GET /api/referral/sponsorship-profile (route alias works with /api/me/ too)
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

  // Parse the newline-separated downline string into an array if needed
  const parseDownline = (str?: string | null): string[] => {
    if (!str) return [];
    return str.split("\n").filter(Boolean);
  };

  const downlineLevel1 = parseDownline(profile?.downline_1st_level);
  const downlineLevel2 = parseDownline(profile?.downline_2nd_level);
  const totalReferrals = profile?.downline_1st_level_count ?? 0;
  const referralPoints = profile?.total_sponsorship_points ?? 0;

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
            {/* Referral Stats Card */}
            <View style={[styles.codeCard, { backgroundColor: theme.colors.primary }]}>
              <View style={styles.codeDecorOne} />
              <View style={styles.codeDecorTwo} />
              <View style={styles.codeTop}>
                <View>
                  <Text style={styles.codeLabel}>MY REFERRALS</Text>
                  <Text style={styles.codeCaption}>
                    Invite others to volunteer and earn bonus points!
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

            {/* Sponsor Section (Upline) */}
            {profile?.upline_2_email && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Sponsor</Text>
                <View style={[styles.sponsorCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <View style={[styles.sponsorAvatar, { backgroundColor: theme.colors.primary + "22" }]}>
                    <Text style={[styles.sponsorInitial, { color: theme.colors.primary }]}>
                      {profile.upline_2_email?.[0]?.toUpperCase() || "S"}
                    </Text>
                  </View>
                  <View style={styles.sponsorInfo}>
                    <Text style={[styles.sponsorEmail, { color: theme.colors.textSecondary }]}>
                      {profile.upline_2_email}
                    </Text>
                    <Text style={[styles.sponsorBadgeText, { color: theme.colors.textSecondary, fontSize: 11 }]}>Direct Sponsor</Text>
                  </View>
                  <View style={[styles.sponsorBadge, { backgroundColor: theme.colors.primary + "18" }]}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.primary} />
                    <Text style={[styles.sponsorBadgeText, { color: theme.colors.primary }]}>Sponsor</Text>
                  </View>
                </View>
                {profile?.upline_1_email && (
                  <Text style={[styles.parentSponsor, { color: theme.colors.textSecondary }]}>
                    Parent sponsor: {profile.upline_1_email}
                  </Text>
                )}
              </View>
            )}

            {/* Downline Level 1 Section */}
            {downlineLevel1.length > 0 && (
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.sectionTitleRow}
                  onPress={() => setShowDownline(!showDownline)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Direct Referrals ({downlineLevel1.length})
                  </Text>
                  <Ionicons
                    name={showDownline ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>

                {showDownline && (
                  <View style={[styles.downlineList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    {downlineLevel1.map((member, index) => (
                      <View
                        key={index}
                        style={[
                          styles.downlineRow,
                          index < downlineLevel1.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                        ]}
                      >
                        <View style={[styles.downlineAvatar, { backgroundColor: theme.colors.primary + "18" }]}>
                          <Text style={[styles.downlineInitial, { color: theme.colors.primary }]}>
                            {member[0]?.toUpperCase() || "V"}
                          </Text>
                        </View>
                        <View style={styles.downlineInfo}>
                          <Text style={[styles.downlineEmail, { color: theme.colors.text }]} numberOfLines={1}>
                            {member}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Level 2 summary */}
            {profile && downlineLevel2.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Indirect Referrals (Level 2) — {profile.downline_2nd_level_count}
                </Text>
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                  {profile.downline_2nd_level}
                </Text>
              </View>
            )}

            {/* Empty state */}
            {!profile?.upline_2_email && downlineLevel1.length === 0 && (
              <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Ionicons name="people-outline" size={36} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No referrals yet</Text>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  Ask a friend to enter your email as their "Direct Sponsor" when registering. You'll earn points when they join!
                </Text>
              </View>
            )}

            {/* How it works */}
            <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>How Sponsorship Works</Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                • Recruit someone directly: earn 10 pts{"\n"}
                • Recruit with upline help: earn 4 pts (upline gets 6){"\n"}
                • Help your downline recruit: earn 6 pts{"\n"}
                • New volunteers can enter your email as their "Direct Sponsor" when registering
              </Text>
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
  codeCaption: { color: "rgba(255,255,255,0.82)", fontSize: 12, fontWeight: "600", maxWidth: 250 },
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
  sponsorEmail: { fontSize: 14, fontWeight: "600" },
  sponsorBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  sponsorBadgeText: { fontSize: 11, fontWeight: "800" },
  parentSponsor: { fontSize: 12, fontWeight: "600", marginTop: 8, textAlign: "center" },
  emptyCard: { borderWidth: 1, borderRadius: 22, padding: 24, alignItems: "center", gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: "900" },
  emptyText: { fontSize: 13, fontWeight: "600", textAlign: "center", lineHeight: 19 },
  downlineList: { borderWidth: 1, borderRadius: 22, overflow: "hidden" },
  downlineRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  downlineAvatar: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  downlineInitial: { fontSize: 16, fontWeight: "900" },
  downlineInfo: { flex: 1 },
  infoCard: { borderWidth: 1, borderRadius: 22, padding: 20, marginBottom: 20 },
  infoText: { fontSize: 13, fontWeight: "600", lineHeight: 22 },
});
