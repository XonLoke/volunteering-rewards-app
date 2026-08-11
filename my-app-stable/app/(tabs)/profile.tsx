import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type OrganiserProfile = {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  points?: number;
  points_balance?: number;
  avatar_url?: string | null;
};

export default function Profile() {
  const [profile, setProfile] = useState<OrganiserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  async function loadProfile() {
    try {
      setErrorMessage("");

      /*
       * The team backend currently protects /me/profile for volunteers.
       * The organiser details are already returned during login, so the
       * login screen stores that user object in AsyncStorage.
       */
      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        throw new Error(
          "No saved organiser profile was found. Please log out and log in again.",
        );
      }

      const parsedUser = JSON.parse(storedUser) as OrganiserProfile;

      if (!parsedUser?.id) {
        throw new Error(
          "The saved organiser profile is invalid. Please log in again.",
        );
      }

      setProfile(parsedUser);
    } catch (error) {
      console.log("Profile error:", error);

      const message =
        error instanceof Error ? error.message : "Cannot load profile.";

      setErrorMessage(message);
      setProfile(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadProfile();
  }

  function handleLogout() {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["user", "token"]);
          router.replace("/");
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6A00E8" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  const role =
    typeof profile?.role === "string"
      ? profile.role.toLowerCase()
      : "organiser";

  const roleLabel =
    role === "organiser" || role === "organizer"
      ? "Verified Organiser"
      : role || "Organiser";

  const points = profile?.points_balance ?? profile?.points ?? 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#6A00E8"
        />
      }
    >
      <Text style={styles.header}>Profile</Text>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Ionicons name="warning-outline" size={22} color="#B42318" />

          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>Unable to load profile</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>

            <Text style={styles.retryText} onPress={loadProfile}>
              Tap here to try again
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.profileBox}>
        <View style={styles.photo}>
          <Ionicons name="person" size={42} color="#6A00E8" />
        </View>

        <View style={styles.profileDetails}>
          <Text style={styles.name}>{profile?.name ?? "No name"}</Text>
          <Text style={styles.email}>{profile?.email ?? "No email"}</Text>

          {profile?.phone ? (
            <Text style={styles.phone}>{profile.phone}</Text>
          ) : null}

          <View style={styles.verifyBox}>
            <Text style={styles.verified}>{roleLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.stats}>
        <Box value={profile?.id ?? "-"} label="User ID" />
        <Box value={points} label="Reward Points" />
        <Box value="Active" label="Account" />
      </View>

      <View style={styles.accountBox}>
        <Text style={styles.accountTitle}>Account Information</Text>

        <InfoRow
          icon="person-outline"
          label="Name"
          value={profile?.name ?? "Not available"}
        />

        <InfoRow
          icon="mail-outline"
          label="Email"
          value={profile?.email ?? "Not available"}
        />

        <InfoRow
          icon="shield-checkmark-outline"
          label="Role"
          value={roleLabel}
        />
      </View>

      <Menu
        icon="calendar-outline"
        title="My Events"
        onPress={() => router.push("/(tabs)/events")}
      />

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Box({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.boxValue}>{value}</Text>
      <Text style={styles.boxLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color="#6A00E8" />
      </View>

      <View style={styles.infoDetails}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function Menu({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menu} activeOpacity={0.8} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#6A00E8" />
      <Text style={styles.menuText}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#777777" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4FF",
  },

  contentContainer: {
    padding: 18,
    paddingBottom: 100,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#F8F4FF",
  },

  header: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    marginVertical: 18,
    color: "#111111",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEE4E2",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    color: "#B42318",
    fontWeight: "800",
    marginBottom: 4,
  },

  errorText: {
    color: "#7A271A",
    fontSize: 13,
  },

  retryText: {
    color: "#6A00E8",
    fontWeight: "700",
    marginTop: 8,
  },

  profileBox: {
    backgroundColor: "#6A00E8",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  profileDetails: {
    flex: 1,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },

  email: {
    color: "#E9D5FF",
    marginTop: 4,
    fontSize: 13,
  },

  phone: {
    color: "#E9D5FF",
    marginTop: 4,
    fontSize: 12,
  },

  verifyBox: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 9,
    alignSelf: "flex-start",
  },

  verified: {
    color: "#6A00E8",
    fontSize: 12,
    fontWeight: "700",
  },

  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },

  box: {
    backgroundColor: "#FFFFFF",
    width: "31%",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
  },

  boxValue: {
    fontWeight: "800",
    fontSize: 16,
    color: "#6A00E8",
  },

  boxLabel: {
    fontSize: 11,
    color: "#555555",
    textAlign: "center",
    marginTop: 4,
  },

  accountBox: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },

  accountTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoDetails: {
    flex: 1,
  },

  infoLabel: {
    color: "#777777",
    fontSize: 11,
    fontWeight: "700",
  },

  infoValue: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },

  menu: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  menuText: {
    flex: 1,
    marginLeft: 14,
    fontWeight: "600",
    color: "#111111",
  },

  logoutButton: {
    marginTop: 25,
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  logoutText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
});
