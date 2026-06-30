import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function EventBooked() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  const [calendarAdded, setCalendarAdded] = useState(false);
  const [addingCalendar, setAddingCalendar] = useState(false);

  const eventTitle =
    typeof params.eventTitle === "string" ? params.eventTitle : "Volunteer Event";

  const eventDate =
    typeof params.eventDate === "string" ? params.eventDate : "Date TBA";

  const eventTime =
    typeof params.eventTime === "string" ? params.eventTime : "Time TBA";

  const eventLocation =
    typeof params.eventLocation === "string" ? params.eventLocation : "Location TBA";

  const eventPoints =
    typeof params.eventPoints === "string" ? params.eventPoints : "0";

  const addToCalendar = async () => {
    try {
      setAddingCalendar(true);

      const Calendar = await import("expo-calendar");
      const { status } = await Calendar.requestCalendarPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Calendar access is needed to add this event."
        );
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );

      const defaultCalendar =
        calendars.find((cal) => cal.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert("Error", "No calendar was found on this device.");
        return;
      }

      const parsedStartDate = new Date(`${eventDate} ${eventTime}`);

      const validStartDate = Number.isNaN(parsedStartDate.getTime())
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : parsedStartDate;

      const endDate = new Date(validStartDate.getTime() + 3 * 60 * 60 * 1000);

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: eventTitle,
        startDate: validStartDate,
        endDate,
        location: eventLocation,
        notes: `Volunteer event. You can earn ${eventPoints} points after attendance is confirmed.`,
        timeZone: "Asia/Singapore",
      });

      setCalendarAdded(true);

      Alert.alert("Added to Calendar", "This event has been added to your phone calendar.");
    } catch (err) {
      console.error("Calendar error:", err);
      Alert.alert("Error", "Failed to add event to calendar.");
    } finally {
      setAddingCalendar(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.decorCircleOne} />
          <View style={styles.decorCircleTwo} />

          <View style={styles.successRing}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={58} color="#fff" />
            </View>
          </View>

          <Text style={[styles.successTitle, { color: theme.colors.text }]}>
            You&apos;re Booked!
          </Text>

          <Text
            style={[styles.successSubtitle, { color: theme.colors.textSecondary }]}
          >
            Your spot has been reserved for this volunteer event.
          </Text>
        </View>

        <View
          style={[
            styles.eventCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.cardTopRow}>
            <View
              style={[
                styles.eventIconBox,
                { backgroundColor: theme.colors.primary + "22" },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={26}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.cardTitleArea}>
              <Text
                style={[styles.eventTitle, { color: theme.colors.text }]}
                numberOfLines={2}
              >
                {eventTitle}
              </Text>

              <Text
                style={[styles.eventSub, { color: theme.colors.textSecondary }]}
              >
                Booking confirmed
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.confirmedPill,
              { backgroundColor: "rgba(16,185,129,0.14)" },
            ]}
          >
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={styles.confirmedText}>Confirmed</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.detailList}>
            <View style={styles.detailRow}>
              <View
                style={[
                  styles.detailIconBox,
                  { backgroundColor: theme.colors.primary + "22" },
                ]}
              >
                <Ionicons
                  name="calendar-clear-outline"
                  size={17}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.detailTextBox}>
                <Text
                  style={[styles.detailLabel, { color: theme.colors.textSecondary }]}
                >
                  Date
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {eventDate}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View
                style={[
                  styles.detailIconBox,
                  { backgroundColor: theme.colors.primary + "22" },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={17}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.detailTextBox}>
                <Text
                  style={[styles.detailLabel, { color: theme.colors.textSecondary }]}
                >
                  Time
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {eventTime}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View
                style={[
                  styles.detailIconBox,
                  { backgroundColor: theme.colors.primary + "22" },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={17}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.detailTextBox}>
                <Text
                  style={[styles.detailLabel, { color: theme.colors.textSecondary }]}
                >
                  Location
                </Text>
                <Text
                  style={[styles.detailValue, { color: theme.colors.text }]}
                  numberOfLines={2}
                >
                  {eventLocation}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.rewardBox,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View>
              <Text
                style={[styles.rewardLabel, { color: theme.colors.textSecondary }]}
              >
                Points after check-in
              </Text>

              <Text style={[styles.rewardCaption, { color: theme.colors.textSecondary }]}>
                Points are awarded after your attendance is scanned.
              </Text>
            </View>

            <View style={styles.rewardPointsBox}>
              <Ionicons name="star" size={16} color={theme.colors.primaryLight} />
              <Text
                style={[styles.rewardPoints, { color: theme.colors.primaryLight }]}
              >
                +{eventPoints}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
            What happens next?
          </Text>

          <View style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepTextBox}>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                Attend the event
              </Text>
              <Text style={[styles.stepText, { color: theme.colors.textSecondary }]}>
                Arrive at the venue and check in with the organiser.
              </Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepTextBox}>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                Scan for points
              </Text>
              <Text style={[styles.stepText, { color: theme.colors.textSecondary }]}>
                Scan the event QR after volunteering to receive your points.
              </Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepTextBox}>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                Redeem rewards
              </Text>
              <Text style={[styles.stepText, { color: theme.colors.textSecondary }]}>
                Use your points to redeem coupons from the rewards page.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.calendarButton,
              {
                backgroundColor: calendarAdded
                  ? "rgba(16,185,129,0.16)"
                  : theme.colors.surface,
                borderColor: calendarAdded ? "#10b981" : theme.colors.border,
              },
            ]}
            onPress={addToCalendar}
            disabled={addingCalendar || calendarAdded}
            activeOpacity={0.85}
          >
            {addingCalendar ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                <Ionicons
                  name={calendarAdded ? "checkmark-circle" : "calendar-outline"}
                  size={19}
                  color={calendarAdded ? "#10b981" : theme.colors.primaryLight}
                />
                <Text
                  style={[
                    styles.calendarButtonText,
                    {
                      color: calendarAdded
                        ? "#10b981"
                        : theme.colors.primaryLight,
                    },
                  ]}
                >
                  {calendarAdded ? "Added to Calendar" : "Add to Phone Calendar"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.replace("/home")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              },
            ]}
            onPress={() => router.replace("/events")}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Browse More Events
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 42,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 26,
    position: "relative",
    overflow: "visible",
  },
  decorCircleOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(16,185,129,0.08)",
    top: -60,
    right: -50,
  },
  decorCircleTwo: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(99,102,241,0.08)",
    bottom: -20,
    left: -45,
  },
  successRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 2,
    borderColor: "rgba(16,185,129,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successCircle: {
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 280,
  },
  eventCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 20,
    marginBottom: 18,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  eventIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleArea: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
    marginBottom: 4,
  },
  eventSub: {
    fontSize: 12,
    fontWeight: "600",
  },
  confirmedPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginBottom: 14,
  },
  confirmedText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "900",
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  detailList: {
    gap: 14,
    marginBottom: 18,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  detailTextBox: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },
  rewardBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
  },
  rewardLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 3,
  },
  rewardCaption: {
    fontSize: 11,
    lineHeight: 16,
    maxWidth: 190,
  },
  rewardPointsBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  rewardPoints: {
    fontSize: 24,
    fontWeight: "900",
  },
  infoCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  stepTextBox: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 3,
  },
  stepText: {
    fontSize: 12,
    lineHeight: 17,
  },
  actionContainer: {
    gap: 12,
  },
  calendarButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
  },
  calendarButtonText: {
    fontSize: 15,
    fontWeight: "800",
  },
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
});