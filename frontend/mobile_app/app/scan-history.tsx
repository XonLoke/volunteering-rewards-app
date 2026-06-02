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
import { useTheme } from "../../contexts/ThemeContext";
import { api } from "../../src/services/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SCAN_HISTORY_KEY = "scanHistory";

interface Scan {
  id: number | string;
  event_id?: number;
  event_title: string;
  location?: string;
  points_value: number;
  points_awarded: number;
  scanned_at: string;
  source?: "backend" | "local";
}

const colors = ["#10b981", "#f97316", "#6366f1", "#ec4899", "#a855f7", "#06b6d4"];

const formatDate = (value?: string) => {
  if (!value) return "Unknown date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value?: string) => {
  if (!value) return "Unknown time";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown time";

  return date.toLocaleTimeString("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ScanHistory() {
  const router = useRouter();
  const { theme } = useTheme();

  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadScans();
    }, [])
  );

  const loadLocalScans = async () => {
    const storedLocal = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
    const localScans: Scan[] = storedLocal ? JSON.parse(storedLocal) : [];

    return localScans.map((scan) => ({
      ...scan,
      source: "local" as const,
    }));
  };

  const loadScans = async () => {
    try {
      setLoading(true);

      const stored = await AsyncStorage.getItem("user");

      if (!stored) {
        const localScans = await loadLocalScans();
        setScans(localScans);
        return;
      }

      const user = JSON.parse(stored);

      try {
        const response = await api.get("/me/points");
        const data = await response.json();

        if (response.ok && Array.isArray(data.scans) && data.scans.length > 0) {
          const backendScans: Scan[] = data.scans.map((scan: Scan) => ({
            ...scan,
            source: "backend" as const,
          }));

          setScans(backendScans);
          return;
        }
      } catch (backendErr) {
        console.log("Backend scan history skipped:", backendErr);
      }

      const localScans = await loadLocalScans();
      setScans(localScans);
    } catch (err) {
      console.error("Failed to load scan history:", err);
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadScans();
    } finally {
      setRefreshing(false);
    }
  };

  const totalPointsEarned = scans.reduce((sum, scan) => {
    const points = Number(scan.points_awarded || scan.points_value || 0);
    return sum + (Number.isNaN(points) ? 0 : points);
  }, 0);

  const latestScan = scans[0];

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.iconButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerMini, { color: theme.colors.textSecondary }]}>
            Attendance
          </Text>

          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Scan History
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.iconButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={onRefresh}
          activeOpacity={0.85}
        >
          <Ionicons name="refresh" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
        >
          <View style={styles.summaryDecorOne} />
          <View style={styles.summaryDecorTwo} />

          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>TOTAL POINTS EARNED</Text>

              <Text style={styles.summaryPoints}>
                +{totalPointsEarned.toLocaleString()}
              </Text>

              <Text style={styles.summaryCaption}>
                From {scans.length} confirmed scan
                {scans.length !== 1 ? "s" : ""}
              </Text>
            </View>

            <View style={styles.summaryIconBox}>
              <Ionicons name="analytics-outline" size={30} color="#fff" />
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={[styles.statIconBox, { backgroundColor: "#10b98122" }]}>
              <Ionicons name="scan-outline" size={23} color="#10b981" />
            </View>

            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {scans.length}
            </Text>

            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total scans
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={[styles.statIconBox, { backgroundColor: "#f59e0b22" }]}>
              <Ionicons name="trophy-outline" size={23} color="#f59e0b" />
            </View>

            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {latestScan ? `+${latestScan.points_awarded || latestScan.points_value}` : "+0"}
            </Text>

            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Latest reward
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recent Activity
            </Text>

            <Text style={[styles.sectionSub, { color: theme.colors.textSecondary }]}>
              Your confirmed attendance records
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.openQrButton,
              { backgroundColor: theme.colors.primary + "18" },
            ]}
            onPress={() => router.push("/scan" as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="qr-code-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.openQrText, { color: theme.colors.primary }]}>
              My QR
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View
            style={[
              styles.loadingCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />

            <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>
              Loading scan history
            </Text>

            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Checking your latest attendance records.
            </Text>
          </View>
        ) : scans.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIconBox,
                { backgroundColor: theme.colors.primary + "18" },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={38}
                color={theme.colors.primary}
              />
            </View>

            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No scans yet
            </Text>

            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Once an organiser scans your volunteer QR code, your attendance
              record and points will appear here.
            </Text>

            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push("/scan" as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="qr-code-outline" size={18} color="#fff" />
              <Text style={styles.emptyButtonText}>Open My QR Code</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.timeline}>
            {scans.map((scan, index) => {
              const color = colors[index % colors.length];
              const points = scan.points_awarded || scan.points_value || 0;

              return (
                <View key={`${scan.id}-${index}`} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: color,
                          shadowColor: color,
                        },
                      ]}
                    >
                      <Ionicons name="checkmark" size={15} color="#fff" />
                    </View>

                    {index !== scans.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          { backgroundColor: theme.colors.border },
                        ]}
                      />
                    )}
                  </View>

                  <View
                    style={[
                      styles.scanCard,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <View style={styles.scanCardTop}>
                      <View style={styles.scanTitleWrap}>
                        <Text
                          style={[styles.scanEvent, { color: theme.colors.text }]}
                          numberOfLines={1}
                        >
                          {scan.event_title || "Volunteer Event"}
                        </Text>

                        <Text
                          style={[
                            styles.scanDate,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          {formatDate(scan.scanned_at)} · {formatTime(scan.scanned_at)}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.pointsPill,
                          { backgroundColor: color + "20" },
                        ]}
                      >
                        <Text style={[styles.pointsText, { color }]}>
                          +{points}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.scanMetaRow}>
                      <Ionicons
                        name="location-outline"
                        size={15}
                        color={theme.colors.textSecondary}
                      />

                      <Text
                        style={[
                          styles.scanLocation,
                          { color: theme.colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {scan.location || "Location not provided"}
                      </Text>
                    </View>

                    <View style={styles.scanFooter}>
                      <View
                        style={[
                          styles.sourcePill,
                          {
                            backgroundColor:
                              scan.source === "backend"
                                ? "#10b98118"
                                : "#6366f118",
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            scan.source === "backend"
                              ? "cloud-done-outline"
                              : "phone-portrait-outline"
                          }
                          size={13}
                          color={
                            scan.source === "backend" ? "#10b981" : "#6366f1"
                          }
                        />

                        <Text
                          style={[
                            styles.sourceText,
                            {
                              color:
                                scan.source === "backend" ? "#10b981" : "#6366f1",
                            },
                          ]}
                        >
                          {scan.source === "backend" ? "Synced" : "Saved locally"}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.scanId,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        #{String(scan.id).slice(-6)}
                      </Text>
                    </View>
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
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 14,
  },
  headerMini: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 38,
  },
  summaryCard: {
    borderRadius: 34,
    padding: 24,
    marginTop: 8,
    marginBottom: 14,
    overflow: "hidden",
    position: "relative",
  },
  summaryDecorOne: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.09)",
    top: -85,
    right: -60,
  },
  summaryDecorTwo: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -45,
    left: 22,
  },
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 1,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  summaryPoints: {
    color: "#fff",
    fontSize: 52,
    fontWeight: "900",
    lineHeight: 58,
  },
  summaryCaption: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 235,
  },
  summaryIconBox: {
    width: 60,
    height: 60,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },
  statIconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  openQrButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    gap: 6,
  },
  openQrText: {
    fontSize: 12,
    fontWeight: "900",
  },
  loadingCard: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 28,
    alignItems: "center",
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 16,
    marginBottom: 6,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 28,
    alignItems: "center",
  },
  emptyIconBox: {
    width: 76,
    height: 76,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 20,
  },
  emptyButton: {
    height: 50,
    borderRadius: 18,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },
  timeline: {
    paddingBottom: 10,
  },
  timelineItem: {
    flexDirection: "row",
  },
  timelineLeft: {
    width: 34,
    alignItems: "center",
  },
  timelineDot: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 5,
    marginBottom: 5,
  },
  scanCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
  },
  scanCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  scanTitleWrap: {
    flex: 1,
  },
  scanEvent: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
  },
  scanDate: {
    fontSize: 12,
    fontWeight: "700",
  },
  pointsPill: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: "900",
  },
  scanMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  scanLocation: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  scanFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sourcePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: "900",
  },
  scanId: {
    fontSize: 11,
    fontWeight: "800",
  },
});