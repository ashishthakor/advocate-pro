'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { apiFetch } from '@/lib/api-client';
import { useDebounce } from '@/lib/utils';
import NoticesSection from '@/components/NoticesSection';
import NoticeStageBadge from '@/components/NoticeStageBadge';
import { useRouter } from 'next/navigation';

interface Notice {
  id: number;
  case_id: number;
  respondent_name: string;
  subject: string | null;
  date: string | null;
  notice_number: number;
  created_at: string;
  case?: {
    id: number;
    case_number: string;
    title: string;
  };
}

export default function UserNoticesPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [noticeNumberFilter, setNoticeNumberFilter] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchNotices();
  }, [debouncedSearchTerm, noticeNumberFilter]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }
      if (noticeNumberFilter) {
        params.append('notice_number', noticeNumberFilter);
      }
      
      const response = await apiFetch(`/api/notices?${params.toString()}`);
      
      if (response.success) {
        setNotices(response.data.notices || []);
      } else {
        setError(response.message || 'Failed to fetch notices');
      }
    } catch (err: any) {
      setError('Failed to fetch notices');
      console.error('Error fetching notices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group notices by case
  const noticesByCase = notices.reduce((acc, notice) => {
    const caseId = notice.case_id;
    if (!acc[caseId]) {
      acc[caseId] = {
        case: notice.case || { id: caseId, case_number: `Case ${caseId}`, title: 'Unknown Case' },
        notices: [],
      };
    }
    acc[caseId].notices.push(notice);
    return acc;
  }, {} as Record<number, { case: { id: number; case_number: string; title: string }; notices: Notice[] }>);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          My Notices
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchNotices}
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

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Notice Number</InputLabel>
                <Select
                  value={noticeNumberFilter}
                  label="Notice Number"
                  onChange={(e) => setNoticeNumberFilter(e.target.value)}
                >
                  <MenuItem value="">All Notices</MenuItem>
                  <MenuItem value="1">Notice 1</MenuItem>
                  <MenuItem value="2">Notice 2</MenuItem>
                  <MenuItem value="3">Notice 3</MenuItem>
                  <MenuItem value="4">Notice 4+</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Notices by Case */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : Object.keys(noticesByCase).length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Notices Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || noticeNumberFilter
                  ? 'Try adjusting your search or filter criteria'
                  : 'You don\'t have any notices yet. Notices will appear here once they are created for your cases.'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {Object.values(noticesByCase).map(({ case: caseData, notices: caseNotices }) => (
            <Card key={caseData.id} sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {caseData.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Case #{caseData.case_number}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => router.push(`/user/cases`)}
                  >
                    View Case
                  </Button>
                </Box>
                <NoticesSection
                  caseId={caseData.id}
                  caseNumber={caseData.case_number}
                  caseTitle={caseData.title}
                  onAddNotice={() => router.push(`/user/cases?case_id=${caseData.id}&action=create_notice`)}
                  onEditNotice={(notice) => router.push(`/user/notices?notice_id=${notice.id}&action=edit`)}
                  onDeleteNotice={async (noticeId) => {
                    if (confirm('Are you sure you want to delete this notice?')) {
                      try {
                        const response = await apiFetch(`/api/notices/${noticeId}`, {
                          method: 'DELETE',
                        });
                        if (response.success) {
                          fetchNotices();
                        } else {
                          alert(response.message || 'Failed to delete notice');
                        }
                      } catch (err) {
                        console.error('Error deleting notice:', err);
                        alert('Failed to delete notice');
                      }
                    }
                  }}
                  showActions={true}
                />
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
