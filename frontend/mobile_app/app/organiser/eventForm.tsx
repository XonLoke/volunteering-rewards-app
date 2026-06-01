import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function EventForm() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>

        <Text style={styles.header}>Edit Event</Text>

        <TouchableOpacity>
          <Text style={styles.save}>Save</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.uploadBox}>
        <Ionicons name="image" size={36} color="#6A00E8" />
        <Text style={styles.uploadText}>Tap to upload event image</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Event Title</Text>
      <TextInput style={styles.input} value="Beach Cleanup at East Coast Park" />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.textArea}
        multiline
        value={"Join us in keeping our beaches clean\nand beautiful! Together, we can make\na difference."}
      />

      <Text style={styles.label}>Date</Text>
      <View style={styles.selectBox}>
        <Ionicons name="calendar-outline" size={20} color="#111" />
        <Text style={styles.selectText}>May 25, 2025</Text>
        <Ionicons name="chevron-down" size={20} color="#111" />
      </View>

      <Text style={styles.label}>Time</Text>
      <View style={styles.selectBox}>
        <Ionicons name="time-outline" size={20} color="#111" />
        <Text style={styles.selectText}>08:00 AM – 11:00 AM</Text>
        <Ionicons name="chevron-down" size={20} color="#111" />
      </View>

      <Text style={styles.label}>Venue</Text>
      <View style={styles.selectBox}>
        <Ionicons name="location-outline" size={20} color="#111" />
        <Text style={styles.selectText}>East Coast Park, Singapore</Text>
        <Ionicons name="chevron-down" size={20} color="#111" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
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
  },
  save: {
    color: "#6A00E8",
    fontWeight: "800",
  },
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
  uploadText: {
    marginTop: 8,
    color: "#555",
    fontSize: 13,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 12,
  },
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
  selectBox: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectText: {
    flex: 1,
    fontWeight: "600",
  },
});