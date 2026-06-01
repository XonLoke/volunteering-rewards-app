import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Profile() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      {/* PROFILE CARD */}
      <View style={styles.profileBox}>
        <View style={styles.photo}>
          <Ionicons name="person" size={40} color="#6A00E8" />
        </View>

        <View>
          <Text style={styles.name}>Organizer Name</Text>
          <Text style={styles.email}>organizer@example.com</Text>

          <View style={styles.verifyBox}>
            <Text style={styles.verified}>Verified Organizer</Text>
          </View>
        </View>
      </View>

      {/* STATS */}
      <View style={styles.stats}>
        <Box value="12" label="Events Created" />
        <Box value="1,250" label="Total Volunteers" />
        <Box value="320" label="Hours" />
      </View>

      {/* MENU */}
      <Menu icon="ribbon-outline" title="My Badges" />
      <Menu icon="gift-outline" title="Reward Points" />
      <Menu icon="document-text-outline" title="My Certificates" />
      <Menu
        icon="notifications-outline"
        title="Notification Preferences"
      />
      <Menu icon="help-circle-outline" title="Help & Support" />

      {/* LOGOUT */}
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

      <Ionicons
        name="chevron-forward"
        size={20}
        color="#777"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4FF",
    padding: 18,
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
    fontSize: 18,
    color: "#6A00E8",
  },

  boxLabel: {
    fontSize: 11,
    color: "#555",
    textAlign: "center",
    marginTop: 4,
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