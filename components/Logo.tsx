import React from 'react';
import { Box, useTheme } from '@mui/material';
import Image from 'next/image';
import logoPath from "@/assets/images/arbitalk-logo.png";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({ width = 120, height = 30, className }: LogoProps) {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        width: width,
        height: height,
      }}
      className={className}
    >
      <Image
        src={logoPath}
        alt="ARBITALK Logo"
        width={width}
        height={height}
        style={{
          objectFit: 'contain',
          filter: theme.palette.mode === 'dark' ? 'brightness(0) invert(1)' : 'none',
        }}
        priority
      />
    </Box>
  );
}
