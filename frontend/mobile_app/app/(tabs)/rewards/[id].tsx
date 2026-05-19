import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  RefreshControl,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, borderRadius, typography } from '../../../src/theme';
import Card from '../../../src/components/Card';
import Button from '../../../src/components/Button';
import LoadingSpinner from '../../../src/components/LoadingSpinner';
import ErrorState from '../../../src/components/ErrorState';
import Toast from '../../../src/components/Toast';
import { api, ApiError } from '../../../src/services/api';

type LoadingState = 'idle' | 'loading' | 'error' | 'success';

interface Reward {
  id: number;
  title: string;
  description: string;
  type: 'online' | 'instore';
  points_cost: number;
  value_cents: number;
  image_url?: string;
  quantity_remaining: number;
  valid_until: string;
  merchant_name: string;
}

interface PointsResponse {
  balance: number;
  total_earned: number;
  total_redeemed: number;
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

export default function CouponDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reward, setReward] = useState<Reward | null>(null);
  const [pointsBalance, setPointsBalance] = useState(0);

  // Redeem flow state
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

  // Fetch reward detail and points
  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setLoadingState('loading');
    }
    setError(null);

    try {
      const [rewardRes, pointsRes] = await Promise.all([
        api.get<Reward>(`/api/rewards/${id}`),
        api.get<PointsResponse>('/api/me/points'),
      ]);

      setReward(rewardRes);
      setPointsBalance(pointsRes.balance);
      setLoadingState('success');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load reward details.';
      setError(message);
      if (!isRefresh) {
        setLoadingState('error');
      }
    } finally {
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingState('loading');
      setError(null);

      try {
        const [rewardRes, pointsRes] = await Promise.all([
          api.get<Reward>(`/api/rewards/${id}`),
          api.get<PointsResponse>('/api/me/points'),
        ]);

        if (!cancelled) {
          setReward(rewardRes);
          setPointsBalance(pointsRes.balance);
          setLoadingState('success');
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof ApiError ? err.message : 'Failed to load reward details.';
          setError(message);
          setLoadingState('error');
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  // Redeem flow
  const handleRedeemPress = useCallback(() => {
    setRedeemError(null);
    setShowConfirmModal(true);
  }, []);

  const handleConfirmRedeem = useCallback(async () => {
    if (!reward) return;

    setRedeeming(true);
    setRedeemError(null);

    try {
      const res = await api.post<RedeemResponse>(`/api/rewards/${reward.id}/redeem`);
      setRedeemResult(res);
      setPointsBalance(res.points_remaining);
      // Update reward quantity remaining
      setReward((prev) =>
        prev ? { ...prev, quantity_remaining: prev.quantity_remaining - 1 } : prev,
      );
      setShowConfirmModal(false);
      setShowPinModal(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'insufficient_points') {
          showToast(err.message || 'Insufficient points for this reward', 'error');
        } else if (err.code === 'out_of_stock') {
          showToast(err.message || 'This reward is no longer available', 'error');
        } else {
          setRedeemError(err.message);
        }
      } else {
        setRedeemError('Failed to redeem reward. Please try again.');
      }
    } finally {
      setRedeeming(false);
    }
  }, [reward, showToast]);

  const handleCancelRedeem = useCallback(() => {
    setShowConfirmModal(false);
    setRedeemError(null);
  }, []);

  const handleCopyPin = useCallback(async (pin: string) => {
    try {
      await Clipboard.setStringAsync(pin);
      showToast('PIN copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy PIN', 'error');
    }
  }, [showToast]);

  const handleDismissPinModal = useCallback(() => {
    setShowPinModal(false);
    setRedeemResult(null);
  }, []);

  const isOutOfStock = reward ? reward.quantity_remaining <= 0 : false;
  const isInsufficientPoints = reward ? pointsBalance < reward.points_cost : false;

  // Loading state
  if (loadingState === 'loading' && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingSpinner fullScreen message="Loading reward details..." />
      </SafeAreaView>
    );
  }

  // Error state
  if (loadingState === 'error' && !reward) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState
          message={error || 'Failed to load reward details'}
          onRetry={() => {
            setLoadingState('loading');
            setError(null);
            fetchData();
          }}
        />
      </SafeAreaView>
    );
  }

  if (!reward) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState message="Reward not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: reward.title,
          headerShown: true,
          headerStyle: { backgroundColor: colors.bg.page },
          headerTintColor: colors.text.primary,
        }}
      />

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
        {/* Image Placeholder */}
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderIcon}>🎁</Text>
          <Text style={styles.imagePlaceholderText}>
            {reward.title}
          </Text>
        </View>

        {/* Title & Merchant */}
        <Text style={styles.rewardTitle}>{reward.title}</Text>
        <Text style={styles.rewardMerchant}>{reward.merchant_name}</Text>

        {/* Points Cost Card */}
        <Card style={styles.pointsCostCard}>
          <View style={styles.pointsCostRow}>
            <View style={styles.pointsCostLeft}>
              <Text style={styles.pointsCostLabel}>Points Required</Text>
              <Text style={styles.pointsCostValue}>
                {formatPoints(reward.points_cost)} pts
              </Text>
            </View>
            <View style={styles.pointsCostDivider} />
            <View style={styles.pointsCostRight}>
              <Text style={styles.pointsCostLabel}>Value</Text>
              <Text style={styles.pointsCostAmount}>
                {formatCents(reward.value_cents)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Your Balance */}
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Your balance:</Text>
          <Text
            style={[
              styles.balanceAmount,
              isInsufficientPoints && styles.balanceInsufficient,
            ]}
          >
            {formatPoints(pointsBalance)} pts
            {isInsufficientPoints && ' (insufficient)'}
          </Text>
        </View>

        {/* Description */}
        <Text style={styles.sectionLabel}>Description</Text>
        <Text style={styles.rewardDescription}>
          {reward.description || 'No description available.'}
        </Text>

        {/* Valid Until */}
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          <Text style={styles.infoLabel}>Valid until:</Text>
          <Text style={styles.infoValue}>{formatDate(reward.valid_until)}</Text>
        </View>

        {/* Stock Remaining */}
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📦</Text>
          <Text style={styles.infoLabel}>Stock:</Text>
          <Text
            style={[
              styles.infoValue,
              reward.quantity_remaining < 50 && styles.stockLow,
            ]}
          >
            {reward.quantity_remaining > 0
              ? `${reward.quantity_remaining} left`
              : 'Out of stock'}
          </Text>
        </View>

        {/* Redeem Button */}
        <View style={styles.redeemContainer}>
          <Button
            title={isOutOfStock ? 'Out of Stock' : 'Redeem Now'}
            onPress={handleRedeemPress}
            variant="primary"
            disabled={isOutOfStock || isInsufficientPoints}
            style={styles.redeemNowButton}
          />
          {isOutOfStock && (
            <Text style={styles.disabledHint}>This reward is no longer available.</Text>
          )}
          {isInsufficientPoints && !isOutOfStock && (
            <Text style={styles.disabledHint}>
              You need {formatPoints(reward.points_cost - pointsBalance)} more points to redeem this reward.
            </Text>
          )}
        </View>

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Confirm Redeem Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelRedeem}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Redemption</Text>

            <Text style={styles.modalRewardTitle}>{reward.title}</Text>
            <Text style={styles.modalMerchantName}>{reward.merchant_name}</Text>

            <View style={styles.modalPointsRow}>
              <Text style={styles.modalPointsCost}>
                {formatPoints(reward.points_cost)} pts
              </Text>
              <Text style={styles.modalPointsValue}>
                ({formatCents(reward.value_cents)})
              </Text>
            </View>

            <Text style={styles.modalBalanceText}>
              Your balance: {formatPoints(pointsBalance)} pts
            </Text>

            {isInsufficientPoints && (
              <Text style={styles.modalInsufficientText}>
                Insufficient points!
              </Text>
            )}

            {redeemError && (
              <Text style={styles.redeemErrorText}>{redeemError}</Text>
            )}

            <Text style={styles.modalBodyText}>
              Redeem {formatPoints(reward.points_cost)} pts for this reward?
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
                disabled={isInsufficientPoints || isOutOfStock}
                style={styles.modalActionButton}
              />
            </View>
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
                    title="Done"
                    onPress={handleDismissPinModal}
                    variant="primary"
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  // Image Placeholder
  imagePlaceholder: {
    height: 200,
    backgroundColor: colors.bg.subtle,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  imagePlaceholderIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  imagePlaceholderText: {
    ...typography.headline,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  // Title & Merchant
  rewardTitle: {
    ...typography.title2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  rewardMerchant: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  // Points Cost Card
  pointsCostCard: {
    marginBottom: spacing.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  pointsCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsCostLeft: {
    flex: 1,
    alignItems: 'center',
  },
  pointsCostLabel: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  pointsCostValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent.orange,
    letterSpacing: 0.5,
  },
  pointsCostDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.xl,
  },
  pointsCostRight: {
    flex: 1,
    alignItems: 'center',
  },
  pointsCostAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  // Balance Row
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  balanceLabel: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  balanceAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent.green,
  },
  balanceInsufficient: {
    color: colors.accent.red,
  },
  // Description
  sectionLabel: {
    ...typography.headline,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  rewardDescription: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  // Info Rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.text.secondary,
    marginRight: spacing.sm,
    width: 80,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
    flex: 1,
  },
  stockLow: {
    color: colors.accent.red,
    fontWeight: '600',
  },
  // Redeem Button
  redeemContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  redeemNowButton: {
    width: '100%',
  },
  disabledHint: {
    ...typography.footnote,
    color: colors.accent.red,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  // Modal (shared with rewards.tsx style patterns)
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
  bottomSpacer: {
    height: spacing.xxl,
  },
});
