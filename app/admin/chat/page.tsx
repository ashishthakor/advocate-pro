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
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search as SearchIcon,
  WhatsApp as WhatsAppIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon,
  AssignmentInd as AssignmentIndIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { apiFetch } from '@/lib/api-client';

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
  advocate_id: number | null;
  advocate_name: string | null;
  advocate_email: string | null;
  user_name: string;
  user_email: string;
}

interface Advocate {
  id: number;
  name: string;
  email: string;
}

export default function AdminChatPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [advocateFilter, setAdvocateFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAdvocate, setSelectedAdvocate] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    fetchCases();
    fetchAdvocates();
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, searchTerm, statusFilter, advocateFilter]);

  const fetchCases = async () => {
    try {
      const data = await apiFetch('/api/cases');

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

  const fetchAdvocates = async () => {
    try {
      const data = await apiFetch('/api/users?role=advocate&is_approved=true');

      if (data.success) {
        setAdvocates(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch advocates:', err);
    }
  };

  const filterCases = () => {
    let filtered = cases;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(case_ => 
        case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.user_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.status === statusFilter);
    }

    // Filter by advocate
    if (advocateFilter !== 'all') {
      if (advocateFilter === 'unassigned') {
        filtered = filtered.filter(case_ => !case_.advocate_id);
      } else {
        filtered = filtered.filter(case_ => case_.advocate_id === parseInt(advocateFilter));
      }
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
    router.push(`/admin/chat/${caseId}`);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, case_: Case) => {
    setAnchorEl(event.currentTarget);
    setSelectedCase(case_);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Don't clear selectedCase here as we need it for the dialog
  };

  const handleAssignCase = () => {
    setAssignDialogOpen(true);
    // Pre-select the currently assigned advocate if any
    setSelectedAdvocate(selectedCase?.advocate_id?.toString() || '');
    handleMenuClose();
  };

  const handleAssignSubmit = async () => {
    if (!selectedCase || !selectedAdvocate) return;

    setAssigning(true);
    try {
      const data = await apiFetch(`/api/cases/${selectedCase.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          advocate_id: parseInt(selectedAdvocate)
        })
      });

      if (data.success) {
        // Update the case in the local state
        setCases(prev => prev.map(case_ => 
          case_.id === selectedCase.id 
            ? { ...case_, advocate_id: parseInt(selectedAdvocate), advocate_name: advocates.find(a => a.id === parseInt(selectedAdvocate))?.name || null }
            : case_
        ));
        setAssignDialogOpen(false);
        setSelectedAdvocate('');
        setSelectedCase(null);
        setSuccessMessage(`Case "${selectedCase.title}" assigned successfully!`);
        setError('');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to assign case');
      }
    } catch (err) {
      console.error('Assign case error:', err);
      setError('Failed to assign case');
    } finally {
      setAssigning(false);
    }
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
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <WhatsAppIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4">{t('chat.adminTitle')}</Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={2}>
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
              <TextField
                fullWidth
                select
                label={t('chat.advocate')}
                value={advocateFilter}
                onChange={(e) => setAdvocateFilter(e.target.value)}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="all">{t('chat.allAdvocates')}</option>
                <option value="unassigned">{t('chat.unassigned')}</option>
                {advocates.map(advocate => (
                  <option key={advocate.id} value={advocate.id}>
                    {advocate.name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AssignmentIcon />}
                onClick={() => router.push('/admin/cases')}
              >
                {t('chat.manageCases')}
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
              <WhatsAppIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm || statusFilter !== 'all' || advocateFilter !== 'all' ? t('chat.noCasesFound') : t('chat.noCasesYet')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || statusFilter !== 'all' || advocateFilter !== 'all' ? t('chat.tryDifferentSearch') : t('chat.noCasesInSystem')}
              </Typography>
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
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuClick(e, case_);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <ArrowForwardIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={2}>
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
                    <Grid item xs={12} sm={6} md={2}>
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
                          {case_.user_name}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AssignmentIndIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {case_.advocate_name || t('chat.notAssigned')}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
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

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleAssignCase}>
          <AssignmentIndIcon sx={{ mr: 1 }} />
          {t('chat.assignCase')}
        </MenuItem>
      </Menu>

      {/* Assign Case Dialog */}
      <Dialog 
        open={assignDialogOpen} 
        onClose={() => {
          setAssignDialogOpen(false);
          setSelectedCase(null);
          setSelectedAdvocate('');
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>{t('chat.assignCase')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('chat.assignCaseTo')}: {selectedCase?.title}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>{t('chat.selectAdvocate')}</InputLabel>
            <Select
              value={selectedAdvocate}
              onChange={(e) => setSelectedAdvocate(e.target.value)}
              label={t('chat.selectAdvocate')}
            >
              {advocates.map(advocate => (
                <MenuItem key={advocate.id} value={advocate.id}>
                  {advocate.name} ({advocate.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAssignDialogOpen(false);
            setSelectedCase(null);
            setSelectedAdvocate('');
          }}>
            {t('chat.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleAssignSubmit}
            disabled={!selectedAdvocate || assigning}
          >
            {assigning ? t('chat.assigning') : t('chat.assign')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
