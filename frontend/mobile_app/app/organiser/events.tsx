import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "../../src/services/api";

const TABS = ["All", "Upcoming", "Ongoing", "Completed", "Past"];

interface OrganiserEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  event_date: string;
  status: string;
  registered_count: number;
  checked_in_count: number;
}

export default function Events() {
  const [events, setEvents] = useState<OrganiserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    fetchEvents();
  }, [status]);

  async function fetchEvents() {
    try {
      setLoading(true);

      // "All" sends no status param; "Past" is computed server-side from event_date.
      const query = status === "All" ? "" : `?status=${status.toLowerCase()}`;

      // api.get returns the parsed JSON body — response is { data: [...] }.
      const data = await api.get<any>(`/organiser/events${query}`);
      setEvents(data.data || data || []);
    } catch (error: any) {
      console.error("Events error:", error);
      Alert.alert("Error", error.message || "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = events.filter((event) =>
    event.title?.toLowerCase().includes(search.toLowerCase())
  );

  const openRoster = (event: OrganiserEvent) => {
    router.push({
      pathname: "/organiser/roster",
      params: { eventId: String(event.id), title: event.title },
    } as any);
  };

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
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* FILTER TAB */}
      <View style={styles.tabs}>
        {TABS.map((item) => (
          <TouchableOpacity key={item} onPress={() => setStatus(item)}>
            <Text style={status === item ? styles.active : styles.tab}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* EVENT LIST */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#6A00E8" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.eventCard}
                onPress={() => openRoster(item)}
              >
                <View style={styles.imageBox}>
                  <Ionicons name="calendar-outline" size={26} color="#6A00E8" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.title}</Text>

                  <View style={styles.row}>
                    <Ionicons name="calendar-outline" size={12} color="#777" />
                    <Text style={styles.text}>
                      {item.event_date
                        ? new Date(item.event_date).toLocaleDateString()
                        : "No date"}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Ionicons name="people-outline" size={12} color="#777" />
                    <Text style={styles.text}>
                      {item.registered_count ?? 0} registered ·{" "}
                      {item.checked_in_count ?? 0} checked in
                    </Text>
                  </View>
                </View>

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
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.empty}>No events found.</Text>
          )}
        </ScrollView>
      )}
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

  loading: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
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

  empty: { textAlign: "center", color: "#777", marginTop: 30 },
});
