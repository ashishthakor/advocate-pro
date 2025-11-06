'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Message as MessageIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';

interface Case {
  id: number;
  case_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  case_type: string;
  created_at: string;
  updated_at: string;
  advocate_name: string | null;
  advocate_email: string | null;
  user_name: string;
  user_email: string;
}

export default function UserChatPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, searchTerm, statusFilter]);

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setCases(data.data.cases || data.data);
      } else {
        setError(data.message || 'Failed to fetch cases');
      }
    } catch (err) {
      setError('An error occurred while fetching cases');
    } finally {
      setLoading(false);
    }
  };

  const filterCases = () => {
    let filtered = cases;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(case_ => 
        case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.status === statusFilter);
    }

    setFilteredCases(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'success';
      case 'in_progress': return 'warning';
      case 'closed': return 'default';
      case 'on_hold': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCaseClick = (caseId: number) => {
    router.push(`/user/chat/${caseId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <MessageIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4">{t('chat.title')}</Typography>
      </Stack> */}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder={t('chat.searchCases')}
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
              <TextField
                fullWidth
                select
                label={t('chat.status')}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="all">{t('chat.allStatuses')}</option>
                <option value="open">{t('chat.open')}</option>
                <option value="in_progress">{t('chat.inProgress')}</option>
                <option value="on_hold">{t('chat.onHold')}</option>
                <option value="closed">{t('chat.closed')}</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AssignmentIcon />}
                onClick={() => router.push('/user/create-case')}
              >
                {t('chat.createNewCase')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm || statusFilter !== 'all' ? t('chat.noCasesFound') : t('chat.noCasesYet')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || statusFilter !== 'all' ? t('chat.tryDifferentSearch') : t('chat.createFirstCase')}
              </Typography>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  variant="contained"
                  startIcon={<AssignmentIcon />}
                  onClick={() => router.push('/user/create-case')}
                >
                  {t('chat.createNewCase')}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredCases.map((case_) => (
            <Grid item xs={12} key={case_.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  }
                }}
                onClick={() => handleCaseClick(case_.id)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {case_.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {case_.case_number}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {case_.description}
                      </Typography>
                    </Box>
                    <IconButton size="small" color="primary">
                      <ArrowForwardIcon />
                    </IconButton>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip
                          label={case_.status}
                          color={getStatusColor(case_.status) as any}
                          size="small"
                        />
                        <Chip
                          label={case_.priority}
                          color={getPriorityColor(case_.priority) as any}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AssignmentIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {case_.case_type}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {case_.advocate_name || t('chat.notAssigned')}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(case_.created_at)}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
