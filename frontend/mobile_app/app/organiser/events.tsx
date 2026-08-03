import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const events = [
  {
    title: "Beach Cleanup at East Coast Park",
    status: "Upcoming",
    volunteers: "120 Volunteers",
  },
  {
    title: "Community Garden Workday",
    status: "Upcoming",
    volunteers: "85 Volunteers",
  },
  {
    title: "Food Donation Drive",
    status: "Ongoing",
    volunteers: "63 Volunteers",
  },
  {
    title: "Park Cleanup @ Bishan-Ang Mo Kio",
    status: "Completed",
    volunteers: "140 Volunteers",
  },
];

export default function Events() {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Events</Text>

        <TouchableOpacity
          style={styles.plus}
          onPress={() => router.push("/organiser/eventForm")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#777" />
        <TextInput
          placeholder="Search events..."
          placeholderTextColor="#777"
          style={styles.searchInput}
        />
      </View>

      {/* FILTER TAB */}
      <View style={styles.tabs}>
        <Text style={styles.active}>All</Text>
        <Text style={styles.tab}>Upcoming</Text>
        <Text style={styles.tab}>Ongoing</Text>
        <Text style={styles.tab}>Completed</Text>
      </View>

      {/* EVENT LIST */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {events.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.eventCard}
            onPress={() => router.push("/organiser/eventForm")}
          >
            <View style={styles.imageBox}>
              <Ionicons name="calendar-outline" size={26} color="#6A00E8" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>

              <View style={styles.row}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color="#777"
                />
                <Text style={styles.text}>May 25, 2025</Text>
              </View>

              <View style={styles.row}>
                <Ionicons name="people-outline" size={12} color="#777" />
                <Text style={styles.text}>{item.volunteers}</Text>
              </View>
            </View>

            <View
              style={[
                styles.badge,
                item.status === "Completed"
                  ? styles.completed
                  : item.status === "Ongoing"
                  ? styles.ongoing
                  : styles.upcoming,
              ]}
            >
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4FF",
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  header: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
  },

  plus: {
    backgroundColor: "#6A00E8",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    height: 50,
    borderRadius: 14,
    marginBottom: 18,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  active: {
    color: "#6A00E8",
    fontWeight: "800",
    borderBottomWidth: 2,
    borderColor: "#6A00E8",
    paddingBottom: 5,
  },

  tab: {
    color: "#777",
    fontWeight: "600",
  },

  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  imageBox: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: "#EFE7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  title: {
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 6,
    color: "#111",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 4,
  },

  text: {
    fontSize: 12,
    color: "#666",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  upcoming: {
    backgroundColor: "#6A00E8",
  },

  ongoing: {
    backgroundColor: "#F59E0B",
  },

  completed: {
    backgroundColor: "#16A34A",
  },
});