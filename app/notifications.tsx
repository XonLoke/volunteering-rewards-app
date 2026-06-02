import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.72.201:3000/api";

interface Notification {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  is_read: boolean;
  created_at: string;
}

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

      const res = await fetch(`${BASE_URL}/notifications?user_id=${user.id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Failed to fetch notifications."
        );
      }

      const latestNotifications = data.notifications || [];

      setNotifications(latestNotifications);
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

      // Poll every 10 seconds while this screen is open
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

      const res = await fetch(
        `${BASE_URL}/notifications/read-all?user_id=${userId}`,
        {
          method: "PATCH",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to mark all read.");
      }

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

    // Optimistic update: update UI immediately
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    try {
      const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: "PATCH",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to mark read.");
      }
    } catch (err) {
      console.error("Failed to mark read:", err);

      // Revert if backend failed
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

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconColor = getSafeColor(item.color);

    return (
      <TouchableOpacity
        onPress={() => markOneRead(item.id)}
        activeOpacity={0.85}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: item.is_read
                ? theme.colors.border
                : theme.colors.primary,
            },
          ]}
        >
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: iconColor + "20",
              },
            ]}
          >
            <Ionicons
              name={getSafeIcon(item.icon) as any}
              size={22}
              color={iconColor}
            />
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text
                style={[styles.cardTitle, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>

              <Text
                style={[
                  styles.cardTime,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {getTimeAgo(item.created_at)}
              </Text>
            </View>

            <Text
              style={[styles.cardDesc, { color: theme.colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          </View>

          {!item.is_read && (
            <View
              style={[
                styles.unreadDot,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          )}
        </View>
      </TouchableOpacity>
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
            styles.backBtn,
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
            Notifications
          </Text>

          <Text
            style={[styles.unreadLabel, { color: theme.colors.textSecondary }]}
          >
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up"}
          </Text>
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
                  : theme.colors.primary + "22",
            },
          ]}
        >
          {markingAll ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text
              style={[
                styles.markAll,
                {
                  color:
                    unreadCount === 0
                      ? theme.colors.textTertiary
                      : theme.colors.primary,
                },
              ]}
            >
              Read
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Loading notifications...
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.list,
            notifications.length === 0 && styles.emptyList,
          ]}
          renderItem={renderNotification}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
                  <View style={styles.liveDot} />
                  <Text
                    style={[styles.liveText, { color: theme.colors.text }]}
                  >
                    Live updates enabled
                  </Text>
                </View>

                <Text
                  style={[
                    styles.liveSubText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Refreshes every 10s
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconBox,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={58}
                  color={theme.colors.textSecondary}
                />
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
                You&apos;ll see updates about events, scans, and rewards here.
              </Text>
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
    paddingTop: 20,
    paddingBottom: 16,
  },
  backBtn: {
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
  unreadLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  markAllBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  markAll: {
    fontSize: 12,
    fontWeight: "900",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
  },
  liveBar: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  liveLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  liveText: {
    fontSize: 13,
    fontWeight: "800",
  },
  liveSubText: {
    fontSize: 11,
    fontWeight: "600",
  },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
  },
  cardTime: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
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
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 108,
    height: 108,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});