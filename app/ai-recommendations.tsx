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

const BASE_URL = "http://192.168.72.201:3000/api";

interface RecommendedEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  event_date: string;
  capacity: number;
  points_value: number;
  category: string;
  org_name: string;
  registrations: number;
  recommendation_reason: string;
}

type AssistantQuestion = "best" | "highestMatch" | "mostPoints" | "availableSlots";

interface AssistantAnswer {
  title: string;
  eventTitle: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export default function AIRecommendations() {
  const router = useRouter();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState<RecommendedEvent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [assistantAnswer, setAssistantAnswer] =
    useState<AssistantAnswer | null>(null);

  const loadRecommendations = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const stored = await AsyncStorage.getItem("user");

      if (!stored) {
        Alert.alert("Login required", "Please login again.");
        router.replace("/login");
        return;
      }

      const user = JSON.parse(stored);

      const response = await fetch(`${BASE_URL}/recommendations/${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to fetch recommendations."
        );
      }

      setEvents(data.recommendations || []);
      setCategories(data.preferred_categories || []);
      setAssistantAnswer(null);
    } catch (error: any) {
      console.error("Recommendation error:", error);
      Alert.alert("Error", error.message || "Failed to load recommendations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecommendations(true);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadRecommendations(false);
  };

  const filterCategories = useMemo(() => {
    const eventCategories = events
      .map((event) => event.category)
      .filter(Boolean);

    return ["All", ...Array.from(new Set([...categories, ...eventCategories]))];
  }, [categories, events]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "All") return events;

    return events.filter(
      (event) =>
        event.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [events, selectedCategory]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Upcoming";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "Upcoming";

    return date.toLocaleDateString("en-SG", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "Time TBA";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "Time TBA";

    return date.toLocaleTimeString("en-SG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryColor = (category?: string) => {
    const lower = (category || "").toLowerCase();

    if (lower.includes("environment")) return "#10b981";
    if (lower.includes("community")) return "#f97316";
    if (lower.includes("health")) return "#ef4444";
    if (lower.includes("youth")) return "#6366f1";
    if (lower.includes("elderly")) return "#ec4899";
    if (lower.includes("food")) return "#f59e0b";
    if (lower.includes("education")) return "#3b82f6";

    return "#6366f1";
  };

  const getCategoryIcon = (category?: string): keyof typeof Ionicons.glyphMap => {
    const lower = (category || "").toLowerCase();

    if (lower.includes("environment")) return "leaf-outline";
    if (lower.includes("community")) return "people-outline";
    if (lower.includes("health")) return "heart-outline";
    if (lower.includes("youth")) return "school-outline";
    if (lower.includes("elderly")) return "accessibility-outline";
    if (lower.includes("food")) return "restaurant-outline";
    if (lower.includes("education")) return "book-outline";

    return "calendar-outline";
  };

  const hasAvailableSlots = (item: RecommendedEvent) => {
    const capacity = Number(item.capacity ?? 0);
    const registrations = Number(item.registrations ?? 0);

    return capacity > 0 && registrations < capacity;
  };

  const getMatchScore = (item: RecommendedEvent, index: number) => {
    const categoryMatch = categories.some(
      (category) => category.toLowerCase() === item.category?.toLowerCase()
    );

    const hasReason = Boolean(item.recommendation_reason);
    const available = hasAvailableSlots(item);

    let score = 65;

    if (categoryMatch) score += 20;
    if (hasReason) score += 7;
    if (available) score += 5;

    score -= index * 3;

    return Math.max(Math.min(score, 96), 60);
  };

  const getSuggestionLabel = (item: RecommendedEvent) => {
    const categoryMatch = categories.some(
      (category) => category.toLowerCase() === item.category?.toLowerCase()
    );

    if (categoryMatch) return "Similar to your interests";
    if (hasAvailableSlots(item)) return "Available slots";
    if (item.recommendation_reason) return "Recommended";
    return "Suggested";
  };

  const getEventIndex = (item: RecommendedEvent) => {
    const foundIndex = events.findIndex((event) => event.id === item.id);
    return foundIndex >= 0 ? foundIndex : 0;
  };

  const getBestOverallEvent = () => {
    return [...events].sort((a, b) => {
      const aIndex = getEventIndex(a);
      const bIndex = getEventIndex(b);

      const aScore =
        getMatchScore(a, aIndex) +
        Number(a.points_value ?? 0) / 10 +
        (hasAvailableSlots(a) ? 8 : 0);

      const bScore =
        getMatchScore(b, bIndex) +
        Number(b.points_value ?? 0) / 10 +
        (hasAvailableSlots(b) ? 8 : 0);

      return bScore - aScore;
    })[0];
  };

  const handleAssistantQuestion = (question: AssistantQuestion) => {
    if (events.length === 0) {
      setAssistantAnswer({
        title: "No suggestions yet",
        eventTitle: "Start by browsing events",
        message:
          "Once you book or attend events, your recommendations will become more personalised.",
        icon: "calendar-outline",
        color: theme.colors.primary,
      });
      return;
    }

    if (question === "highestMatch") {
      const bestMatch = [...events].sort((a, b) => {
        const aScore = getMatchScore(a, getEventIndex(a));
        const bScore = getMatchScore(b, getEventIndex(b));

        return bScore - aScore;
      })[0];

      const score = getMatchScore(bestMatch, getEventIndex(bestMatch));
      const color = getCategoryColor(bestMatch.category);

      setAssistantAnswer({
        title: "Highest match",
        eventTitle: `${bestMatch.title} · ${score}% match`,
        message:
          bestMatch.recommendation_reason ||
          `This event matches your volunteering activity and ${bestMatch.category || "event"} interests.`,
        icon: "sparkles-outline",
        color,
      });

      setExpandedId(bestMatch.id);
      return;
    }

    if (question === "mostPoints") {
      const mostPoints = [...events].sort(
        (a, b) => Number(b.points_value ?? 0) - Number(a.points_value ?? 0)
      )[0];

      const color = getCategoryColor(mostPoints.category);

      setAssistantAnswer({
        title: "Most points",
        eventTitle: `${mostPoints.title} · +${mostPoints.points_value} pts`,
        message:
          "This event gives the highest points among your current suggestions. You can open the card to check the date, location and available slots.",
        icon: "star-outline",
        color,
      });

      setExpandedId(mostPoints.id);
      return;
    }

    if (question === "availableSlots") {
      const availableEvents = events.filter((event) => hasAvailableSlots(event));
      const bestAvailable =
        availableEvents.sort((a, b) => {
          const aScore = getMatchScore(a, getEventIndex(a));
          const bScore = getMatchScore(b, getEventIndex(b));

          return bScore - aScore;
        })[0] || events[0];

      const color = getCategoryColor(bestAvailable.category);
      const slotsLeft =
        Number(bestAvailable.capacity ?? 0) -
        Number(bestAvailable.registrations ?? 0);

      setAssistantAnswer({
        title: availableEvents.length > 0 ? "Available slots" : "Limited slots",
        eventTitle: bestAvailable.title,
        message:
          availableEvents.length > 0
            ? `${slotsLeft} slot${slotsLeft === 1 ? "" : "s"} left. This is one of the suitable events that still has room for more volunteers.`
            : "Your current suggestions may be close to full. You can still check the Events page for more options.",
        icon: "people-outline",
        color,
      });

      setExpandedId(bestAvailable.id);
      return;
    }

    const bestOverall = getBestOverallEvent();
    const color = getCategoryColor(bestOverall.category);
    const score = getMatchScore(bestOverall, getEventIndex(bestOverall));

    setAssistantAnswer({
      title: "Best overall pick",
      eventTitle: `${bestOverall.title} · ${score}% match`,
      message:
        bestOverall.recommendation_reason ||
        "This event has the best balance of match score, available slots and points among your suggestions.",
      icon: "checkmark-circle-outline",
      color,
    });

    setExpandedId(bestOverall.id);
  };

  const renderHeader = () => {
    return (
      <View>
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.summaryTop}>
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: theme.colors.primary + "18" },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.summaryText}>
              <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
                For You
              </Text>

              <Text
                style={[
                  styles.summarySubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Events picked from your activity, saved interests and available
                opportunities.
              </Text>
            </View>
          </View>

          <View style={styles.summaryStats}>
            <View
              style={[
                styles.statBox,
                { backgroundColor: theme.colors.primary + "10" },
              ]}
            >
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {events.length}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                suggested
              </Text>
            </View>

            <View
              style={[
                styles.statBox,
                { backgroundColor: theme.colors.primary + "10" },
              ]}
            >
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {categories.length}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                interests
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.allEventsBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => router.push("/events")}
              activeOpacity={0.85}
            >
              <Text style={styles.allEventsText}>All Events</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.assistantCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.assistantHeader}>
            <View
              style={[
                styles.assistantIcon,
                { backgroundColor: theme.colors.primary + "18" },
              ]}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={22}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.assistantHeaderText}>
              <Text style={[styles.assistantTitle, { color: theme.colors.text }]}>
                Ask about your picks
              </Text>
              <Text
                style={[
                  styles.assistantSub,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Compare your recommended events quickly
              </Text>
            </View>
          </View>

          <View style={styles.questionGrid}>
            <TouchableOpacity
              style={[
                styles.questionChip,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => handleAssistantQuestion("highestMatch")}
              activeOpacity={0.85}
            >
              <Ionicons
                name="sparkles-outline"
                size={15}
                color={theme.colors.primary}
              />
              <Text style={[styles.questionText, { color: theme.colors.text }]}>
                Highest match?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.questionChip,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => handleAssistantQuestion("best")}
              activeOpacity={0.85}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={15}
                color={theme.colors.primary}
              />
              <Text style={[styles.questionText, { color: theme.colors.text }]}>
                Best overall?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.questionChip,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => handleAssistantQuestion("mostPoints")}
              activeOpacity={0.85}
            >
              <Ionicons
                name="star-outline"
                size={15}
                color={theme.colors.primary}
              />
              <Text style={[styles.questionText, { color: theme.colors.text }]}>
                Most points?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.questionChip,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => handleAssistantQuestion("availableSlots")}
              activeOpacity={0.85}
            >
              <Ionicons
                name="people-outline"
                size={15}
                color={theme.colors.primary}
              />
              <Text style={[styles.questionText, { color: theme.colors.text }]}>
                Has slots?
              </Text>
            </TouchableOpacity>
          </View>

          {assistantAnswer && (
            <View
              style={[
                styles.answerBox,
                {
                  backgroundColor: assistantAnswer.color + "10",
                  borderColor: assistantAnswer.color + "30",
                },
              ]}
            >
              <View
                style={[
                  styles.answerIcon,
                  { backgroundColor: assistantAnswer.color + "18" },
                ]}
              >
                <Ionicons
                  name={assistantAnswer.icon}
                  size={18}
                  color={assistantAnswer.color}
                />
              </View>

              <View style={styles.answerTextWrap}>
                <Text style={[styles.answerTitle, { color: assistantAnswer.color }]}>
                  {assistantAnswer.title}
                </Text>

                <Text
                  style={[styles.answerEvent, { color: theme.colors.text }]}
                  numberOfLines={2}
                >
                  {assistantAnswer.eventTitle}
                </Text>

                <Text
                  style={[
                    styles.answerMessage,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {assistantAnswer.message}
                </Text>
              </View>
            </View>
          )}
        </View>

        {filterCategories.length > 1 && (
          <View style={styles.categorySection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Browse by category
            </Text>

            <FlatList
              horizontal
              data={filterCategories}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => {
                const active = selectedCategory === item;
                const color =
                  item === "All" ? theme.colors.primary : getCategoryColor(item);

                return (
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: active ? color : theme.colors.surface,
                        borderColor: active ? color : theme.colors.border,
                      },
                    ]}
                    onPress={() => setSelectedCategory(item)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: active ? "#fff" : color },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        <View style={styles.listHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Suggested Events
            </Text>

            <Text
              style={[
                styles.listSubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              Tap an event to view more details
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.refreshBtn,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => loadRecommendations(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEvent = ({
    item,
    index,
  }: {
    item: RecommendedEvent;
    index: number;
  }) => {
    const color = getCategoryColor(item.category);
    const icon = getCategoryIcon(item.category);
    const expanded = expandedId === item.id;
    const registrations = Number(item.registrations ?? 0);
    const capacity = Number(item.capacity ?? 0);
    const progress =
      capacity > 0 ? Math.min((registrations / capacity) * 100, 100) : 0;
    const suggestionLabel = getSuggestionLabel(item);
    const matchScore = getMatchScore(item, index);

    return (
      <TouchableOpacity
        style={[
          styles.eventCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: expanded ? color + "88" : theme.colors.border,
          },
        ]}
        activeOpacity={0.9}
        onPress={() => setExpandedId(expanded ? null : item.id)}
      >
        <View style={styles.eventTop}>
          <View style={[styles.eventIcon, { backgroundColor: color + "18" }]}>
            <Ionicons name={icon} size={22} color={color} />
          </View>

          <View style={styles.eventMain}>
            <View style={styles.eventTitleRow}>
              <Text
                style={[styles.eventTitle, { color: theme.colors.text }]}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={theme.colors.textSecondary}
              />
            </View>

            <Text
              style={[styles.eventOrg, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.org_name || "Volunteer Organisation"}
            </Text>
          </View>
        </View>

        <View style={styles.suggestionRow}>
          <View style={[styles.suggestionBadge, { backgroundColor: color + "14" }]}>
            <Text style={[styles.suggestionBadgeText, { color }]}>
              {suggestionLabel}
            </Text>
          </View>

          <View style={[styles.matchBadge, { backgroundColor: color + "10" }]}>
            <Text style={[styles.matchBadgeText, { color }]}>
              {matchScore}% match
            </Text>
          </View>
        </View>

        <Text
          style={[styles.eventDescription, { color: theme.colors.textSecondary }]}
          numberOfLines={expanded ? 4 : 2}
        >
          {item.description}
        </Text>

        <View style={styles.eventMetaRow}>
          <View style={[styles.metaPill, { backgroundColor: color + "12" }]}>
            <Ionicons name="calendar-outline" size={14} color={color} />
            <Text style={[styles.metaText, { color }]}>
              {formatDate(item.event_date)}
            </Text>
          </View>

          <View style={[styles.metaPill, { backgroundColor: color + "12" }]}>
            <Ionicons name="star-outline" size={14} color={color} />
            <Text style={[styles.metaText, { color }]}>
              +{item.points_value} pts
            </Text>
          </View>
        </View>

        {expanded && (
          <View style={styles.expandedArea}>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={color} />
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                {formatTime(item.event_date)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={color} />
              <Text
                style={[styles.detailText, { color: theme.colors.text }]}
                numberOfLines={2}
              >
                {item.location}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={16} color={color} />
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                {registrations}/{capacity} volunteers joined
              </Text>
            </View>

            <View
              style={[
                styles.progressBg,
                { backgroundColor: theme.colors.border },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%` as any,
                    backgroundColor: color,
                  },
                ]}
              />
            </View>

            <View
              style={[
                styles.reasonBox,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.reasonLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Why suggested
              </Text>

              <Text style={[styles.reasonText, { color: theme.colors.text }]}>
                {item.recommendation_reason ||
                  "This event may be suitable based on your recent volunteering activity."}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.viewEventBtn, { backgroundColor: color }]}
              onPress={() => router.push("/events")}
              activeOpacity={0.85}
            >
              <Text style={styles.viewEventBtnText}>View in Events</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            For You
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}
          >
            Personalised events
          </Text>
        </View>

        <View style={styles.spacer} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>
            Loading suggestions
          </Text>
          <Text
            style={[styles.loadingSub, { color: theme.colors.textSecondary }]}
          >
            Finding suitable events for you...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderEvent}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[
            styles.list,
            filteredEvents.length === 0 && styles.emptyList,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: theme.colors.primary + "18" },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={40}
                  color={theme.colors.primary}
                />
              </View>

              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No suggestions yet
              </Text>

              <Text
                style={[styles.emptyText, { color: theme.colors.textSecondary }]}
              >
                Join or book events first so your recommendations can improve.
              </Text>

              <TouchableOpacity
                style={[
                  styles.browseBtn,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => router.push("/events")}
                activeOpacity={0.85}
              >
                <Text style={styles.browseBtnText}>Browse Events</Text>
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
  screen: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  headerText: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
  },

  headerSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  spacer: {
    width: 42,
  },

  list: {
    padding: 20,
    paddingBottom: 34,
  },

  emptyList: {
    flexGrow: 1,
  },

  summaryCard: {
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },

  summaryTop: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },

  summaryIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryText: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "900",
  },

  summarySubtitle: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 4,
  },

  summaryStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  statBox: {
    borderRadius: 18,
    paddingVertical: 11,
    paddingHorizontal: 14,
    minWidth: 82,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "900",
  },

  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },

  allEventsBtn: {
    flex: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  allEventsText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },

  assistantCard: {
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },

  assistantHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 14,
  },

  assistantIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  assistantHeaderText: {
    flex: 1,
  },

  assistantTitle: {
    fontSize: 16,
    fontWeight: "900",
  },

  assistantSub: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },

  questionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  questionChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  questionText: {
    fontSize: 12,
    fontWeight: "800",
  },

  answerBox: {
    flexDirection: "row",
    gap: 11,
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    marginTop: 14,
  },

  answerIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  answerTextWrap: {
    flex: 1,
  },

  answerTitle: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  answerEvent: {
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },

  answerMessage: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },

  categorySection: {
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
  },

  categoryList: {
    paddingTop: 12,
    paddingRight: 20,
  },

  categoryChip: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    marginRight: 8,
  },

  categoryChipText: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "capitalize",
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  listSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  refreshBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  eventCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },

  eventTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 12,
  },

  eventIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  eventMain: {
    flex: 1,
  },

  eventTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  eventTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 21,
  },

  eventOrg: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },

  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 11,
    flexWrap: "wrap",
  },

  suggestionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  suggestionBadgeText: {
    fontSize: 12,
    fontWeight: "900",
  },

  matchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  matchBadgeText: {
    fontSize: 12,
    fontWeight: "900",
  },

  eventDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },

  eventMetaRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  metaText: {
    fontSize: 12,
    fontWeight: "800",
  },

  expandedArea: {
    marginTop: 14,
  },

  detailRow: {
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    marginBottom: 10,
  },

  detailText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },

  progressBg: {
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 4,
    marginBottom: 14,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  reasonBox: {
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
  },

  reasonLabel: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 5,
  },

  reasonText: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },

  viewEventBtn: {
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  viewEventBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "900",
  },

  loadingSub: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 40,
  },

  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },

  browseBtn: {
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  browseBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
});