import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../../src/theme';
import Button from '../../../src/components/Button';
import LoadingSpinner from '../../../src/components/LoadingSpinner';
import ErrorState from '../../../src/components/ErrorState';
import Toast from '../../../src/components/Toast';
import { api, ApiError } from '../../../src/services/api';

type LoadingState = 'idle' | 'loading' | 'error' | 'success';
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const STAR_OPTIONS = [1, 2, 3, 4, 5];

export default function FeedbackScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [eventTitle, setEventTitle] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  // Fetch event details to get the title
  useEffect(() => {
    if (!id) {
      setLoadingState('error');
      return;
    }

    let cancelled = false;
    const fetchEvent = async () => {
      try {
        const res = await api.get<{ title: string }>(`/api/events/${id}`);
        if (!cancelled) {
          setEventTitle(res.title);
          setLoadingState('success');
        }
      } catch {
        if (!cancelled) {
          setEventTitle('Event');
          setLoadingState('success'); // Allow feedback even if title fails
        }
      }
    };
    fetchEvent();
    return () => { cancelled = true; };
  }, [id]);

  const handleSubmit = useCallback(async () => {
    if (!rating) {
      showToast('Please select a rating.');
      return;
    }

    setSubmitState('submitting');
    setSubmitError(null);

    try {
      await api.post(`/api/events/${id}/feedback`, {
        rating,
        comment: comment.trim(),
      });
      setSubmitState('success');
      showToast('Feedback submitted!');
      // Go back after short delay
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.push('/(tabs)/home');
        }
      }, 1200);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to submit feedback.';
      setSubmitError(message);
      setSubmitState('error');
    }
  }, [id, rating, comment, router, showToast]);

  const handleSkip = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/home');
    }
  }, [router]);

  // Loading state
  if (loadingState === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <LoadingSpinner fullScreen message="Loading..." />
      </SafeAreaView>
    );
  }

  // Success state — show thank you
  if (submitState === 'success') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerContainer}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Thank You!</Text>
          <Text style={styles.successSubtitle}>Your feedback has been submitted.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>‹</Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.formContainer}>
            {/* Title */}
            <Text style={styles.pageTitle}>Share Your Feedback</Text>
            <Text style={styles.eventLabel}>{eventTitle}</Text>

            {/* Rating Stars */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionLabel}>Rating</Text>
              <View style={styles.starsRow}>
                {STAR_OPTIONS.map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.6}
                    style={styles.starButton}
                  >
                    <Text
                      style={[
                        styles.starIcon,
                        star <= rating && styles.starIconActive,
                      ]}
                    >
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingHint}>
                {rating === 0
                  ? 'Tap a star to rate'
                  : rating === 1
                    ? 'Poor'
                    : rating === 2
                      ? 'Below Average'
                      : rating === 3
                        ? 'Average'
                        : rating === 4
                          ? 'Good'
                          : 'Excellent'}
              </Text>
            </View>

            {/* Comment */}
            <View style={styles.commentSection}>
              <Text style={styles.sectionLabel}>Comments (optional)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Tell us about your experience..."
                placeholderTextColor={colors.text.tertiary}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={1000}
              />
              <Text style={styles.charCount}>{comment.length}/1000</Text>
            </View>

            {/* Error */}
            {submitState === 'error' && submitError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{submitError}</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title={submitState === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
                onPress={handleSubmit}
                variant="primary"
                disabled={submitState === 'submitting' || rating === 0}
                loading={submitState === 'submitting'}
                style={styles.submitButton}
              />
              <TouchableOpacity
                onPress={handleSkip}
                style={styles.skipButton}
                activeOpacity={0.7}
              >
                <Text style={styles.skipText}>Skip / Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type="success"
        onDismiss={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg.page,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backArrow: {
    fontSize: 28,
    color: colors.accent.blue,
    marginRight: spacing.xs,
    lineHeight: 28,
  },
  backText: {
    fontSize: 17,
    color: colors.accent.blue,
  },
  formContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  eventLabel: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  // Rating
  ratingSection: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  starButton: {
    padding: spacing.xs,
  },
  starIcon: {
    fontSize: 40,
    color: colors.border.light,
  },
  starIconActive: {
    color: '#f59e0b',
  },
  ratingHint: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  // Comment
  commentSection: {
    marginBottom: spacing.lg,
  },
  commentInput: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text.primary,
    minHeight: 120,
    lineHeight: 20,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  // Error
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  // Actions
  actions: {
    marginTop: spacing.sm,
  },
  submitButton: {
    height: 52,
    borderRadius: borderRadius.lg,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  skipText: {
    fontSize: 15,
    color: colors.text.tertiary,
  },
  // Success
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
