import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

const accent = "#22d3a5";

export default function Settings() {
  const router = useRouter();
  const { theme } = useTheme();

  // Toggles
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [locationAccess, setLocationAccess] = useState(true);

  // Change Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const handleChangePassword = () => {
    if (!currentPw || !newPw || !confirmPw) {
      Alert.alert("Missing fields", "Please fill in all password fields.");
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert("Mismatch", "New passwords don't match.");
      return;
    }
    if (newPw.length < 6) {
      Alert.alert("Too short", "Password must be at least 6 characters.");
      return;
    }
    setShowPasswordModal(false);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    Alert.alert("Success", "Your password has been updated.");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your points. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Account Deleted", "Your account has been removed.", [
              { text: "OK", onPress: () => router.push("/" as any) },
            ]);
          },
        },
      ]
    );
  };

  const toggles = [
    { label: "Push Notifications", sub: "Get alerts for new events", value: pushNotifs, setter: setPushNotifs },
    { label: "Email Notifications", sub: "Receive updates via email", value: emailNotifs, setter: setEmailNotifs },
    { label: "Dark Mode", sub: "Switch to dark theme", value: darkMode, setter: setDarkMode },
    { label: "Location Access", sub: "Used for nearby events", value: locationAccess, setter: setLocationAccess },
  ];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backText, { color: theme.colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Settings</Text>
          <View style={styles.spacer} />
        </View>

        {/* ── PREFERENCES ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Preferences</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {toggles.map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.toggleRow,
                  index < toggles.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                ]}
              >
                <View style={styles.toggleText}>
                  <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>{item.label}</Text>
                  <Text style={[styles.toggleSub, { color: theme.colors.textSecondary }]}>{item.sub}</Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.setter}
                  trackColor={{ false: theme.colors.border, true: accent }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </View>
        </View>

        {/* ── CHANGE PASSWORD (inline) ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Security</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>

            {/* Toggle expand */}
            <TouchableOpacity
              style={[styles.expandRow, showPasswordModal && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
              onPress={() => setShowPasswordModal(!showPasswordModal)}
              activeOpacity={0.7}
            >
              <View style={[styles.rowIcon, { backgroundColor: accent + "20" }]}>
                <Text style={styles.rowEmoji}>🔒</Text>
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Change Password</Text>
                <Text style={[styles.rowSub, { color: theme.colors.textSecondary }]}>Update your login password</Text>
              </View>
              <Text style={[styles.chevron, { color: accent }]}>
                {showPasswordModal ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>

            {/* Expandable password fields */}
            {showPasswordModal && (
              <View style={styles.passwordSection}>
                {[
                  { label: "Current Password", value: currentPw, setter: setCurrentPw },
                  { label: "New Password", value: newPw, setter: setNewPw },
                  { label: "Confirm New Password", value: confirmPw, setter: setConfirmPw },
                ].map((field) => (
                  <View key={field.label} style={styles.fieldGroup}>
                    <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{field.label}</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                      value={field.value}
                      onChangeText={field.setter}
                      placeholder="••••••••"
                      placeholderTextColor={theme.colors.textTertiary}
                      secureTextEntry
                    />
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: accent }]}
                  onPress={handleChangePassword}
                  activeOpacity={0.85}
                >
                  <Text style={styles.saveBtnText}>Update Password</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* ── DANGER ZONE ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Danger Zone</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: "#ef444440" }]}>
            <TouchableOpacity
              style={styles.deleteRow}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <View style={[styles.rowIcon, { backgroundColor: "#ef444420" }]}>
                <Text style={styles.rowEmoji}>🗑️</Text>
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, { color: "#ef4444" }]}>Delete Account</Text>
                <Text style={[styles.rowSub, { color: theme.colors.textSecondary }]}>Permanently remove your account</Text>
              </View>
              <Text style={[styles.chevron, { color: "#ef4444" }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: 60 },

  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  backText: { fontSize: 18, fontWeight: "700" },
  pageTitle: { fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
  spacer: { width: 40, height: 40 },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionLabel: {
    fontSize: 11, fontWeight: "800", letterSpacing: 1.2,
    textTransform: "uppercase", marginBottom: 12,
  },
  card: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },

  // Toggles
  toggleRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  toggleText: { flex: 1 },
  toggleLabel: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  toggleSub: { fontSize: 11, fontWeight: "500" },

  // Expandable rows
  expandRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  rowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowEmoji: { fontSize: 18 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  rowSub: { fontSize: 11, fontWeight: "500" },
  chevron: { fontSize: 12, fontWeight: "700" },

  // Password section
  passwordSection: { padding: 16, gap: 16 },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  input: {
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, fontWeight: "600",
  },
  saveBtn: {
    borderRadius: 12, paddingVertical: 13,
    alignItems: "center", marginTop: 4,
  },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },

  // Delete row
  deleteRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
});