"use client";

import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  useTheme,
  SelectChangeEvent,
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

  const handleLanguageChange = (event: SelectChangeEvent<Language>) => {
    // MUI Select passes value through event.target.value
    const newLanguage = (event.target.value as string) as Language;
    console.log('LanguageSelector: onChange triggered');
    console.log('  Event:', event);
    console.log('  event.target.value:', event.target.value);
    console.log('  newLanguage:', newLanguage);
    console.log('  current language:', language);
    
    if (newLanguage && ['en', 'hi', 'mr', 'gu'].includes(newLanguage)) {
      if (newLanguage !== language) {
        console.log('LanguageSelector: Setting language to', newLanguage);
        setLanguage(newLanguage);
      } else {
        console.log('LanguageSelector: Language is already', newLanguage);
      }
    } else {
      console.error('LanguageSelector: Invalid language value:', newLanguage);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LanguageIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={language}
          onChange={handleLanguageChange}
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
