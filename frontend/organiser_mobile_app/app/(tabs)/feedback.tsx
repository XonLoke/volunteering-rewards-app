import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiGet } from "../../lib/api";

export default function Feedback() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) fetchFeedback();
  }, [selectedEvent]);

  async function fetchEvents() {
    try {
      const data = await apiGet("/api/organiser/events");
      setEvents(data.data || data);
      if (data.data?.length > 0 || data?.length > 0) {
        const first = data.data?.[0] || data?.[0];
        setSelectedEvent(first);
      }
    } catch (error: any) {
      console.log("Events error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFeedback() {
    try {
      const data = await apiGet(`/api/organiser/events/${selectedEvent.id}/feedback`);
      setFeedback(data.data || data);
    } catch (error: any) {
      console.log("Feedback error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    if (selectedEvent) fetchFeedback();
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>Feedback</Text>

      {/* Event selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {events.map((event: any) => (
          <TouchableOpacity
            key={event.id}
            style={[styles.tab, selectedEvent?.id === event.id && styles.activeTab]}
            onPress={() => setSelectedEvent(event)}
          >
            <Text style={[styles.tabText, selectedEvent?.id === event.id && styles.activeTabText]}>
              {event.title?.substring(0, 20)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedEvent && (
        <Text style={styles.eventLabel}>Feedback for: {selectedEvent.title}</Text>
      )}

      {feedback.length === 0 && (
        <Text style={styles.empty}>No feedback yet for this event.</Text>
      )}

      {feedback.map((item: any, idx: number) => (
        <View key={idx} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.volunteer}>{item.volunteer_name || item.name || "Volunteer"}</Text>
            <Text style={styles.rating}>
              {"⭐".repeat(item.rating || 0)}
            </Text>
          </View>
          {item.comment && (
            <Text style={styles.comment}>{item.comment}</Text>
          )}
          <Text style={styles.date}>
            {new Date(item.created_at || item.submitted_at).toLocaleDateString()}
          </Text>
        </View>
      ))}
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
  empty: { color: "#999", textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  volunteer: { fontWeight: "700", fontSize: 15 },
  rating: { fontSize: 14 },
  comment: { color: "#444", fontSize: 14, lineHeight: 20, marginBottom: 6 },
  date: { color: "#aaa", fontSize: 12 },
});
