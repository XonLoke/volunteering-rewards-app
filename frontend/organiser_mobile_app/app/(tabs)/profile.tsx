import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { apiGet } from "../../lib/api";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const data = await apiGet("/api/auth/me");
      setProfile(data);
    } catch (error: any) {
      console.log("Profile error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    fetchProfile();
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6A00E8" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>Profile</Text>

      <View style={styles.profileBox}>
        <View style={styles.photo}>
          <Ionicons name="person" size={40} color="#6A00E8" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile?.name ?? "No name"}</Text>
          <Text style={styles.email}>{profile?.email ?? "No email"}</Text>
          <Text style={styles.phone}>
            {profile?.phone ?? "No phone number"}
          </Text>

          <View style={styles.verifyBox}>
            <Text style={styles.verified}>
              {profile?.status === "active"
                ? "Verified Organizer"
                : (profile?.status ?? "Unknown Status")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.stats}>
        <Box value={profile?.points ?? 0} label="Reward Points" />
        <Box value={profile?.id ?? "-"} label="User ID" />
        <Box value={profile?.status ?? "-"} label="Status" />
      </View>

      <View style={styles.qrBox}>
        <Text style={styles.qrTitle}>Volunteer QR Code</Text>
        <Text style={styles.qrText}>
          {profile?.volunteer_qr_code ?? "No QR code found"}
        </Text>
      </View>

      <Menu icon="ribbon-outline" title="My Badges" />
      <Menu icon="gift-outline" title="Reward Points" />
      <Menu icon="document-text-outline" title="My Certificates" />
      <Menu icon="notifications-outline" title="Notification Preferences" />
      <Menu icon="help-circle-outline" title="Help & Support" />

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.replace("/")}
      >
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Box({ value, label }: any) {
  return (
    <View style={styles.box}>
      <Text style={styles.boxValue}>{value}</Text>
      <Text style={styles.boxLabel}>{label}</Text>
    </View>
  );
}

function Menu({ icon, title }: any) {
  return (
    <TouchableOpacity style={styles.menu}>
      <Ionicons name={icon} size={22} color="#6A00E8" />
      <Text style={styles.menuText}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#777" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4FF",
    padding: 18,
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
    color: "#111",
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
    backgroundColor: "#fff",
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  email: {
    color: "#E9D5FF",
    marginTop: 4,
  },

  phone: {
    color: "#E9D5FF",
    marginTop: 4,
    fontSize: 12,
  },

  verifyBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 8,
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
    backgroundColor: "#fff",
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
    color: "#555",
    textAlign: "center",
    marginTop: 4,
  },

  qrBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },

  qrTitle: {
    fontWeight: "800",
    color: "#111",
    marginBottom: 6,
  },

  qrText: {
    color: "#555",
    fontSize: 12,
  },

  menu: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  menuText: {
    flex: 1,
    marginLeft: 14,
    fontWeight: "600",
    color: "#111",
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
    marginBottom: 100,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
