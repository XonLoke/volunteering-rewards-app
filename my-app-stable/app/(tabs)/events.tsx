import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
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
import { apiDelete, apiGet } from "../../lib/api";

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [errorMessage, setErrorMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [status]),
  );

  async function fetchEvents() {
    try {
      setLoading(true);
      setErrorMessage("");

      let path = "/organiser/events";

      if (status !== "All") {
        path += `?status=${encodeURIComponent(status.toLowerCase())}`;
      }

      const data = await apiGet(path);

      console.log("Events response:", JSON.stringify(data, null, 2));

      const eventList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.events)
            ? data.events
            : Array.isArray(data?.data?.events)
              ? data.data.events
              : [];

      setEvents(eventList);
    } catch (error) {
      console.log("Cannot load events:", error);

      const message =
        error instanceof Error ? error.message : "Cannot load events.";

      setErrorMessage(message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  function deleteEvent(eventId: number) {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiDelete(`/organiser/events/${eventId}`);

            Alert.alert("Deleted", "Event deleted successfully.");
            fetchEvents();
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to delete event.";

            Alert.alert("Error", message);
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
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Ionicons name="warning-outline" size={22} color="#B42318" />

          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>Unable to load events</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>

            <Text style={styles.retryText} onPress={fetchEvents}>
              Tap here to try again
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#777777" />

        <TextInput
          placeholder="Search events..."
          placeholderTextColor="#777777"
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
                    params: {
                      eventId: String(item.id),
                    },
                  })
                }
              >
                <View style={styles.imageBox}>
                  <Ionicons name="calendar-outline" size={26} color="#6A00E8" />
                </View>

                <View style={styles.eventDetails}>
                  {/* EVENT TITLE */}
                  <Text style={styles.title}>
                    {item.title ?? "Untitled Event"}
                  </Text>

                  {/* EVENT DESCRIPTION */}
                  <Text style={styles.description} numberOfLines={2}>
                    {item.description ?? "No description available"}
                  </Text>

                  {/* DATE & TIME */}
                  <View style={styles.row}>
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color="#777777"
                    />

                    <Text style={styles.text}>
                      {item.event_date || item.start_time
                        ? new Date(
                            item.event_date ?? item.start_time,
                          ).toLocaleString("en-SG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "No date available"}
                    </Text>
                  </View>

                  {/* LOCATION */}
                  <View style={styles.row}>
                    <Ionicons
                      name="location-outline"
                      size={12}
                      color="#777777"
                    />

                    <Text style={styles.text}>
                      {item.location ?? "No location"}
                    </Text>
                  </View>

                  {/* REGISTERED */}
                  <View style={styles.row}>
                    <Ionicons name="people-outline" size={12} color="#777777" />

                    <Text style={styles.text}>
                      {Number(
                        item.registered_count ??
                          item.volunteers ??
                          item.total_volunteers ??
                          0,
                      )}{" "}
                      Registered
                    </Text>
                  </View>

                  {/* CHECKED IN */}
                  <View style={styles.row}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={12}
                      color="#16A34A"
                    />

                    <Text style={styles.text}>
                      {Number(
                        item.checked_in_count ??
                          item.attended ??
                          item.checked_in ??
                          0,
                      )}{" "}
                      Checked In
                    </Text>
                  </View>

                  {/* CAPACITY */}
                  <View style={styles.row}>
                    <Ionicons
                      name="people-circle-outline"
                      size={12}
                      color="#777777"
                    />

                    <Text style={styles.text}>
                      Capacity: {item.spots_total ?? item.capacity ?? 0}
                    </Text>
                  </View>

                  {/* POINTS */}
                  <View style={styles.row}>
                    <Ionicons name="star-outline" size={12} color="#777777" />

                    <Text style={styles.text}>
                      {item.points_value ?? 0} Points
                    </Text>
                  </View>

                  {/* CATEGORY */}
                  <View style={styles.row}>
                    <Ionicons
                      name="pricetag-outline"
                      size={12}
                      color="#777777"
                    />

                    <Text style={styles.text}>
                      {item.category ?? "No category"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.rightSide}>
                <View
                  style={[
                    styles.badge,
                    item.status?.toLowerCase() === "completed"
                      ? styles.completed
                      : item.status?.toLowerCase() === "ongoing"
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

  header: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111111",
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

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
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
    color: "#777777",
    fontWeight: "600",
  },

  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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

  eventDetails: {
    flex: 1,
  },

  title: {
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 4,
    color: "#111111",
  },

  // NEW DESCRIPTION STYLE
  description: {
    fontSize: 12,
    color: "#777777",
    marginBottom: 6,
    lineHeight: 17,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 4,
  },

  text: {
    fontSize: 12,
    color: "#666666",
  },

  rightSide: {
    alignItems: "flex-end",
    gap: 10,
  },

  deleteButton: {
    backgroundColor: "#FEE2E2",
    padding: 8,
    borderRadius: 10,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  badgeText: {
    color: "#FFFFFF",
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

  empty: {
    textAlign: "center",
    color: "#777777",
    marginTop: 30,
  },
});
