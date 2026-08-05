import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { api } from "../../src/services/api";

interface OrganiserEvent {
  id: number;
  title: string;
}

interface FeedbackItem {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  volunteer_name: string;
}

export default function Feedback() {
  const [events, setEvents] = useState<OrganiserEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<OrganiserEvent | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) fetchFeedback();
  }, [selectedEvent]);

  async function fetchEvents() {
    try {
      const data = await api.get<any>("/organiser/events");
      const list = data.data || [];
      setEvents(list);
      if (list.length > 0) setSelectedEvent(list[0]);
    } catch (error: any) {
      console.error("Events error:", error);
      Alert.alert("Error", error.message || "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchFeedback() {
    try {
      const data = await api.get<any>(
        `/organiser/events/${selectedEvent?.id}/feedback`
      );
      setFeedback(data.data || []);
      setAverageRating(data.average_rating ?? 0);
      setTotal(data.total ?? 0);
    } catch (error: any) {
      console.error("Feedback error:", error);
      Alert.alert("Error", error.message || "Failed to load feedback.");
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6A00E8" />
        <Text>Loading feedback...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Feedback</Text>

      {/* Event selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={[
              styles.tab,
              selectedEvent?.id === event.id && styles.activeTab,
            ]}
            onPress={() => setSelectedEvent(event)}
          >
            <Text
              style={[
                styles.tabText,
                selectedEvent?.id === event.id && styles.activeTabText,
              ]}
            >
              {event.title?.substring(0, 20)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedEvent && (
        <>
          <Text style={styles.eventLabel}>
            Feedback for: {selectedEvent.title}
          </Text>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryMain}>
              <Text style={styles.summaryRating}>{averageRating}</Text>
              <Text style={styles.summaryStars}>
                {"★".repeat(Math.round(averageRating))}
                {"☆".repeat(5 - Math.round(averageRating))}
              </Text>
              <Text style={styles.summaryTotal}>
                {total} {total === 1 ? "feedback" : "feedbacks"}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summarySide}>
              <Text style={styles.summarySideText}>
                Overall rating from volunteers who attended your events.
              </Text>
            </View>
          </View>
        </>
      )}

      {feedback.length === 0 ? (
        <Text style={styles.empty}>No feedback yet for this event.</Text>
      ) : (
        feedback.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.volunteer_name?.charAt(0).toUpperCase() || "?"}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.volunteer}>
                  {item.volunteer_name || "Volunteer"}
                </Text>
                <Text style={styles.rating}>
                  {"★".repeat(item.rating || 0)}
                  {"☆".repeat(5 - (item.rating || 0))}
                </Text>
              </View>
              <Text style={styles.date}>
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString()
                  : ""}
              </Text>
            </View>
            {item.comment && <Text style={styles.comment}>{item.comment}</Text>}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F4FF", padding: 20 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 24, fontWeight: "800", color: "#4B00B5", marginBottom: 16 },
  tabs: { marginBottom: 16 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeTab: { backgroundColor: "#6A00E8", borderColor: "#6A00E8" },
  tabText: { color: "#555", fontWeight: "600", fontSize: 13 },
  activeTabText: { color: "#fff" },
  eventLabel: { fontSize: 13, color: "#888", marginBottom: 12 },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#6A00E8",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  summaryMain: { alignItems: "center", width: 110 },
  summaryRating: { color: "#fff", fontSize: 38, fontWeight: "900" },
  summaryStars: { color: "#FFD700", fontSize: 16, marginTop: 2 },
  summaryTotal: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 4 },
  summaryDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.3)", marginHorizontal: 16 },
  summarySide: { flex: 1, justifyContent: "center" },
  summarySideText: { color: "rgba(255,255,255,0.9)", fontSize: 12, lineHeight: 17 },
  empty: { color: "#999", textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFE7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#6A00E8", fontWeight: "800" },
  volunteer: { fontWeight: "700", fontSize: 15 },
  rating: { color: "#FFD700", fontSize: 13, marginTop: 2 },
  date: { color: "#aaa", fontSize: 11 },
  comment: { color: "#444", fontSize: 14, lineHeight: 20 },
});
