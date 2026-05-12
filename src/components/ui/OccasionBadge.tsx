// src/components/ui/OccasionBadge.tsx
//
// Mapping direct vers OCCASIONS du theme. Wrapper de Badge.

import React from 'react';
import { OCCASIONS } from '../../utils/theme';
import { Occasion } from '../../types';
import { Badge } from './Badge';

interface Props {
  occasion: Occasion;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function OccasionBadge({ occasion, size = 'md', showLabel = true }: Props) {
  const o = OCCASIONS[occasion] ?? OCCASIONS.Autre;
  return (
    <Badge
      label={showLabel ? o.label : ''}
      color={o.color}
      bg={o.bg}
      icon={o.emoji}
      size={size}
    />
  );
}
