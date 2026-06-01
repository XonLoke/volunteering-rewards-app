import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Dashboard() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Good morning, Organizer!</Text>
        <Text style={styles.bannerText}>Manage your volunteer events easily.</Text>
      </View>

      <View style={styles.grid}>
        <Card icon="calendar" value="12" label="Total Events" />
        <Card icon="people" value="1,250" label="Total Volunteers" />
        <Card icon="time" value="8" label="Upcoming Events" />
        <Card icon="star" value="4.7" label="Average Feedback" />
      </View>

      <Text style={styles.section}>Upcoming Events</Text>

      <View style={styles.eventCard}>
        <View style={styles.imageBox} />
        <View style={{ flex: 1 }}>
          <Text style={styles.eventTitle}>Beach Cleanup at East Coast Park</Text>
          <Text style={styles.eventText}>May 25, 2025</Text>
          <Text style={styles.eventText}>120 Volunteers</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#333" />
      </View>
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
  header: { textAlign: "center", fontSize: 20, fontWeight: "800", marginVertical: 18 },
  banner: { backgroundColor: "#6A00E8", padding: 20, borderRadius: 16, marginBottom: 18 },
  bannerTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  bannerText: { color: "#fff", marginTop: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { width: "48%", backgroundColor: "#fff", padding: 18, borderRadius: 16, elevation: 3 },
  value: { fontSize: 20, fontWeight: "800", marginTop: 8 },
  label: { color: "#555", fontSize: 12 },
  section: { fontSize: 17, fontWeight: "800", marginTop: 24, marginBottom: 12 },
  eventCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 16, elevation: 3 },
  imageBox: { width: 80, height: 60, backgroundColor: "#D8F3DC", borderRadius: 12, marginRight: 12 },
  eventTitle: { fontWeight: "800" },
  eventText: { color: "#555", fontSize: 12, marginTop: 4 },
});