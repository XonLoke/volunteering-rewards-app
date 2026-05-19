import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../../src/theme';
import Card from '../../../src/components/Card';
import Badge from '../../../src/components/Badge';
import Button from '../../../src/components/Button';
import LoadingSpinner from '../../../src/components/LoadingSpinner';
import EmptyState from '../../../src/components/EmptyState';
import ErrorState from '../../../src/components/ErrorState';
import { api, ApiError } from '../../../src/services/api';

type LoadingState = 'idle' | 'loading' | 'error' | 'success';
type EventTab = 'upcoming' | 'past';

interface EventSummary {
  id: number;
  title: string;
  date: string;
  location: string;
  points_awarded: number;
  is_checked_in?: boolean;
  has_given_feedback?: boolean;
  points_earned?: number;
}

interface MyEventsResponse {
  upcoming?: EventSummary[];
  past?: EventSummary[];
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export default function MyEventsScreen() {
  const router = useRouter();
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<EventTab>('upcoming');
  const [upcomingEvents, setUpcomingEvents] = useState<EventSummary[]>([]);
  const [pastEvents, setPastEvents] = useState<EventSummary[]>([]);
  const [upcomingFetched, setUpcomingFetched] = useState(false);
  const [pastFetched, setPastFetched] = useState(false);

  const fetchEvents = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh && !upcomingFetched && !pastFetched) {
        setLoadingState('loading');
      }
      setError(null);

