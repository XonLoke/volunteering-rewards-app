import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://vol-rewards-api.onrender.com/api";
const SUPPORT_EMAIL = "volunteerrewardsapp@gmail.com";

const accent = "#22d3a5";
const gold = "#f5c842";
const blue = "#60a5fa";
const purple = "#a78bfa";

export default function Contact() {
  const router = useRouter();
  const { theme } = useTheme();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const getToken = async () => {
    return await AsyncStorage.getItem("token");
  };

  const handleTopicPress = (topic: string) => {
    setSubject(topic);
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Missing details", "Please enter both a subject and message.");
      return;
    }

    if (subject.trim().length < 3) {
      Alert.alert("Subject too short", "Please enter a clearer subject.");
      return;
    }

    if (message.trim().length < 10) {
      Alert.alert("Message too short", "Please include a little more detail.");
      return;
    }

    try {
      setSending(true);

      const token = await getToken();

      if (!token) {
        Alert.alert("Session expired", "Please log in again.");
        router.replace("/login" as any);
        return;
      }

      const res = await fetch(`${BASE_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to send your message.");
      }

      setSubject("");
      setMessage("");

      Alert.alert(
        "Message sent",
        "Thanks for reaching out. Our team will get back to you within 1–2 business days.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert(
        "Message not sent",
        err.message || "Something went wrong. Please try again later."
      );
    } finally {
      setSending(false);
    }
  };

  const topics = [
    "Reward issue",
    "Event booking",
    "Points problem",
    "Account help",
  ];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
            </TouchableOpacity>

            <Text style={[styles.pageTitle, { color: theme.colors.text }]}>
              Contact Us
            </Text>

            <View style={styles.spacer} />
          </View>

          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.heroTop}>
              <View style={[styles.heroIcon, { backgroundColor: accent + "22" }]}>
                <Ionicons name="chatbubbles-outline" size={30} color={accent} />
              </View>

              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Support Online</Text>
              </View>
            </View>

            <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
              Need help with your account?
            </Text>

            <Text style={[styles.heroSub, { color: theme.colors.textSecondary }]}>
              Send us your issue and we’ll help you check it. Include details like event name,
              reward, or points issue so we can respond faster.
            </Text>
          </View>

          <View style={styles.infoStack}>
            <View
              style={[
                styles.supportCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={[styles.infoIconBg, { backgroundColor: accent + "20" }]}>
                <Ionicons name="mail-outline" size={22} color={accent} />
              </View>

              <View style={styles.supportTextWrap}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                  Support Email
                </Text>

                <Text style={[styles.supportEmail, { color: theme.colors.text }]}>
                  {SUPPORT_EMAIL}
                </Text>
              </View>
            </View>

            <View style={styles.miniInfoRow}>
              <View
                style={[
                  styles.miniInfoCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={[styles.miniIcon, { backgroundColor: gold + "20" }]}>
                  <Ionicons name="time-outline" size={18} color={gold} />
                </View>

                <Text style={[styles.miniLabel, { color: theme.colors.textSecondary }]}>
                  Reply Time
                </Text>

                <Text style={[styles.miniValue, { color: theme.colors.text }]}>
                  1–2 days
                </Text>
              </View>

              <View
                style={[
                  styles.miniInfoCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={[styles.miniIcon, { backgroundColor: blue + "20" }]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={blue} />
                </View>

                <Text style={[styles.miniLabel, { color: theme.colors.textSecondary }]}>
                  Secure
                </Text>

                <Text style={[styles.miniValue, { color: theme.colors.text }]}>
                  Logged in
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.formCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.formHeader}>
              <View>
                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
                  Send Message
                </Text>

                <Text style={[styles.formTitle, { color: theme.colors.text }]}>
                  What can we help with?
                </Text>
              </View>

              <View style={[styles.formHeaderIcon, { backgroundColor: purple + "20" }]}>
                <Ionicons name="create-outline" size={20} color={purple} />
              </View>
            </View>

            <View style={styles.topicWrap}>
              {topics.map((topic) => {
                const active = subject === topic;

                return (
                  <TouchableOpacity
                    key={topic}
                    style={[
                      styles.topicChip,
                      {
                        backgroundColor: active ? accent : theme.colors.background,
                        borderColor: active ? accent : theme.colors.border,
                      },
                    ]}
                    onPress={() => handleTopicPress(topic)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.topicText,
                        {
                          color: active ? "#fff" : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {topic}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                Subject
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
                value={subject}
                onChangeText={setSubject}
                placeholder="Example: Issue with my reward PIN"
                placeholderTextColor={theme.colors.textTertiary}
                editable={!sending}
                maxLength={120}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                Message
              </Text>

              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={message}
                onChangeText={setMessage}
                placeholder="Tell us more about the issue..."
                placeholderTextColor={theme.colors.textTertiary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                editable={!sending}
                maxLength={1000}
              />

              <View style={styles.messageFooter}>
                <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                  Tip: Add event name or reward PIN if relevant.
                </Text>

                <Text style={[styles.counter, { color: theme.colors.textSecondary }]}>
                  {message.length}/1000
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.sendBtn,
                {
                  backgroundColor: sending ? theme.colors.border : accent,
                },
              ]}
              onPress={handleSend}
              activeOpacity={0.85}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send-outline" size={18} color="#fff" />
              )}

              <Text style={styles.sendBtnText}>
                {sending ? "Sending..." : "Send Message"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 50,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  spacer: {
    width: 42,
    height: 42,
  },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 26,
    borderWidth: 1,
    padding: 20,
    marginTop: 4,
    marginBottom: 16,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22d3a51A",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: accent,
  },
  statusText: {
    color: accent,
    fontSize: 11,
    fontWeight: "800",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 21,
  },
  infoStack: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 18,
  },
  supportCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  supportTextWrap: {
    flex: 1,
  },
  infoIconBg: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  supportEmail: {
    fontSize: 14,
    fontWeight: "900",
    marginTop: 3,
    flexShrink: 1,
  },
  miniInfoRow: {
    flexDirection: "row",
    gap: 12,
  },
  miniInfoCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  miniIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  miniLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  miniValue: {
    fontSize: 14,
    fontWeight: "900",
  },
  formCard: {
    marginHorizontal: 20,
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    gap: 18,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  formHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  topicWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  topicChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  topicText: {
    fontSize: 12,
    fontWeight: "800",
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "700",
  },
  textArea: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "700",
    minHeight: 140,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
  },
  counter: {
    fontSize: 11,
    fontWeight: "700",
  },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 18,
    paddingVertical: 16,
    marginTop: 2,
  },
  sendBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
});
