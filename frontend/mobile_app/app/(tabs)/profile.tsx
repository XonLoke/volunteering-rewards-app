import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../src/theme';
import Card from '../../src/components/Card';
import Badge from '../../src/components/Badge';
import Button from '../../src/components/Button';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import ErrorState from '../../src/components/ErrorState';
import { api, ApiError, setAuthToken } from '../../src/services/api';

type LoadingState = 'idle' | 'loading' | 'error' | 'success';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

interface PointsResponse {
  balance: number;
  total_earned: number;
  total_redeemed: number;
  history: {
    type: 'earned' | 'redeemed';
    amount: number;
    description: string;
    created_at: string;
  }[];
}

interface QRCodeResponse {
  qr_data: string;
  volunteer_id: string;
  volunteer_name: string;
  expires_at: string;
}

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

interface HistoryItem {
  type: 'earned' | 'redeemed';
  amount: number;
  description: string;
  created_at: string;
}

function PointsHistorySection({ history }: { history: HistoryItem[] }) {
  const [expanded, setExpanded] = useState(false);

  if (history.length === 0) {
    return (
      <View style={styles.historyEmptyContainer}>
        <Text style={styles.historyEmptyText}>No point history yet.</Text>
      </View>
    );
  }

  const displayHistory = expanded ? history : history.slice(0, 5);

  return (
    <View>
      {displayHistory.map((item, index) => (
        <View
          key={`${item.created_at}-${index}`}
          style={[
            styles.historyItem,
            index < displayHistory.length - 1 && styles.historyItemBorder,
          ]}
        >
          <View style={styles.historyLeft}>
            <View
              style={[
                styles.historyDot,
                {
                  backgroundColor:
                    item.type === 'earned'
                      ? colors.accent.green
                      : colors.accent.orange,
                },
              ]}
            />
            <View style={styles.historyTextContainer}>
              <Text style={styles.historyDescription}>{item.description}</Text>
              <Text style={styles.historyDate}>{formatDate(item.created_at)}</Text>
            </View>
          </View>
          <Text
            style={[
              styles.historyAmount,
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
      {history.length > 5 && (
        <TouchableOpacity
          style={styles.showMoreButton}
          activeOpacity={0.7}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.showMoreText}>
            {expanded ? 'Show Less' : `Show All (${history.length} entries)`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();

  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pointsData, setPointsData] = useState<PointsResponse | null>(null);
  const [qrCode, setQrCode] = useState<QRCodeResponse | null>(null);

  const [qrRefreshing, setQrRefreshing] = useState(false);
  const [pointsExpanded, setPointsExpanded] = useState(false);

  // Fetch all profile data
  const fetchAllData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setLoadingState('loading');
    }
    setError(null);

    try {
      const [profileRes, pointsRes, qrRes] = await Promise.all([
        api.get<UserProfile>('/api/auth/me'),
        api.get<PointsResponse>('/api/me/points'),
        api.get<QRCodeResponse>('/api/me/qr-code'),
      ]);

      setProfile(profileRes);
      setPointsData(pointsRes);
      setQrCode(qrRes);
      setLoadingState('success');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load profile.';
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
        const [profileRes, pointsRes, qrRes] = await Promise.all([
          api.get<UserProfile>('/api/auth/me'),
          api.get<PointsResponse>('/api/me/points'),
          api.get<QRCodeResponse>('/api/me/qr-code'),
        ]);

        if (!cancelled) {
          setProfile(profileRes);
          setPointsData(pointsRes);
          setQrCode(qrRes);
          setLoadingState('success');
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof ApiError ? err.message : 'Failed to load profile.';
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
    const refresh = async () => {
      try {
        const [profileRes, pointsRes, qrRes] = await Promise.all([
          api.get<UserProfile>('/api/auth/me'),
          api.get<PointsResponse>('/api/me/points'),
          api.get<QRCodeResponse>('/api/me/qr-code'),
        ]);
        setProfile(profileRes);
        setPointsData(pointsRes);
        setQrCode(qrRes);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Failed to refresh.';
        setError(message);
      } finally {
        setRefreshing(false);
      }
    };
    refresh();
  }, []);

  // Refresh QR code
  const handleRefreshQR = useCallback(async () => {
    setQrRefreshing(true);
    try {
      const res = await api.get<QRCodeResponse>('/api/me/qr-code');
      setQrCode(res);
    } catch {
      // Keep existing QR code on error
    } finally {
      setQrRefreshing(false);
    }
  }, []);

  // Logout handler
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear auth token (via the api service's internal state)
              setAuthToken(null);
              // Navigate to login
              router.replace('/(auth)/login');
            } catch {
              router.replace('/(auth)/login');
            }
          },
        },
      ],
    );
  }, [router]);

  // Get user initial for avatar
  const getInitial = useCallback((): string => {
    if (!profile?.name) return '?';
    return profile.name.charAt(0).toUpperCase();
  }, [profile]);

  // Role badge label
  const getRoleLabel = useCallback((role: string): string => {
    switch (role?.toLowerCase()) {
      case 'volunteer':
        return 'Volunteer';
      case 'admin':
        return 'Admin';
      case 'organizer':
        return 'Organizer';
      default:
        return role || 'Volunteer';
    }
  }, []);

  // Get role badge variant
  const getRoleBadgeVariant = useCallback((role: string): 'approved' | 'pending' | 'rejected' | 'default' => {
    switch (role?.toLowerCase()) {
      case 'volunteer':
        return 'approved';
      case 'admin':
      case 'organizer':
        return 'pending';
      default:
        return 'default';
    }
  }, []);

  // Loading state
  if (loadingState === 'loading' && !refreshing) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  // Error state
  if (loadingState === 'error' && !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState
          message={error || 'Failed to load profile'}
          onRetry={() => {
            setLoadingState('loading');
            setError(null);
            fetchAllData();
          }}
        />
      </SafeAreaView>
    );
  }

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
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitial()}</Text>
          </View>
          <Text style={styles.profileName}>{profile?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
          {profile?.role && (
            <View style={styles.roleBadgeContainer}>
              <Badge
                label={getRoleLabel(profile.role)}
                variant={getRoleBadgeVariant(profile.role)}
              />
            </View>
          )}
        </View>

        {/* Points Card */}
        <Card style={styles.pointsCard}>
          <View style={styles.pointsHeaderRow}>
            <Text style={styles.pointsStar}>★</Text>
            <Text style={styles.pointsLabel}>Total Points</Text>
          </View>
          {pointsData ? (
            <>
              <Text style={styles.pointsAmount}>
                {formatPoints(pointsData.balance)} pts
              </Text>
              <View style={styles.pointsBreakdown}>
                <Text style={styles.pointsBreakdownText}>
                  Earned: {formatPoints(pointsData.total_earned)}
                </Text>
                <Text style={styles.pointsBreakdownDot}>|</Text>
                <Text style={styles.pointsBreakdownText}>
                  Redeemed: {formatPoints(pointsData.total_redeemed)}
                </Text>
              </View>
              {/* Points History Quick View */}
              {pointsData.history && pointsData.history.length > 0 && (
                <TouchableOpacity
                  style={styles.pointsHistoryToggle}
                  activeOpacity={0.7}
                  onPress={() => setPointsExpanded(!pointsExpanded)}
                >
                  <Text style={styles.pointsHistoryToggleText}>
                    {pointsExpanded ? 'Hide History' : 'View Points History'}
                  </Text>
                  <Text style={styles.pointsHistoryToggleArrow}>
                    {pointsExpanded ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
              )}
              {pointsExpanded && (
                <View style={styles.pointsHistoryContainer}>
                  <PointsHistorySection history={pointsData.history} />
                </View>
              )}
            </>
          ) : (
            <Text style={styles.pointsAmount}>-- pts</Text>
          )}
        </Card>

        {/* QR Code Section */}
        <Card style={styles.qrCard}>
          <View style={styles.qrHeaderRow}>
            <Text style={styles.qrTitle}>My QR Code</Text>
            <TouchableOpacity
              style={styles.qrRefreshButton}
              activeOpacity={0.7}
              onPress={handleRefreshQR}
              disabled={qrRefreshing}
            >
              <Text style={[styles.qrRefreshText, qrRefreshing && styles.qrRefreshDisabled]}>
                {qrRefreshing ? '...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* QR Code Placeholder */}
          <View style={styles.qrPlaceholder}>
            <View style={styles.qrCodeBox}>
              <Text style={styles.qrCodePlaceholderText}>QR</Text>
              <Text style={styles.qrCodePlaceholderSubtext}>code</Text>
            </View>
          </View>

          {qrCode && (
            <Text style={styles.qrVolunteerName}>{qrCode.volunteer_name}</Text>
          )}

          <Text style={styles.qrInstruction}>
            Show this to the organizer to check in
          </Text>

          {qrCode && qrCode.expires_at && (
            <Text style={styles.qrExpiry}>
              Expires: {formatDate(qrCode.expires_at)}
            </Text>
          )}
        </Card>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/events/my')}
        >
          <Card style={styles.actionRow}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>My Events</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            // Navigate to rewards and switch to My Coupons tab.
            // We use a query param that rewards.tsx can read
            router.push('/rewards');
          }}
        >
          <Card style={styles.actionRow}>
            <Text style={styles.actionIcon}>🎫</Text>
            <Text style={styles.actionText}>My Coupons</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPointsExpanded(!pointsExpanded)}
        >
          <Card style={styles.actionRow}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Points History</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Card>
        </TouchableOpacity>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="tertiary"
            style={styles.logoutButton}
          />
        </View>

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
  // Profile Header
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.bg.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  profileName: {
    ...typography.title1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  roleBadgeContainer: {
    alignSelf: 'center',
  },
  // Points Card
  pointsCard: {
    marginBottom: spacing.xl,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  pointsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  pointsStar: {
    fontSize: 20,
    color: colors.accent.green,
    marginRight: spacing.xs,
  },
  pointsLabel: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  pointsAmount: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.accent.green,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  pointsBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
  pointsHistoryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  pointsHistoryToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent.blue,
    marginRight: spacing.xs,
  },
  pointsHistoryToggleArrow: {
    fontSize: 10,
    color: colors.accent.blue,
  },
  pointsHistoryContainer: {
    width: '100%',
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.md,
  },
  // Points History
  historyEmptyContainer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  historyEmptyText: {
    ...typography.subhead,
    color: colors.text.tertiary,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  historyTextContainer: {
    flex: 1,
  },
  historyDescription: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  showMoreButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent.blue,
  },
  // QR Code Section
  qrCard: {
    marginBottom: spacing.xl,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  qrHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  qrTitle: {
    ...typography.headline,
    color: colors.text.primary,
  },
  qrRefreshButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  qrRefreshText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent.blue,
  },
  qrRefreshDisabled: {
    opacity: 0.5,
  },
  qrPlaceholder: {
    marginBottom: spacing.md,
  },
  qrCodeBox: {
    width: 160,
    height: 160,
    backgroundColor: colors.bg.input,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  qrCodePlaceholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.tertiary,
  },
  qrCodePlaceholderSubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  qrVolunteerName: {
    ...typography.headline,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  qrInstruction: {
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  qrExpiry: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  // Quick Actions
  sectionTitle: {
    ...typography.title3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  actionIcon: {
    fontSize: 22,
    marginRight: spacing.md,
  },
  actionText: {
    ...typography.headline,
    color: colors.text.primary,
    flex: 1,
  },
  actionArrow: {
    fontSize: 22,
    color: colors.text.tertiary,
    fontWeight: '300',
  },
  // Logout
  logoutContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
