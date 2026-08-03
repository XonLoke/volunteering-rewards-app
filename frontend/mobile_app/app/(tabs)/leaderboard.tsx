import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { api } from "../../src/services/api";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PODIUM_SIZE = SCREEN_WIDTH * 0.22;

interface LeaderboardEntry {
  id: number;
  name: string;
  points: number;
  rank?: string;
  total_events?: number;
  total_redeemed?: number;
}

interface LeaderboardData {
  most_points: LeaderboardEntry[];
  most_events: LeaderboardEntry[];
  most_checkins: LeaderboardEntry[];
  most_redeemed: LeaderboardEntry[];
}

type CategoryKey = "most_points" | "most_events" | "most_checkins" | "most_redeemed";

interface CategoryConfig {
  key: CategoryKey;
  label: string;
  icon: string;
  color: string;
  metricLabel: string;
}

const CATEGORIES: CategoryConfig[] = [
  { key: "most_points", label: "Top Points", icon: "trophy", color: "#f59e0b", metricLabel: "pts" },
  { key: "most_events", label: "Most Events", icon: "calendar", color: "#3b82f6", metricLabel: "events" },
  { key: "most_checkins", label: "Most Check-ins", icon: "qr-code", color: "#10b981", metricLabel: "check-ins" },
  { key: "most_redeemed", label: "Most Redeemed", icon: "gift", color: "#ec4899", metricLabel: "redeemed" },
];

function getMedalIcon(rank: number): string {
  if (rank === 1) return "medal";
  if (rank === 2) return "medal-outline";
  return "ellipse";
}

function getMedalColor(rank: number): string {
  if (rank === 1) return "#f59e0b";
  if (rank === 2) return "#94a3b8";
  if (rank === 3) return "#cd7f32";
  return "#94a3b8";
}

function getMedalSize(rank: number): number {
  if (rank === 1) return 28;
  if (rank === 2) return 24;
  return 20;
}

