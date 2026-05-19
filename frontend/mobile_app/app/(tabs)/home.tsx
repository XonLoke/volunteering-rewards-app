import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../src/theme';
import Card from '../../src/components/Card';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import EmptyState from '../../src/components/EmptyState';
import ErrorState from '../../src/components/ErrorState';
import { api, ApiError } from '../../src/services/api';

type LoadingState = 'idle' | 'loading' | 'error' | 'success';

interface PointsResponse {
  balance: number;
  total_earned: number;
  total_redeemed: number;
  history: HistoryItem[];
}

interface HistoryItem {
  type: 'earned' | 'redeemed';
  amount: number;
  description: string;
  created_at: string;
}

interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  points_awarded: number;
}

interface UpcomingEventsResponse {
  upcoming: UpcomingEvent[];
}

const screenWidth = Dimensions.get('window').width;
const EVENT_CARD_WIDTH = (screenWidth - spacing.lg * 2 - spacing.md) * 0.75;

function formatPoints(amount: number): string {
  return amount.toLocaleString();
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pointsData, setPointsData] = useState<PointsResponse | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setLoadingState('loading');
    }
    setError(null);

    try {
      const [pointsRes, eventsRes] = await Promise.all([
        api.get<PointsResponse>('/api/me/points'),
        api.get<UpcomingEventsResponse>('/api/me/events?status=upcoming'),
      ]);

      setPointsData(pointsRes);
      setUpcomingEvents(eventsRes.upcoming || []);
      setLoadingState('success');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load data. Pull to retry.';
      setError(message);
      if (!isRefresh) {
        setLoadingState('error');
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingState('loading');
      setError(null);

      try {
        const [pointsRes, eventsRes] = await Promise.all([
          api.get<PointsResponse>('/api/me/points'),
          api.get<UpcomingEventsResponse>('/api/me/events?status=upcoming'),
        ]);

        if (!cancelled) {
          setPointsData(pointsRes);
          setUpcomingEvents(eventsRes.upcoming || []);
          setLoadingState('success');
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof ApiError ? err.message : 'Failed to load data.';
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoadingState('success');
    setError(null);

    const refresh = async () => {
      try {
        const [pointsRes, eventsRes] = await Promise.all([
          api.get<PointsResponse>('/api/me/points'),
          api.get<UpcomingEventsResponse>('/api/me/events?status=upcoming'),
        ]);
        setPointsData(pointsRes);
        setUpcomingEvents(eventsRes.upcoming || []);
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Failed to refresh data.';
        setError(message);
      } finally {
        setRefreshing(false);
      }
    };

    refresh();
  }, []);

  // Loading state
  if (loadingState === 'loading' && !refreshing) {
    return <LoadingSpinner fullScreen message="Loading your dashboard..." />;
  }

  // Error state
  if (loadingState === 'error' && !pointsData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState
          message={error || 'Something went wrong'}
          onRetry={() => {
            setLoadingState('loading');
            setError(null);
            fetchData();
          }}
        />
      </SafeAreaView>
    );
  }

  const history = pointsData?.history || [];
  const maxEvents = upcomingEvents.slice(0, 3);
  const showSeeAll = upcomingEvents.length > 3;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.green}
            colors={[colors.accent.green]}
          />
        }
      >
        {/* Header */}
        <Text style={styles.headerTitle}>Volunteering Rewards</Text>

        {/* Points Hero Card */}
        <Card style={styles.pointsHeroCard}>
          <View style={styles.pointsRow}>
            <View style={styles.pointsPill}>
              <Text style={styles.pointsStar}>★</Text>
              <Text style={styles.pointsValue}>
                {pointsData ? formatPoints(pointsData.balance) : '0'} pts
              </Text>
            </View>
          </View>
          <Text style={styles.pointsLabel}>Total Points</Text>
          {pointsData && (
            <View style={styles.pointsBreakdown}>
              <Text style={styles.pointsBreakdownText}>
                Earned: {formatPoints(pointsData.total_earned)} pts
              </Text>
              <Text style={styles.pointsBreakdownDot}>·</Text>
              <Text style={styles.pointsBreakdownText}>
                Redeemed: {formatPoints(pointsData.total_redeemed)} pts
              </Text>
            </View>
          )}
        </Card>

        {/* Upcoming Events Preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Upcoming Events</Text>
          {showSeeAll && (
            <TouchableOpacity onPress={() => router.push('/events/my')}>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          )}
        </View>

        {maxEvents.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No upcoming events"
            message="Browse events to find volunteer opportunities."
            actionLabel="Browse Events"
            onAction={() => router.push('/events')}
          />
        ) : (
          <FlatList
            data={maxEvents}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsHorizontalList}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push(`/events/${item.id}`)}
                style={styles.eventCardWrapper}
              >
                <Card style={styles.eventCard}>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
                  <View style={styles.eventPointsRow}>
                    <Text style={styles.eventPointsValue}>
                      {item.points_awarded} pts
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.quickActionWrapper}
            onPress={() => router.push('/events')}
          >
            <Card style={styles.quickActionCard}>
              <Text style={styles.quickActionIcon}>🗓️</Text>
              <Text style={styles.quickActionTitle}>Browse Events</Text>
              <Text style={styles.quickActionArrow}>›</Text>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.quickActionWrapper}
            onPress={() => router.push('/rewards')}
          >
            <Card style={styles.quickActionCard}>
              <Text style={styles.quickActionIcon}>🎁</Text>
              <Text style={styles.quickActionTitle}>View Rewards</Text>
              <Text style={styles.quickActionArrow}>›</Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>

        {history.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No activity yet"
            message="Your recent point activity will appear here."
          />
        ) : (
          <View style={styles.activityList}>
            {history.slice(0, 10).map((item, index) => (
              <View
                key={`${item.created_at}-${index}`}
                style={[
                  styles.activityItem,
                  index < Math.min(history.length, 10) - 1 && styles.activityItemBorder,
                ]}
              >
                <View style={styles.activityLeft}>
                  <View
                    style={[
                      styles.activityDot,
                      {
                        backgroundColor:
                          item.type === 'earned'
                            ? colors.accent.green
                            : colors.accent.orange,
                      },
                    ]}
                  />
                  <View style={styles.activityTextContainer}>
                    <Text style={styles.activityDescription}>{item.description}</Text>
                    <Text style={styles.activityDate}>
                      {formatDate(item.created_at)}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.activityAmount,
                    {
                      color:
                        item.type === 'earned'
                          ? colors.accent.green
                          : colors.accent.orange,
                    },
                  ]}
                >
                  {item.type === 'earned' ? '+' : '-'}
                  {item.amount} pts
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerTitle: {
    ...typography.largeTitle,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  // Points Hero Card
  pointsHeroCard: {
    marginBottom: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.input,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
  },
  pointsStar: {
    fontSize: 20,
    color: colors.accent.green,
    marginRight: spacing.xs,
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent.green,
    letterSpacing: 0.5,
  },
  pointsLabel: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  pointsBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  pointsBreakdownText: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  pointsBreakdownDot: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginHorizontal: spacing.sm,
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  seeAllLink: {
    ...typography.subhead,
    color: colors.accent.green,
    fontWeight: '600',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  // Upcoming Events
  eventsHorizontalList: {
    paddingRight: spacing.lg,
    marginBottom: spacing.sm,
  },
  eventCardWrapper: {
    width: EVENT_CARD_WIDTH,
    marginRight: spacing.md,
  },
  eventCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  eventDate: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  eventPointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventPointsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.green,
  },
  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  quickActionWrapper: {
    flex: 1,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  quickActionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  quickActionTitle: {
    ...typography.headline,
    color: colors.text.primary,
    flex: 1,
  },
  quickActionArrow: {
    fontSize: 22,
    color: colors.text.tertiary,
    fontWeight: '300',
  },
  // Recent Activity
  activityList: {
    backgroundColor: colors.bg.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  activityAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
