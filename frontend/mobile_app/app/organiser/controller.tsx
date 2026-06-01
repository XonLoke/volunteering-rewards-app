import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Controller() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Ionicons name="menu" size={26} color="#111" />
        <Text style={styles.header}>Onsite Controller</Text>
        <Ionicons name="scan-outline" size={24} color="#6A00E8" />
      </View>

      <View style={styles.eventBox}>
        <View style={styles.imageBox} />

        <View style={{ flex: 1 }}>
          <View style={styles.eventTop}>
            <Text style={styles.eventTitle}>Beach Cleanup at East Coast Park</Text>
            <Text style={styles.badge}>Upcoming</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color="#fff" />
            <Text style={styles.white}>May 25, 2025 • 08:00 AM</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color="#fff" />
            <Text style={styles.white}>East Coast Park, Singapore</Text>
          </View>
        </View>
      </View>

      <Text style={styles.section}>Check-in Overview</Text>

      <View style={styles.stats}>
        <Box value="120" label="Registered" color="#4B00B5" />
        <Box value="85" label="Checked-in" color="#16A34A" />
        <Box value="20" label="Pending" color="#F59E0B" />
        <Box value="71%" label="Check-in Rate" color="#2563EB" />
      </View>

      <TouchableOpacity style={styles.scan}>
        <Ionicons name="qr-code-outline" size={36} color="#fff" />
        <View>
          <Text style={styles.scanText}>Scan QR Code</Text>
          <Text style={styles.scanSub}>Tap to scan volunteer QR</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.sectionRow}>
        <Text style={styles.section}>Recent Check-ins</Text>
        <Text style={styles.viewAll}>View all</Text>
      </View>

      <CheckIn name="Alex Tan" email="alex.tan@example.com" time="08:15 AM" />
      <CheckIn name="Nur Aisyah" email="aisyah.k@example.com" time="08:17 AM" />
    </ScrollView>
  );
}

function Box({ value, label, color }: any) {
  return (
    <View style={styles.box}>
      <Text style={[styles.boxValue, { color }]}>{value}</Text>
      <Text style={styles.boxLabel}>{label}</Text>
    </View>
  );
}

function CheckIn({ name, email, time }: any) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.charAt(0)}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <Text style={styles.time}>{time}</Text>
      <View style={styles.checkCircle}>
        <Ionicons name="checkmark" size={14} color="#fff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 18,
    paddingBottom: 95,
  },
  topBar: {
    marginTop: 10,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    fontSize: 18,
    fontWeight: "800",
  },
  eventBox: {
    backgroundColor: "#6A00E8",
    padding: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  imageBox: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#D8F3DC",
    marginRight: 12,
  },
  eventTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventTitle: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: "#B084FF",
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 5,
  },
  white: {
    color: "#fff",
    fontSize: 12,
  },
  section: {
    fontSize: 16,
    fontWeight: "800",
    marginVertical: 14,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  box: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 14,
    width: "24%",
  },
  boxValue: {
    fontSize: 18,
    fontWeight: "900",
  },
  boxLabel: {
    fontSize: 10,
    color: "#555",
    textAlign: "center",
    marginTop: 4,
  },
  scan: {
    backgroundColor: "#6A00E8",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexDirection: "row",
    gap: 14,
  },
  scanText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  scanSub: {
    color: "#fff",
    fontSize: 12,
    marginTop: 3,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewAll: {
    color: "#6A00E8",
    fontSize: 12,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: "#eee",
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
    color: "#fff",
    fontWeight: "800",
  },
  name: {
    fontWeight: "800",
  },
  email: {
    color: "#555",
    fontSize: 12,
    marginTop: 2,
  },
  time: {
    color: "#555",
    fontSize: 12,
    marginRight: 8,
  },
  checkCircle: {
    backgroundColor: "#22C55E",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});