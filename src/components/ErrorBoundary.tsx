// src/components/ErrorBoundary.tsx
//
// Top-level safety net. Catches render-time exceptions thrown anywhere
// below it so the user sees an apologetic screen instead of a white screen
// or red box. Errors thrown inside event handlers / async callbacks are
// NOT caught here — React doesn't surface them through componentDidCatch.

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from './ui/Button';
import { StyledText } from './ui/StyledText';
import { COLORS, SPACING } from '../utils/theme';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top', 'bottom']}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: SPACING.xl,
            gap: SPACING.md,
          }}
        >
          <StyledText style={{ fontSize: 64, lineHeight: 72 }}>🌫️</StyledText>
          <StyledText variant="h1" align="center">
            Une page s'est froissée
          </StyledText>
          <StyledText
            variant="body"
            align="center"
            color={COLORS.textSecondary}
            style={{ maxWidth: 320 }}
          >
            Vos souvenirs sont en sécurité. Réessayez — si le problème persiste, redémarrez l'app.
          </StyledText>
          {__DEV__ ? (
            <StyledText
              variant="caption"
              color={COLORS.textTertiary}
              style={{ maxWidth: 320, marginTop: SPACING.sm }}
              align="center"
            >
              {error.message}
            </StyledText>
          ) : null}
          <View style={{ marginTop: SPACING.lg }}>
            <Button label="Réessayer" onPress={this.reset} size="lg" />
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
