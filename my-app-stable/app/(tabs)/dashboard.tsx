import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { apiGet } from "../../lib/api";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const data = await apiGet("/organiser/dashboard");

      console.log("Dashboard response:", JSON.stringify(data, null, 2));

      setDashboard(data);
    } catch (error) {
      console.log("Cannot load dashboard:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Cannot connect to the backend.";

      setErrorMessage(message);
      setDashboard(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function formatEventDate(value: string | null | undefined) {
    if (!value) {
      return "No date available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-SG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6A00E8" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const stats = dashboard?.stats ?? dashboard?.data?.stats ?? {};

  const upcomingEvents =
    dashboard?.upcoming_events ??
    dashboard?.upcomingEvents ??
    dashboard?.upcoming ??
    dashboard?.data?.upcoming_events ??
    dashboard?.data?.upcomingEvents ??
    dashboard?.data?.upcoming ??
    [];

  const totalEvents =
    stats?.total_events ??
    stats?.totalEvents ??
    dashboard?.total_events ??
    dashboard?.totalEvents ??
    0;

  const totalVolunteers =
    stats?.total_volunteers ??
    stats?.totalVolunteers ??
    dashboard?.total_volunteers ??
    dashboard?.totalVolunteers ??
    0;

  const upcomingEventCount =
    stats?.upcoming_events ??
    stats?.upcomingEvents ??
    stats?.upcoming_event_count ??
    stats?.upcomingEventCount ??
    upcomingEvents.length;

  const averageFeedback =
    stats?.average_feedback ??
    stats?.averageFeedback ??
    dashboard?.average_feedback ??
    dashboard?.averageFeedback ??
    0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchDashboard(true)}
          tintColor="#6A00E8"
        />
      }
    >
      <Text style={styles.header}>Dashboard</Text>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Good morning, Organizer!</Text>

        <Text style={styles.bannerText}>
          Manage your volunteer events easily.
        </Text>
      </View>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Ionicons name="warning-outline" size={24} color="#B42318" />

          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>Unable to load dashboard</Text>

            <Text style={styles.errorText}>{errorMessage}</Text>

            <Text style={styles.retryText} onPress={() => fetchDashboard()}>
              Tap here to try again
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.grid}>
        <Card icon="calendar" value={totalEvents} label="Total Events" />

        <Card icon="people" value={totalVolunteers} label="Total Volunteers" />

        <Card icon="time" value={upcomingEventCount} label="Upcoming Events" />

        <Card icon="star" value={averageFeedback} label="Average Feedback" />
      </View>

      <Text style={styles.section}>Upcoming Events</Text>

      {Array.isArray(upcomingEvents) && upcomingEvents.length > 0 ? (
        upcomingEvents.map((event: any) => {
          const volunteerCount =
            event?.volunteer_count ??
            event?.volunteers_count ??
            event?.registered_volunteers ??
            event?.volunteers ??
            0;

          const eventDate =
            event?.event_date ??
            event?.start_time ??
            event?.startDate ??
            event?.date;

          return (
            <View key={String(event.id)} style={styles.eventCard}>
              <View style={styles.imageBox}>
                <Ionicons name="calendar-outline" size={30} color="#6A00E8" />
              </View>

              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>
                  {event.title ?? "Untitled Event"}
                </Text>

                <Text style={styles.eventText}>
                  {formatEventDate(eventDate)}
                </Text>

                <Text style={styles.eventText}>
                  {volunteerCount}{" "}
                  {Number(volunteerCount) === 1 ? "Volunteer" : "Volunteers"}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={22} color="#333333" />
            </View>
          );
        })
      ) : (
        <Text style={styles.empty}>No upcoming events yet.</Text>
      )}
    </ScrollView>
  );
}

function Card({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
}) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={26} color="#6A00E8" />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  contentContainer: {
    padding: 18,
    paddingBottom: 40,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
  },

  loadingText: {
    color: "#555555",
  },

  header: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    marginVertical: 18,
    color: "#111111",
  },

  banner: {
    backgroundColor: "#6A00E8",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },

  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  bannerText: {
    color: "#FFFFFF",
    marginTop: 6,
    fontSize: 15,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEE4E2",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
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

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  value: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8,
    color: "#111111",
  },

  label: {
    color: "#555555",
    fontSize: 13,
    marginTop: 2,
  },

  section: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 14,
    color: "#111111",
  },

  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    elevation: 2,
    marginBottom: 12,
  },

  imageBox: {
    width: 70,
    height: 60,
    backgroundColor: "#F1E8FF",
    borderRadius: 12,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  eventDetails: {
    flex: 1,
  },

  eventTitle: {
    fontWeight: "800",
    color: "#111111",
  },

  eventText: {
    color: "#555555",
    fontSize: 12,
    marginTop: 4,
  },

  empty: {
    color: "#777777",
    textAlign: "center",
    marginTop: 20,
  },
});
