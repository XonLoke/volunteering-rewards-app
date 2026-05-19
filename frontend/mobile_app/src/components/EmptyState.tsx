import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';
import Button from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon ? (
        <Text style={styles.icon}>{icon}</Text>
      ) : (
        <Text style={styles.fallbackIcon}>📭</Text>
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <View style={styles.actionContainer}>
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="secondary"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  fallbackIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.subhead,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: spacing.xl,
  },
});
