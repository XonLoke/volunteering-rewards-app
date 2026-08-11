import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { api } from "../src/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function EventFeedback() {
  const router = useRouter();
  const { theme } = useTheme();
  const { eventId, eventTitle } = useLocalSearchParams<{
    eventId: string;
    eventTitle: string;
  }>();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitFeedback = async () => {
    if (rating < 1) {
      Alert.alert("Rating required", "Please tap a star to rate this event.");
      return;
    }

    try {
      setSubmitting(true);

      // api.post returns the parsed JSON body and throws ApiError on failure.
      await api.post(`/events/${eventId}/feedback`, { rating, comment });

      Alert.alert(
        "Thank you!",
        "Your feedback has been submitted. It helps organisers improve future events.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error("Feedback submit error:", error);
      Alert.alert("Error", error.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Share Feedback
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {eventTitle}
            </Text>
          </View>

          <View style={styles.spacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.ratingBox,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.ratingLabel, { color: theme.colors.text }]}>
              How was your experience?
            </Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={40}
                    color={
                      star <= rating
                        ? "#f59e0b"
                        : theme.colors.textTertiary || theme.colors.border
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.ratingHint, { color: theme.colors.textSecondary }]}>
              {rating === 0
                ? "Tap to rate"
                : rating <= 2
                ? "Needs improvement"
                : rating === 3
                ? "It was okay"
                : rating === 4
                ? "Pretty good"
                : "Excellent!"}
            </Text>
          </View>

          <Text
            style={[styles.commentLabel, { color: theme.colors.text }]}
          >
            Comments (optional)
          </Text>

          <TextInput
            style={[
              styles.commentInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="Share what you liked or how we can improve..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
            maxLength={500}
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: rating < 1 || submitting ? 0.5 : 1,
              },
            ]}
            onPress={submitFeedback}
            disabled={rating < 1 || submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="paper-plane-outline" size={18} color="#fff" />
                <Text style={styles.submitText}>Submit Feedback</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerCenter: { flex: 1, alignItems: "center", paddingHorizontal: 12 },
  title: { fontSize: 21, fontWeight: "900" },
  subtitle: { fontSize: 12, fontWeight: "500", marginTop: 2, maxWidth: 220 },
  spacer: { width: 42 },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  ratingBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    alignItems: "center",
    marginBottom: 22,
  },
  ratingLabel: { fontSize: 16, fontWeight: "800", marginBottom: 14 },
  starsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  ratingHint: { fontSize: 12, fontWeight: "600" },
  commentLabel: { fontSize: 14, fontWeight: "800", marginBottom: 8 },
  commentInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    minHeight: 120,
    fontSize: 14,
    marginBottom: 22,
  },
  submitButton: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
