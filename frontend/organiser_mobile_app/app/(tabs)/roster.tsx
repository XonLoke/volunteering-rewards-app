import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { apiGet } from "../../lib/api";

interface RosterVolunteer {
  id: number;
  name: string;
  email: string;
  status: string;
  registered_at: string;
  check_in_time: string | null;
}

export default function Roster() {
  const { eventId, title } = useLocalSearchParams<{
    eventId: string;
    title: string;
  }>();

  const [volunteers, setVolunteers] = useState<RosterVolunteer[]>([]);
  const [eventTitle, setEventTitle] = useState(title || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoster();
  }, []);

  async function fetchRoster() {
    try {
      // apiGet returns the parsed JSON body: { data: [...], event_title }
      const data = await apiGet(`/api/events/${eventId}/roster`);
      setVolunteers(data.data || []);
      if (data.event_title) setEventTitle(data.event_title);
    } catch (error: any) {
      console.log("Roster error:", error.message);
      Alert.alert("Error", error.message || "Failed to load volunteers.");
    } finally {
      setLoading(false);
    }
  }

  const checkedIn = volunteers.filter((v) => v.check_in_time).length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.header}>Volunteers</Text>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {eventTitle}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#6A00E8" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{volunteers.length}</Text>
              <Text style={styles.summaryLabel}>Registered</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{checkedIn}</Text>
              <Text style={styles.summaryLabel}>Checked In</Text>
            </View>
          </View>

          {volunteers.length === 0 ? (
            <Text style={styles.empty}>
              No volunteers registered for this event yet.
            </Text>
          ) : (
            volunteers.map((volunteer) => (
              <View key={volunteer.id} style={styles.card}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {volunteer.name?.charAt(0).toUpperCase() || "?"}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{volunteer.name}</Text>
                  <Text style={styles.email}>{volunteer.email}</Text>
                  <Text style={styles.meta}>
                    Registered{" "}
                    {volunteer.registered_at
                      ? new Date(volunteer.registered_at).toLocaleDateString()
                      : "—"}
                  </Text>
                  {volunteer.check_in_time && (
                    <Text style={styles.meta}>
                      Checked in{" "}
                      {new Date(volunteer.check_in_time).toLocaleString()}
                    </Text>
                  )}
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    volunteer.check_in_time
                      ? styles.badgeCheckedIn
                      : styles.badgePending,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      volunteer.check_in_time
                        ? styles.textCheckedIn
                        : styles.textPending,
                    ]}
                  >
                    {volunteer.check_in_time ? "✓ Checked in" : "Not checked in"}
                  </Text>
                </View>
              </View>
            ))
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
    alignItems: "center",
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  header: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
  },

  eventTitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  loading: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },

  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#6A00E8",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  summaryValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },

  summaryLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 2,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EFE7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#6A00E8",
    fontSize: 18,
    fontWeight: "900",
  },

  name: {
    fontWeight: "800",
    fontSize: 15,
    color: "#111",
  },

  email: {
    color: "#555",
    fontSize: 12,
    marginTop: 2,
  },

  meta: {
    color: "#999",
    fontSize: 11,
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },

  badgeCheckedIn: {
    backgroundColor: "#DCFCE7",
  },

  badgePending: {
    backgroundColor: "#FEF3C7",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  textCheckedIn: {
    color: "#16A34A",
  },

  textPending: {
    color: "#B45309",
  },

  empty: { textAlign: "center", color: "#777", marginTop: 40 },
});
