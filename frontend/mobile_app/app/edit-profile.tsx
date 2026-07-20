import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, ApiError } from "../src/services/api";

type PageState = "loading" | "ready" | "saving" | "error";

export default function EditProfile() {
  const router = useRouter();
  const { theme } = useTheme();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const accent = "#22d3a5";

  // ── Load profile from API on mount ─────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // Try API first
        const data = await api.get<any>("/auth/me");
        if (cancelled) return;

        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");

        // Update AsyncStorage cache
        const stored = await AsyncStorage.getItem("user");
        const user = stored ? JSON.parse(stored) : {};
        Object.assign(user, { name: data.name, email: data.email, phone: data.phone });
        await AsyncStorage.setItem("user", JSON.stringify(user));

        setPageState("ready");
      } catch {
        // Fallback to AsyncStorage if offline
        if (cancelled) return;
        try {
          const stored = await AsyncStorage.getItem("user");
          if (stored) {
            const user = JSON.parse(stored);
            setName(user.name || "");
            setEmail(user.email || "");
            setPhone(user.phone || "");
          }
          setPageState("ready");
        } catch {
          if (!cancelled) {
            setErrorMsg("Could not load profile data.");
            setPageState("error");
          }
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Validate before save ───────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters.";
    }
    if (phone.trim() && !/^\+65[689]\d{7}$/.test(phone.trim())) {
      errs.phone = "Singapore phone: +65 followed by 8 digits.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save via API ───────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;

    setPageState("saving");
    setErrorMsg("");

    try {
      const result = await api.put<any>("/auth/me", {
        name: name.trim(),
        phone: phone.trim() || undefined,
      });

      // Update AsyncStorage cache
      const stored = await AsyncStorage.getItem("user");
      const user = stored ? JSON.parse(stored) : {};
      Object.assign(user, {
        name: result.name || name.trim(),
        phone: result.phone || phone.trim(),
      });
      await AsyncStorage.setItem("user", JSON.stringify(user));

      Alert.alert("Saved", "Your profile has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      setPageState("ready");
      if (err instanceof ApiError) {
        if (err.code === "validation_error") {
          // Show field-level errors from backend
          setErrorMsg("Please fix the highlighted fields.");
          return;
        }
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save. Check your connection and try again.");
      }
    }
  };

  // ── Loading state ──────────────────────────────────────
  if (pageState === "loading") {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={accent} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ────────────────────────────────────────
  if (pageState === "error") {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerWrap}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Oops</Text>
          <Text style={[styles.errorDesc, { color: theme.colors.textSecondary }]}>
            {errorMsg}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: accent }]}
            onPress={() => router.back()}
          >
            <Text style={styles.retryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Ready state ────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Edit Profile</Text>
          <View style={styles.spacer} />
        </View>

        {/* API Error Banner */}
        {errorMsg !== "" && (
          <View style={[styles.errorBanner, { backgroundColor: "#ef444415", borderColor: "#ef444455" }]}>
            <Ionicons name="warning-outline" size={16} color="#ef4444" />
            <Text style={styles.errorBannerText}>{errorMsg}</Text>
          </View>
        )}

        {/* Fields */}
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: fieldErrors.name ? "#ef4444" : theme.colors.textSecondary }]}>
              Full Name *
            </Text>
            <View style={[
              styles.inputWrapper,
              { backgroundColor: theme.colors.surface, borderColor: fieldErrors.name ? "#ef4444" : theme.colors.border },
            ]}>
              <Ionicons name="person-outline" size={18} color={fieldErrors.name ? "#ef4444" : theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={name}
                onChangeText={(t) => { setName(t); if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" }); }}
                placeholder="Your full name"
                placeholderTextColor={theme.colors.textTertiary}
                autoCapitalize="words"
                editable={pageState !== "saving"}
              />
            </View>
            {fieldErrors.name && <Text style={styles.fieldError}>{fieldErrors.name}</Text>}
          </View>

          {/* Email — read-only */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Email</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: 0.6 }]}>
              <Ionicons name="mail-outline" size={18} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={email}
                editable={false}
              />
            </View>
            <Text style={[styles.fieldHint, { color: theme.colors.textTertiary }]}>
              Email cannot be changed here.
            </Text>
          </View>

          {/* Phone */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: fieldErrors.phone ? "#ef4444" : theme.colors.textSecondary }]}>
              Phone (optional)
            </Text>
            <View style={[
              styles.inputWrapper,
              { backgroundColor: theme.colors.surface, borderColor: fieldErrors.phone ? "#ef4444" : theme.colors.border },
            ]}>
              <Ionicons name="call-outline" size={18} color={fieldErrors.phone ? "#ef4444" : theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={phone}
                onChangeText={(t) => { setPhone(t); if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: "" }); }}
                placeholder="+65 8123 4567"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="phone-pad"
                editable={pageState !== "saving"}
              />
            </View>
            {fieldErrors.phone && <Text style={styles.fieldError}>{fieldErrors.phone}</Text>}
            <Text style={[styles.fieldHint, { color: theme.colors.textTertiary }]}>
              Singapore format: +65 followed by 8 digits.
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: accent, opacity: pageState === "saving" ? 0.6 : 1 }]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={pageState === "saving"}
        >
          {pageState === "saving" ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="checkmark-outline" size={20} color="#fff" />
          )}
          <Text style={styles.saveBtnText}>
            {pageState === "saving" ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: 48 },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  loadingText: { fontSize: 14, fontWeight: "500", marginTop: 8 },
  errorTitle: { fontSize: 20, fontWeight: "800" },
  errorDesc: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  retryBtn: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 14, marginTop: 8 },
  retryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  topBar: {
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
  pageTitle: { fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
  spacer: { width: 40, height: 40 },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorBannerText: { color: "#ef4444", fontSize: 13, fontWeight: "600", flex: 1 },

  form: { paddingHorizontal: 20, marginTop: 12, gap: 20 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  fieldHint: { fontSize: 11, fontWeight: "500", marginTop: -4 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: { flex: 1, fontSize: 15, fontWeight: "600" },
  fieldError: { color: "#ef4444", fontSize: 12, fontWeight: "600" },

  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 16,
    paddingVertical: 16,
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.3 },
});
