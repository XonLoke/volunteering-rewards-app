import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

const initialNotifications = [
  {
    id: "1",
    title: "Volunteer event confirmed",
    description: "Your spot for the beach cleanup on Saturday is secured.",
    time: "2h ago",
    read: false,
  },
  {
    id: "2",
    title: "Reward unlocked 🎉",
    description: "You earned a free drink reward for 100 volunteer points.",
    time: "1d ago",
    read: false,
  },
  {
    id: "3",
    title: "New event available",
    description: "A neighborhood park restoration event is open for registration.",
    time: "3d ago",
    read: false,
  },
];

export default function Notifications() {
  const router = useRouter();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Text style={[styles.backText, { color: theme.colors.text }]}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[styles.unreadLabel, { color: theme.colors.textSecondary }]}>
              {unreadCount} unread
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={[styles.markAll, { color: theme.colors.primary }]}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => markOneRead(item.id)}
            activeOpacity={0.85}
          >
            <View style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: item.read ? theme.colors.border : theme.colors.primary,
              },
            ]}>
              {/* Unread dot */}
              {!item.read && (
                <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
              )}
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
                  <Text style={[styles.cardTime, { color: theme.colors.textSecondary }]}>{item.time}</Text>
                </View>
                <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>{item.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No notifications yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              You'll see updates about events and rewards here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  backText: { fontSize: 18, fontWeight: "700" },
  title: { fontSize: 20, fontWeight: "900" },
  unreadLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  markAll: { fontSize: 13, fontWeight: "700" },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    marginTop: 6, flexShrink: 0,
  },
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", flex: 1, marginRight: 8 },
  cardTime: { fontSize: 11, fontWeight: "600" },
  cardDesc: { fontSize: 13, lineHeight: 20 },
  emptyState: { marginTop: 80, alignItems: "center" },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: "center", maxWidth: 280 },
});