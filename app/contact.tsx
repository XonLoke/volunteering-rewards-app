import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

export default function Contact() {
  const router = useRouter();
  const { theme } = useTheme();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const accent = "#22d3a5";
  const gold = "#f5c842";

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Missing fields", "Please fill in both subject and message.");
      return;
    }
    Alert.alert("Message Sent!", "We'll get back to you within 1–2 business days.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

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
          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>Contact Us</Text>
          <View style={styles.spacer} />
        </View>

        {/* Info cards */}
        <View style={styles.infoRow}>
          {[
            { emoji: "📧", label: "Email", value: "help@volunteerrewards.sg", color: accent },
            { emoji: "⏰", label: "Response", value: "1–2 business days", color: gold },
          ].map((item) => (
            <View key={item.label} style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[styles.infoIconBg, { backgroundColor: item.color + "20" }]}>
                <Text style={styles.infoEmoji}>{item.emoji}</Text>
              </View>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>{item.label}</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Send a Message</Text>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Subject</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={subject}
              onChangeText={setSubject}
              placeholder="What's your question about?"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Message</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your issue or question..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: accent }]}
            onPress={handleSend}
            activeOpacity={0.85}
          >
            <Text style={styles.sendBtnText}>Send Message 📤</Text>
          </TouchableOpacity>
        </View>

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
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  backText: { fontSize: 18, fontWeight: "700" },
  pageTitle: { fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
  spacer: { width: 40, height: 40 },
  infoRow: { flexDirection: "row", paddingHorizontal: 20, gap: 12, marginBottom: 28 },
  infoCard: {
    flex: 1, borderRadius: 18, borderWidth: 1,
    padding: 16, alignItems: "center", gap: 6,
  },
  infoIconBg: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  infoEmoji: { fontSize: 20 },
  infoLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  infoValue: { fontSize: 11, fontWeight: "700", textAlign: "center" },
  form: { paddingHorizontal: 20, gap: 20 },
  sectionLabel: {
    fontSize: 11, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase",
  },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  input: {
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, fontWeight: "600",
  },
  textArea: {
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, fontWeight: "600", minHeight: 120,
  },
  sendBtn: {
    borderRadius: 16, paddingVertical: 16, alignItems: "center", marginTop: 8,
  },
  sendBtnText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.3 },
});