import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { apiGet, apiPost, apiPut } from "../../lib/api";

const STATUS_OPTIONS = ["upcoming", "ongoing", "completed"];

export default function EventForm() {
  const params = useLocalSearchParams();

  const eventId = Array.isArray(params.eventId)
    ? params.eventId[0]
    : params.eventId;

  const isEdit = Boolean(eventId);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [status, setStatus] = useState("upcoming");

  const [showStartDate, setShowStartDate] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  async function fetchEventDetails() {
    try {
      setLoading(true);

      const data = await apiGet(`/organiser/events/${eventId}`);

      console.log("Event details:", JSON.stringify(data, null, 2));

      const event = data?.data ?? data?.event ?? data;

      const eventDate = event?.event_date ? new Date(event.event_date) : null;

      const durationHours = Number(event?.duration_hours ?? 1);

      const calculatedEndDate = eventDate
        ? new Date(eventDate.getTime() + durationHours * 60 * 60 * 1000)
        : null;

      setTitle(event?.title ?? "");
      setDescription(event?.description ?? "");
      setLocation(event?.location ?? "");

      setStartTime(
        eventDate && !Number.isNaN(eventDate.getTime()) ? eventDate : null,
      );

      setEndTime(
        calculatedEndDate && !Number.isNaN(calculatedEndDate.getTime())
          ? calculatedEndDate
          : null,
      );

      setStatus(
        typeof event?.status === "string"
          ? event.status.toLowerCase()
          : "upcoming",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cannot load event.";

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value: Date | null) {
    if (!value) return "Select date";

    return value.toLocaleDateString("en-SG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(value: Date | null) {
    if (!value) return "Select time";

    return value.toLocaleTimeString("en-SG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function combineDateAndTime(datePart: Date, timePart: Date) {
    return new Date(
      datePart.getFullYear(),
      datePart.getMonth(),
      datePart.getDate(),
      timePart.getHours(),
      timePart.getMinutes(),
      0,
      0,
    );
  }

  function handleStartDateChange(
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) {
    setShowStartDate(false);

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    const currentTime = startTime ?? new Date();

    setStartTime(combineDateAndTime(selectedDate, currentTime));
  }

  function handleStartTimeChange(
    event: DateTimePickerEvent,
    selectedTime?: Date,
  ) {
    setShowStartTimePicker(false);

    if (event.type === "dismissed" || !selectedTime) {
      return;
    }

    const currentDate = startTime ?? new Date();

    setStartTime(combineDateAndTime(currentDate, selectedTime));
  }

  function handleEndDateChange(
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) {
    setShowEndDate(false);

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    const currentTime = endTime ?? startTime ?? new Date();

    setEndTime(combineDateAndTime(selectedDate, currentTime));
  }

  function handleEndTimeChange(
    event: DateTimePickerEvent,
    selectedTime?: Date,
  ) {
    setShowEndTimePicker(false);

    if (event.type === "dismissed" || !selectedTime) {
      return;
    }

    const currentDate = endTime ?? startTime ?? new Date();

    setEndTime(combineDateAndTime(currentDate, selectedTime));
  }

  async function saveEvent() {
    const cleanedTitle = title.trim();
    const cleanedDescription = description.trim();
    const cleanedLocation = location.trim();

    if (!cleanedTitle) {
      Alert.alert("Missing Title", "Please enter the event title.");
      return;
    }

    if (!cleanedLocation) {
      Alert.alert("Missing Location", "Please enter the event location.");
      return;
    }

    if (!startTime) {
      Alert.alert(
        "Missing Start Date & Time",
        "Please select the event start date and time.",
      );
      return;
    }

    if (!endTime) {
      Alert.alert(
        "Missing End Date & Time",
        "Please select the event end date and time.",
      );
      return;
    }

    if (endTime <= startTime) {
      Alert.alert(
        "Invalid Date & Time",
        "The end date and time must be later than the start date and time.",
      );
      return;
    }

    const durationHours =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    try {
      setSaving(true);

      const body = {
        title: cleanedTitle,
        description: cleanedDescription,
        location: cleanedLocation,
        event_date: startTime.toISOString(),
        duration_hours: durationHours,
        capacity: 50,
        points_value: 100,
        category: "Community",
        status,
        image_url: null,
        latitude: null,
        longitude: null,
      };

      console.log("Saving event:", JSON.stringify(body, null, 2));

      if (isEdit) {
        await apiPut(`/organiser/events/${eventId}`, body);

        Alert.alert("Updated", "Event updated successfully.", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        await apiPost("/organiser/events", body);

        Alert.alert("Created", "Event created successfully.", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error) {
      console.log("Save event error:", error);

      const message =
        error instanceof Error ? error.message : "Failed to save event.";

      Alert.alert("Error", message);
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
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111111" />
        </TouchableOpacity>

        <Text style={styles.header}>
          {isEdit ? "Edit Event" : "Create Event"}
        </Text>

        <TouchableOpacity onPress={saveEvent} disabled={saving}>
          <Text style={[styles.save, saving && styles.saveDisabled]}>
            {saving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.uploadBox}>
        <Ionicons name="image" size={36} color="#6A00E8" />

        <Text style={styles.uploadText}>Event image coming soon</Text>
      </View>

      <Text style={styles.label}>Event Title</Text>

      <TextInput
        style={styles.input}
        placeholder="Example: Beach Cleanup"
        placeholderTextColor="#999999"
        value={title}
        onChangeText={setTitle}
        editable={!saving}
      />

      <Text style={styles.label}>Description</Text>

      <TextInput
        style={styles.textArea}
        multiline
        placeholder="Describe your event"
        placeholderTextColor="#999999"
        value={description}
        onChangeText={setDescription}
        editable={!saving}
      />

      <Text style={styles.label}>Location</Text>

      <TextInput
        style={styles.input}
        placeholder="Example: East Coast Park"
        placeholderTextColor="#999999"
        value={location}
        onChangeText={setLocation}
        editable={!saving}
      />

      <Text style={styles.label}>Start Date & Time</Text>

      <View style={styles.dateTimeRow}>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => {
            setShowStartDate(true);
            setShowStartTimePicker(false);
          }}
          disabled={saving}
        >
          <Ionicons name="calendar-outline" size={20} color="#6A00E8" />

          <Text style={styles.dateTimeText}>{formatDate(startTime)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => {
            setShowStartTimePicker(true);
            setShowStartDate(false);
          }}
          disabled={saving}
        >
          <Ionicons name="time-outline" size={20} color="#6A00E8" />

          <Text style={styles.dateTimeText}>{formatTime(startTime)}</Text>
        </TouchableOpacity>
      </View>

      {showStartDate && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={startTime ?? new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={new Date()}
            onChange={handleStartDateChange}
            textColor="#000000"
            themeVariant="light"
            accentColor="#6A00E8"
            style={styles.picker}
          />
        </View>
      )}

      {showStartTimePicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={startTime ?? new Date()}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleStartTimeChange}
            textColor="#000000"
            themeVariant="light"
            accentColor="#6A00E8"
            style={styles.picker}
          />
        </View>
      )}

      <Text style={styles.label}>End Date & Time</Text>

      <View style={styles.dateTimeRow}>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => {
            setShowEndDate(true);
            setShowEndTimePicker(false);
          }}
          disabled={saving}
        >
          <Ionicons name="calendar-outline" size={20} color="#6A00E8" />

          <Text style={styles.dateTimeText}>{formatDate(endTime)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => {
            setShowEndTimePicker(true);
            setShowEndDate(false);
          }}
          disabled={saving}
        >
          <Ionicons name="time-outline" size={20} color="#6A00E8" />

          <Text style={styles.dateTimeText}>{formatTime(endTime)}</Text>
        </TouchableOpacity>
      </View>

      {showEndDate && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={endTime ?? startTime ?? new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={startTime ?? new Date()}
            onChange={handleEndDateChange}
            textColor="#000000"
            themeVariant="light"
            accentColor="#6A00E8"
            style={styles.picker}
          />
        </View>
      )}

      {showEndTimePicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={endTime ?? startTime ?? new Date()}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleEndTimeChange}
            textColor="#000000"
            themeVariant="light"
            accentColor="#6A00E8"
            style={styles.picker}
          />
        </View>
      )}

      <Text style={styles.label}>Status</Text>

      <View style={styles.statusRow}>
        {STATUS_OPTIONS.map((item) => {
          const isActive = status === item;

          return (
            <TouchableOpacity
              key={item}
              style={[
                styles.statusButton,
                isActive && styles.statusButtonActive,
              ]}
              onPress={() => setStatus(item)}
              disabled={saving}
            >
              <Text
                style={[styles.statusText, isActive && styles.statusTextActive]}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  contentContainer: {
    padding: 18,
    paddingBottom: 100,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
  },

  headerRow: {
    marginTop: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  header: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111111",
  },

  save: {
    color: "#6A00E8",
    fontWeight: "800",
  },

  saveDisabled: {
    opacity: 0.5,
  },

  uploadBox: {
    height: 130,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderStyle: "dashed",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#FAFAFA",
  },

  uploadText: {
    marginTop: 8,
    color: "#555555",
    fontSize: 13,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 12,
    color: "#111111",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontWeight: "600",
    color: "#111111",
    backgroundColor: "#FFFFFF",
  },

  textArea: {
    minHeight: 95,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
    fontWeight: "600",
    color: "#111111",
    backgroundColor: "#FFFFFF",
  },

  dateTimeRow: {
    flexDirection: "row",
    gap: 10,
  },

  dateTimeButton: {
    flex: 1,
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
  },

  dateTimeText: {
    flex: 1,
    color: "#111111",
    fontWeight: "600",
    fontSize: 13,
  },

  pickerContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  picker: {
    width: "100%",
    backgroundColor: "#FFFFFF",
  },

  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    marginBottom: 20,
  },

  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },

  statusButtonActive: {
    backgroundColor: "#6A00E8",
  },

  statusText: {
    color: "#555555",
    fontWeight: "700",
    fontSize: 12,
  },

  statusTextActive: {
    color: "#FFFFFF",
  },
});
