'use client';

import React from 'react';
import { Chip } from '@mui/material';

interface NoticeStageBadgeProps {
  number: number | string;
  size?: 'small' | 'medium';
}

export default function NoticeStageBadge({ number, size = 'small' }: NoticeStageBadgeProps) {
  const noticeNum = typeof number === 'string' ? parseInt(number) : number;
  
  const getStageConfig = (num: number) => {
    // First 3 notices get special colors, rest get default
    if (num === 1) {
      return { label: `Notice ${num}`, color: 'primary' as const };
    } else if (num === 2) {
      return { label: `Notice ${num}`, color: 'warning' as const };
    } else if (num === 3) {
      return { label: `Notice ${num}`, color: 'error' as const };
    } else {
      return { label: `Notice ${num}`, color: 'default' as const };
    }
  };

  const config = getStageConfig(noticeNum || 1);

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant="outlined"
    />
  );
}
