import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface InputProps extends Omit<TextInputProps, 'style' | 'onFocus' | 'onBlur'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  helperText?: string;
}

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  helperText,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const inputContainerStyles = [
    styles.inputContainer,
    isFocused && styles.inputFocused,
    error ? styles.inputError : null,
  ];

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={inputContainerStyles}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.subhead,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    backgroundColor: colors.bg.input,
    height: 44,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: colors.border.focus,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.accent.red,
    borderWidth: 1,
  },
  input: {
    ...typography.body,
    color: colors.text.primary,
    padding: 0,
    margin: 0,
  },
  errorText: {
    ...typography.footnote,
    color: colors.accent.red,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.footnote,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
