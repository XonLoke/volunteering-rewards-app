import React, { useEffect, useRef } from 'react';
import {
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
  duration?: number;
}

const typeStyles: Record<string, { backgroundColor: string; color: string }> = {
  success: {
    backgroundColor: colors.accent.green,
    color: colors.text.inverse,
  },
  error: {
    backgroundColor: colors.accent.red,
    color: colors.text.inverse,
  },
  info: {
    backgroundColor: colors.text.primary,
    color: colors.text.inverse,
  },
};

export default function Toast({
  visible,
  message,
  type = 'info',
  onDismiss,
  duration = 3000,
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 50,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDismiss();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      opacity.setValue(0);
      translateY.setValue(50);
    }
  }, [visible, duration, onDismiss, opacity, translateY]);

  if (!visible) {
    return null;
  }

  const currentType = typeStyles[type] || typeStyles.info;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: currentType.backgroundColor, opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={[styles.message, { color: currentType.color }]}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    ...({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 6,
    } as ViewStyle),
  },
  message: {
    ...typography.subhead,
    fontWeight: '600',
    textAlign: 'center',
  },
});
