import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';
import Button from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = 'Something went wrong',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>!</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <View style={styles.buttonContainer}>
          <Button title="Try Again" onPress={onRetry} variant="tertiary" />
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
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent.red,
    lineHeight: 32,
  },
  message: {
    ...typography.subhead,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: spacing.xl,
  },
});
