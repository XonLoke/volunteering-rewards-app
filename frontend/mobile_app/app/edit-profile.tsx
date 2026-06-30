import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditProfile() {
  const router = useRouter();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const accent = "#22d3a5";

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
      }
    };
    load();
  }, []);

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

        {/* Fields */}
        <View style={styles.form}>
          {[
            { label: "Full Name", value: name, setter: setName, placeholder: "Your full name", icon: "person-outline" },
            { label: "Email", value: email, setter: setEmail, placeholder: "Your email", icon: "mail-outline" },
            { label: "Phone", value: phone, setter: setPhone, placeholder: "Your phone number", icon: "call-outline" },
          ].map((field) => (
            <View key={field.label} style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{field.label}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Ionicons name={field.icon as any} size={18} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  value={field.value}
                  onChangeText={field.setter}
                  placeholder={field.placeholder}
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType={field.label === "Email" ? "email-address" : field.label === "Phone" ? "phone-pad" : "default"}
                  autoCapitalize={field.label === "Email" ? "none" : "words"}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Info note */}
        <View style={[styles.infoBox, { backgroundColor: accent + "15", borderColor: accent + "40" }]}>
          <Ionicons name="information-circle-outline" size={18} color={accent} />
          <Text style={[styles.infoText, { color: accent }]}>Changes are saved locally for this session.</Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: accent }]}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-outline" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: 48 },
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
  form: { paddingHorizontal: 20, marginTop: 12, gap: 20 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
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
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoText: { fontSize: 13, fontWeight: "500", flex: 1 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    paddingVertical: 16,
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.3 },
});