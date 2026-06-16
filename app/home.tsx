import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiGet, apiDelete } from "./api";

const BASE_URL = "http://192.168.72.201:3000/api";
const CANCELLED_BOOKINGS_KEY = "cancelledBookingIds";

const CARD_IMAGE_HEIGHT = 120;
const CARD_WIDTH = 200;

interface FeaturedEvent {
  id: number;
  title: string;
  description?: string;
  event_date?: string;
  location: string;
  points_value: number;
  category: string;
  org_name?: string;
  registrations?: number;
  capacity?: number;
  registered?: boolean;
}

interface UpdateItem {
  id: number;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  is_read?: boolean;
  created_at?: string;
}

const getCancelledBookingIds = async (): Promise<number[]> => {
  const stored = await AsyncStorage.getItem(CANCELLED_BOOKINGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveCancelledBookingId = async (eventId: number) => {
  const ids = await getCancelledBookingIds();

  if (!ids.includes(eventId)) {
    await AsyncStorage.setItem(
      CANCELLED_BOOKINGS_KEY,
      JSON.stringify([...ids, eventId])
    );
  }
};

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getEventImage = (category?: string, title?: string) => {
  const text = `${category || ""} ${title || ""}`.toLowerCase();

  if (text.includes("beach") || text.includes("cleanup")) {
    return require("@/assets/images/beach.webp");
  }

  if (
    text.includes("food bank") ||
    text.includes("sorting") ||
    text.includes("packing")
  ) {
    return require("@/assets/images/foodbank.jpg");
  }

  if (text.includes("blood") || text.includes("donation")) {
    return require("@/assets/images/blooddonation.jpg");
  }

  if (
    text.includes("disaster") ||
    text.includes("preparedness") ||
    text.includes("workshop")
  ) {
    return require("@/assets/images/disasterprep.png");
  }

  if (
    text.includes("guided") ||
    text.includes("walk") ||
    text.includes("botanic")
  ) {
    return require("@/assets/images/guidedwalk.webp");
  }

  if (
    text.includes("soup") ||
    text.includes("kitchen") ||
    text.includes("willing hearts") ||
    text.includes("elderly")
  ) {
    return require("@/assets/images/soup kitchen.webp");
  }

  if (text.includes("youth") || text.includes("mentor")) {
    return require("@/assets/images/youthmentoring.jpg");
  }

  if (
    text.includes("park") ||
    text.includes("garden") ||
    text.includes("wetland") ||
    text.includes("restoration") ||
    text.includes("environment")
  ) {
    return require("@/assets/images/park.jpg");
  }

  return require("@/assets/images/beach.webp");
};

const getEventColor = (category?: string) => {
  const lower = (category || "").toLowerCase();

  if (lower.includes("environment")) return "#10b981";
  if (lower.includes("community")) return "#f97316";
  if (lower.includes("health")) return "#ef4444";
  if (lower.includes("youth")) return "#6366f1";
  if (lower.includes("elderly")) return "#ec4899";
  if (lower.includes("food")) return "#f59e0b";
  if (lower.includes("education")) return "#3b82f6";

  return "#6366f1";
};

const getEventIcon = (category?: string, title?: string) => {
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

  if (text.includes("disaster")) {
    return "shield-checkmark-outline";
  }

  return "calendar-outline";
};

const formatEventDate = (dateString?: string) => {
  if (!dateString) return "Upcoming";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Upcoming";
  }

  return date.toLocaleDateString("en-SG", {
    month: "short",
    day: "numeric",
  });
};

const formatEventFullDate = (dateString?: string) => {
  if (!dateString) return "Upcoming";

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

const formatEventTime = (dateString?: string) => {
  if (!dateString) return "Time TBA";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Time TBA";
  }

  return date.toLocaleTimeString("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getUpdateIcon = (icon?: string) => {
  if (!icon) return "notifications-outline";
  return icon;
};

const getUpdateColor = (color?: string) => {
  if (!color) return "#6366f1";
  return color;
};

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Volunteer");
  const [userPoints, setUserPoints] = useState(0);
  const [activeCoupons, setActiveCoupons] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([]);
  const [bookedEvents, setBookedEvents] = useState<FeaturedEvent[]>([]);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const syncBookedEvents = async (latestEvents: FeaturedEvent[]) => {
    const cancelledIds = await getCancelledBookingIds();

    const latestBookedEvents = latestEvents.filter(
      (event) => event.registered && !cancelledIds.includes(Number(event.id))
    );

    setBookedEvents(latestBookedEvents);

    await AsyncStorage.setItem(
      "bookedEvents",
      JSON.stringify(latestBookedEvents)
    );
  };

  const refreshEventsAndBookings = async (userId: number) => {
    const eventsData = await apiGet("/events");

    const cancelledIds = await getCancelledBookingIds();

    const latestEvents: FeaturedEvent[] = (eventsData.events || []).map(
      (event: FeaturedEvent) => {
        if (cancelledIds.includes(Number(event.id))) {
          return {
            ...event,
            registered: false,
          };
        }

        return event;
      }
    );

    setFeaturedEvents(latestEvents.slice(0, 8));
    await syncBookedEvents(latestEvents);
  };

  const removeBookingFromHome = async (
    eventId: number,
    registrations?: number
  ) => {
    setBookedEvents((prev) => {
      const updated = prev.filter(
        (event) => Number(event.id) !== Number(eventId)
      );

      AsyncStorage.setItem("bookedEvents", JSON.stringify(updated));

      return updated;
    });

    setFeaturedEvents((prev) =>
      prev.map((event) =>
        Number(event.id) === Number(eventId)
          ? {
              ...event,
              registered: false,
              registrations: Number(registrations ?? 0),
            }
          : event
      )
    );
  };

  const cancelBooking = async (event: FeaturedEvent) => {
    try {
      setCancelingId(event.id);

      const stored = await AsyncStorage.getItem("user");

      if (!stored) {
        Alert.alert("Login required", "Please login again.");
        router.replace("/login");
        return;
      }

      const user = JSON.parse(stored);

      const data = await apiDelete(`/events/${event.id}/register`);
      console.log("HOME DELETE DATA:", data);

      await saveCancelledBookingId(Number(event.id));
      await removeBookingFromHome(Number(event.id), data.registrations);

      Alert.alert(
        "Booking cancelled",
        `"${event.title}" has been removed from your bookings.`
      );
    } catch (error: any) {
      console.error("Failed to cancel booking:", error);
      Alert.alert("Error", error.message || "Failed to cancel booking.");
    } finally {
      setCancelingId(null);
    }
  };

  const confirmCancelBooking = (event: FeaturedEvent) => {
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
          onPress: () => cancelBooking(event),
        },
      ]
    );
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const stored = await AsyncStorage.getItem("user");

      if (!stored) {
        setUserName("Volunteer");
        setUserPoints(0);
        setActiveCoupons(0);
        setUnreadCount(0);
        setAvatarUri(null);
        setFeaturedEvents([]);
        setBookedEvents([]);
        setUpdates([]);
        await AsyncStorage.removeItem("bookedEvents");
        return;
      }

      const user = JSON.parse(stored);

      setAvatarUri(user.avatar_url || null);
      setUserName(user.name || "Volunteer");

      const storedPoints = await AsyncStorage.getItem("userPoints");
      setUserPoints(Number(storedPoints ?? user.points ?? 0));

      try {
        const profileData = await apiGet("/auth/me");

        if (profileData) {
          const freshPoints = Number(profileData.points ?? 0);

          setUserPoints(freshPoints);

          const updatedUser = {
            ...user,
            ...profileData,
          };

          setUserName(updatedUser.name || "Volunteer");
          setAvatarUri(updatedUser.avatar_url || null);

          await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
          await AsyncStorage.setItem("userPoints", String(freshPoints));
        }
      } catch (profileErr) {
        console.log("Profile refresh skipped:", profileErr);
      }

      try {
        const couponsData = await apiGet("/me/coupons");

        if (couponsData && couponsData.data) {
          const active = (couponsData.data || []).filter(
            (c: any) => c.status === "unused"
          ).length;

          setActiveCoupons(active);
        }
      } catch (couponsErr) {
        console.log("Coupons refresh skipped:", couponsErr);
      }

      try {
        const notifData = await apiGet("/notifications");

        const notifications = notifData.notifications || [];

        const unread = notifications.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);

        setUpdates(notifications.slice(0, 3));
      } catch (notifErr) {
        console.log("Notifications refresh skipped:", notifErr);
      }

      try {
        await refreshEventsAndBookings(user.id);
      } catch (eventsErr) {
        console.log("Events refresh skipped:", eventsErr);

        const storedBookedEvents = await AsyncStorage.getItem("bookedEvents");
        const parsedBookedEvents: FeaturedEvent[] = storedBookedEvents
          ? JSON.parse(storedBookedEvents)
          : [];

        const cancelledIds = await getCancelledBookingIds();

        const filteredBookedEvents = parsedBookedEvents.filter(
          (event) => !cancelledIds.includes(Number(event.id))
        );

        setBookedEvents(filteredBookedEvents);

        await AsyncStorage.setItem(
          "bookedEvents",
          JSON.stringify(filteredBookedEvents)
        );
      }
    } catch (err) {
      console.error("Failed to load home data:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const visibleBookedEvents = bookedEvents.slice(0, 3);
  const hiddenBookingCount = Math.max(
    bookedEvents.length - visibleBookedEvents.length,
    0
  );

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
      >
        <View style={styles.header}>
          <View>
            <Text
              style={[styles.greeting, { color: theme.colors.textSecondary }]}
            >
              {getGreeting()}, {userName}
            </Text>

            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Volunteer Rewards
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[
                styles.notifBtn,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => router.push("/notifications")}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={theme.colors.text}
              />

              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.avatarBtn,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => router.push("/profile" as any)}
              activeOpacity={0.8}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.headerAvatarImg} />
              ) : (
                <Ionicons
                  name="person"
                  size={22}
                  color={theme.colors.textSecondary}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.walletCard,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
        >
          <View style={styles.walletDecorOne} />
          <View style={styles.walletDecorTwo} />

          <View style={styles.walletTop}>
            <View>
              <Text style={styles.walletLabel}>POINTS WALLET</Text>

              {loading ? (
                <ActivityIndicator
                  color="#fff"
                  size="small"
                  style={{ marginVertical: 16 }}
                />
              ) : (
                <Text style={styles.walletPoints}>
                  {userPoints.toLocaleString()}
                </Text>
              )}

              <Text style={styles.walletCaption}>
                Earn points by volunteering and scanning QR codes.
              </Text>
            </View>

            <View style={styles.walletIconCircle}>
              <Ionicons name="sparkles-outline" size={28} color="#fff" />
            </View>
          </View>

          <View style={styles.walletActions}>
            <TouchableOpacity
              style={styles.walletActionBtn}
              onPress={() => router.push("/scan" as any)}
            >
              <Ionicons name="qr-code-outline" size={20} color="#fff" />
              <Text style={styles.walletActionText}>My QR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.walletActionBtn}
              onPress={() => router.push("/rewards")}
            >
              <Ionicons name="gift-outline" size={20} color="#fff" />
              <Text style={styles.walletActionText}>Redeem</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.walletActionBtn}
              onPress={() => router.push("/my-coupons" as any)}
            >
              <Ionicons name="ticket-outline" size={20} color="#fff" />
              <Text style={styles.walletActionText}>Coupons</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.phaseTwoCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.phaseTwoHeader}>
            <View>
              <Text style={[styles.phaseTwoTitle, { color: theme.colors.text }]}>
                Smart Volunteering
              </Text>
              <Text
                style={[
                  styles.phaseTwoSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Discover events picked for you and track top volunteers
              </Text>
            </View>

            <View
              style={[
                styles.phaseTwoHeaderIcon,
                { backgroundColor: theme.colors.primary + "22" },
              ]}
            >
              <Ionicons
                name="sparkles-outline"
                size={22}
                color={theme.colors.primary}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.phaseTwoButton, { backgroundColor: "#6366f1" }]}
            onPress={() => router.push("/ai-recommendations" as any)}
            activeOpacity={0.88}
          >
            <View style={styles.phaseTwoButtonLeft}>
              <View style={styles.phaseTwoButtonIcon}>
                <Ionicons name="bulb-outline" size={22} color="#fff" />
              </View>

              <View style={styles.phaseTwoButtonTextWrap}>
                <Text style={styles.phaseTwoButtonTitle}>AI Recommendations</Text>
                <Text style={styles.phaseTwoButtonSub}>
                  Get events based on your activity
                </Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.phaseTwoButton, { backgroundColor: "#f59e0b" }]}
            onPress={() => router.push("/hall-of-fame" as any)}
            activeOpacity={0.88}
          >
            <View style={styles.phaseTwoButtonLeft}>
              <View style={styles.phaseTwoButtonIcon}>
                <Ionicons name="trophy-outline" size={22} color="#fff" />
              </View>

              <View style={styles.phaseTwoButtonTextWrap}>
                <Text style={styles.phaseTwoButtonTitle}>Hall of Fame</Text>
                <Text style={styles.phaseTwoButtonSub}>
                  See your ranking and top volunteers
                </Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {bookedEvents.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Your Bookings
                </Text>
                <Text
                  style={[
                    styles.sectionSubtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {bookedEvents.length} upcoming event
                  {bookedEvents.length !== 1 ? "s" : ""}
                </Text>
              </View>

              <TouchableOpacity onPress={() => setManageModalVisible(true)}>
                <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
                  Manage
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.bookingPreviewCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.bookingPreviewTop}>
                <View>
                  <Text
                    style={[
                      styles.bookingPreviewTitle,
                      { color: theme.colors.text },
                    ]}
                  >
                    Upcoming Schedule
                  </Text>
                  <Text
                    style={[
                      styles.bookingPreviewSub,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Manage or cancel confirmed bookings
                  </Text>
                </View>

                <View
                  style={[
                    styles.bookingCountPill,
                    { backgroundColor: theme.colors.primary + "22" },
                  ]}
                >
                  <Text
                    style={[
                      styles.bookingCountText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {bookedEvents.length}
                  </Text>
                </View>
              </View>

              {visibleBookedEvents.map((event, index) => {
                const color = getEventColor(event.category);
                const icon = getEventIcon(event.category, event.title);

                return (
                  <View key={`${event.id}-${index}`}>
                    <View style={styles.bookingRow}>
                      <View
                        style={[
                          styles.bookedIcon,
                          { backgroundColor: color + "22" },
                        ]}
                      >
                        <Ionicons name={icon as any} size={22} color={color} />
                      </View>

                      <View style={styles.bookedText}>
                        <Text
                          style={[
                            styles.bookedTitle,
                            { color: theme.colors.text },
                          ]}
                          numberOfLines={1}
                        >
                          {event.title}
                        </Text>

                        <Text
                          style={[
                            styles.bookedSub,
                            { color: theme.colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {formatEventDate(event.event_date)} ·{" "}
                          {formatEventTime(event.event_date)}
                        </Text>

                        <Text
                          style={[
                            styles.bookedLocation,
                            { color: theme.colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {event.location}
                        </Text>
                      </View>

                      <View style={styles.bookedRight}>
                        <Text style={[styles.bookedPoints, { color }]}>
                          +{event.points_value ?? 0}
                        </Text>
                        <Text
                          style={[
                            styles.bookedPointsLabel,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          pts
                        </Text>
                      </View>
                    </View>

                    {index !== visibleBookedEvents.length - 1 && (
                      <View
                        style={[
                          styles.bookingDivider,
                          { backgroundColor: theme.colors.border },
                        ]}
                      />
                    )}
                  </View>
                );
              })}

              <TouchableOpacity
                style={[
                  styles.manageBookingsBtn,
                  {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                onPress={() => setManageModalVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="settings-outline" size={18} color="#fff" />
                <Text style={styles.manageBookingsText}>Manage Bookings</Text>

                {hiddenBookingCount > 0 && (
                  <View style={styles.hiddenCountBadge}>
                    <Text style={styles.hiddenCountText}>
                      +{hiddenBookingCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View
              style={[
                styles.emptyBookingCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.emptyBookingIcon,
                  { backgroundColor: theme.colors.primary + "22" },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={30}
                  color={theme.colors.primary}
                />
              </View>

              <Text style={[styles.emptyBookingTitle, { color: theme.colors.text }]}>
                No bookings yet
              </Text>

              <Text
                style={[
                  styles.emptyBookingText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Explore volunteer events and book your first opportunity.
              </Text>

              <TouchableOpacity
                style={[
                  styles.emptyBookingBtn,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => router.push("/events")}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyBookingBtnText}>Browse Events</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Featured Events
            </Text>

            <TouchableOpacity onPress={() => router.push("/events")}>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View
              style={[
                styles.loadingCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <ActivityIndicator color={theme.colors.primary} />
              <Text
                style={[
                  styles.loadingText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Loading events...
              </Text>
            </View>
          ) : featuredEvents.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={28}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[styles.emptyText, { color: theme.colors.textSecondary }]}
              >
                No upcoming events yet
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {featuredEvents.map((event) => {
                const color = getEventColor(event.category);
                const image = getEventImage(event.category, event.title);
                const participants = event.registrations ?? 0;
                const maxParticipants = event.capacity ?? 1;
                const progress =
                  maxParticipants > 0
                    ? Math.min((participants / maxParticipants) * 100, 100)
                    : 0;

                return (
                  <TouchableOpacity
                    key={`${event.id}-${participants}`}
                    style={styles.eventCard}
                    activeOpacity={0.88}
                    onPress={() => router.push("/events")}
                  >
                    <View
                      style={[styles.eventCardTop, { backgroundColor: color }]}
                    >
                      <Image
                        source={image}
                        style={styles.eventImage}
                        resizeMode="cover"
                      />

                      <View style={styles.eventCardOverlay} />

                      <View style={styles.eventCardBadge}>
                        <Text style={styles.eventCardBadgeText}>
                          {event.category || "Event"}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.eventCardBody,
                        { backgroundColor: theme.colors.surface },
                      ]}
                    >
                      <Text style={[styles.eventCardDate, { color }]}>
                        {formatEventDate(event.event_date)}
                      </Text>

                      <Text
                        style={[
                          styles.eventCardTitle,
                          { color: theme.colors.text },
                        ]}
                        numberOfLines={2}
                      >
                        {event.title}
                      </Text>

                      <View style={styles.locationRow}>
                        <Ionicons
                          name="location-outline"
                          size={11}
                          color={theme.colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.eventCardLocation,
                            { color: theme.colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {event.location}
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
                              backgroundColor: color,
                            },
                          ]}
                        />
                      </View>

                      <View style={styles.eventCardFooter}>
                        <Text
                          style={[
                            styles.eventParticipants,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          {participants}/{maxParticipants} joined
                        </Text>

                        <Text style={[styles.eventPoints, { color }]}>
                          +{event.points_value ?? 0} pts
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.couponsBanner,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => router.push("/my-coupons" as any)}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.couponsBannerIcon,
                { backgroundColor: "#ec489922" },
              ]}
            >
              <Ionicons name="ticket" size={24} color="#ec4899" />
            </View>

            <View style={styles.couponsBannerText}>
              <Text
                style={[styles.couponsBannerTitle, { color: theme.colors.text }]}
              >
                My Coupons
              </Text>

              <Text
                style={[
                  styles.couponsBannerSub,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {activeCoupons} active coupon{activeCoupons !== 1 ? "s" : ""}{" "}
                ready to use
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Latest Updates
            </Text>

            <TouchableOpacity onPress={() => router.push("/notifications")}>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View
              style={[
                styles.loadingCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <ActivityIndicator color={theme.colors.primary} />
              <Text
                style={[
                  styles.loadingText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Loading updates...
              </Text>
            </View>
          ) : updates.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={28}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[styles.emptyText, { color: theme.colors.textSecondary }]}
              >
                No updates yet
              </Text>
            </View>
          ) : (
            updates.map((update) => {
              const color = getUpdateColor(update.color);

              return (
                <View
                  key={update.id}
                  style={[
                    styles.updateCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.updateIconBox,
                      { backgroundColor: color + "22" },
                    ]}
                  >
                    <Ionicons
                      name={getUpdateIcon(update.icon) as any}
                      size={22}
                      color={color}
                    />
                  </View>

                  <View style={styles.updateText}>
                    <Text
                      style={[styles.updateTitle, { color: theme.colors.text }]}
                      numberOfLines={1}
                    >
                      {update.title}
                    </Text>

                    <Text
                      style={[
                        styles.updateSubtitle,
                        { color: theme.colors.textSecondary },
                      ]}
                      numberOfLines={2}
                    >
                      {update.description}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal
        visible={manageModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setManageModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setManageModalVisible(false)}
        />

        <View
          style={[
            styles.manageSheet,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
                Manage Bookings
              </Text>
              <Text
                style={[
                  styles.sheetSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Cancel bookings directly from here
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.sheetCloseBtn,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setManageModalVisible(false)}
            >
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {bookedEvents.length === 0 ? (
            <View style={styles.sheetEmpty}>
              <Ionicons
                name="calendar-outline"
                size={38}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.sheetEmptyText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                You have no active bookings.
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetList}
            >
              {bookedEvents.map((event) => {
                const color = getEventColor(event.category);
                const icon = getEventIcon(event.category, event.title);
                const isCanceling = cancelingId === event.id;

                return (
                  <View
                    key={event.id}
                    style={[
                      styles.manageItem,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <View style={styles.manageItemTop}>
                      <View
                        style={[
                          styles.manageIconBox,
                          { backgroundColor: color + "22" },
                        ]}
                      >
                        <Ionicons name={icon as any} size={22} color={color} />
                      </View>

                      <View style={styles.manageText}>
                        <Text
                          style={[
                            styles.manageTitle,
                            { color: theme.colors.text },
                          ]}
                          numberOfLines={2}
                        >
                          {event.title}
                        </Text>

                        <Text
                          style={[
                            styles.manageDate,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          {formatEventFullDate(event.event_date)} ·{" "}
                          {formatEventTime(event.event_date)}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.managePointsPill,
                          { backgroundColor: color + "22" },
                        ]}
                      >
                        <Text style={[styles.managePoints, { color }]}>
                          +{event.points_value ?? 0}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.manageLocationRow}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.manageLocation,
                          { color: theme.colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {event.location}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.cancelBookingBtn,
                        {
                          backgroundColor: "#ef444422",
                          borderColor: "#ef444455",
                        },
                      ]}
                      onPress={() => confirmCancelBooking(event)}
                      disabled={isCanceling}
                      activeOpacity={0.85}
                    >
                      {isCanceling ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                      ) : (
                        <>
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#ef4444"
                          />
                          <Text style={styles.cancelBookingText}>
                            Cancel Booking
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  page: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  headerAvatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },

  walletCard: {
    marginHorizontal: 24,
    borderRadius: 30,
    padding: 24,
    marginBottom: 28,
    overflow: "hidden",
    position: "relative",
  },
  walletDecorOne: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -90,
    right: -70,
  },
  walletDecorTwo: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.07)",
    bottom: -45,
    left: 18,
  },
  walletTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    zIndex: 1,
  },
  walletLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  walletPoints: {
    color: "#fff",
    fontSize: 52,
    fontWeight: "900",
    lineHeight: 58,
  },
  walletCaption: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 230,
  },
  walletIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  walletActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
    zIndex: 1,
  },
  walletActionBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    gap: 5,
  },
  walletActionText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },

  phaseTwoCard: {
    marginHorizontal: 24,
    marginBottom: 28,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
  },
  phaseTwoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  phaseTwoTitle: {
    fontSize: 19,
    fontWeight: "900",
  },
  phaseTwoSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    lineHeight: 17,
    maxWidth: 245,
  },
  phaseTwoHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseTwoButton: {
    borderRadius: 22,
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  phaseTwoButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  phaseTwoButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  phaseTwoButtonTextWrap: {
    flex: 1,
  },
  phaseTwoButtonTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  phaseTwoButtonSub: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },

  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "700",
  },

  bookingPreviewCard: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 26,
    borderWidth: 1,
  },
  bookingPreviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  bookingPreviewTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  bookingPreviewSub: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  bookingCountPill: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bookingCountText: {
    fontSize: 18,
    fontWeight: "900",
  },
  bookingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  bookedIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  bookedText: {
    flex: 1,
  },
  bookedTitle: {
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 3,
  },
  bookedSub: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  bookedLocation: {
    fontSize: 11,
    fontWeight: "600",
  },
  bookedRight: {
    alignItems: "center",
  },
  bookedPoints: {
    fontSize: 16,
    fontWeight: "900",
  },
  bookedPointsLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  bookingDivider: {
    height: 1,
    marginLeft: 60,
  },
  manageBookingsBtn: {
    marginTop: 14,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  manageBookingsText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  hiddenCountBadge: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 4,
  },
  hiddenCountText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },

  emptyBookingCard: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyBookingIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyBookingTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 6,
  },
  emptyBookingText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
  },
  emptyBookingBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  emptyBookingBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },

  horizontalScroll: {
    paddingLeft: 24,
  },
  eventCard: {
    width: CARD_WIDTH,
    borderRadius: 24,
    overflow: "hidden",
    marginRight: 14,
  },
  eventCardTop: {
    height: CARD_IMAGE_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  eventImage: {
    width: CARD_WIDTH,
    height: CARD_IMAGE_HEIGHT,
    position: "absolute",
    top: 0,
    left: 0,
  },
  eventCardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 1,
  },
  eventCardBadge: {
    position: "absolute",
    bottom: 8,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    zIndex: 2,
  },
  eventCardBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  eventCardBody: {
    padding: 14,
  },
  eventCardDate: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  eventCardTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
    minHeight: 36,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  eventCardLocation: {
    fontSize: 11,
    flex: 1,
  },
  progressBg: {
    height: 5,
    borderRadius: 3,
    marginBottom: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  eventCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eventParticipants: {
    fontSize: 10,
    fontWeight: "600",
  },
  eventPoints: {
    fontSize: 12,
    fontWeight: "800",
  },

  couponsBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
  },
  couponsBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  couponsBannerText: {
    flex: 1,
  },
  couponsBannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 2,
  },
  couponsBannerSub: {
    fontSize: 12,
  },

  updateCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 24,
    marginBottom: 10,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  updateIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  updateText: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  updateSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  loadingCard: {
    marginHorizontal: 24,
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    marginHorizontal: 24,
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  manageSheet: {
    maxHeight: "82%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.8)",
    marginBottom: 18,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "900",
  },
  sheetSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 3,
  },
  sheetCloseBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  sheetList: {
    paddingBottom: 20,
  },
  sheetEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  sheetEmptyText: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
  },
  manageItem: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
  },
  manageItemTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  manageIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  manageText: {
    flex: 1,
  },
  manageTitle: {
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  manageDate: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  managePointsPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  managePoints: {
    fontSize: 12,
    fontWeight: "900",
  },
  manageLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  manageLocation: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  cancelBookingBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  cancelBookingText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "900",
  },
});