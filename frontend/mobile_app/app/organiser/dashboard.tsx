import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { api } from "../../src/services/api";

interface DashboardData {
  stats?: {
    total_events: number;
    total_volunteers: number;
    total_volunteers_checked_in: number;
    upcoming_events: number;
    average_rating: number;
  };
  upcoming?: {
    id: number;
    title: string;
    location: string;
    event_date: string;
    status: string;
    volunteers: number;
  }[];
  organisation?: { name: string; status: string };
  recent_activity?: {
    timestamp: string;
    volunteer_name: string;
    event_title: string;
  }[];
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      // api.get returns the parsed JSON body — do NOT read .ok/.json() on it.
      const data = await api.get<DashboardData>("/organiser/dashboard");
      setDashboard(data);
    } catch (error: any) {
      console.error("Dashboard error:", error);
      Alert.alert("Error", error.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6A00E8" />
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  const stats = dashboard?.stats;
  const upcoming = dashboard?.upcoming ?? [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>
          {dashboard?.organisation?.name || "Good morning, Organizer!"}
        </Text>
        <Text style={styles.bannerText}>Manage your volunteer events easily.</Text>
      </View>

      <View style={styles.grid}>
        <Card icon="calendar" value={stats?.total_events ?? 0} label="Total Events" />
        <Card icon="people" value={stats?.total_volunteers ?? 0} label="Total Volunteers" />
        <Card
          icon="checkmark-circle"
          value={stats?.total_volunteers_checked_in ?? 0}
          label="Volunteers Checked In"
        />
        <Card icon="star" value={stats?.average_rating ?? 0} label="Average Feedback" />
      </View>

      <Text style={styles.section}>Upcoming Events</Text>

      {upcoming.length > 0 ? (
        upcoming.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.imageBox}>
              <Ionicons name="calendar-outline" size={24} color="#6A00E8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventText}>
                {event.event_date
                  ? new Date(event.event_date).toLocaleDateString()
                  : "No date available"}
              </Text>
              <Text style={styles.eventText}>
                {event.volunteers ?? 0} Volunteers
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#333" />
          </View>
        ))
      ) : (
        <Text style={styles.empty}>No upcoming events yet.</Text>
      )}

      <Text style={styles.section}>Recent Check-ins</Text>

      {(dashboard?.recent_activity ?? []).length > 0 ? (
        (dashboard?.recent_activity ?? []).map((item, index) => (
          <View key={index} style={styles.activityCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={16} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>
                <Text style={styles.activityName}>{item.volunteer_name}</Text>{" "}
                checked in for {item.event_title}
              </Text>
              <Text style={styles.activityDate}>
                {item.timestamp
                  ? new Date(item.timestamp).toLocaleString()
                  : ""}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>No check-ins recorded yet.</Text>
      )}
    </ScrollView>
  );
}

function Card({ icon, value, label }: any) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={26} color="#6A00E8" />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 18 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  header: { textAlign: "center", fontSize: 20, fontWeight: "800", marginVertical: 18 },
  banner: { backgroundColor: "#6A00E8", padding: 20, borderRadius: 16, marginBottom: 18 },
  bannerTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  bannerText: { color: "#fff", marginTop: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    elevation: 3,
  },
  value: { fontSize: 20, fontWeight: "800", marginTop: 8 },
  label: { color: "#555", fontSize: 12 },
  section: { fontSize: 17, fontWeight: "800", marginTop: 24, marginBottom: 12 },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 12,
  },
  imageBox: {
    width: 64,
    height: 60,
    backgroundColor: "#EFE7FF",
    borderRadius: 12,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  eventTitle: { fontWeight: "800" },
  eventText: { color: "#555", fontSize: 12, marginTop: 4 },
  empty: { color: "#777", textAlign: "center", marginTop: 20 },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F4FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6A00E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  activityText: { fontSize: 13, color: "#333" },
  activityName: { fontWeight: "800" },
  activityDate: { fontSize: 11, color: "#999", marginTop: 2 },
});
