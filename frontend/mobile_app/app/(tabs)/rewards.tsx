import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, borderRadius, typography } from '../../src/theme';
import Card from '../../src/components/Card';
import Badge from '../../src/components/Badge';
import Button from '../../src/components/Button';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import EmptyState from '../../src/components/EmptyState';
import ErrorState from '../../src/components/ErrorState';
import Toast from '../../src/components/Toast';
import { api, ApiError } from '../../src/services/api';

type LoadingState = 'idle' | 'loading' | 'error' | 'success';

type TabMode = 'available' | 'coupons';

type RewardType = 'online' | 'instore';

type CouponStatus = 'active' | 'used' | 'expired';

interface Reward {
  id: number;
  title: string;
  description: string;
  type: RewardType;
  points_cost: number;
  value_cents: number;
  image_url?: string;
  quantity_remaining: number;
  valid_until: string;
  merchant_name: string;
}

interface RewardsResponse {
  data: Reward[];
}

interface Coupon {
  id: number;
  title: string;
  pin_code: string;
  points_cost: number;
  value_cents: number;
  status: CouponStatus;
  valid_until: string;
  redeemed_at?: string;
  merchant_name: string;
}

interface CouponsResponse {
  data: Coupon[];
}

interface PointsResponse {
  balance: number;
  total_earned: number;
  total_redeemed: number;
  history: { type: string; amount: number; description: string; created_at: string }[];
}

interface RedeemResponse {
  coupon: {
    id: number;
    title: string;
    pin_code: string;
    value_cents: number;
    points_cost: number;
    valid_until: string;
    redeemed_at: string;
  };
  points_remaining: number;
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

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatPoints(amount: number): string {
  return amount.toLocaleString();
}

export default function RewardsScreen() {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabMode>('available');

  // Available rewards state
  const [rewardsLoading, setRewardsLoading] = useState<LoadingState>('loading');
  const [rewardsRefreshing, setRewardsRefreshing] = useState(false);
  const [rewardsError, setRewardsError] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardType, setRewardType] = useState<RewardType>('online');

