import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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
import { apiGet, apiPost, apiPut } from "../../lib/api";

export default function EventForm() {
  const { eventId } = useLocalSearchParams();

  const isEdit = !!eventId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("Upcoming");

  useEffect(() => {
    if (isEdit) {
      fetchEventDetails();
    }
  }, [eventId]);

  async function fetchEventDetails() {
    try {
      setLoading(true);

      const data = await apiGet(`/api/organiser/events/${eventId}`);

      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setLocation(data.location ?? "");
      setStartTime(data.start_time ?? "");
      setEndTime(data.end_time ?? "");
      setStatus(data.status ?? "Upcoming");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Cannot load event");
    } finally {
      setLoading(false);
    }
  }

  async function saveEvent() {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter event title.");
      return;
    }

    if (!location.trim()) {
      Alert.alert("Missing Location", "Please enter event location.");
      return;
    }

    if (!startTime.trim()) {
      Alert.alert("Missing Start Time", "Please enter start time.");
      return;
    }

    if (!endTime.trim()) {
      Alert.alert("Missing End Time", "Please enter end time.");
      return;
    }

    try {
      setSaving(true);

      const body = {
        title,
        description,
        location,
        start_time: startTime,
        end_time: endTime,
        status,
        image_url: null,
      };

      if (isEdit) {
        await apiPut(`/api/organiser/events/${eventId}`, body);
        Alert.alert("Updated", "Event updated successfully.");
      } else {
        await apiPost("/api/organiser/events", body);
        Alert.alert("Created", "Event created successfully.");
      }

      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save event");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6A00E8" />
        <Text>Loading event...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>

        <Text style={styles.header}>
          {isEdit ? "Edit Event" : "Create Event"}
        </Text>

        <TouchableOpacity onPress={saveEvent} disabled={saving}>
          <Text style={styles.save}>{saving ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.uploadBox}>
        <Ionicons name="image" size={36} color="#6A00E8" />
        <Text style={styles.uploadText}>Event image coming soon</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Event Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Example: Beach Cleanup"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.textArea}
        multiline
        placeholder="Describe your event"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Example: East Coast Park"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Start Time</Text>
      <TextInput
        style={styles.input}
        placeholder="2026-06-10T10:00:00.000Z"
        value={startTime}
        onChangeText={setStartTime}
      />

      <Text style={styles.label}>End Time</Text>
      <TextInput
        style={styles.input}
        placeholder="2026-06-10T12:00:00.000Z"
        value={endTime}
        onChangeText={setEndTime}
      />

      <Text style={styles.label}>Status</Text>
      <View style={styles.statusRow}>
        {["Upcoming", "Ongoing", "Completed"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.statusButton,
              status === item && styles.statusButtonActive,
            ]}
            onPress={() => setStatus(item)}
          >
            <Text
              style={[
                styles.statusText,
                status === item && styles.statusTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 18 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  headerRow: {
    marginTop: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: { fontSize: 18, fontWeight: "800" },
  save: { color: "#6A00E8", fontWeight: "800" },
  uploadBox: {
    height: 130,
    borderWidth: 1,
    borderColor: "#DDD",
    borderStyle: "dashed",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#FAFAFA",
  },
  uploadText: { marginTop: 8, color: "#555", fontSize: 13 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 6, marginTop: 12 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontWeight: "600",
  },
  textArea: {
    height: 95,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
    fontWeight: "600",
  },
  statusRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  statusButtonActive: { backgroundColor: "#6A00E8" },
  statusText: { color: "#555", fontWeight: "700", fontSize: 12 },
  statusTextActive: { color: "#fff" },
});
