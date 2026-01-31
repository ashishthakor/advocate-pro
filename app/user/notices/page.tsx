'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  TextField,
  Pagination,
  Snackbar,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { apiFetch } from '@/lib/api-client';
import { useDebounce } from '@/lib/utils';
import { InputAdornment } from '@mui/material';

interface Case {
  id: number;
  case_number: string;
  title: string;
}

interface Notice {
  id: number;
  case_id: number;
  respondent_name: string;
  respondent_address: string;
  subject: string | null;
  date: string | null;
  pdf_filename: string | null;
  uploaded_file_path: string | null;
  notice_stage: string | null;
  tracking_id: string | null;
  created_at: string;
  case?: Case;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function UserNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchNotices(1);
  }, [debouncedSearchTerm]);

  const fetchNotices = async (page = 1) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: 'updated_at',
        sortOrder: 'DESC',
      });

      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }

      const response = await apiFetch(`/api/notices?${params.toString()}`);

      if (response.success) {
        setNotices(response.data.notices || []);
        setPagination(response.data.pagination || pagination);
      } else {
        setError(response.message || 'Failed to fetch notices');
      }
    } catch (err) {
      setError('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (notice: Notice) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notices/${notice.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = notice.uploaded_file_path
          ? notice.uploaded_file_path.split('/').pop() || `Notice_${notice.id}`
          : notice.pdf_filename || `Notice_${notice.id}.pdf`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download file');
      }
    } catch (err) {
      setError('Failed to download file');
    }
  };

  const formatDateForDisplay = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchNotices(pagination.currentPage)}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Notices Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Case</TableCell>
                  <TableCell>Respondent</TableCell>
                  <TableCell>File Name</TableCell>
                  <TableCell>Notice Stage</TableCell>
                  <TableCell>Tracking ID</TableCell>
                  <TableCell>Notice Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : notices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm ? 'No notices found matching your search' : 'No notices found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  notices.map((notice) => (
                    <TableRow key={notice.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">
                            {notice.case?.title || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            #{notice.case?.case_number || notice.case_id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {notice.respondent_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notice.respondent_address}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {(notice.uploaded_file_path || notice.pdf_filename) ? (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'primary.main',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              '&:hover': {
                                textDecoration: 'none',
                              },
                            }}
                            onClick={() => handleDownloadPDF(notice)}
                          >
                            {notice.uploaded_file_path
                              ? notice.uploaded_file_path.split('/').pop() || 'Uploaded File'
                              : notice.pdf_filename}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {notice.notice_stage || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {notice.tracking_id || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateForDisplay(notice.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleDownloadPDF(notice)}
                          >
                            <DescriptionIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={(e, page) => fetchNotices(page)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </>
  );
}
