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
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authFetch } from "./api";


const BASE_URL = "https://vol-rewards-api.onrender.com/api";
const accent = "#22d3a5";

export default function Settings() {
  const router = useRouter();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [locationAccess, setLocationAccess] = useState(false);

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const getToken = async () => {
    return await AsyncStorage.getItem("token");
  };

  const loadSettings = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        Alert.alert("Not logged in", "Please login again.");
        router.replace("/login" as any);
        return;
      }

      const res = await authFetch(`${BASE_URL}/settings`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load settings");
      }

      setPushNotifs(data.push_notifications ?? true);
      setEmailNotifs(data.email_notifications ?? false);
      setLocationAccess(data.location_access ?? false);

      await AsyncStorage.setItem(
        "settings",
        JSON.stringify({
          pushNotifs: data.push_notifications ?? true,
          emailNotifs: data.email_notifications ?? false,
          locationAccess: data.location_access ?? false,
        })
      );
    } catch (err: any) {
      console.log("Load settings error:", err.message);

      const saved = await AsyncStorage.getItem("settings");

      if (saved) {
        const s = JSON.parse(saved);
        setPushNotifs(s.pushNotifs ?? true);
        setEmailNotifs(s.emailNotifs ?? false);
        setLocationAccess(s.locationAccess ?? false);
      }

      Alert.alert(
        "Settings",
        "Could not load latest settings from backend. Showing saved settings instead."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSettings = async (updates: {
    push_notifications?: boolean;
    email_notifications?: boolean;
    location_access?: boolean;
  }) => {
    const token = await getToken();

    if (!token) {
      Alert.alert("Not logged in", "Please login again.");
      router.replace("/login" as any);
      return;
    }

    const res = await authFetch(`${BASE_URL}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to update settings");
    }

    return data;
  };

  const handleToggle = async (
    key: "push_notifications" | "email_notifications" | "location_access",
    value: boolean
  ) => {
    const previousPush = pushNotifs;
    const previousEmail = emailNotifs;
    const previousLocation = locationAccess;

    try {
      setSavingKey(key);

      if (key === "push_notifications") setPushNotifs(value);
      if (key === "email_notifications") setEmailNotifs(value);
      if (key === "location_access") setLocationAccess(value);

      const updated = await updateSettings({ [key]: value });

      const finalPush =
        updated?.push_notifications ??
        (key === "push_notifications" ? value : pushNotifs);

      const finalEmail =
        updated?.email_notifications ??
        (key === "email_notifications" ? value : emailNotifs);

      const finalLocation =
        updated?.location_access ??
        (key === "location_access" ? value : locationAccess);

      setPushNotifs(finalPush);
      setEmailNotifs(finalEmail);
      setLocationAccess(finalLocation);

      await AsyncStorage.setItem(
        "settings",
        JSON.stringify({
          pushNotifs: finalPush,
          emailNotifs: finalEmail,
          locationAccess: finalLocation,
        })
      );

      if (key === "email_notifications" && value) {
        Alert.alert(
          "Email Notifications On",
          "You will now receive booking confirmations, reward alerts, and event updates by email."
        );
      }
    } catch (err: any) {
      console.log("Toggle error:", err.message);

      setPushNotifs(previousPush);
      setEmailNotifs(previousEmail);
      setLocationAccess(previousLocation);

      Alert.alert("Update failed", err.message || "Please try again.");
    } finally {
      setSavingKey(null);
    }
  };

  const handleChangePassword = async () => {
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

    try {
      const token = await getToken();

      if (!token) {
        Alert.alert("Not logged in", "Please login again.");
        router.replace("/login" as any);
        return;
      }

      const res = await authFetch(`${BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setShowPasswordSection(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");

      Alert.alert("Success", "Your password has been updated.");
    } catch (err: any) {
      Alert.alert(
        "Password not updated",
        err.message || "This needs the backend change-password route to work."
      );
    }
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
          onPress: async () => {
            try {
              const token = await getToken();

              if (token) {
                await authFetch(`${BASE_URL}/users/me`, {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
              }

              await AsyncStorage.removeItem("user");
              await AsyncStorage.removeItem("token");
              await AsyncStorage.removeItem("settings");

              Alert.alert("Account Deleted", "Your account has been removed.", [
                { text: "OK", onPress: () => router.replace("/" as any) },
              ]);
            } catch (err) {
              Alert.alert("Error", "Failed to delete account.");
            }
          },
        },
      ]
    );
  };

  const toggles = [
    {
      label: "Push Notifications",
      sub: "Get alerts for new events and rewards",
      value: pushNotifs,
      key: "push_notifications" as const,
      icon: "notifications-outline",
    },
    {
      label: "Email Notifications",
      sub: "Booking confirmations, reward alerts, and event updates",
      value: emailNotifs,
      key: "email_notifications" as const,
      icon: "mail-outline",
    },
    {
      label: "Location Access",
      sub: "Used to show nearby volunteer events",
      value: locationAccess,
      key: "location_access" as const,
      icon: "location-outline",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.screen,
          styles.center,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={accent} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading settings...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[
              styles.backBtn,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Settings</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
            Preferences
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {toggles.map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.toggleRow,
                  index < toggles.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
              >
                <View style={[styles.rowIcon, { backgroundColor: accent + "20" }]}>
                  <Ionicons name={item.icon as any} size={18} color={accent} />
                </View>

                <View style={styles.toggleText}>
                  <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.toggleSub, { color: theme.colors.textSecondary }]}>
                    {item.sub}
                  </Text>
                </View>

                {savingKey === item.key ? (
                  <ActivityIndicator size="small" color={accent} />
                ) : (
                  <Switch
                    value={item.value}
                    onValueChange={(val) => handleToggle(item.key, val)}
                    trackColor={{ false: theme.colors.border, true: accent }}
                    thumbColor="#fff"
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
            Security
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.expandRow,
                showPasswordSection && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                },
              ]}
              onPress={() => setShowPasswordSection(!showPasswordSection)}
              activeOpacity={0.7}
            >
              <View style={[styles.rowIcon, { backgroundColor: accent + "20" }]}>
                <Ionicons name="lock-closed-outline" size={18} color={accent} />
              </View>

              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, { color: theme.colors.text }]}>
                  Change Password
                </Text>
                <Text style={[styles.rowSub, { color: theme.colors.textSecondary }]}>
                  Update your login password
                </Text>
              </View>

              <Ionicons
                name={showPasswordSection ? "chevron-up" : "chevron-down"}
                size={16}
                color={accent}
              />
            </TouchableOpacity>

            {showPasswordSection && (
              <View style={styles.passwordSection}>
                {[
                  { label: "Current Password", value: currentPw, setter: setCurrentPw },
                  { label: "New Password", value: newPw, setter: setNewPw },
                  { label: "Confirm New Password", value: confirmPw, setter: setConfirmPw },
                ].map((field) => (
                  <View key={field.label} style={styles.fieldGroup}>
                    <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                      {field.label}
                    </Text>

                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.colors.background,
                          borderColor: theme.colors.border,
                          color: theme.colors.text,
                        },
                      ]}
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

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
            Danger Zone
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: "#ef444440",
              },
            ]}
          >
            <TouchableOpacity
              style={styles.deleteRow}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <View style={[styles.rowIcon, { backgroundColor: "#ef444420" }]}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </View>

              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, { color: "#ef4444" }]}>
                  Delete Account
                </Text>
                <Text style={[styles.rowSub, { color: theme.colors.textSecondary }]}>
                  Permanently remove your account
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  scroll: { paddingBottom: 60 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  pageTitle: { fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
  spacer: { width: 40, height: 40 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  card: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  toggleText: { flex: 1 },
  toggleLabel: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  toggleSub: { fontSize: 11, fontWeight: "500" },
  expandRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  rowSub: { fontSize: 11, fontWeight: "500" },
  passwordSection: { padding: 16, gap: 16 },
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "600",
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  deleteRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
});
