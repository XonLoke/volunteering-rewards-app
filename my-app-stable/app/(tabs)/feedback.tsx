import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadFeedbackPage();
    }, []),
  );

  async function loadFeedbackPage(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const eventsResponse = await apiGet("/organiser/events");

      const eventList = Array.isArray(eventsResponse)
        ? eventsResponse
        : Array.isArray(eventsResponse?.data)
          ? eventsResponse.data
          : Array.isArray(eventsResponse?.events)
            ? eventsResponse.events
            : Array.isArray(eventsResponse?.data?.events)
              ? eventsResponse.data.events
              : [];

      setEvents(eventList);

      const eventId =
        selectedEventId ??
        (eventList.length > 0 ? Number(eventList[0].id) : null);

      if (!eventId) {
        setSelectedEventId(null);
        setFeedback([]);
        return;
      }

      setSelectedEventId(eventId);
      await fetchFeedbackForEvent(eventId);
    } catch (error) {
      console.log("Feedback page error:", error);

      const message =
        error instanceof Error ? error.message : "Cannot load feedback.";

      setErrorMessage(message);
      setFeedback([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function fetchFeedbackForEvent(eventId: number) {
    try {
      setErrorMessage("");

      const data = await apiGet(`/organiser/events/${eventId}/feedback`);

      console.log("Feedback response:", JSON.stringify(data, null, 2));

      const feedbackList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.feedback)
            ? data.feedback
            : Array.isArray(data?.data?.feedback)
              ? data.data.feedback
              : [];

      setFeedback(feedbackList);
    } catch (error) {
      console.log("Feedback error:", error);

      const message =
        error instanceof Error ? error.message : "Cannot load feedback.";

      setErrorMessage(message);
      setFeedback([]);
    }
  }

  async function selectEvent(eventId: number) {
    setSelectedEventId(eventId);
    setLoading(true);

    try {
      await fetchFeedbackForEvent(eventId);
    } finally {
      setLoading(false);
    }
  }

  function onRefresh() {
    loadFeedbackPage(true);
  }

  const selectedEvent = useMemo(
    () => events.find((event) => Number(event.id) === selectedEventId),
    [events, selectedEventId],
  );

  const average =
    feedback.length > 0
      ? (
          feedback.reduce(
            (sum, item) => sum + Number(item.rating ?? item.score ?? 0),
            0,
          ) / feedback.length
        ).toFixed(1)
      : "0.0";

  const roundedAverage = Math.max(0, Math.min(5, Math.round(Number(average))));

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
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#6A00E8"
        />
      }
    >
      <Text style={styles.header}>Feedback</Text>

      <Text style={styles.sectionLabel}>Select Event</Text>

      {events.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventSelector}
        >
          {events.map((event) => {
            const eventId = Number(event.id);
            const isSelected = eventId === selectedEventId;

            return (
              <TouchableOpacity
                key={String(event.id)}
                style={[
                  styles.eventButton,
                  isSelected && styles.eventButtonSelected,
                ]}
                onPress={() => selectEvent(eventId)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.eventButtonText,
                    isSelected && styles.eventButtonTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {event.title ?? "Untitled Event"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.infoBox}>
          <Ionicons name="calendar-outline" size={22} color="#6A00E8" />
          <Text style={styles.infoText}>
            No events found. Create an event before viewing feedback.
          </Text>
        </View>
      )}

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Ionicons name="warning-outline" size={22} color="#B42318" />

          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>Unable to load feedback</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>

            <Text style={styles.retryText} onPress={() => loadFeedbackPage()}>
              Tap here to try again
            </Text>
          </View>
        </View>
      ) : null}

      {selectedEvent ? (
        <View style={styles.ratingBox}>
          <Text style={styles.overall}>Overall Rating</Text>
          <Text style={styles.eventName}>
            {selectedEvent.title ?? "Selected Event"}
          </Text>
          <Text style={styles.rating}>{average}</Text>

          <Text style={styles.stars}>
            {"★".repeat(roundedAverage)}
            {"☆".repeat(5 - roundedAverage)}
          </Text>

          <Text style={styles.white}>
            {feedback.length} {feedback.length === 1 ? "Feedback" : "Feedbacks"}
          </Text>
        </View>
      ) : null}

      {feedback.length > 0 ? (
        feedback.map((item, index) => {
          const rating = Math.max(
            0,
            Math.min(5, Number(item.rating ?? item.score ?? 0)),
          );

          const volunteerName =
            item.volunteer_name ??
            item.volunteerName ??
            item.user_name ??
            item.name ??
            "Unknown Volunteer";

          const eventTitle =
            item.event_title ??
            item.eventTitle ??
            selectedEvent?.title ??
            "Unknown Event";

          const createdAt =
            item.created_at ?? item.createdAt ?? item.submitted_at ?? item.date;

          const comment =
            item.comment ??
            item.feedback ??
            item.message ??
            "No comment provided.";

          return (
            <View
              key={String(item.id ?? `${selectedEventId}-${index}`)}
              style={styles.feedbackCard}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {volunteerName.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.feedbackDetails}>
                <Text style={styles.name}>{volunteerName}</Text>

                <Text style={styles.eventTitle}>{eventTitle}</Text>

                <Text style={styles.date}>
                  {createdAt
                    ? new Date(createdAt).toLocaleDateString("en-SG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "No date"}
                </Text>

                <Text style={styles.starSmall}>
                  {"★".repeat(rating)}
                  {"☆".repeat(5 - rating)}
                </Text>

                <Text style={styles.comment}>{comment}</Text>
              </View>
            </View>
          );
        })
      ) : selectedEvent && !errorMessage ? (
        <Text style={styles.empty}>
          No feedback has been submitted for this event yet.
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  contentContainer: {
    padding: 18,
    paddingBottom: 100,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
  },

  header: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    marginVertical: 18,
    color: "#111111",
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 10,
  },

  eventSelector: {
    gap: 10,
    paddingBottom: 16,
  },

  eventButton: {
    maxWidth: 190,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: "#F1E8FF",
    borderWidth: 1,
    borderColor: "#E4D5FF",
  },

  eventButtonSelected: {
    backgroundColor: "#6A00E8",
    borderColor: "#6A00E8",
  },

  eventButtonText: {
    color: "#6A00E8",
    fontWeight: "700",
    fontSize: 13,
  },

  eventButtonTextSelected: {
    color: "#FFFFFF",
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F1E8FF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },

  infoText: {
    flex: 1,
    color: "#4B00B5",
    fontSize: 13,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEE4E2",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    color: "#B42318",
    fontWeight: "800",
    marginBottom: 4,
  },

  errorText: {
    color: "#7A271A",
    fontSize: 13,
  },

  retryText: {
    color: "#6A00E8",
    fontWeight: "700",
    marginTop: 8,
  },

  ratingBox: {
    backgroundColor: "#6A00E8",
    padding: 20,
    borderRadius: 18,
    marginBottom: 14,
  },

  overall: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  eventName: {
    color: "#E9D5FF",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },

  rating: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    marginTop: 8,
  },

  stars: {
    color: "#FFD700",
    fontSize: 22,
  },

  white: {
    color: "#FFFFFF",
    marginTop: 4,
  },

  feedbackCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginTop: 12,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#6A00E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  feedbackDetails: {
    flex: 1,
  },

  name: {
    fontWeight: "800",
    fontSize: 15,
    color: "#111111",
  },

  eventTitle: {
    color: "#6A00E8",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  date: {
    color: "#555555",
    fontSize: 12,
    marginTop: 2,
  },

  starSmall: {
    color: "#FFD700",
    marginVertical: 4,
  },

  comment: {
    color: "#333333",
    lineHeight: 19,
  },

  empty: {
    textAlign: "center",
    color: "#777777",
    marginTop: 30,
  },
});
