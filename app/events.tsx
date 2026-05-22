import { Text, View, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  participants: number;
  maxParticipants: number;
  pointsReward: number;
  category: string;
  booked: boolean;
}

const eventsData: Event[] = [
  {
    id: "1",
    title: "Beach Cleanup",
    date: "May 18, 2026",
    time: "09:00 AM - 12:00 PM",
    location: "East Coast Park Beach",
    description: "Help us clean up our beautiful beach and protect marine life.",
    participants: 24,
    maxParticipants: 30,
    pointsReward: 50,
    category: "Environment",
    booked: false,
  },
  {
    id: "2",
    title: "Food Bank Volunteer",
    date: "May 20, 2026",
    time: "02:00 PM - 05:00 PM",
    location: "Downtown Food Bank",
    description: "Sort and pack food donations for families in need.",
    participants: 18,
    maxParticipants: 25,
    pointsReward: 40,
    category: "Food & Hunger",
    booked: true,
  },
  {
    id: "3",
    title: "Park Restoration",
    date: "May 25, 2026",
    time: "10:00 AM - 01:00 PM",
    location: "Botanic Gardens",
    description: "Plant trees and restore natural habitats in our local park.",
    participants: 32,
    maxParticipants: 40,
    pointsReward: 60,
    category: "Environment",
    booked: false,
  },
  {
    id: "4",
    title: "Youth Tutoring",
    date: "May 22, 2026",
    time: "03:00 PM - 06:00 PM",
    location: "Community Center",
    description: "Tutor students in math and reading skills.",
    participants: 12,
    maxParticipants: 20,
    pointsReward: 45,
    category: "Education",
    booked: false,
  },
  {
    id: "5",
    title: "Senior Care Visit",
    date: "May 23, 2026",
    time: "04:00 PM - 06:00 PM",
    location: "Sunrise Senior Home",
    description: "Spend time with seniors, play games, and keep them company.",
    participants: 8,
    maxParticipants: 15,
    pointsReward: 35,
    category: "Healthcare",
    booked: false,
  },
];

export default function Events() {
  const router = useRouter();
  const { theme } = useTheme();
  const [events, setEvents] = useState<Event[]>(eventsData);

  const handleBookEvent = (event: Event) => {
    if (!event.booked) {
      // Navigate to booking success page
      router.push({
        pathname: '/event-booked',
        params: {
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          eventLocation: event.location,
          eventPoints: event.pointsReward.toString(),
        },
      });
    }
    // Update local state
    setEvents(
      events.map((e) =>
        e.id === event.id ? { ...e, booked: !e.booked } : e
      )
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Environment: "#10b981",
      "Food & Hunger": "#f97316",
      Education: "#3b82f6",
      Healthcare: "#ec4899",
    };
    return colors[category] || "#6366f1";
  };

  const renderEventCard = ({ item }: { item: Event }) => {
    const spotsLeft = item.maxParticipants - item.participants;
    const isFullyBooked = spotsLeft <= 0;

    return (
      <View style={[styles.eventCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <Text
              style={[
                styles.categoryText,
                { color: getCategoryColor(item.category) },
              ]}
            >
              {item.category}
            </Text>
          </View>
          <Text style={[styles.pointsReward, { color: theme.colors.primaryLight }]}>+{item.pointsReward} pts</Text>
        </View>

        <Text style={[styles.eventTitle, { color: theme.colors.text }]}>{item.title}</Text>

        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>📅 {item.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>🕐 {item.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>📍 {item.location}</Text>
          </View>
        </View>

        <Text style={[styles.eventDescription, { color: theme.colors.textSecondary }]}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.participantsBox}>
            <Text style={[styles.participantsText, { color: theme.colors.text }]}>
              {item.participants}/{item.maxParticipants} participants
            </Text>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceSecondary }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(item.participants / item.maxParticipants) * 100}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.bookButton,
              item.booked && styles.bookedButton,
              isFullyBooked && !item.booked && styles.fullyBookedButton,
              { backgroundColor: item.booked ? theme.colors.primary : theme.colors.primary }
            ]}
            onPress={() => handleBookEvent(item)}
            disabled={isFullyBooked && !item.booked}
          >
            <Text
              style={[
                styles.bookButtonText,
                item.booked && styles.bookedButtonText,
                { color: theme.colors.text }
              ]}
            >
              {item.booked ? "Cancel" : isFullyBooked ? "Full" : "Book Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <Text style={[styles.backText, { color: theme.colors.primaryLight }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Volunteer Events</Text>
        <View style={styles.spacer} />
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEventCard}
        contentContainerStyle={styles.listContainer}
        scrollEnabled={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  spacer: {
    width: 56,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  eventCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "700",
  },
  pointsReward: {
    fontSize: 14,
    fontWeight: "700",
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 12,
  },
  detailRow: {
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    gap: 12,
  },
  participantsBox: {
    gap: 6,
  },
  participantsText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  bookButton: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  bookedButton: {
    opacity: 0.5,
  },
  fullyBookedButton: {
    opacity: 0.3,
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  bookedButtonText: {
    opacity: 0.8,
  },
});
