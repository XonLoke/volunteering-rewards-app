import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://vol-rewards-api.onrender.com/api";

export default function EditProfile() {
  const router = useRouter();
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const accent = "#22d3a5";

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem("user");

        if (!stored) {
          Alert.alert("Login required", "Please login again.");
          router.replace("/login" as any);
          return;
        }

        const user = JSON.parse(stored);

        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");

        try {
          const token = await AsyncStorage.getItem("token");

          const response = await fetch(`${BASE_URL}/me`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          const data = await response.json();
          console.log("Profile load response:", JSON.stringify(data));

          if (response.ok && data.name) {
            const updatedUser = { ...user, ...data };

            setName(updatedUser.name || "");
            setEmail(updatedUser.email || "");
            setPhone(updatedUser.phone || "");

            await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

            const freshPoints = Number(
              data.points_balance ?? data.points ?? 0
            );
            if (freshPoints > 0) {
              await AsyncStorage.setItem("userPoints", String(freshPoints));
            }
          }
        } catch (error) {
          console.log("Profile refresh skipped:", error);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        Alert.alert("Error", "Failed to load profile.");
      }
    };

    load();
  }, []);

  const handleSave = async () => {
    try {
      const trimmedName = name.trim();
      const trimmedPhone = phone.trim();

      if (!trimmedName) {
        Alert.alert("Missing name", "Please enter your full name.");
        return;
      }

      const stored = await AsyncStorage.getItem("user");

      if (!stored) {
        Alert.alert("Login required", "Please login again.");
        router.replace("/login" as any);
        return;
      }

      const user = JSON.parse(stored);
      const token = await AsyncStorage.getItem("token");

      setSaving(true);

      const response = await fetch(`${BASE_URL}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));
      console.log("EDIT PROFILE STATUS:", response.status);
      console.log("EDIT PROFILE DATA:", JSON.stringify(data));

      if (!response.ok) {
        throw new Error(
          data.error?.message || data.message || "Failed to update profile."
        );
      }

      const updatedUser = {
        ...user,
        ...(data || {}),
        name: trimmedName,
        phone: trimmedPhone,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      Alert.alert("Saved", "Profile updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Edit profile error:", error);
      Alert.alert("Error", error.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Edit Profile</Text>

          <View style={styles.spacer} />
        </View>

        <View style={styles.form}>
          {[
            {
              label: "Full Name",
              value: name,
              setter: setName,
              placeholder: "Your full name",
              icon: "person-outline",
              editable: true,
              keyboard: "default" as any,
              capitalize: "words" as any,
            },
            {
              label: "Email",
              value: email,
              setter: setEmail,
              placeholder: "Your email",
              icon: "mail-outline",
              editable: false, // email cannot be changed
              keyboard: "email-address" as any,
              capitalize: "none" as any,
            },
            {
              label: "Phone",
              value: phone,
              setter: setPhone,
              placeholder: "+65XXXXXXXX",
              icon: "call-outline",
              editable: true,
              keyboard: "phone-pad" as any,
              capitalize: "none" as any,
            },
          ].map((field) => (
            <View key={field.label} style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                {field.label}
                {!field.editable && (
                  <Text style={{ color: theme.colors.textTertiary }}> (cannot be changed)</Text>
                )}
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: field.editable ? theme.colors.surface : theme.colors.background,
                    borderColor: theme.colors.border,
                    opacity: field.editable ? 1 : 0.6,
                  },
                ]}
              >
                <Ionicons name={field.icon as any} size={18} color={theme.colors.textSecondary} />

                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  value={field.value}
                  onChangeText={field.setter}
                  placeholder={field.placeholder}
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType={field.keyboard}
                  autoCapitalize={field.capitalize}
                  autoCorrect={false}
                  editable={field.editable && !saving}
                />
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: accent, opacity: saving ? 0.75 : 1 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-outline" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: 48 },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  pageTitle: { fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
  spacer: { width: 40, height: 40 },
  form: { paddingHorizontal: 20, marginTop: 12, gap: 20 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  inputWrapper: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14,
  },
  input: { flex: 1, fontSize: 15, fontWeight: "600" },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, marginHorizontal: 20, marginTop: 24, borderRadius: 16, paddingVertical: 16,
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.3 },
});