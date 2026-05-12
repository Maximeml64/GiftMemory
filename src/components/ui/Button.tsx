// src/components/ui/Button.tsx
//
// Bouton avec 4 variantes : primary (filled prune), secondary (outline),
// ghost (transparent, link-like), danger (filled rouge). 3 tailles : sm/md/lg.

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../utils/theme';
import { StyledText } from './StyledText';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends Omit<TouchableOpacityProps, 'style'> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  disabled,
  style,
  ...rest
}: Props) {
  const heights: Record<Size, number> = { sm: 36, md: 44, lg: 52 };
  const paddingsH: Record<Size, number> = { sm: SPACING.md, md: SPACING.lg, lg: SPACING.xl };

  const containerStyle: ViewStyle = {
    height: heights[size],
    paddingHorizontal: paddingsH[size],
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    opacity: disabled || loading ? 0.5 : 1,
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
  };

  let backgroundColor: string;
  let borderWidth = 0;
  let borderColor = 'transparent';
  let textColor: string;

  switch (variant) {
    case 'primary':
      backgroundColor = COLORS.primary;
      textColor = COLORS.textInverse;
      break;
    case 'secondary':
      backgroundColor = 'transparent';
      borderWidth = 1;
      borderColor = COLORS.primary;
      textColor = COLORS.primary;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      textColor = COLORS.primary;
      break;
    case 'danger':
      backgroundColor = COLORS.danger;
      textColor = COLORS.textInverse;
      break;
  }

  const textVariant = size === 'sm' ? 'smallMedium' : 'bodyMedium';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      style={[
        containerStyle,
        { backgroundColor, borderWidth, borderColor },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {iconLeft ? <View>{iconLeft}</View> : null}
          <StyledText variant={textVariant} color={textColor} style={styles.label}>
            {label}
          </StyledText>
          {iconRight ? <View>{iconRight}</View> : null}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: TYPOGRAPHY.bodyMedium.fontFamily,
  },
});
