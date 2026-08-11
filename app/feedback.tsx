import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://vol-rewards-api.onrender.com/api";
const STAR_OPTIONS = [1, 2, 3, 4, 5];

export default function FeedbackScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { eventId, eventTitle } = useLocalSearchParams<{
    eventId: string;
    eventTitle: string;
  }>();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getRatingLabel = (r: number) => {
    if (r === 0) return "Tap a star to rate";
    if (r === 1) return "Poor";
    if (r === 2) return "Below Average";
    if (r === 3) return "Average";
    if (r === 4) return "Good";
    return "Excellent";
  };

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert("Rating required", "Please select a star rating.");
      return;
    }

    if (!eventId) {
      Alert.alert("Error", "Event ID is missing.");
      return;
    }

    setSubmitting(true);

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/events/${eventId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || "Failed to submit feedback.");
      }

      setSubmitted(true);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#10b981" />
          <Text style={[styles.successTitle, { color: theme.colors.text }]}>Thank You!</Text>
          <Text style={[styles.successSub, { color: theme.colors.textSecondary }]}>
            Your feedback has been submitted.
          </Text>
          <TouchableOpacity style={[styles.successBtn, { backgroundColor: theme.colors.primary }]} onPress={goBack}>
            <Text style={styles.successBtnText}>Back to Events</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <TouchableOpacity style={styles.backBtn} onPress={goBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          <Text style={[styles.backText, { color: theme.colors.primary }]}>Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={[styles.heading, { color: theme.colors.text }]}>Share Your Feedback</Text>
          <Text style={[styles.subheading, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {eventTitle || "Event"}
          </Text>

          {/* Rating */}
          <View style={styles.ratingSection}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Rating</Text>
            <View style={styles.starsRow}>
              {STAR_OPTIONS.map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.6}
                  style={styles.starBtn}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={44}
                    color={star <= rating ? "#f59e0b" : theme.colors.border}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.ratingHint, { color: theme.colors.textSecondary }]}>
              {getRatingLabel(rating)}
            </Text>
          </View>

          {/* Comment */}
          <View style={styles.commentSection}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
              Comments{" "}
              <Text style={{ color: theme.colors.textSecondary }}>(optional)</Text>
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
              placeholder="Tell us about your experience..."
              placeholderTextColor={theme.colors.textTertiary}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={[styles.charCount, { color: theme.colors.textTertiary }]}>
              {comment.length}/1000
            </Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor: rating ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={handleSubmit}
            disabled={!rating || submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.submitText}>Submit Feedback</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Skip */}
          <TouchableOpacity style={styles.skipBtn} onPress={goBack} activeOpacity={0.7}>
            <Text style={[styles.skipText, { color: theme.colors.textTertiary }]}>
              Skip / Back
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  backBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 },
  backText: { fontSize: 17, fontWeight: "600", marginLeft: 4 },
  content: { paddingHorizontal: 24 },
  heading: { fontSize: 26, fontWeight: "900", marginBottom: 4 },
  subheading: { fontSize: 15, fontWeight: "600", marginBottom: 32 },
  // Rating
  ratingSection: { marginBottom: 28 },
  sectionLabel: { fontSize: 16, fontWeight: "800", marginBottom: 14 },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 8 },
  starBtn: { padding: 6 },
  ratingHint: { textAlign: "center", fontSize: 14, fontWeight: "600", marginTop: 10 },
  // Comment
  commentSection: { marginBottom: 28 },
  commentInput: { borderRadius: 18, borderWidth: 1, padding: 16, fontSize: 15, minHeight: 130, lineHeight: 22 },
  charCount: { textAlign: "right", fontSize: 12, marginTop: 6 },
  // Submit
  submitBtn: { borderRadius: 18, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  skipBtn: { alignItems: "center", paddingVertical: 20 },
  skipText: { fontSize: 14, fontWeight: "600" },
  // Success
  successContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  successTitle: { fontSize: 26, fontWeight: "900", marginTop: 16, marginBottom: 8 },
  successSub: { fontSize: 15, fontWeight: "600", textAlign: "center", marginBottom: 32 },
  successBtn: { borderRadius: 18, paddingVertical: 16, paddingHorizontal: 32 },
  successBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },
});