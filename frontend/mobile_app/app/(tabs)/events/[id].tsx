import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../../src/theme';
import Card from '../../../src/components/Card';
import Badge from '../../../src/components/Badge';
import Button from '../../../src/components/Button';
import LoadingSpinner from '../../../src/components/LoadingSpinner';
import ErrorState from '../../../src/components/ErrorState';
import Toast from '../../../src/components/Toast';
import { api, ApiError } from '../../../src/services/api';

type LoadingState = 'idle' | 'loading' | 'error' | 'success';

interface EventDetail {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  points_awarded: number;
  capacity: number;
  registered_count: number;
  category: string;
  category_id: number;
  organiser: string;
  what_to_bring: string[];
  image_url: string | null;
  is_registered: boolean;
  is_full: boolean;
}

const screenWidth = Dimensions.get('window').width;

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function getCategoryBadgeVariant(
  category: string,
): 'approved' | 'pending' | 'rejected' | 'default' {
  const lower = category.toLowerCase();
  if (lower === 'environment' || lower === 'health') return 'approved';
  if (lower === 'elderly' || lower === 'youth') return 'pending';
  if (lower === 'animals') return 'rejected';
  return 'default';
}

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToastMessage(message);
      setToastType(type);
      setToastVisible(true);
    },
    [],
  );

  const hideToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  // Fetch event detail
  useEffect(() => {
    let cancelled = false;

    const fetchEvent = async () => {
      setLoadingState('loading');
      setError(null);

      try {
        const res = await api.get<EventDetail>(`/api/events/${id}`);
        if (!cancelled) {
          setEvent(res);
          setLoadingState('success');
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof ApiError ? err.message : 'Failed to load event details.';
          setError(message);
          setLoadingState('error');
        }
      }
    };

    if (id) {
      fetchEvent();
    } else {
      setError('Event ID not found.');
      setLoadingState('error');
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Handle Join Event
  const handleJoin = useCallback(async () => {
    if (!event || isJoining) return;

    setIsJoining(true);
    try {
      await api.post(`/api/events/${event.id}/register`);
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              is_registered: true,
              registered_count: prev.registered_count + 1,
              is_full: prev.registered_count + 1 >= prev.capacity,
            }
          : prev,
      );
      showToast('Registered!', 'success');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to register.';
      showToast(message, 'error');
    } finally {
      setIsJoining(false);
    }
  }, [event, isJoining, showToast]);

  // Handle Cancel Registration
  const handleCancel = useCallback(async () => {
    if (!event || isCancelling) return;

    setIsCancelling(true);
    try {
      await api.del(`/api/events/${event.id}/register`);
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              is_registered: false,
              registered_count: Math.max(0, prev.registered_count - 1),
              is_full: false,
            }
          : prev,
      );
      showToast('Registration cancelled', 'success');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to cancel registration.';
      showToast(message, 'error');
    } finally {
      setIsCancelling(false);
    }
  }, [event, isCancelling, showToast]);

  // Loading state
  if (loadingState === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <LoadingSpinner fullScreen message="Loading event..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (loadingState === 'error' || !event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <ErrorState
            message={error || 'Event not found'}
            onRetry={() => {
              setLoadingState('loading');
              setError(null);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const filledPercent = Math.min(
    (event.registered_count / event.capacity) * 100,
    100,
  );
  const isFull = event.is_full || event.registered_count >= event.capacity;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Event Image / Placeholder */}
        {event.image_url ? (
          <View style={styles.imageContainer}>
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📸</Text>
            </View>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderIcon}>🗓️</Text>
          </View>
        )}

        {/* Event Details */}
        <View style={styles.detailsContainer}>
          {/* Title */}
          <Text style={styles.eventTitle}>{event.title}</Text>

          {/* Organiser */}
          <Text style={styles.organiserText}>by {event.organiser}</Text>

          {/* Category Badge */}
          <View style={styles.categoryBadgeContainer}>
            <Badge
              label={event.category}
              variant={getCategoryBadgeVariant(event.category)}
            />
          </View>

          {/* Info Section */}
          <Card style={styles.infoCard}>
            {/* Date */}
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            {/* Time */}
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>⏰</Text>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{event.time || 'To be confirmed'}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            {/* Location */}
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{event.location}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            {/* Capacity */}
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>👥</Text>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Capacity</Text>
                <View style={styles.capacityDetails}>
                  <View style={styles.capacityTrack}>
                    <View
                      style={[
                        styles.capacityFill,
                        {
                          width: `${filledPercent}%`,
                          backgroundColor: isFull
                            ? colors.accent.red
                            : colors.accent.green,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.capacityText}>
                    {event.registered_count}/{event.capacity} registered
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Points Callout */}
          <Card style={styles.pointsCard}>
            <Text style={styles.pointsIcon}>⭐</Text>
            <View style={styles.pointsTextContainer}>
              <Text style={styles.pointsEarnText}>
                Earn {event.points_awarded} points
              </Text>
              <Text style={styles.pointsSubtext}>
                By participating in this event
              </Text>
            </View>
          </Card>

          {/* Description */}
          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.descriptionText}>{event.description}</Text>

          {/* What to Bring */}
          {event.what_to_bring && event.what_to_bring.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>What to Bring</Text>
              <View style={styles.bringList}>
                {event.what_to_bring.map((item, index) => (
                  <View key={index} style={styles.bringItem}>
                    <Text style={styles.bringBullet}>•</Text>
                    <Text style={styles.bringText}>{item}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Action Button */}
          <View style={styles.actionContainer}>
            {event.is_registered ? (
              <Button
                title={
                  isCancelling ? 'Cancelling...' : 'Cancel Registration'
                }
                onPress={handleCancel}
                variant="secondary"
                disabled={isCancelling}
                loading={isCancelling}
                style={styles.actionButton}
              />
            ) : isFull ? (
              <Button
                title="Event Full"
                onPress={() => {}}
                variant="primary"
                disabled
                style={styles.actionButton}
              />
            ) : (
              <Button
                title={isJoining ? 'Joining...' : 'Join Event'}
                onPress={handleJoin}
                variant="primary"
                disabled={isJoining}
                loading={isJoining}
                style={styles.actionButton}
              />
            )}
          </View>

          {/* Bottom spacer */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Toast notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={hideToast}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg.page,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  errorContainer: {
    flex: 1,
  },
  // Back Button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    zIndex: 10,
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
  // Image / Placeholder
  imageContainer: {
    width: screenWidth,
    height: 200,
  },
  imagePlaceholder: {
    width: screenWidth,
    height: 200,
    backgroundColor: colors.bg.subtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderIcon: {
    fontSize: 48,
  },
  imagePlaceholderText: {
    fontSize: 48,
  },
  // Details
  detailsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  organiserText: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  categoryBadgeContainer: {
    marginBottom: spacing.lg,
  },
  // Info Card
  infoCard: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: spacing.md,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 20,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.xs,
  },
  // Capacity in Info Card
  capacityDetails: {
    marginTop: spacing.xs,
  },
  capacityTrack: {
    height: 6,
    backgroundColor: colors.bg.subtle,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  capacityFill: {
    height: '100%',
    borderRadius: 3,
  },
  capacityText: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  // Points Callout
  pointsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8E8',
    borderColor: colors.accent.green,
    borderWidth: 1,
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  pointsIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  pointsTextContainer: {
    flex: 1,
  },
  pointsEarnText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.accent.green,
    marginBottom: 2,
  },
  pointsSubtext: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  // Description
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  // What to Bring
  bringList: {
    backgroundColor: colors.bg.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  bringItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  bringBullet: {
    fontSize: 15,
    color: colors.accent.green,
    marginRight: spacing.sm,
    lineHeight: 22,
    fontWeight: '700',
  },
  bringText: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
    flex: 1,
  },
  // Action Button
  actionContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButton: {
    height: 52,
    borderRadius: borderRadius.lg,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
