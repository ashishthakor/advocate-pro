'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Box, useTheme } from '@mui/material';
import ReactQuillPolyfill from './ReactQuillPolyfill';

// Dynamically import ReactQuill with no SSR
// The webpack config will ensure react-dom is patched before react-quill loads
const ReactQuillWrapper = dynamic(
  async () => {
    if (typeof window === 'undefined') {
      return { default: () => null };
    }
    
    // Import ReactQuill and CSS
    // Note: react-dom polyfill is applied via webpack config
    const ReactQuillModule = await import('react-quill');
    // @ts-ignore - CSS import
    await import('react-quill/dist/quill.snow.css');
    
    return ReactQuillModule;
  },
  { 
    ssr: false,
    loading: () => (
      <Box sx={{ minHeight: '200px', border: '1px solid #ccc', borderRadius: '4px', p: 2 }}>
        Loading editor...
      </Box>
    )
  }
);

interface ReactQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  readOnly?: boolean;
}

export default function ReactQuillEditor({
  value,
  onChange,
  placeholder = 'Enter content...',
  error = false,
  helperText,
  readOnly = false,
}: ReactQuillEditorProps) {
  const [mounted, setMounted] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['link'],
        ['clean'],
      ],
      // Preserve whitespace and formatting
      clipboard: {
        matchVisual: false, // Don't match visual formatting
      },
    }),
    []
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'align',
    'link',
  ];

  if (!mounted) {
    return (
      <Box>
        <Box
          sx={{
            minHeight: '200px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
          }}
        >
          Loading editor...
        </Box>
        {helperText && (
          <Box
            sx={{
              mt: 1,
              ml: 1.75,
              fontSize: '0.75rem',
              color: error ? 'error.main' : 'text.secondary',
            }}
          >
            {helperText}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <ReactQuillPolyfill />
      <Box
        sx={{
          '& .ql-container': {
            minHeight: '200px',
            fontSize: '14px',
            fontFamily: 'inherit',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px',
            backgroundColor: isDarkMode ? '#383838' : '#fff',
            ...(error && {
              borderColor: 'error.main',
            }),
            ...(isDarkMode && {
              color: theme.palette.text.primary,
            }),
          },
          '& .ql-editor': {
            minHeight: '200px',
            ...(isDarkMode && {
              color: theme.palette.text.primary,
            }),
          },
          '& .ql-toolbar': {
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            backgroundColor: isDarkMode ? '#383838' : '#fff',
            ...(isDarkMode && {
              borderColor: theme.palette.divider,
              '& .ql-stroke': {
                stroke: theme.palette.text.primary,
              },
              '& .ql-fill': {
                fill: theme.palette.text.primary,
              },
              '& .ql-picker-label': {
                color: theme.palette.text.primary,
                '&::before': {
                  color: theme.palette.text.primary,
                },
              },
              '& .ql-picker-options': {
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider,
                '& .ql-picker-item': {
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                },
              },
              '& button': {
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                '&.ql-active': {
                  backgroundColor: theme.palette.action.selected,
                },
              },
              '& .ql-formats': {
                '& button': {
                  color: theme.palette.text.primary,
                },
              },
            }),
          },
        }}
      >
        {mounted && typeof window !== 'undefined' && (
          <ReactQuillWrapper
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            readOnly={readOnly}
          />
        )}
      </Box>
      {helperText && (
        <Box
          sx={{
            mt: 1,
            ml: 1.75,
            fontSize: '0.75rem',
            color: error ? 'error.main' : 'text.secondary',
          }}
        >
          {helperText}
        </Box>
      )}
    </Box>
  );
}

