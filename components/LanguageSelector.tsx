"use client";

import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useLanguage, Language } from './LanguageProvider';

const languageNames = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी',
  gu: 'ગુજરાતી',
};

const languageFlags = {
  en: '🇺🇸',
  hi: '🇮🇳',
  mr: '🇮🇳',
  gu: '🇮🇳',
};

export default function LanguageSelector() {
  const theme = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LanguageIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          displayEmpty
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          {Object.entries(languageNames).map(([code, name]) => (
            <MenuItem key={code} value={code}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '1.2rem' }}>
                  {languageFlags[code as keyof typeof languageFlags]}
                </Typography>
                <Typography variant="body2">{name}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
