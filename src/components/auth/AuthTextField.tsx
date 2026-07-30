import { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";

type AuthTextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
};

export const AuthTextField = forwardRef<TextInput, AuthTextFieldProps>(
  function AuthTextField({ label, error, hint, style, ...props }, ref) {
    const [focused, setFocused] = useState(false);

    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          aria-invalid={Boolean(error)}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          placeholderTextColor={HOME_COLORS.textSecondary}
          style={[
            styles.input,
            focused && styles.focused,
            error && styles.invalid,
            style,
          ]}
          {...props}
        />
        {error ? (
          <Text
            accessibilityLiveRegion="polite"
            role="alert"
            style={styles.error}
          >
            {error}
          </Text>
        ) : hint ? (
          <Text style={styles.hint}>{hint}</Text>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  field: {
    gap: 7,
  },
  label: {
    color: HOME_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    color: HOME_COLORS.textPrimary,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  focused: {
    borderWidth: 2,
    borderColor: HOME_COLORS.accent,
  },
  invalid: {
    borderColor: "#d86f7e",
  },
  hint: {
    color: HOME_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  error: {
    color: "#f1a5ae",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
});
