import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, borderRadius, typography } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyles: ViewStyle[] = [styles.base];

  if (variant === 'primary') {
    containerStyles.push(styles.primary);
  } else if (variant === 'secondary') {
    containerStyles.push(styles.secondary);
  } else {
    containerStyles.push(styles.tertiary);
  }

  if (isDisabled) {
    containerStyles.push(styles.disabled);
  }

  if (style) {
    containerStyles.push(style);
  }

  const textStyles: TextStyle[] = [styles.textBase];
  if (variant === 'primary') {
    textStyles.push(styles.primaryText);
  } else if (variant === 'secondary') {
    textStyles.push(styles.secondaryText);
  } else {
    textStyles.push(styles.tertiaryText);
  }

  if (isDisabled) {
    textStyles.push(styles.disabledText);
  }

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.text.inverse : colors.accent.green}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: colors.accent.green,
  },
  secondary: {
    backgroundColor: colors.bg.card,
    borderWidth: 1.5,
    borderColor: colors.accent.green,
  },
  tertiary: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    ...typography.headline,
  },
  primaryText: {
    color: colors.text.inverse,
  },
  secondaryText: {
    color: colors.accent.green,
  },
  tertiaryText: {
    color: colors.accent.blue,
  },
  disabledText: {
    opacity: 0.5,
  },
});
