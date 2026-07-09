import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { apiGet } from "../../lib/api";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const data = await apiGet("/api/organiser/dashboard");
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Good morning, Organizer!</Text>
        <Text style={styles.bannerText}>
          Manage your volunteer events easily.
        </Text>
      </View>

      <View style={styles.grid}>
        <Card
          icon="calendar"
          value={stats?.total_events ?? 0}
          label="Total Events"
        />
        <Card
          icon="people"
          value={stats?.total_volunteers ?? 0}
          label="Total Volunteers"
        />
        <Card
          icon="time"
          value={stats?.upcoming_events ?? 0}
          label="Upcoming Events"
        />
        <Card
          icon="star"
          value={stats?.average_feedback ?? 0}
          label="Average Feedback"
        />
      </View>

      <Text style={styles.section}>Upcoming Events</Text>

      {dashboard?.upcoming?.length > 0 ? (
        dashboard.upcoming.map((event: any) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.imageBox} />
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventText}>
                {event.start_time ?? "No date available"}
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
  header: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    marginVertical: 18,
  },
  banner: {
    backgroundColor: "#6A00E8",
    padding: 20,
    borderRadius: 16,
    marginBottom: 18,
  },
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
    width: 80,
    height: 60,
    backgroundColor: "#D8F3DC",
    borderRadius: 12,
    marginRight: 12,
  },
  eventTitle: { fontWeight: "800" },
  eventText: { color: "#555", fontSize: 12, marginTop: 4 },
  empty: { color: "#777", textAlign: "center", marginTop: 20 },
});
