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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { authFetch } from "./api";

const BASE_URL = "https://vol-rewards-api.onrender.com/api";

export default function Feedback() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  const eventId = params.eventId as string;
  const eventTitle = (params.eventTitle as string) || "this event";

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const accent = "#f59e0b";

  const handleSubmit = async () => {
    if (!eventId) {
      Alert.alert("Missing event", "We couldn't tell which event this feedback is for.");
      return;
    }

    if (rating === 0) {
      Alert.alert("Add a rating", "Please tap a star to rate this event before submitting.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await authFetch(`${BASE_URL}/events/${eventId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      console.log("Feedback status:", response.status);
      console.log("Feedback response:", JSON.stringify(data));

      if (!response.ok) {
        throw new Error(
          data.error?.message || data.message || "Failed to submit feedback."
        );
      }

      Alert.alert("Thank you!", "Your feedback has been submitted.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Feedback submit error:", error);
      Alert.alert("Error", error.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[
              styles.backBtn,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
            onPress={() => router.back()}
            disabled={submitting}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>
            Rate Your Experience
          </Text>

          <View style={styles.spacer} />
        </View>

        <View
          style={[
            styles.eventCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <View style={[styles.eventIconBox, { backgroundColor: accent + "18" }]}>
            <Ionicons name="calendar-outline" size={26} color={accent} />
          </View>

          <Text style={[styles.eventTitle, { color: theme.colors.text }]} numberOfLines={2}>
            {eventTitle}
          </Text>

          <Text style={[styles.eventSub, { color: theme.colors.textSecondary }]}>
            How was your volunteering experience?
          </Text>
        </View>

        <View style={styles.starsSection}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                disabled={submitting}
                activeOpacity={0.7}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={40}
                  color={star <= rating ? accent : theme.colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <Text style={[styles.ratingLabel, { color: accent }]}>
              {ratingLabels[rating]}
            </Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            Comments (optional)
          </Text>

          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={comment}
            onChangeText={setComment}
            placeholder="Tell us what went well, or what could be improved..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            editable={!submitting}
            maxLength={500}
          />

          <Text style={[styles.counter, { color: theme.colors.textSecondary }]}>
            {comment.length}/500
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: accent, opacity: submitting ? 0.75 : 1 },
          ]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-outline" size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Submit Feedback</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.back()}
          disabled={submitting}
        >
          <Text style={[styles.skipBtnText, { color: theme.colors.textSecondary }]}>
            Skip for now
          </Text>
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
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  pageTitle: { fontSize: 17, fontWeight: "900", letterSpacing: 0.3 },
  spacer: { width: 40, height: 40 },
  eventCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    alignItems: "center",
    marginBottom: 24,
  },
  eventIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  eventTitle: { fontSize: 18, fontWeight: "900", textAlign: "center", marginBottom: 6 },
  eventSub: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  starsSection: { alignItems: "center", marginBottom: 28 },
  starsRow: { flexDirection: "row", gap: 8 },
  starButton: { padding: 4 },
  ratingLabel: { fontSize: 14, fontWeight: "800", marginTop: 10 },
  fieldGroup: { paddingHorizontal: 20, marginBottom: 24 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  textArea: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: "600",
    minHeight: 120,
  },
  counter: { fontSize: 11, fontWeight: "700", textAlign: "right", marginTop: 6 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 14,
  },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.3 },
  skipBtn: { alignItems: "center", paddingVertical: 8 },
  skipBtnText: { fontSize: 13, fontWeight: "700" },
});