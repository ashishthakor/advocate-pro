'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
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
            ...(error && {
              borderColor: 'error.main',
            }),
          },
          '& .ql-editor': {
            minHeight: '200px',
          },
          '& .ql-toolbar': {
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
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

