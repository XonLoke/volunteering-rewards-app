import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiGet, apiPost } from "../../lib/api";

export default function Controller() {
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const data = await apiGet("/api/organiser/events");
      setEvents(data.data || data);
    } catch (error) {
      console.log("Cannot fetch events:", error);
    }
  }

  async function handleQRScanned(data: string) {
    setScanned(true);

    if (!selectedEvent) {
      Alert.alert("No Event Selected", "Please select an event first.");
      setScanned(false);
      return;
    }

    const QR_PREFIX = "VR_VOLUNTEER:";

    if (!data.startsWith(QR_PREFIX)) {
      Alert.alert(
        "Invalid QR Code",
        "This QR code is not a Volunteer Reward volunteer QR.",
      );
      setScanned(false);
      return;
    }

    const volunteerQrCode = data.replace(QR_PREFIX, "").trim();

    if (!volunteerQrCode) {
      Alert.alert("Invalid QR Code", "Volunteer QR code is empty.");
      setScanned(false);
      return;
    }

    try {
      const result = await apiPost("/api/attendance/scan", {
        event_id: selectedEvent.id,
        qr_code_value: volunteerQrCode,
      });

      Alert.alert(
        "Check-in Successful",
        `Volunteer checked in to "${selectedEvent.title}"`,
      );
    } catch (error: any) {
      Alert.alert("Check-in Failed", error.message || "Could not check in");
    }

    setScanned(false);
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera permission required</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-outline" size={60} color="#999" />
        <Text style={styles.title}>Camera Access Needed</Text>
        <Text style={styles.text}>
          This app uses the camera to scan volunteer QR codes.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showScanner) {
    return (
      <View style={StyleSheet.absoluteFill}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          onBarcodeScanned={scanned ? undefined : ({ data }) => handleQRScanned(data)}
        />
        <View style={styles.scanOverlay}>
          <Text style={styles.scanText}>Scan volunteer QR code</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setShowScanner(false)}
          >
            <Text style={styles.backBtnText}>Close Scanner</Text>
          </TouchableOpacity>
        </View>
        {scanned && (
          <View style={styles.scanOverlay}>
            <Text style={styles.scanText}>Processing...</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>QR Scanner</Text>

      {!selectedEvent && (
        <Text style={styles.hint}>Select an event to start scanning</Text>
      )}

      {selectedEvent && (
        <View style={styles.selectedCard}>
          <Ionicons name="calendar" size={24} color="#6A00E8" />
          <View style={{ flex: 1 }}>
            <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
            <Text style={styles.eventDate}>
              {new Date(selectedEvent.event_date || selectedEvent.date).toLocaleDateString()}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedEvent(null)}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      )}

      {events.length === 0 && !selectedEvent && (
        <Text style={styles.emptyText}>No events found.</Text>
      )}

      {!selectedEvent &&
        events.map((event: any) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => setSelectedEvent(event)}
          >
            <Ionicons name="calendar-outline" size={22} color="#6A00E8" />
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>
                {new Date(event.event_date || event.date).toLocaleDateString()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}

      {selectedEvent && (
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => {
            setScanned(false);
            setShowScanner(true);
          }}
        >
          <Ionicons name="qr-code" size={24} color="#fff" />
          <Text style={styles.scanBtnText}> Start Scanning</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F4FF", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  header: { fontSize: 24, fontWeight: "800", color: "#4B00B5", marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  text: { color: "#666", fontSize: 14, textAlign: "center", marginBottom: 16 },
  hint: { color: "#888", fontSize: 14, textAlign: "center", marginVertical: 30 },
  emptyText: { color: "#999", textAlign: "center", marginTop: 40 },
  selectedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#6A00E8",
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  eventTitle: { fontSize: 15, fontWeight: "600", marginLeft: 10, color: "#333" },
  eventDate: { fontSize: 13, color: "#888", marginLeft: 10, marginTop: 2 },
  changeText: { color: "#6A00E8", fontWeight: "600" },
  scanBtn: {
    flexDirection: "row",
    backgroundColor: "#6A00E8",
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  scanBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  scanOverlay: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  scanText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backBtnText: { color: "#fff", fontWeight: "600" },
  btn: {
    backgroundColor: "#6A00E8",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
