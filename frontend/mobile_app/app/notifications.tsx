import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";
import { api } from "../src/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useRef, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";


interface Notification {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  is_read: boolean;
  created_at: string;
}

type NotificationListItem =
  | {
      type: "section";
      id: string;
      title: string;
    }
  | {
      type: "notification";
      id: string;
      notification: Notification;
    };

export default function Notifications() {
  const router = useRouter();
  const { theme } = useTheme();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const stored = await AsyncStorage.getItem("user");

      if (!stored) {
        Alert.alert("Login required", "Please login again.");
        router.replace("/login");
        return;
      }

      const user = JSON.parse(stored);
      setUserId(user.id);

      const data = await api.get<{ notifications: Notification[] }>("/me/notifications");
      setNotifications(data.notifications || []);
    } catch (err: any) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications(true);

      pollingRef.current = setInterval(() => {
        fetchNotifications(false);
      }, 10000);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(false);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    if (!userId || unreadCount === 0 || markingAll) {
      return;
    }

    try {
      setMarkingAll(true);

      await api.patch("/me/notifications/read");

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err: any) {
      console.error("Failed to mark all read:", err);
      Alert.alert("Error", err.message || "Failed to mark all as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  const markOneRead = async (id: number) => {
    const selected = notifications.find((n) => n.id === id);

    if (!selected || selected.is_read) {
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    try {
      await api.patch(`/me/notifications/${id}/read`);
    } catch (err) {
      console.error("Failed to mark read:", err);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))
      );
    }
  };

  const getSafeIcon = (icon?: string) => {
    if (!icon) return "notifications-outline";
    return icon;
  };

  const getSafeColor = (color?: string) => {
    if (!color) return theme.colors.primary;
    return color;
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
      return "Just now";
    }

    const diff = Date.now() - date.getTime();
    const mins = Math.max(Math.floor(diff / 60000), 0);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;

    return "Just now";
  };

  const getDateGroup = (dateStr: string) => {
    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
      return "Recent";
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return "Earlier";
  };

  const listData: NotificationListItem[] = useMemo(() => {
    const grouped: Record<string, Notification[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
      Recent: [],
    };

    notifications.forEach((notification) => {
      const group = getDateGroup(notification.created_at);

      if (!grouped[group]) {
        grouped[group] = [];
      }

      grouped[group].push(notification);
    });

    const finalList: NotificationListItem[] = [];
    const order = ["Today", "Yesterday", "Earlier", "Recent"];

    order.forEach((group) => {
      if (grouped[group] && grouped[group].length > 0) {
        finalList.push({
          type: "section",
          id: `section-${group}`,
          title: group,
        });

        grouped[group].forEach((notification) => {
          finalList.push({
            type: "notification",
            id: `notification-${notification.id}`,
            notification,
          });
        });
      }
    });

    return finalList;
  }, [notifications]);

  const renderNotificationCard = (item: Notification) => {
    const iconColor = getSafeColor(item.color);
    const unread = !item.is_read;

    return (
      <TouchableOpacity
        onPress={() => markOneRead(item.id)}
        activeOpacity={0.86}
        style={styles.cardWrapper}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: unread
                ? theme.colors.primary + "10"
                : theme.colors.surface,
              borderColor: unread
                ? theme.colors.primary + "55"
                : theme.colors.border,
            },
          ]}
        >
          {unread && (
            <View
              style={[
                styles.leftAccent,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          )}

          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: iconColor + "18",
              },
            ]}
          >
            <Ionicons
              name={getSafeIcon(item.icon) as any}
              size={23}
              color={iconColor}
            />
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: theme.colors.text,
                    fontWeight: unread ? "900" : "700",
                  },
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>

              {unread && (
                <View
                  style={[
                    styles.newBadge,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
            </View>

            <Text
              style={[styles.cardDesc, { color: theme.colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>

            <View style={styles.cardFooter}>
              <Ionicons
                name="time-outline"
                size={13}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.cardTime,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {getTimeAgo(item.created_at)}
              </Text>

              {unread && (
                <>
                  <View
                    style={[
                      styles.footerDot,
                      { backgroundColor: theme.colors.textSecondary },
                    ]}
                  />
                  <Text
                    style={[
                      styles.tapHint,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Tap to mark read
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: NotificationListItem }) => {
    if (item.type === "section") {
      return (
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
      );
    }

    return renderNotificationCard(item.notification);
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backBtn,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={23} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerIconWrap}>
          <View
            style={[
              styles.headerIconBox,
              { backgroundColor: theme.colors.primary + "18" },
            ]}
          >
            <Ionicons
              name="notifications"
              size={23}
              color={theme.colors.primary}
            />

            {unreadCount > 0 && (
              <View
                style={[
                  styles.headerBadge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.headerBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={markAllRead}
          disabled={unreadCount === 0 || markingAll}
          style={[
            styles.markAllBtn,
            {
              backgroundColor:
                unreadCount === 0
                  ? theme.colors.surfaceSecondary
                  : theme.colors.primary,
              opacity: unreadCount === 0 ? 0.65 : 1,
            },
          ]}
          activeOpacity={0.82}
        >
          {markingAll ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name="checkmark-done"
              size={19}
              color={unreadCount === 0 ? theme.colors.textTertiary : "#fff"}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.titleArea}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Notifications
        </Text>

        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {unreadCount > 0
            ? `You have ${unreadCount} unread update${
                unreadCount > 1 ? "s" : ""
              }`
            : "You're all caught up"}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <View
            style={[
              styles.loadingIconBox,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>

          <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>
            Loading updates
          </Text>

          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Getting your latest activity notifications...
          </Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            notifications.length === 0 && styles.emptyList,
          ]}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListHeaderComponent={
            notifications.length > 0 ? (
              <View
                style={[
                  styles.liveBar,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.liveLeft}>
                  <View style={styles.liveDotOuter}>
                    <View style={styles.liveDotInner} />
                  </View>

                  <View>
                    <Text
                      style={[styles.liveText, { color: theme.colors.text }]}
                    >
                      Live Sync
                    </Text>

                    <Text
                      style={[
                        styles.liveSubText,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Auto-refreshing every 10 seconds
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.syncPill,
                    { backgroundColor: theme.colors.primary + "14" },
                  ]}
                >
                  <Ionicons
                    name="flash-outline"
                    size={13}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.syncPillText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    ON
                  </Text>
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconOuter,
                  { backgroundColor: theme.colors.primary + "10" },
                ]}
              >
                <View
                  style={[
                    styles.emptyIconBox,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={56}
                    color={theme.colors.primary}
                  />
                </View>
              </View>

              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No notifications yet
              </Text>

              <Text
                style={[
                  styles.emptySubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Updates about events, scans, rewards, and points will appear
                here.
              </Text>

              <View
                style={[
                  styles.emptyHint,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="arrow-down-outline"
                  size={14}
                  color={theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.emptyHintText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Pull down to refresh
                </Text>
              </View>
            </View>
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
    paddingTop: 18,
    paddingBottom: 10,
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  headerIconWrap: {
    flex: 1,
    alignItems: "center",
  },

  headerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  headerBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: "#fff",
  },

  headerBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
  },

  markAllBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  titleArea: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
  },

  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },

  emptyList: {
    flexGrow: 1,
  },

  liveBar: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 15,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  liveLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  liveDotOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#10b98122",
    alignItems: "center",
    justifyContent: "center",
  },

  liveDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10b981",
  },

  liveText: {
    fontSize: 14,
    fontWeight: "900",
  },

  liveSubText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  syncPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  syncPillText: {
    fontSize: 11,
    fontWeight: "900",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
    marginTop: 4,
  },

  cardWrapper: {
    marginBottom: 13,
  },

  card: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },

  leftAccent: {
    width: 4,
    height: "150%",
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    position: "absolute",
    left: 0,
    top: 0,
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  cardContent: {
    flex: 1,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },

  cardTitle: {
    fontSize: 15,
    flex: 1,
  },

  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },

  newBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  cardDesc: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 9,
  },

  cardTime: {
    fontSize: 11,
    fontWeight: "700",
  },

  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.55,
    marginHorizontal: 2,
  },

  tapHint: {
    fontSize: 11,
    fontWeight: "600",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
  },

  loadingIconBox: {
    width: 88,
    height: 88,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  loadingTitle: {
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 6,
  },

  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 34,
  },

  emptyIconOuter: {
    width: 136,
    height: 136,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  emptyIconBox: {
    width: 104,
    height: 104,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    fontWeight: "600",
  },

  emptyHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginTop: 18,
  },

  emptyHintText: {
    fontSize: 12,
    fontWeight: "700",
  },
});