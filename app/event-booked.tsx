import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet, Alert, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Calendar from "expo-calendar";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function EventBooked() {
  const router = useRouter();
  const { theme } = useTheme();
  const { eventTitle, eventDate, eventTime, eventLocation, eventPoints } = useLocalSearchParams();
  const [calendarAdded, setCalendarAdded] = useState(false);

  const parseDateTime = () => {
    const dateStr = eventDate as string;
    const timeStr = eventTime as string;
    const startTime = timeStr.split(" - ")[0];

    const [month, day, year] = dateStr.split(" ");
    const monthMap: Record<string, number> = {
      January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
      July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
    };

    const monthNum = monthMap[month];
    const dayNum = parseInt(day.replace(",", ""));
    const yearNum = parseInt(year);

    const [timeOnly, meridiem] = startTime.trim().split(" ");
    let [hours, minutes] = timeOnly.split(":").map(Number);
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    return new Date(yearNum, monthNum, dayNum, hours, minutes);
  };

  const addToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Calendar access is needed to add this event to your phone calendar.");
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find((cal) => cal.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert("Error", "No calendar found on your device.");
        return;
      }

      const startDate = parseDateTime();
      const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);

      const event = {
        title: eventTitle as string,
        startDate,
        endDate,
        location: eventLocation as string,
        notes: `Volunteer event - Earn ${eventPoints} points!`,
        timeZone: "UTC",
      };

      await Calendar.createEventAsync(defaultCalendar.id, event);
      setCalendarAdded(true);
      Alert.alert("Success!", "Event has been added to your phone calendar.", [{ text: "OK" }]);
    } catch (err) {
      console.error("Calendar error:", err);
      Alert.alert("Error", "Failed to add event to calendar. Please try again.");
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Checkmark Circle */}
        <View style={styles.checkmarkContainer}>
          <View style={[styles.checkmarkCircle, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.checkmark, { color: theme.colors.text }]}>✓</Text>
          </View>
        </View>

        {/* Success Message */}
        <Text style={[styles.successTitle, { color: theme.colors.text }]}>Event Booked!</Text>
        <Text style={[styles.successSubtitle, { color: theme.colors.textSecondary }]}>Your spot is reserved</Text>

        {/* Event Card */}
        <View style={[styles.eventCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.eventTitle, { color: theme.colors.text }]}>{eventTitle}</Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>📅 {eventDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>🕐 {eventTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>📍 {eventLocation}</Text>
          </View>

          <View style={[styles.rewardBox, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <Text style={[styles.rewardLabel, { color: theme.colors.textSecondary }]}>You'll earn</Text>
            <Text style={[styles.rewardPoints, { color: theme.colors.primaryLight }]}>+{eventPoints}</Text>
            <Text style={[styles.rewardText, { color: theme.colors.textSecondary }]}>points</Text>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={[styles.notificationsSection, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notifications</Text>
          <View style={styles.notificationItem}>
            <Text style={[styles.notificationIcon, { color: theme.colors.primaryLight }]}>🔔</Text>
            <View style={styles.notificationContent}>
              <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>Event Confirmation</Text>
              <Text style={[styles.notificationText, { color: theme.colors.textSecondary }]}>Check-in confirmation will be sent 24h before</Text>
            </View>
          </View>
          <View style={styles.notificationItem}>
            <Text style={[styles.notificationIcon, { color: theme.colors.primaryLight }]}>⏰</Text>
            <View style={styles.notificationContent}>
              <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>Reminders</Text>
              <Text style={[styles.notificationText, { color: theme.colors.textSecondary }]}>You'll get a reminder 1 hour before the event</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.calendarButton, calendarAdded && styles.calendarButtonAdded, { backgroundColor: calendarAdded ? theme.colors.primary : theme.colors.surfaceSecondary }]}
            onPress={addToCalendar}
          >
            <Text style={[styles.calendarButtonText, { color: calendarAdded ? theme.colors.text : theme.colors.primaryLight }]}>
              {calendarAdded ? "✓ Added to Calendar" : "Add to Phone Calendar"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.continueButton, { backgroundColor: theme.colors.primary }]} onPress={() => router.push('/home')}>
            <Text style={[styles.continueText, { color: theme.colors.text }]}>Back to Home</Text>
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
    paddingVertical: 40,
  },
  checkmarkContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 56,
    fontWeight: "800",
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 15,
    marginBottom: 28,
    textAlign: "center",
  },
  eventCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
  },
  rewardBox: {
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  rewardLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  rewardPoints: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 2,
  },
  rewardText: {
    fontSize: 12,
  },
  notificationsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 13,
  },
  actionContainer: {
    gap: 12,
  },
  calendarButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
  },
  calendarButtonAdded: {
    opacity: 0.8,
  },
  calendarButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  continueButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  continueText: {
    fontSize: 15,
    fontWeight: "700",
  },
});