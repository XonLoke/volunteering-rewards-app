import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface BadgeProps {
  label: string;
  variant?: 'approved' | 'pending' | 'rejected' | 'default';
}

const variantStyles = {
  approved: {
    backgroundColor: '#E8F8E8',
    color: colors.status.approved,
  },
  pending: {
    backgroundColor: '#FFF3E0',
    color: colors.status.pending,
  },
  rejected: {
    backgroundColor: '#FFEBEE',
    color: colors.status.rejected,
  },
  default: {
    backgroundColor: colors.bg.subtle,
    color: colors.status.default,
  },
} as const;

export default function Badge({ label, variant = 'default' }: BadgeProps) {
  const variantStyle = variantStyles[variant];

  return (
    <View style={[styles.badge, { backgroundColor: variantStyle.backgroundColor }]}>
      <Text style={[styles.label, { color: variantStyle.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.caption2,
    fontSize: 12,
    fontWeight: '500',
  },
});