function PodiumCard({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const heights = [160, 120, 90];
  const height = heights[rank - 1] || 80;
  const medalIcon = getMedalIcon(rank);
  const medalColor = getMedalColor(rank);
  const medalSize = getMedalSize(rank);

  return (
    <View style={[styles.podiumCard, { height }]}>
      <View style={styles.podiumMedal}>
        <Ionicons name={medalIcon as any} size={medalSize} color={medalColor} />
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>
        {entry.name}
      </Text>
      <Text style={[styles.podiumValue, { color: medalColor }]}>
        {entry.points}
      </Text>
      <Text style={styles.podiumLabel}>pts</Text>
    </View>
  );
}

function PodiumView({ entries }: { entries: LeaderboardEntry[] }) {
  if (!entries || entries.length === 0) {
    return (
      <View style={styles.emptyPodium}>
        <Ionicons name="trophy-outline" size={40} color="#94a3b8" />
        <Text style={styles.emptyPodiumText}>No rankings yet</Text>
      </View>
    );
  }

  // Sort by points descending, take top 3
  const sorted = [...entries].sort((a, b) => b.points - a.points).slice(0, 3);

  // Arrange as 2nd → 1st → 3rd
  const podiumOrder = sorted.length >= 2
    ? [sorted[1], sorted[0], sorted[2]]
    : [sorted[0], null, null];

  // Filter out undefined
  const displayOrder = podiumOrder.filter(Boolean) as LeaderboardEntry[];

  return (
    <View style={styles.podiumContainer}>
      {displayOrder.map((entry, index) => {
        const actualRank = index === 0 ? 2 : index === 1 ? 1 : 3;
        const widths = sorted.length >= 3
          ? [80, 100, 70]
          : sorted.length === 2
            ? [90, 110]
            : [120];
        const widthIndex = sorted.length >= 3 ? index : index === 0 ? 1 : 0;
        return (
          <View key={entry.id} style={[styles.podiumItem, { width: widths[widthIndex] || 80 }]}>
            <PodiumCard entry={entry} rank={actualRank} />
          </View>
        );
      })}
    </View>
  );
}

function LeaderboardRow({ entry, rank, metricLabel }: { entry: LeaderboardEntry; rank: number; metricLabel: string }) {
  const medalColor = getMedalColor(rank);

  return (
    <View style={styles.row}>
      <View style={styles.rankBadge}>
        {rank <= 3 ? (
          <Ionicons name={getMedalIcon(rank) as any} size={18} color={medalColor} />
        ) : (
          <Text style={styles.rankText}>{rank}</Text>
        )}
      </View>

      <View style={styles.rowAvatar}>
        <Ionicons name="person-circle" size={36} color="#94a3b8" />
      </View>

      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>
          {entry.name}
        </Text>
        {entry.total_events !== undefined && (
          <Text style={styles.rowDetail}>{entry.total_events} events attended</Text>
        )}
        {entry.total_redeemed !== undefined && (
          <Text style={styles.rowDetail}>{entry.total_redeemed} points redeemed</Text>
        )}
      </View>

      <View style={styles.rowValue}>
        <Text style={[styles.rowPoints, { color: medalColor }]}>
          {entry.points}
        </Text>
        <Text style={styles.rowLabel}>{metricLabel}</Text>
      </View>
    </View>
  );
}

export default function Leaderboard() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("most_points");
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/leaderboard");
      const json = await res.json();
      if (res.ok) {
        setData(json.data || json);
      } else {
        setError(json.error?.message || "Failed to load leaderboard");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const activeConfig = CATEGORIES.find((c) => c.key === activeCategory)!;
  const entries = data ? data[activeCategory] || [] : [];
  const topEntries = [...entries].sort((a, b) => b.points - a.points);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerIcon]}>
            <Ionicons name="trophy" size={32} color={theme.colors.primary} />
          </Text>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Hall of Fame
          </Text>
          <Text style={[styles.headerSub, { color: theme.colors.textSecondary }]}>
            Top volunteers this month
          </Text>
        </View>

        {/* Loading */}
        {loading && (
          <View style={[styles.loadingBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading leaderboard...</Text>
          </View>
        )}

        {/* Error */}
        {error && !loading && (
          <View style={[styles.errorBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="cloud-offline-outline" size={36} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]} onPress={loadData}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Podium - show for most_points only */}
        {!loading && !error && activeCategory === "most_points" && (
          <View style={styles.podiumSection}>
            <PodiumView entries={entries} />
          </View>
        )}

        {/* Category Tabs */}
        {!loading && !error && (
          <View style={styles.categoryTabs}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryTab,
                  activeCategory === cat.key && { backgroundColor: cat.color + "22", borderColor: cat.color },
                  { borderColor: theme.colors.border },
                ]}
                onPress={() => setActiveCategory(cat.key)}
              >
                <Ionicons name={cat.icon as any} size={16} color={activeCategory === cat.key ? cat.color : theme.colors.textSecondary} />
                <Text style={[
                  styles.categoryTabText,
                  { color: activeCategory === cat.key ? cat.color : theme.colors.textSecondary },
                  activeCategory === cat.key && { fontWeight: "900" },
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Leaderboard List */}
        {!loading && !error && (
          <View style={[styles.listCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {topEntries.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={40} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No data yet for this category
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                  Rankings will appear as volunteers participate
                </Text>
              </View>
            ) : (
              topEntries.map((entry, index) => (
                <LeaderboardRow
                  key={`${entry.id}-${index}`}
                  entry={entry}
                  rank={index + 1}
                  metricLabel={activeConfig.metricLabel}
                />
              ))
            )}
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
  page: {
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  headerIcon: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Podium
  podiumSection: {
    marginHorizontal: 24,
    marginBottom: 20,
  },
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 6,
    paddingTop: 20,
  },
  podiumItem: {
    alignItems: "center",
  },
  podiumCard: {
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    minWidth: 70,
  },
  podiumMedal: {
    marginBottom: 6,
  },
  podiumName: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    maxWidth: 80,
    marginBottom: 4,
  },
  podiumValue: {
    fontSize: 18,
    fontWeight: "900",
  },
  podiumLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94a3b8",
    marginTop: 1,
  },
  emptyPodium: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyPodiumText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94a3b8",
  },

  // Category tabs
  categoryTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 16,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // List
  listCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(148,163,184,0.2)",
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#94a3b8",
  },
  rowAvatar: {
    marginRight: 10,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
  },
  rowDetail: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
  },
  rowValue: {
    alignItems: "center",
    marginLeft: 8,
  },
  rowPoints: {
    fontSize: 16,
    fontWeight: "900",
  },
  rowLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94a3b8",
    marginTop: 1,
  },

  // Loading / Error / Empty
  loadingBox: {
    marginHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    padding: 40,
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "700",
  },
  errorBox: {
    marginHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    padding: 40,
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ef4444",
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "800",
  },
  emptySubtext: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
