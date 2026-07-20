import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://vol-rewards-api.onrender.com/api";

interface RecommendedEvent {
  id: number;
  title: string;
  description?: string;
  location: string;
  event_date: string;
  points_value: number;
  category: string;
  org_name?: string;
  capacity?: number;
  registrations?: number;
  match_score?: number;
  recommendation_reason?: string;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    environment: "#10b981",
    community: "#f97316",
    education: "#3b82f6",
    health: "#ec4899",
    elderly: "#a855f7",
    youth: "#06b6d4",
    food: "#f59e0b",
    disaster: "#ef4444",
  };
  return colors[category?.toLowerCase()] || "#6366f1";
};

const getCategoryIcon = (category: string) => {
  const lower = (category || "").toLowerCase();
  if (lower.includes("environment") || lower.includes("beach")) return "leaf-outline";
  if (lower.includes("food") || lower.includes("soup")) return "restaurant-outline";
  if (lower.includes("blood") || lower.includes("health")) return "heart-outline";
  if (lower.includes("youth") || lower.includes("education")) return "school-outline";
  if (lower.includes("elderly")) return "people-outline";
  if (lower.includes("disaster")) return "shield-checkmark-outline";
  return "calendar-outline";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Upcoming";
  return date.toLocaleDateString("en-SG", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Time TBA";
  return date.toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" });
};

export default function AIRecommendations() {
  const router = useRouter();
  const { theme } = useTheme();

  const [events, setEvents] = useState<RecommendedEvent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecommendations = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const stored = await AsyncStorage.getItem("user");
      if (!stored) {
        Alert.alert("Login required", "Please login again.");
        router.replace("/login");
        return;
      }

      const token = await AsyncStorage.getItem("token");

      // ← try /ai/recommendations first
      let response = await fetch(`${BASE_URL}/ai/recommendations`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // fallback to /recommendations/:userId
      if (!response.ok && response.status === 404) {
        const user = JSON.parse(stored);
        response = await fetch(`${BASE_URL}/recommendations/${user.id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      }

      const data = await response.json();
      console.log("Recommendations response:", JSON.stringify(data));

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || "Failed to fetch recommendations.");
      }

      // ← backend wraps the list in "data" — was missing this fallback
      setEvents(data.recommendations || data.events || data.data || []);
      setCategories(data.preferred_categories || data.categories || []);
    } catch (error: any) {
      console.error("Recommendation error:", error);
      Alert.alert("Error", error.message || "Failed to load recommendations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadRecommendations(true); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    loadRecommendations(false);
  };

  const topEvents = useMemo(() => events.slice(0, 10), [events]);

  const renderEvent = ({ item, index }: { item: RecommendedEvent; index: number }) => {
    const color = getCategoryColor(item.category);
    const icon = getCategoryIcon(item.category);
    const score = item.match_score ?? Math.max(95 - index * 3, 60);
    const registrations = Number(item.registrations ?? 0);
    const capacity = Number(item.capacity ?? 1);
    const progress = capacity > 0 ? Math.min((registrations / capacity) * 100, 100) : 0;

    return (
      <View style={[styles.eventCard, { backgroundColor: theme.colors.surface, borderColor: color + "55" }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: color + "22" }]}>
            <Ionicons name={icon as any} size={14} color={color} />
            <Text style={[styles.categoryText, { color }]}>{item.category || "Event"}</Text>
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: color }]}>
            <Ionicons name="sparkles" size={11} color="#fff" />
            <Text style={styles.scoreText}>{score}% match</Text>
          </View>
        </View>

        <Text style={[styles.eventTitle, { color: theme.colors.text }]}>{item.title}</Text>

        {item.org_name && (
          <View style={styles.orgRow}>
            <Ionicons name="business-outline" size={13} color={theme.colors.textSecondary} />
            <Text style={[styles.orgText, { color: theme.colors.textSecondary }]}>{item.org_name}</Text>
          </View>
        )}

        <View style={[styles.detailsBox, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color={color} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>{formatDate(item.event_date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color={color} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>{formatTime(item.event_date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color={color} />
            <Text style={[styles.detailText, { color: theme.colors.text }]} numberOfLines={1}>{item.location}</Text>
          </View>
        </View>

        {item.recommendation_reason && (
          <View style={[styles.reasonBox, { backgroundColor: color + "14", borderColor: color + "33" }]}>
            <Ionicons name="bulb-outline" size={14} color={color} />
            <Text style={[styles.reasonText, { color }]}>{item.recommendation_reason}</Text>
          </View>
        )}

        <View style={styles.capacitySection}>
          <View style={styles.capacityRow}>
            <Text style={[styles.capacityText, { color: theme.colors.textSecondary }]}>
              {registrations}/{capacity} volunteers
            </Text>
            <Text style={[styles.pointsText, { color }]}>+{item.points_value} pts</Text>
          </View>
          <View style={[styles.progressBg, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: color }]} />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push("/events")}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.bookBtnText}>View & Book</Text>
        </TouchableOpacity>
      </View>
    );
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>AI Recommendations</Text>
          <Text style={[styles.headerSub, { color: theme.colors.textSecondary }]}>Events picked for you</Text>
        </View>
        <View style={{ width: 42 }} />
      </View>

      {categories.length > 0 && (
        <View style={styles.categoriesRow}>
          {categories.slice(0, 4).map((cat) => (
            <View key={cat} style={[styles.catPill, { backgroundColor: getCategoryColor(cat) + "22" }]}>
              <Text style={[styles.catPillText, { color: getCategoryColor(cat) }]}>{cat}</Text>
            </View>
          ))}
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>Finding your matches</Text>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Analysing your volunteer history...
          </Text>
        </View>
      ) : (
        <FlatList
          data={topEvents}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderEvent}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.colors.primary + "18" }]}>
                <Ionicons name="bulb-outline" size={42} color={theme.colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No recommendations yet</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Book and attend events to get personalised recommendations.
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
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  backBtn: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  headerCenter: { flex: 1, alignItems: "center", paddingHorizontal: 12 },
  headerTitle: { fontSize: 20, fontWeight: "900" },
  headerSub: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  categoriesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20, marginBottom: 12 },
  catPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  catPillText: { fontSize: 11, fontWeight: "800", textTransform: "capitalize" },
  list: { paddingHorizontal: 20, paddingBottom: 36 },
  eventCard: { borderRadius: 24, padding: 18, marginBottom: 16, borderWidth: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  categoryBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  categoryText: { fontSize: 11, fontWeight: "900", textTransform: "capitalize" },
  scoreBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  scoreText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  eventTitle: { fontSize: 18, fontWeight: "900", marginBottom: 8 },
  orgRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  orgText: { fontSize: 12, fontWeight: "600" },
  detailsBox: { borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 12, gap: 8 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { fontSize: 13, fontWeight: "600", flex: 1 },
  reasonBox: { borderWidth: 1, borderRadius: 14, padding: 10, flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 12 },
  reasonText: { fontSize: 12, fontWeight: "700", flex: 1, lineHeight: 17 },
  capacitySection: { marginBottom: 14 },
  capacityRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  capacityText: { fontSize: 12, fontWeight: "700" },
  pointsText: { fontSize: 13, fontWeight: "900" },
  progressBg: { height: 6, borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
  bookBtn: { borderRadius: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  bookBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30, gap: 10 },
  loadingTitle: { fontSize: 18, fontWeight: "900" },
  loadingText: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingHorizontal: 30, paddingTop: 50 },
  emptyIcon: { width: 82, height: 82, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyTitle: { fontSize: 20, fontWeight: "900", marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 18 },
  emptyBtn: { borderRadius: 16, paddingVertical: 13, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", gap: 8 },
  emptyBtnText: { color: "#fff", fontSize: 14, fontWeight: "900" },
});