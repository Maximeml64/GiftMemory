// src/components/ui/ScreenWrapper.tsx
//
// Wrapper standard pour les screens : SafeAreaView + padding horizontal +
// option scroll. Garantit une base cohérente entre tous les écrans.

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StatusBar,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../utils/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  background?: string;
  edges?: readonly Edge[];
  keyboardAvoiding?: boolean;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  style?: ViewStyle;
}

export function ScreenWrapper({
  children,
  scroll = false,
  padded = true,
  background,
  edges = ['top', 'left', 'right'] as const,
  keyboardAvoiding = false,
  contentContainerStyle,
  style,
}: Props) {
  const bg = background ?? COLORS.background;
  const paddingHorizontal = padded ? SPACING.lg : 0;

  const inner = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        { paddingHorizontal, paddingBottom: SPACING.xxl },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, paddingHorizontal }, style]}>{children}</View>
  );

  const content = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {inner}
    </KeyboardAvoidingView>
  ) : (
    inner
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={edges}>
      <StatusBar barStyle="dark-content" backgroundColor={bg} />
      {content}
    </SafeAreaView>
  );
}
