import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiGet, apiPost, apiDelete } from "./api";

const BASE_URL = "https://vol-rewards-api.onrender.com/api";
const CANCELLED_BOOKINGS_KEY = "cancelledBookingIds";

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  event_date: string;
  capacity: number;
  points_value: number;
  category: string;
  org_name: string;
  registrations?: number;
  registered?: boolean;
}

const getCancelledBookingIds = async (): Promise<number[]> => {
  const stored = await AsyncStorage.getItem(CANCELLED_BOOKINGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveCancelledBookingId = async (eventId: number) => {
  const ids = await getCancelledBookingIds();

  if (!ids.includes(Number(eventId))) {
    await AsyncStorage.setItem(
      CANCELLED_BOOKINGS_KEY,
      JSON.stringify([...ids, Number(eventId)])
    );
  }
};

const removeCancelledBookingId = async (eventId: number) => {
  const ids = await getCancelledBookingIds();

  const updated = ids.filter((id) => Number(id) !== Number(eventId));

  await AsyncStorage.setItem(CANCELLED_BOOKINGS_KEY, JSON.stringify(updated));
};

export default function Events() {
  const router = useRouter();
  const { theme } = useTheme();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [bookedIds, setBookedIds] = useState<number[]>([]);

  const loadUser = async () => {
    const stored = await AsyncStorage.getItem("user");

    if (!stored) {
      Alert.alert("Login required", "Please login again.");
      router.replace("/login");
      return null;
    }

    return JSON.parse(stored);
  };

  const syncBookedEventsToStorage = async (latestEvents: Event[]) => {
    const cancelledIds = await getCancelledBookingIds();

    const bookedEvents = latestEvents.filter(
      (event) =>
        event.registered && !cancelledIds.includes(Number(event.id))
    );

    await AsyncStorage.setItem("bookedEvents", JSON.stringify(bookedEvents));

    setBookedIds(bookedEvents.map((event) => Number(event.id)));
  };

  const fetchEvents = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const user = await loadUser();

      if (!user) {
        return;
      }

      const data = await apiGet("/events");

      const cancelledIds = await getCancelledBookingIds();

      const fetchedEvents: Event[] = (data.events || []).map((event: Event) => {
        if (cancelledIds.includes(Number(event.id))) {
          return {
            ...event,
            registered: false,
          };
        }

        return event;
      });

      setEvents(fetchedEvents);
      await syncBookedEventsToStorage(fetchedEvents);
    } catch (err: any) {
      console.error("Failed to fetch events:", err);
      Alert.alert("Error", err.message || "Failed to load events.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents(true);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents(false);
  };

  const goToEventBookedPage = (event: Event) => {
    router.push({
      pathname: "/event-booked",
      params: {
        eventTitle: event.title,
        eventDate: formatFullDate(event.event_date),
        eventTime: formatTime(event.event_date),
        eventLocation: event.location,
        eventPoints: String(event.points_value),
      },
    } as any);
  };

  const saveSingleBookedEventToStorage = async (event: Event) => {
    const stored = await AsyncStorage.getItem("bookedEvents");
    const bookedEvents: Event[] = stored ? JSON.parse(stored) : [];

    const alreadySaved = bookedEvents.some(
      (item) => Number(item.id) === Number(event.id)
    );

    if (!alreadySaved) {
      await AsyncStorage.setItem(
        "bookedEvents",
        JSON.stringify([{ ...event, registered: true }, ...bookedEvents])
      );
    }
  };

  const removeSingleBookedEventFromStorage = async (eventId: number) => {
    const stored = await AsyncStorage.getItem("bookedEvents");
    const bookedEvents: Event[] = stored ? JSON.parse(stored) : [];

    const updated = bookedEvents.filter(
      (event) => Number(event.id) !== Number(eventId)
    );

    await AsyncStorage.setItem("bookedEvents", JSON.stringify(updated));
  };

  const handleRegisterEvent = async (event: Event) => {
    const registrations = Number(event.registrations ?? 0);
    const capacity = Number(event.capacity ?? 0);
    const isFull = capacity > 0 && registrations >= capacity;

    if (isFull) {
      Alert.alert("Event full", "This event has reached its volunteer capacity.");
      return;
    }

    const user = await loadUser();

    if (!user) {
      return;
    }

    try {
      setBookingId(event.id);

      const data = await apiPost(`/events/${event.id}/register`);

      console.log("EVENTS BOOK STATUS: 201");
      console.log("EVENTS BOOK DATA:", data);

      await removeCancelledBookingId(event.id);

      const updatedRegistrations =
        typeof data.registrations !== "undefined"
          ? Number(data.registrations)
          : registrations + 1;

      const updatedEvent = {
        ...event,
        registered: true,
        registrations: updatedRegistrations,
      };

      setEvents((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(event.id) ? updatedEvent : item
        )
      );

      setBookedIds((prev) =>
        prev.includes(Number(event.id)) ? prev : [...prev, Number(event.id)]
      );

      await saveSingleBookedEventToStorage(updatedEvent);

      await fetchEvents(false);

      goToEventBookedPage(updatedEvent);
    } catch (error: any) {
      console.error("Book event error:", error);
      Alert.alert("Error", error.message || "Failed to book this event.");
    } finally {
      setBookingId(null);
    }
  };

  const cancelBookingNow = async (event: Event) => {
    const user = await loadUser();

    if (!user) {
      return;
    }

    const currentRegistrations = Number(event.registrations ?? 0);
    const fallbackRegistrations = Math.max(currentRegistrations - 1, 0);

    try {
      setBookingId(event.id);

      const data = await apiDelete(`/events/${event.id}/register`);

      console.log("EVENTS DELETE STATUS: 200");
      console.log("EVENTS DELETE DATA:", data);

      const updatedRegistrations =
        typeof data.registrations !== "undefined" &&
        data.registrations !== null &&
        !Number.isNaN(Number(data.registrations))
          ? Number(data.registrations)
          : fallbackRegistrations;

      await saveCancelledBookingId(event.id);

      setEvents((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(event.id)
            ? {
                ...item,
                registered: false,
                registrations: updatedRegistrations,
              }
            : item
        )
      );

      setBookedIds((prev) =>
        prev.filter((id) => Number(id) !== Number(event.id))
      );

      await removeSingleBookedEventFromStorage(event.id);

      Alert.alert(
        "Booking cancelled",
        "This event has been removed from your bookings."
      );

      await fetchEvents(false);
    } catch (error: any) {
      console.error("Cancel event error:", error);
      Alert.alert("Error", error.message || "Failed to cancel booking.");
    } finally {
      setBookingId(null);
    }
  };

  const handleCancelEvent = async (event: Event) => {
    Alert.alert(
      "Cancel booking?",
      `Remove "${event.title}" from your bookings?`,
      [
        {
          text: "Keep",
          style: "cancel",
        },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: () => cancelBookingNow(event),
        },
      ]
    );
  };

  const handleBookButtonPress = async (event: Event) => {
    const isBooked =
      bookedIds.includes(Number(event.id)) || Boolean(event.registered);

    if (isBooked) {
      Alert.alert("Booking Options", "What would you like to do?", [
        {
          text: "View Booking",
          onPress: () => goToEventBookedPage(event),
        },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: () => handleCancelEvent(event),
        },
        {
          text: "Close",
          style: "cancel",
        },
      ]);

      return;
    }

    await handleRegisterEvent(event);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      environment: "#10b981",
      community: "#f97316",
      education: "#3b82f6",
      health: "#ec4899",
      elderly: "#a855f7",
      youth: "#06b6d4",
      food: "#f59e0b",
      disaster: "#ef4444",
    };

    return colors[category?.toLowerCase()] || "#6366f1";
  };

  const getCategoryIcon = (category: string, title: string) => {
    const text = `${category || ""} ${title || ""}`.toLowerCase();

    if (
      text.includes("environment") ||
      text.includes("beach") ||
      text.includes("park")
    ) {
      return "leaf-outline";
    }

    if (
      text.includes("food") ||
      text.includes("soup") ||
      text.includes("kitchen")
    ) {
      return "restaurant-outline";
    }

    if (text.includes("blood") || text.includes("health")) {
      return "heart-outline";
    }

    if (
      text.includes("youth") ||
      text.includes("mentor") ||
      text.includes("education")
    ) {
      return "school-outline";
    }

    if (text.includes("elderly")) {
      return "people-outline";
    }

    if (text.includes("disaster") || text.includes("preparedness")) {
      return "shield-checkmark-outline";
    }

    return "calendar-outline";
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Upcoming";
    }

    return date.toLocaleDateString("en-SG", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Time TBA";
    }

    return date.toLocaleTimeString("en-SG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderEventCard = ({ item }: { item: Event }) => {
    const isBooked =
      bookedIds.includes(Number(item.id)) || Boolean(item.registered);

    const categoryColor = getCategoryColor(item.category);
    const categoryIcon = getCategoryIcon(item.category, item.title);
    const registrations = Number(item.registrations ?? 0);
    const capacity = Number(item.capacity ?? 0);
    const isFull = capacity > 0 && registrations >= capacity && !isBooked;
    const progress =
      capacity > 0 ? Math.min((registrations / capacity) * 100, 100) : 0;
    const isSubmitting = bookingId === item.id;

    return (
      <View
        style={[
          styles.eventCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isBooked ? categoryColor : theme.colors.border,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: categoryColor + "22" },
            ]}
          >
            <Ionicons
              name={categoryIcon as any}
              size={14}
              color={categoryColor}
            />
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {item.category || "Event"}
            </Text>
          </View>

          <View
            style={[
              styles.pointsBadge,
              { backgroundColor: theme.colors.primary + "22" },
            ]}
          >
            <Ionicons name="star" size={13} color={theme.colors.primaryLight} />
            <Text
              style={[styles.pointsReward, { color: theme.colors.primaryLight }]}
            >
              +{item.points_value} pts
            </Text>
          </View>
        </View>

        <Text style={[styles.eventTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>

        <View style={styles.orgRow}>
          <Ionicons
            name="business-outline"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[styles.orgText, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.org_name ? `Organised by ${item.org_name}` : "Volunteer event"}
          </Text>
        </View>

        <View
          style={[
            styles.detailsBox,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.detailRow}>
            <View
              style={[
                styles.detailIconBox,
                { backgroundColor: categoryColor + "22" },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={15}
                color={categoryColor}
              />
            </View>

            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {formatFullDate(item.event_date)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View
              style={[
                styles.detailIconBox,
                { backgroundColor: categoryColor + "22" },
              ]}
            >
              <Ionicons name="time-outline" size={15} color={categoryColor} />
            </View>

            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {formatTime(item.event_date)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View
              style={[
                styles.detailIconBox,
                { backgroundColor: categoryColor + "22" },
              ]}
            >
              <Ionicons
                name="location-outline"
                size={15}
                color={categoryColor}
              />
            </View>

            <Text
              style={[styles.detailText, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {item.location}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.eventDescription, { color: theme.colors.textSecondary }]}
          numberOfLines={3}
        >
          {item.description}
        </Text>

        <View style={styles.capacitySection}>
          <View style={styles.capacityTopRow}>
            <Text style={[styles.capacityText, { color: theme.colors.text }]}>
              Capacity
            </Text>

            <Text
              style={[
                styles.capacityCount,
                {
                  color: isFull ? "#ef4444" : theme.colors.textSecondary,
                },
              ]}
            >
              {registrations}/{capacity} volunteers
            </Text>
          </View>

          <View
            style={[
              styles.progressBg,
              { backgroundColor: theme.colors.border },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%` as any,
                  backgroundColor: isFull ? "#ef4444" : categoryColor,
                },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.bookButton,
            {
              backgroundColor: isBooked
                ? theme.colors.surfaceSecondary
                : isFull
                ? theme.colors.border
                : theme.colors.primary,
              borderColor: isBooked
                ? categoryColor
                : isFull
                ? theme.colors.border
                : theme.colors.primary,
            },
          ]}
          onPress={() => handleBookButtonPress(item)}
          disabled={isSubmitting || isFull}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator
              size="small"
              color={isBooked ? categoryColor : "#fff"}
            />
          ) : (
            <>
              <Ionicons
                name={
                  isBooked
                    ? "checkmark-circle-outline"
                    : isFull
                    ? "close-circle-outline"
                    : "add-circle-outline"
                }
                size={18}
                color={
                  isBooked
                    ? categoryColor
                    : isFull
                    ? theme.colors.textTertiary
                    : "#fff"
                }
              />

              <Text
                style={[
                  styles.bookButtonText,
                  {
                    color: isBooked
                      ? categoryColor
                      : isFull
                      ? theme.colors.textTertiary
                      : "#fff",
                  },
                ]}
              >
                {isBooked ? "Booked · Manage" : isFull ? "Fully Booked" : "Book Now"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Volunteer Events
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Discover meaningful opportunities
          </Text>
        </View>

        <View style={styles.spacer} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Loading events...
          </Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconBox,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={54}
              color={theme.colors.textSecondary}
            />
          </View>

          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No events yet
          </Text>

          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            New volunteer events will appear here once available.
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) =>
            `${item.id}-${item.registered ? "booked" : "open"}-${
              item.registrations ?? 0
            }`
          }
          renderItem={renderEventCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          extraData={{ bookedIds, bookingId, events }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
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
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 21,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  spacer: {
    width: 42,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  eventCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexShrink: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pointsReward: {
    fontSize: 12,
    fontWeight: "900",
  },
  eventTitle: {
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 8,
    lineHeight: 24,
  },
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  orgText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  detailsBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  detailText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  capacitySection: {
    marginBottom: 16,
  },
  capacityTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: "800",
  },
  capacityCount: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressBg: {
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  bookButton: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: "800",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 70,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 104,
    height: 104,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});