      try {
        const [upcomingRes, pastRes] = await Promise.all([
          !upcomingFetched || isRefresh
            ? api.get<MyEventsResponse>('/api/me/events?status=upcoming')
            : Promise.resolve(null),
          !pastFetched || isRefresh
            ? api.get<MyEventsResponse>('/api/me/events?status=past')
            : Promise.resolve(null),
        ]);

        if (upcomingRes) {
          setUpcomingEvents(upcomingRes.upcoming || []);
          setUpcomingFetched(true);
        }
        if (pastRes) {
          setPastEvents(pastRes.past || []);
          setPastFetched(true);
        }

        setLoadingState('success');
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Failed to load events.';
        setError(message);
        if (!upcomingFetched && !pastFetched) {
          setLoadingState('error');
        }
      } finally {
        setRefreshing(false);
      }
    },
    [upcomingFetched, pastFetched],
  );

  // Initial fetch
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingState('loading');
      setError(null);

      try {
        const [upcomingRes, pastRes] = await Promise.all([
          api.get<MyEventsResponse>('/api/me/events?status=upcoming'),
          api.get<MyEventsResponse>('/api/me/events?status=past'),
        ]);

        if (!cancelled) {
          setUpcomingEvents(upcomingRes.upcoming || []);
          setUpcomingFetched(true);
          setPastEvents(pastRes.past || []);
          setPastFetched(true);
          setLoadingState('success');
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof ApiError ? err.message : 'Failed to load events.';
          setError(message);
          setLoadingState('error');
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setUpcomingFetched(false);
    setPastFetched(false);

    const refresh = async () => {
      try {
        const [upcomingRes, pastRes] = await Promise.all([
          api.get<MyEventsResponse>('/api/me/events?status=upcoming'),
          api.get<MyEventsResponse>('/api/me/events?status=past'),
        ]);

        setUpcomingEvents(upcomingRes.upcoming || []);
        setUpcomingFetched(true);
        setPastEvents(pastRes.past || []);
        setPastFetched(true);
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Failed to refresh.';
        setError(message);
      } finally {
        setRefreshing(false);
      }
    };

    refresh();
  }, []);

  // Handle tab change
  const handleTabChange = useCallback((tab: EventTab) => {
    setActiveTab(tab);
  }, []);

  // Render upcoming event card
  const renderUpcomingEvent = useCallback(
    ({ item }: { item: EventSummary }) => (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/events/${item.id}`)}
        style={styles.eventCardContainer}
      >
        <Card style={styles.eventCard}>
          <View style={styles.eventCardHeader}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Badge
              label={item.is_checked_in ? 'Checked In' : 'Not Checked In'}
              variant={item.is_checked_in ? 'approved' : 'pending'}
            />
          </View>
          <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
          <View style={styles.eventLocationRow}>
            <Text style={styles.eventLocationIcon}>📍</Text>
            <Text style={styles.eventLocation} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <View style={styles.eventCardFooter}>
            <Text style={styles.eventPoints}>{item.points_awarded} pts</Text>
          </View>
        </Card>
      </TouchableOpacity>
    ),
    [router],
  );

  // Render past event card
  const renderPastEvent = useCallback(
    ({ item }: { item: EventSummary }) => (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/events/${item.id}`)}
        style={styles.eventCardContainer}
      >
        <Card style={styles.eventCard}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
          <View style={styles.eventLocationRow}>
            <Text style={styles.eventLocationIcon}>📍</Text>
            <Text style={styles.eventLocation} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <View style={styles.pastEventFooter}>
            <View style={styles.pointsEarnedContainer}>
              <Text style={styles.pointsEarnedLabel}>Points Earned</Text>
              <Text style={styles.pointsEarnedValue}>
                +{item.points_earned || item.points_awarded} pts
              </Text>
            </View>
            {!item.has_given_feedback && (
              <Button
                title="Give Feedback"
                onPress={() => {
                  // Navigate to feedback form for this event
                  router.push(`/events/${item.id}/feedback`);
                }}
                variant="tertiary"
                style={styles.feedbackButton}
              />
            )}
            {item.has_given_feedback && (
              <Badge label="Feedback Given" variant="approved" />
            )}
          </View>
        </Card>
      </TouchableOpacity>
    ),
    [router],
  );

  const keyExtractor = useCallback(
    (item: EventSummary) => String(item.id),
    [],
  );

  // Loading state
  if (loadingState === 'loading' && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>My Events</Text>
        </View>
        <LoadingSpinner fullScreen />
      </SafeAreaView>
    );
  }

  // Error state (no data at all)
  if (loadingState === 'error' && !upcomingFetched && !pastFetched) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>My Events</Text>
        </View>
        <ErrorState
          message={error || 'Something went wrong'}
          onRetry={() => {
            setLoadingState('loading');
            setError(null);
            setUpcomingFetched(false);
            setPastFetched(false);
          }}
        />
      </SafeAreaView>
    );
  }

  const currentEvents =
    activeTab === 'upcoming' ? upcomingEvents : pastEvents;
  const isEmpty = currentEvents.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>My Events</Text>
        </View>

        {/* Segmented Control */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentTab,
              activeTab === 'upcoming' && styles.segmentTabActive,
            ]}
            onPress={() => handleTabChange('upcoming')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentTabText,
                activeTab === 'upcoming' && styles.segmentTabTextActive,
              ]}
            >
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentTab,
              activeTab === 'past' && styles.segmentTabActive,
            ]}
            onPress={() => handleTabChange('past')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentTabText,
                activeTab === 'past' && styles.segmentTabTextActive,
              ]}
            >
              Past
            </Text>
          </TouchableOpacity>
        </View>

        {/* Events List */}
        <FlatList
          data={currentEvents}
          keyExtractor={keyExtractor}
          renderItem={
            activeTab === 'upcoming' ? renderUpcomingEvent : renderPastEvent
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.green}
              colors={[colors.accent.green]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={activeTab === 'upcoming' ? '📅' : '📋'}
              title={
                activeTab === 'upcoming'
                  ? 'No upcoming events'
                  : 'No past events'
              }
              message={
                activeTab === 'upcoming'
                  ? 'You haven\'t registered for any upcoming events yet.'
                  : 'Your completed events will appear here.'
              }
              actionLabel={
                activeTab === 'upcoming' ? 'Browse Events' : undefined
              }
              onAction={
                activeTab === 'upcoming'
                  ? () => router.push('/events')
                  : undefined
              }
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg.page,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.largeTitle,
    color: colors.text.primary,
  },
  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.bg.subtle,
    borderRadius: borderRadius.md,
    padding: 2,
    marginBottom: spacing.lg,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: borderRadius.sm + 2,
  },
  segmentTabActive: {
    backgroundColor: colors.bg.page,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentTabText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  segmentTabTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  // Event List
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  eventCardContainer: {
    marginBottom: spacing.md,
  },
  eventCard: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  eventDate: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  eventLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  eventLocationIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  eventLocation: {
    fontSize: 15,
    color: colors.text.secondary,
    flex: 1,
  },
  eventCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  eventPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.green,
  },
  // Past Event Footer
  pastEventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  pointsEarnedContainer: {
    flexDirection: 'column',
  },
  pointsEarnedLabel: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  pointsEarnedValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent.green,
  },
  feedbackButton: {
    height: 36,
    paddingHorizontal: spacing.md,
  },
});