  // My Coupons state
  const [couponsLoading, setCouponsLoading] = useState<LoadingState>('loading');
  const [couponsRefreshing, setCouponsRefreshing] = useState(false);
  const [couponsError, setCouponsError] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponStatus, setCouponStatus] = useState<CouponStatus>('active');

  // Points data (needed for redeem flow)
  const [pointsBalance, setPointsBalance] = useState(0);
  const [pointsLoading, setPointsLoading] = useState(false);

  // Redeem flow state
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemResult, setRedeemResult] = useState<RedeemResponse | null>(null);

  // Toast state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  }, []);

  const dismissToast = useCallback(() => {
    setToast({ visible: false, message: '', type: 'info' });
  }, []);

  // Fetch points balance
  const fetchPoints = useCallback(async () => {
    try {
      setPointsLoading(true);
      const res = await api.get<PointsResponse>('/api/me/points');
      setPointsBalance(res.balance);
    } catch {
      // Non-critical, use last known balance
    } finally {
      setPointsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  // Fetch rewards
  const fetchRewards = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setRewardsLoading('loading');
    }
    setRewardsError(null);

    try {
      const res = await api.get<RewardsResponse>(`/api/rewards?type=${rewardType}`);
      setRewards(res.data || []);
      setRewardsLoading('success');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load rewards.';
      setRewardsError(message);
      if (!isRefresh) {
        setRewardsLoading('error');
      }
    } finally {
      setRewardsRefreshing(false);
    }
  }, [rewardType]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setRewardsLoading('loading');
      setRewardsError(null);

      try {
        const res = await api.get<RewardsResponse>(`/api/rewards?type=${rewardType}`);
        if (!cancelled) {
          setRewards(res.data || []);
          setRewardsLoading('success');
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof ApiError ? err.message : 'Failed to load rewards.';
          setRewardsError(message);
          setRewardsLoading('error');
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [rewardType]);

  // Fetch coupons
  const fetchCoupons = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setCouponsLoading('loading');
    }
    setCouponsError(null);

    try {
      const res = await api.get<CouponsResponse>(`/api/me/coupons?status=${couponStatus}`);
      setCoupons(res.data || []);
      setCouponsLoading('success');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load coupons.';
      setCouponsError(message);
      if (!isRefresh) {
        setCouponsLoading('error');
      }
    } finally {
      setCouponsRefreshing(false);
    }
  }, [couponStatus]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setCouponsLoading('loading');
      setCouponsError(null);

      try {
        const res = await api.get<CouponsResponse>(`/api/me/coupons?status=${couponStatus}`);
        if (!cancelled) {
          setCoupons(res.data || []);
          setCouponsLoading('success');
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof ApiError ? err.message : 'Failed to load coupons.';
          setCouponsError(message);
          setCouponsLoading('error');
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [couponStatus]);

  // Refresh handlers
  const onRewardsRefresh = useCallback(() => {
    setRewardsRefreshing(true);
    fetchRewards(true);
  }, [fetchRewards]);

  const onCouponsRefresh = useCallback(() => {
    setCouponsRefreshing(true);
    fetchCoupons(true);
  }, [fetchCoupons]);

  // Redeem flow
  const handleRedeemPress = useCallback((reward: Reward) => {
    setSelectedReward(reward);
    setRedeemError(null);
    setShowConfirmModal(true);
  }, []);

  const handleConfirmRedeem = useCallback(async () => {
    if (!selectedReward) return;

    setRedeeming(true);
    setRedeemError(null);

    try {
      const res = await api.post<RedeemResponse>(`/api/rewards/${selectedReward.id}/redeem`);
      setRedeemResult(res);
      setPointsBalance(res.points_remaining);
      setShowConfirmModal(false);
      setShowPinModal(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'insufficient_points') {
          showToast(err.message || 'Insufficient points', 'error');
        } else if (err.code === 'out_of_stock') {
          showToast(err.message || 'This reward is out of stock', 'error');
        } else {
          setRedeemError(err.message);
        }
      } else {
        setRedeemError('Failed to redeem reward. Please try again.');
      }
    } finally {
      setRedeeming(false);
    }
  }, [selectedReward, showToast]);

  const handleCopyPin = useCallback(async (pin: string) => {
    try {
      await Clipboard.setStringAsync(pin);
      showToast('PIN copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy PIN', 'error');
    }
  }, [showToast]);

  const handleViewMyCoupons = useCallback(() => {
    setShowPinModal(false);
    setSelectedReward(null);
    setRedeemResult(null);
    setActiveTab('coupons');
    setCouponStatus('active');
  }, []);

  const handleDismissPinModal = useCallback(() => {
    setShowPinModal(false);
    setSelectedReward(null);
    setRedeemResult(null);
    // Refresh rewards to update quantity
    fetchRewards(true);
    // Refresh coupons
    fetchCoupons(true);
  }, [fetchRewards, fetchCoupons]);

  const handleCancelRedeem = useCallback(() => {
    setShowConfirmModal(false);
    setSelectedReward(null);
    setRedeemError(null);
  }, []);

  // Tab status badge mapping
  const getCouponBadgeVariant = useCallback((status: CouponStatus): 'approved' | 'pending' | 'rejected' | 'default' => {
    switch (status) {
      case 'active': return 'approved';
      case 'used': return 'rejected';
      case 'expired': return 'rejected';
      default: return 'default';
    }
  }, []);

  const getCouponBadgeLabel = useCallback((status: CouponStatus): string => {
    switch (status) {
      case 'active': return 'Active';
      case 'used': return 'Used';
      case 'expired': return 'Expired';
      default: return status;
    }
  }, []);

  // Filter chip definitions
  const rewardTypeChips: { label: string; value: RewardType }[] = [
    { label: 'Online', value: 'online' },
    { label: 'In-Store', value: 'instore' },
  ];

  const couponStatusChips: { label: string; value: CouponStatus }[] = [
    { label: 'Active', value: 'active' },
    { label: 'Used', value: 'used' },
    { label: 'Expired', value: 'expired' },
  ];

  // Render reward card
  const renderRewardItem = useCallback(
    ({ item }: { item: Reward }) => {
      const isLowStock = item.quantity_remaining < 50;

      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push(`/rewards/${item.id}`)}
          style={styles.rewardCardContainer}
        >
          <Card style={styles.rewardCard}>
            <View style={styles.rewardBorderStrip} />
            <View style={styles.rewardCardContent}>
              <Text style={styles.rewardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.rewardMerchant} numberOfLines={1}>
                {item.merchant_name}
              </Text>
              <View style={styles.rewardInfoRow}>
                <Text style={styles.rewardPoints}>{formatPoints(item.points_cost)} pts</Text>
                <Text style={styles.rewardValue}>{formatCents(item.value_cents)}</Text>
              </View>
              <View style={styles.rewardBottomRow}>
                <Text
                  style={[
                    styles.rewardQuantity,
                    isLowStock && styles.rewardQuantityLow,
                  ]}
                >
                  {item.quantity_remaining > 0
                    ? `${item.quantity_remaining} left`
                    : 'Out of stock'}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.redeemButton,
                    item.quantity_remaining <= 0 && styles.redeemButtonDisabled,
                  ]}
                  activeOpacity={0.7}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    if (item.quantity_remaining > 0) {
                      handleRedeemPress(item);
                    }
                  }}
                  disabled={item.quantity_remaining <= 0}
                >
                  <Text
                    style={[
                      styles.redeemButtonText,
                      item.quantity_remaining <= 0 && styles.redeemButtonTextDisabled,
                    ]}
                  >
                    Redeem
                  </Text>
                </TouchableOpacity>
              </View>
              {item.valid_until && (
                <Text style={styles.rewardValidUntil}>
                  Valid until {formatDate(item.valid_until)}
                </Text>
              )}
            </View>
          </Card>
        </TouchableOpacity>
      );
    },
    [router, handleRedeemPress],
  );

  // Render coupon card
  const renderCouponItem = useCallback(
    ({ item }: { item: Coupon }) => {
      const isExpired = item.status === 'expired';
      const isActive = item.status === 'active';

      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push(`/rewards/${item.id}`)}
          style={styles.couponCardContainer}
        >
          <Card style={styles.couponCard}>
            <View style={styles.couponCardHeader}>
              <Badge label={getCouponBadgeLabel(item.status)} variant={getCouponBadgeVariant(item.status)} />
            </View>
            <Text style={styles.couponTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.couponMerchant} numberOfLines={1}>
              {item.merchant_name}
            </Text>

            {/* PIN code display */}
            {isActive ? (
              <View style={styles.pinContainer}>
                <Text style={styles.pinLabel}>PIN:</Text>
                <Text style={styles.pinCode}>{item.pin_code}</Text>
              </View>
            ) : (
              <View style={styles.pinContainer}>
                <Text style={styles.pinLabel}>PIN:</Text>
                <Text style={styles.pinCodeMasked}>••••••</Text>
              </View>
            )}

            <View style={styles.couponInfoRow}>
              <Text
                style={[
                  styles.couponValidUntil,
                  isExpired && styles.couponValidUntilExpired,
                ]}
              >
                {isExpired
                  ? `Expired ${formatDate(item.valid_until)}`
                  : `Valid until ${formatDate(item.valid_until)}`}
              </Text>
              <Text style={styles.couponPointsCost}>{formatPoints(item.points_cost)} pts</Text>
            </View>
          </Card>
        </TouchableOpacity>
      );
    },
    [router, getCouponBadgeLabel, getCouponBadgeVariant],
  );

  const rewardKeyExtractor = useCallback((item: Reward) => String(item.id), []);
  const couponKeyExtractor = useCallback((item: Coupon) => String(item.id), []);

  // Render Available tab content
  const renderAvailableTab = () => {
    if (rewardsLoading === 'loading' && rewards.length === 0) {
      return <LoadingSpinner fullScreen message="Loading rewards..." />;
    }

    if (rewardsLoading === 'error' && rewards.length === 0) {
      return (
        <ErrorState
          message={rewardsError || 'Failed to load rewards'}
          onRetry={() => {
            setRewardsLoading('loading');
            setRewardsError(null);
            fetchRewards();
          }}
        />
      );
    }

    return (
      <FlatList
        data={rewards}
        keyExtractor={rewardKeyExtractor}
        renderItem={renderRewardItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={rewardsRefreshing}
            onRefresh={onRewardsRefresh}
            tintColor={colors.accent.green}
            colors={[colors.accent.green]}
          />
        }
        ListEmptyComponent={
          rewardsLoading === 'success' ? (
            <EmptyState
              icon="🎁"
              title="No rewards available"
              message="Check back later for new rewards!"
            />
          ) : null
        }
        ListFooterComponent={<View style={styles.bottomSpacer} />}
      />
    );
  };

  // Render My Coupons tab content
  const renderCouponsTab = () => {
    if (couponsLoading === 'loading' && coupons.length === 0) {
      return <LoadingSpinner fullScreen message="Loading coupons..." />;
    }

    if (couponsLoading === 'error' && coupons.length === 0) {
      return (
        <ErrorState
          message={couponsError || 'Failed to load coupons'}
          onRetry={() => {
            setCouponsLoading('loading');
            setCouponsError(null);
            fetchCoupons();
          }}
        />
      );
    }

    return (
      <FlatList
        data={coupons}
        keyExtractor={couponKeyExtractor}
        renderItem={renderCouponItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={couponsRefreshing}
            onRefresh={onCouponsRefresh}
            tintColor={colors.accent.green}
            colors={[colors.accent.green]}
          />
        }
        ListEmptyComponent={
          couponsLoading === 'success' ? (
            <EmptyState
              icon="🎫"
              title="No coupons yet"
              message={
                couponStatus === 'active'
                  ? 'Redeem rewards to see your active coupons here.'
                  : `No ${couponStatus} coupons found.`
              }
              actionLabel={couponStatus === 'active' ? 'Browse Rewards' : undefined}
              onAction={
                couponStatus === 'active'
                  ? () => setActiveTab('available')
                  : undefined
              }
            />
          ) : null
        }
        ListFooterComponent={<View style={styles.bottomSpacer} />}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Screen Title */}
        <Text style={styles.screenTitle}>Rewards</Text>

        {/* Segmented Control */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentTab,
              activeTab === 'available' && styles.segmentTabActive,
            ]}
            activeOpacity={0.7}
            onPress={() => setActiveTab('available')}
          >
            <Text
              style={[
                styles.segmentTabText,
                activeTab === 'available' && styles.segmentTabTextActive,
              ]}
            >
              Available
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentTab,
              activeTab === 'coupons' && styles.segmentTabActive,
            ]}
            activeOpacity={0.7}
            onPress={() => setActiveTab('coupons')}
          >
            <Text
              style={[
                styles.segmentTabText,
                activeTab === 'coupons' && styles.segmentTabTextActive,
              ]}
            >
              My Coupons
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View style={styles.chipsContainer}>
          {activeTab === 'available'
            ? rewardTypeChips.map((chip) => (
                <TouchableOpacity
                  key={chip.value}
                  style={[
                    styles.chip,
                    rewardType === chip.value ? styles.chipActive : styles.chipInactive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setRewardType(chip.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      rewardType === chip.value ? styles.chipTextActive : styles.chipTextInactive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))
            : couponStatusChips.map((chip) => (
                <TouchableOpacity
                  key={chip.value}
                  style={[
                    styles.chip,
                    couponStatus === chip.value ? styles.chipActive : styles.chipInactive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setCouponStatus(chip.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      couponStatus === chip.value ? styles.chipTextActive : styles.chipTextInactive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
        </View>

        {/* Tab Content */}
        <View style={styles.contentArea}>
          {activeTab === 'available' ? renderAvailableTab() : renderCouponsTab()}
        </View>
      </View>

      {/* Confirm Redeem Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelRedeem}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReward && (
              <>
                <Text style={styles.modalTitle}>Confirm Redemption</Text>
                <Text style={styles.modalRewardTitle}>{selectedReward.title}</Text>
                <Text style={styles.modalMerchantName}>{selectedReward.merchant_name}</Text>

                <View style={styles.modalPointsRow}>
                  <Text style={styles.modalPointsCost}>
                    {formatPoints(selectedReward.points_cost)} pts
                  </Text>
                  <Text style={styles.modalPointsValue}>
                    ({formatCents(selectedReward.value_cents)})
                  </Text>
                </View>

                <Text style={styles.modalBalanceText}>
                  Your balance: {formatPoints(pointsBalance)} pts
                </Text>

                {pointsBalance < selectedReward.points_cost && (
                  <Text style={styles.modalInsufficientText}>
                    Insufficient points!
                  </Text>
                )}

                {redeemError && (
                  <Text style={styles.redeemErrorText}>{redeemError}</Text>
                )}

                <Text style={styles.modalBodyText}>
                  Redeem {formatPoints(selectedReward.points_cost)} pts for this reward?
                </Text>

                <View style={styles.modalActions}>
                  <Button
                    title="Cancel"
                    onPress={handleCancelRedeem}
                    variant="tertiary"
                    style={styles.modalActionButton}
                  />
                  <Button
                    title="Confirm"
                    onPress={handleConfirmRedeem}
                    variant="primary"
                    loading={redeeming}
                    disabled={pointsBalance < selectedReward.points_cost}
                    style={styles.modalActionButton}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* PIN Display Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        onRequestClose={handleDismissPinModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {redeemResult && (
              <>
                <View style={styles.pinSuccessIcon}>
                  <Text style={styles.pinSuccessIconText}>✓</Text>
                </View>

                <Text style={styles.pinSuccessTitle}>Redemption Successful!</Text>

                <Text style={styles.pinRewardTitle}>{redeemResult.coupon.title}</Text>

                <View style={styles.pinDisplayContainer}>
                  <Text style={styles.pinDisplayCode}>{redeemResult.coupon.pin_code}</Text>
                </View>

                <Text style={styles.pinInstruction}>
                  Show this PIN to the cashier
                </Text>

                <View style={styles.pinDetailsContainer}>
                  <Text style={styles.pinDetailText}>
                    Value: {formatCents(redeemResult.coupon.value_cents)}
                  </Text>
                  <Text style={styles.pinDetailText}>
                    Valid until: {formatDate(redeemResult.coupon.valid_until)}
                  </Text>
                  <Text style={styles.pinDetailText}>
                    Points remaining: {formatPoints(redeemResult.points_remaining)} pts
                  </Text>
                </View>

                <View style={styles.pinActions}>
                  <Button
                    title="Copy PIN"
                    onPress={() => handleCopyPin(redeemResult.coupon.pin_code)}
                    variant="secondary"
                    style={styles.pinActionButton}
                  />
                  <Button
                    title="View My Coupons"
                    onPress={handleViewMyCoupons}
                    variant="primary"
                    style={styles.pinActionButton}
                  />
                  <Button
                    title="Done"
                    onPress={handleDismissPinModal}
                    variant="tertiary"
                    style={styles.pinActionButton}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={dismissToast}
      />
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
  screenTitle: {
    ...typography.largeTitle,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.bg.input,
    borderRadius: 10,
    padding: 3,
    marginBottom: spacing.md,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTabActive: {
    backgroundColor: colors.bg.page,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  segmentTabText: {
    ...typography.subhead,
    fontWeight: '500',
    color: colors.text.tertiary,
  },
  segmentTabTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  // Filter Chips
  chipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
  },
  chipActive: {
    backgroundColor: colors.accent.orange,
  },
  chipInactive: {
    backgroundColor: colors.bg.subtle,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.text.inverse,
  },
  chipTextInactive: {
    color: colors.text.secondary,
  },
  // Content Area
  contentArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
  // Reward Card
  rewardCardContainer: {
    marginBottom: spacing.md,
  },
  rewardCard: {
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden',
  },
  rewardBorderStrip: {
    width: 4,
    backgroundColor: colors.accent.orange,
  },
  rewardCardContent: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rewardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  rewardMerchant: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  rewardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  rewardPoints: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accent.orange,
  },
  rewardValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  rewardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  rewardQuantity: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  rewardQuantityLow: {
    color: colors.accent.red,
    fontWeight: '600',
  },
  redeemButton: {
    backgroundColor: colors.accent.green,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
  },
  redeemButtonDisabled: {
    opacity: 0.5,
  },
  redeemButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  redeemButtonTextDisabled: {
    color: colors.text.inverse,
  },
  rewardValidUntil: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  // Coupon Card
  couponCardContainer: {
    marginBottom: spacing.md,
  },
  couponCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  couponCardHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  couponTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  couponMerchant: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  pinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.subtle,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  pinLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  pinCode: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 2,
  },
  pinCodeMasked: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.tertiary,
    letterSpacing: 2,
  },
  couponInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponValidUntil: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  couponValidUntilExpired: {
    color: colors.accent.red,
    fontWeight: '500',
  },
  couponPointsCost: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.bg.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.title3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  modalRewardTitle: {
    ...typography.headline,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  modalMerchantName: {
    ...typography.subhead,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  modalPointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modalPointsCost: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent.orange,
  },
  modalPointsValue: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  modalBalanceText: {
    ...typography.subhead,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  modalInsufficientText: {
    ...typography.subhead,
    color: colors.accent.red,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  modalBodyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalActionButton: {
    flex: 1,
  },
  redeemErrorText: {
    ...typography.subhead,
    color: colors.accent.red,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  // PIN Display
  pinSuccessIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pinSuccessIconText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent.green,
  },
  pinSuccessTitle: {
    ...typography.title2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  pinRewardTitle: {
    ...typography.subhead,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  pinDisplayContainer: {
    backgroundColor: colors.bg.subtle,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  pinDisplayCode: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 4,
    textAlign: 'center',
  },
  pinInstruction: {
    ...typography.subhead,
    color: colors.text.tertiary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  pinDetailsContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  pinDetailText: {
    ...typography.footnote,
    color: colors.text.tertiary,
  },
  pinActions: {
    width: '100%',
    gap: spacing.sm,
  },
  pinActionButton: {
    width: '100%',
  },
});
