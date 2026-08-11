import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
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
  const [checkingIn, setCheckingIn] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();

  const [events, setEvents] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [roster, setRoster] = useState<any[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState("");

  useFocusEffect(
    useCallback(() => {
      fetchEvent();
    }, []),
  );

  useEffect(() => {
    if (event?.id) {
      fetchRoster(Number(event.id));
    } else {
      setRoster([]);
      setRosterError("");
    }
  }, [event?.id]);

  async function fetchEvent() {
    try {
      setLoading(true);

      const data = await apiGet("/organiser/events");

      console.log("Controller events response:", JSON.stringify(data, null, 2));

      const eventList = Array.isArray(data)
        ? data
        : Array.isArray(data?.events)
          ? data.events
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.events)
              ? data.data.events
              : [];

      setEvents(eventList);

      setEvent((currentEvent: any) => {
        if (currentEvent?.id) {
          const refreshedSelectedEvent = eventList.find(
            (item: any) => Number(item.id) === Number(currentEvent.id),
          );

          if (refreshedSelectedEvent) {
            return refreshedSelectedEvent;
          }
        }

        return (
          eventList.find(
            (item: any) =>
              String(item?.status ?? "").toLowerCase() === "ongoing",
          ) ??
          eventList.find(
            (item: any) =>
              String(item?.status ?? "").toLowerCase() === "upcoming",
          ) ??
          eventList[0] ??
          null
        );
      });
    } catch (error) {
      console.log("Controller event error:", error);

      const message =
        error instanceof Error ? error.message : "Cannot load events.";

      Alert.alert("Unable to Load Event", message);
      setEvents([]);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRoster(eventId: number) {
    try {
      setRosterLoading(true);
      setRosterError("");

      const data = await apiGet(`/organiser/events/${eventId}/roster`);

      console.log("Event roster response:", JSON.stringify(data, null, 2));

      const rosterList = Array.isArray(data)
        ? data
        : Array.isArray(data?.roster)
          ? data.roster
          : Array.isArray(data?.participants)
            ? data.participants
            : Array.isArray(data?.volunteers)
              ? data.volunteers
              : Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.data?.roster)
                  ? data.data.roster
                  : Array.isArray(data?.data?.participants)
                    ? data.data.participants
                    : [];

      setRoster(rosterList);
    } catch (error) {
      console.log("Roster error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to load registered volunteers.";

      setRosterError(message);
      setRoster([]);
    } finally {
      setRosterLoading(false);
    }
  }

  async function openScanner() {
    setScanned(false);

    if (!event?.id) {
      Alert.alert(
        "No Event",
        "No upcoming or ongoing event was found. Please create an event first.",
      );
      return;
    }

    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access to scan volunteer QR codes.",
        );
        return;
      }
    }

    setShowScanner(true);
  }

  async function handleQRScanned(data: string) {
    if (scanned || checkingIn) {
      return;
    }

    setScanned(true);
    setCheckingIn(true);

    if (!event?.id) {
      Alert.alert("No Event", "No event was selected.");
      setScanned(false);
      setCheckingIn(false);
      return;
    }

    const scannedValue = String(data ?? "").trim();

    console.log("Original scanned QR:", scannedValue);
    console.log("Selected event ID:", event.id);

    if (!scannedValue) {
      Alert.alert("Invalid QR Code", "The scanned QR code is empty.");
      setScanned(false);
      setCheckingIn(false);
      return;
    }

    // The volunteer app encodes QR values as:
    // VR_VOLUNTEER:<value stored in users.volunteer_qr_code>
    // Remove the display prefix before sending the database QR value to Render.
    const QR_PREFIX = "VR_VOLUNTEER:";

    let volunteerQrCode = scannedValue;

    while (volunteerQrCode.startsWith(QR_PREFIX)) {
      volunteerQrCode = volunteerQrCode.slice(QR_PREFIX.length).trim();
    }

    console.log("FINAL QR SENT TO RENDER:", volunteerQrCode);

    if (!volunteerQrCode) {
      Alert.alert("Invalid QR Code", "The volunteer QR value is empty.");
      setScanned(false);
      setCheckingIn(false);
      return;
    }

    try {
      const requestBody = {
        event_id: Number(event.id),
        qr_code_value: volunteerQrCode,
      };

      console.log("========== CHECK-IN REQUEST ==========");
      console.log("Selected event:", {
        id: event?.id,
        title: event?.title,
        status: event?.status,
        registered_count: getRegisteredCount(event),
        checked_in_count: getCheckedInCount(event),
      });
      console.log("Scanned QR value:", volunteerQrCode);
      console.log("Request body:", requestBody);

      const result = await apiPost("/attendance/scan", requestBody);

      console.log("Attendance scan response:", JSON.stringify(result, null, 2));

      Alert.alert(
        "Check-in Successful",
        result?.message ?? "Volunteer attendance was recorded successfully.",
        [
          {
            text: "OK",
            onPress: async () => {
              setShowScanner(false);
              setScanned(false);
              setCheckingIn(false);

              await fetchEvent();
            },
          },
        ],
      );
    } catch (error) {
      console.log("Attendance scan error:", error);

      const rawMessage =
        error instanceof Error
          ? error.message
          : "Unable to record volunteer attendance.";

      const normalizedMessage = rawMessage.toLowerCase();

      let displayMessage = rawMessage;

      if (normalizedMessage.includes("not registered")) {
        displayMessage =
          `${event?.title ?? "This event"} (Event ID ${event?.id}) does not have ` +
          "a registration for this volunteer. Register the volunteer for this exact event first, then scan again.";
      } else if (
        normalizedMessage.includes("already checked") ||
        normalizedMessage.includes("duplicate")
      ) {
        displayMessage =
          "This volunteer has already checked in for the selected event.";
      }

      Alert.alert("Check-in Failed", displayMessage, [
        {
          text: "Try Again",
          onPress: () => {
            setScanned(false);
            setCheckingIn(false);
          },
        },
        {
          text: "Close",
          style: "cancel",
          onPress: () => {
            setShowScanner(false);
            setScanned(false);
            setCheckingIn(false);
          },
        },
      ]);
    }
  }

  function selectEvent(selectedEvent: any) {
    if (checkingIn) {
      return;
    }

    setEvent(selectedEvent);
    setScanned(false);
  }

  function getRegisteredCount(item: any) {
    return Number(
      item?.registered_count ?? item?.volunteers ?? item?.total_volunteers ?? 0,
    );
  }

  function getCheckedInCount(item: any) {
    return Number(
      item?.checked_in_count ?? item?.attended ?? item?.checked_in ?? 0,
    );
  }

  function getVolunteerName(item: any) {
    return (
      item?.name ??
      item?.volunteer_name ??
      item?.volunteerName ??
      item?.user_name ??
      item?.userName ??
      "Unknown Volunteer"
    );
  }

  function getVolunteerEmail(item: any) {
    return (
      item?.email ??
      item?.volunteer_email ??
      item?.volunteerEmail ??
      item?.user_email ??
      item?.userEmail ??
      "No email"
    );
  }

  function isVolunteerCheckedIn(item: any) {
    const status = String(
      item?.attendance_status ??
        item?.attendanceStatus ??
        item?.registration_status ??
        item?.registrationStatus ??
        item?.status ??
        "",
    ).toLowerCase();

    return Boolean(
      item?.checked_in_at ||
      item?.checkedInAt ||
      item?.check_in_time ||
      item?.checkInTime ||
      item?.attendance_id ||
      item?.attendanceId ||
      item?.checked_in === true ||
      item?.checkedIn === true ||
      status.includes("checked") ||
      status.includes("attended"),
    );
  }

  function getCheckedInTime(item: any) {
    const value =
      item?.checked_in_at ??
      item?.checkedInAt ??
      item?.check_in_time ??
      item?.checkInTime ??
      item?.scanned_at ??
      item?.scannedAt;

    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("en-SG", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatShortEventDate(item: any) {
    const value =
      item?.event_date ?? item?.start_time ?? item?.startDate ?? item?.date;

    if (!value) {
      return "No date";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-SG", {
      day: "numeric",
      month: "short",
    });
  }

  function formatEventDate() {
    const value =
      event?.event_date ?? event?.start_time ?? event?.startDate ?? event?.date;

    if (!value) {
      return "No date available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("en-SG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const registered = getRegisteredCount(event);

  const checkedIn = getCheckedInCount(event);

  const pending = Math.max(registered - checkedIn, 0);

  const checkInRate =
    registered > 0 ? `${Math.round((checkedIn / registered) * 100)}%` : "0%";

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6A00E8" />
        <Text>Loading controller...</Text>
      </View>
    );
  }

  if (showScanner) {
    if (!permission) {
      return <View style={styles.container} />;
    }

    if (!permission.granted) {
      return (
        <View style={styles.center}>
          <Text style={styles.text}>Camera permission is required.</Text>

          <Button title="Allow Camera" onPress={requestPermission} />

          <Button
            title="Back"
            onPress={() => {
              setShowScanner(false);
              setScanned(false);
            }}
          />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={
            scanned || checkingIn
              ? undefined
              : ({ data }) => handleQRScanned(data)
          }
        />

        {checkingIn ? (
          <View style={styles.processing}>
            <ActivityIndicator size="large" color="#FFFFFF" />

            <Text style={styles.processingText}>Recording attendance...</Text>
          </View>
        ) : null}

        <View style={styles.scanBottom}>
          <Button
            title="Scan Again"
            onPress={() => {
              setScanned(false);
              setCheckingIn(false);
            }}
          />

          <Button
            title="Back"
            onPress={() => {
              setShowScanner(false);
              setScanned(false);
              setCheckingIn(false);
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Ionicons name="menu" size={26} color="#111111" />

        <Text style={styles.header}>Onsite Controller</Text>

        <Ionicons name="scan-outline" size={24} color="#6A00E8" />
      </View>

      <Text style={styles.selectorTitle}>Select Event</Text>

      {events.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventSelector}
        >
          {events.map((item: any) => {
            const isSelected = Number(event?.id) === Number(item.id);
            const itemRegistered = getRegisteredCount(item);
            const itemCheckedIn = getCheckedInCount(item);

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.eventOption,
                  isSelected && styles.eventOptionSelected,
                ]}
                onPress={() => selectEvent(item)}
                disabled={checkingIn}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.eventOptionTitle,
                    isSelected && styles.eventOptionTitleSelected,
                  ]}
                  numberOfLines={2}
                >
                  {item.title ?? "Untitled Event"}
                </Text>

                <Text
                  style={[
                    styles.eventOptionMeta,
                    isSelected && styles.eventOptionMetaSelected,
                  ]}
                >
                  ID {item.id} • {formatShortEventDate(item)}
                </Text>

                <Text
                  style={[
                    styles.eventOptionMeta,
                    isSelected && styles.eventOptionMetaSelected,
                  ]}
                >
                  {itemRegistered} registered • {itemCheckedIn} checked in
                </Text>

                <Text
                  style={[
                    styles.eventOptionStatus,
                    isSelected && styles.eventOptionStatusSelected,
                  ]}
                >
                  {String(item.status ?? "upcoming").toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.noEventsBox}>
          <Text style={styles.noEventsText}>No events available.</Text>
        </View>
      )}

      <View style={styles.eventBox}>
        <View style={styles.imageBox}>
          <Ionicons name="calendar-outline" size={34} color="#6A00E8" />
        </View>

        <View style={styles.eventContent}>
          <View style={styles.eventTop}>
            <Text style={styles.eventTitle}>
              {event?.title ?? "No event found"}
            </Text>

            <Text style={styles.badge}>{event?.status ?? "Upcoming"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color="#FFFFFF" />

            <Text style={styles.white}>{formatEventDate()}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color="#FFFFFF" />

            <Text style={styles.white}>{event?.location ?? "No location"}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.section}>
        Check-in Overview {event?.id ? `(Event ID ${event.id})` : ""}
      </Text>

      <View style={styles.stats}>
        <Box value={registered} label="Registered" color="#4B00B5" />

        <Box value={checkedIn} label="Checked-in" color="#16A34A" />

        <Box value={pending} label="Pending" color="#F59E0B" />

        <Box value={checkInRate} label="Rate" color="#2563EB" />
      </View>

      <View style={styles.rosterHeader}>
        <View>
          <Text style={styles.rosterTitle}>Registered Volunteers</Text>
          <Text style={styles.rosterSubtitle}>
            {roster.length} {roster.length === 1 ? "volunteer" : "volunteers"}{" "}
            for this event
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshRosterButton}
          onPress={() => event?.id && fetchRoster(Number(event.id))}
          disabled={rosterLoading || !event?.id}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={18} color="#6A00E8" />
        </TouchableOpacity>
      </View>

      {rosterLoading ? (
        <View style={styles.rosterLoading}>
          <ActivityIndicator size="small" color="#6A00E8" />
          <Text style={styles.rosterLoadingText}>Loading volunteers...</Text>
        </View>
      ) : rosterError ? (
        <View style={styles.rosterErrorBox}>
          <Ionicons name="warning-outline" size={20} color="#B42318" />
          <Text style={styles.rosterErrorText}>{rosterError}</Text>
        </View>
      ) : roster.length > 0 ? (
        <View style={styles.rosterList}>
          {roster.map((item: any, index: number) => {
            const volunteerCheckedIn = isVolunteerCheckedIn(item);
            const volunteerName = getVolunteerName(item);
            const volunteerEmail = getVolunteerEmail(item);
            const checkedInTime = getCheckedInTime(item);

            return (
              <View
                key={String(
                  item?.registration_id ??
                    item?.registrationId ??
                    item?.user_id ??
                    item?.userId ??
                    item?.id ??
                    index,
                )}
                style={styles.volunteerRow}
              >
                <View style={styles.volunteerAvatar}>
                  <Text style={styles.volunteerAvatarText}>
                    {volunteerName.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.volunteerDetails}>
                  <Text style={styles.volunteerName}>{volunteerName}</Text>
                  <Text style={styles.volunteerEmail}>{volunteerEmail}</Text>

                  {volunteerCheckedIn && checkedInTime ? (
                    <Text style={styles.checkedInTime}>
                      Checked in {checkedInTime}
                    </Text>
                  ) : null}
                </View>

                <View
                  style={[
                    styles.volunteerStatus,
                    volunteerCheckedIn
                      ? styles.checkedInStatus
                      : styles.pendingStatus,
                  ]}
                >
                  <Text
                    style={[
                      styles.volunteerStatusText,
                      volunteerCheckedIn
                        ? styles.checkedInStatusText
                        : styles.pendingStatusText,
                    ]}
                  >
                    {volunteerCheckedIn ? "Checked in" : "Pending"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyRosterBox}>
          <Ionicons name="people-outline" size={22} color="#777777" />
          <Text style={styles.emptyRosterText}>
            No registered volunteers were returned for this event.
          </Text>
        </View>
      )}

      {event?.id && registered === 0 ? (
        <View style={styles.registrationWarning}>
          <Ionicons name="warning-outline" size={20} color="#B42318" />
          <Text style={styles.registrationWarningText}>
            No volunteers are currently registered for this event. You can still
            scan a volunteer QR code for Event ID {event.id}.
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.scan, !event?.id && styles.scanDisabled]}
        onPress={openScanner}
        disabled={!event?.id}
        activeOpacity={0.8}
      >
        <Ionicons name="qr-code-outline" size={36} color="#FFFFFF" />

        <View>
          <Text style={styles.scanText}>Scan QR Code</Text>

          <Text style={styles.scanSub}>Tap to scan a volunteer QR code</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Box({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.box}>
      <Text style={[styles.boxValue, { color }]}>{value}</Text>
      <Text style={styles.boxLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    padding: 18,
    paddingBottom: 95,
  },

  camera: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 20,
  },

  text: {
    fontSize: 15,
    marginBottom: 10,
    textAlign: "center",
  },

  scanBottom: {
    padding: 20,
    gap: 10,
    backgroundColor: "#FFFFFF",
  },

  processing: {
    position: "absolute",
    top: "42%",
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 20,
    borderRadius: 16,
  },

  processingText: {
    color: "#FFFFFF",
    marginTop: 10,
    fontWeight: "700",
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

  selectorTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 10,
  },

  eventSelector: {
    paddingBottom: 14,
    gap: 10,
  },

  eventOption: {
    width: 190,
    minHeight: 118,
    backgroundColor: "#F7F3FF",
    borderWidth: 1,
    borderColor: "#DDD2F3",
    borderRadius: 14,
    padding: 12,
  },

  eventOptionSelected: {
    backgroundColor: "#6A00E8",
    borderColor: "#6A00E8",
  },

  eventOptionTitle: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "800",
    minHeight: 36,
  },

  eventOptionTitleSelected: {
    color: "#FFFFFF",
  },

  eventOptionMeta: {
    color: "#666666",
    fontSize: 11,
    marginTop: 5,
  },

  eventOptionMetaSelected: {
    color: "#EFE7FF",
  },

  eventOptionStatus: {
    color: "#6A00E8",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 7,
  },

  eventOptionStatusSelected: {
    color: "#FFFFFF",
  },

  noEventsBox: {
    backgroundColor: "#F7F3FF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  noEventsText: {
    color: "#666666",
    textAlign: "center",
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
    backgroundColor: "#EFE7FF",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  eventContent: {
    flex: 1,
  },

  eventTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  eventTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },

  badge: {
    backgroundColor: "#B084FF",
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    textTransform: "capitalize",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 5,
  },

  white: {
    color: "#FFFFFF",
    fontSize: 12,
    flex: 1,
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
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderRadius: 14,
    width: "24%",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  boxValue: {
    fontSize: 18,
    fontWeight: "900",
  },

  boxLabel: {
    fontSize: 10,
    color: "#555555",
    textAlign: "center",
    marginTop: 4,
  },

  rosterHeader: {
    marginTop: 22,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rosterTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111111",
  },

  rosterSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#666666",
  },

  refreshRosterButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1E8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  rosterLoading: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  rosterLoadingText: {
    color: "#666666",
    fontSize: 13,
  },

  rosterErrorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FEE4E2",
    borderRadius: 14,
    padding: 14,
  },

  rosterErrorText: {
    flex: 1,
    color: "#7A271A",
    fontSize: 12,
    lineHeight: 18,
  },

  rosterList: {
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  volunteerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  volunteerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EFE7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  volunteerAvatarText: {
    color: "#6A00E8",
    fontSize: 16,
    fontWeight: "900",
  },

  volunteerDetails: {
    flex: 1,
    paddingRight: 8,
  },

  volunteerName: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "800",
  },

  volunteerEmail: {
    color: "#666666",
    fontSize: 11,
    marginTop: 3,
  },

  checkedInTime: {
    color: "#15803D",
    fontSize: 10,
    marginTop: 4,
    fontWeight: "600",
  },

  volunteerStatus: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  checkedInStatus: {
    backgroundColor: "#DCFCE7",
  },

  pendingStatus: {
    backgroundColor: "#FEF3C7",
  },

  volunteerStatusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  checkedInStatusText: {
    color: "#15803D",
  },

  pendingStatusText: {
    color: "#B45309",
  },

  emptyRosterBox: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  emptyRosterText: {
    flex: 1,
    color: "#666666",
    fontSize: 12,
  },

  registrationWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FEE4E2",
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
  },

  registrationWarningText: {
    flex: 1,
    color: "#7A271A",
    fontSize: 12,
    lineHeight: 18,
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

  scanDisabled: {
    opacity: 0.5,
  },

  scanText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  scanSub: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 3,
  },
});
