import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiDelete } from "../../lib/api";

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    fetchEvents();
  }, [status]);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [status]),
  );

  async function fetchEvents() {
    try {
      setLoading(true);

      let url = "/api/organiser/events";

      if (status !== "All") {
        url += `?status=${status}`;
      }

      const data = await apiGet(url);
      setEvents(data.data || data);
    } catch (error) {
      console.log("Cannot connect to backend:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(eventId: number) {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiDelete(`/api/organiser/events/${eventId}`);

            if (!res.ok) {
              Alert.alert("Error", data.message || "Failed to delete event");
              return;
            }

            Alert.alert("Deleted", "Event deleted successfully");
            fetchEvents();
          } catch (error) {
            Alert.alert("Error", "Cannot connect to backend");
          }
        },
      },
    ]);
  }

  const filteredEvents = events.filter((event) =>
    event.title?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6A00E8" />
        <Text>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Events</Text>

        <TouchableOpacity
          style={styles.plus}
          onPress={() => router.push("/(tabs)/eventForm")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#777" />
        <TextInput
          placeholder="Search events..."
          placeholderTextColor="#777"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.tabs}>
        {["All", "Upcoming", "Ongoing", "Completed"].map((item) => (
          <TouchableOpacity key={item} onPress={() => setStatus(item)}>
            <Text style={status === item ? styles.active : styles.tab}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((item) => (
            <View key={item.id} style={styles.eventCard}>
              <TouchableOpacity
                style={styles.cardLeft}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/eventForm",
                    params: { eventId: item.id },
                  })
                }
              >
                <View style={styles.imageBox}>
                  <Ionicons name="calendar-outline" size={26} color="#6A00E8" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.title}</Text>

                  <View style={styles.row}>
                    <Ionicons name="calendar-outline" size={12} color="#777" />
                    <Text style={styles.text}>
                      {item.start_time
                        ? new Date(item.start_time).toLocaleDateString()
                        : "No date available"}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Ionicons name="location-outline" size={12} color="#777" />
                    <Text style={styles.text}>
                      {item.location ?? "No location"}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Ionicons name="people-outline" size={12} color="#777" />
                    <Text style={styles.text}>
                      {item.volunteers ?? item.total_volunteers ?? 0} Volunteers
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.rightSide}>
                <View
                  style={[
                    styles.badge,
                    item.status === "Completed" || item.status === "completed"
                      ? styles.completed
                      : item.status === "Ongoing" || item.status === "ongoing"
                        ? styles.ongoing
                        : styles.upcoming,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {item.status ?? "Upcoming"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteEvent(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>No events found.</Text>
        )}
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
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#F8F4FF",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  header: { fontSize: 24, fontWeight: "800", color: "#111" },
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
  searchInput: { flex: 1, marginLeft: 8 },
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
  tab: { color: "#777", fontWeight: "600" },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  imageBox: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: "#EFE7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  title: { fontWeight: "800", fontSize: 14, marginBottom: 6, color: "#111" },
  row: { flexDirection: "row", alignItems: "center", marginTop: 3, gap: 4 },
  text: { fontSize: 12, color: "#666" },
  rightSide: { alignItems: "flex-end", gap: 10 },
  deleteButton: { backgroundColor: "#FEE2E2", padding: 8, borderRadius: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  upcoming: { backgroundColor: "#6A00E8" },
  ongoing: { backgroundColor: "#F59E0B" },
  completed: { backgroundColor: "#16A34A" },
  empty: { textAlign: "center", color: "#777", marginTop: 30 },
});
