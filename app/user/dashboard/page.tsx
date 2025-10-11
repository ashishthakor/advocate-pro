'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  LinearProgress,
  Fab,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { apiFetch } from '@/lib/api-client';
import CaseDetailsModal from '@/components/CaseDetailsModal';

interface UserStats {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  pendingCases: number;
  recentCases: Array<{
    id: number;
    case_number: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    case_type: string;
    created_at: string;
    updated_at: string;
    user_id: number;
    advocate_id: number;
    court_name: string;
    judge_name: string;
    next_hearing_date: string;
    fees: number;
    fees_paid: number;
    start_date: string;
    end_date: string;
    requester_name: string;
    requester_email: string;
    requester_phone: string;
    requester_address: string;
    respondent_name: string;
    respondent_email: string;
    respondent_phone: string;
    respondent_address: string;
    relationship_between_parties: string;
    nature_of_dispute: string;
    brief_description_of_dispute: string;
    occurrence_date: string;
    prior_communication: string;
    prior_communication_other: string;
    sought_monetary_claim: boolean;
    sought_settlement: boolean;
    sought_other: string;
    sought_other_text: string;
    attachments_json: string;
    user_name: string;
    user_email: string;
    advocate_name: string;
    advocate_email: string;
  }>;
}

export default function UserDashboard() {
  const [stats, setStats] = useState<UserStats>({
    totalCases: 0,
    activeCases: 0,
    closedCases: 0,
    pendingCases: 0,
    recentCases: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiFetch('/api/dashboard');
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (caseItem: any) => {
    setSelectedCase(caseItem);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCase(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'primary';
      case 'in_progress':
        return 'warning';
      case 'closed':
        return 'success';
      case 'on_hold':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
{/*       
      <Typography variant="h5" gutterBottom>
        {t('dashboard.title')}
      </Typography> */}
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {t('dashboard.subtitle')}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    {t('dashboard.totalCases')}
                  </Typography>
                  <Typography variant="h4">{stats.totalCases}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    {t('dashboard.activeCases')}
                  </Typography>
                  <Typography variant="h4">{stats.activeCases}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MessageIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    {t('dashboard.closedCases')}
                  </Typography>
                  <Typography variant="h4">{stats.closedCases}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    {t('dashboard.pendingCases')}
                  </Typography>
                  <Typography variant="h4">{stats.pendingCases}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Cases Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {t('dashboard.recentCases')}
                </Typography>
                <Button variant="outlined" size="small" onClick={() => router.push('/user/cases')}>
                  {t('dashboard.viewAllCases')}
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('dashboard.caseTitle')}</TableCell>
                      <TableCell>{t('dashboard.advocate')}</TableCell>
                      <TableCell>{t('dashboard.status')}</TableCell>
                      <TableCell>{t('dashboard.priority')}</TableCell>
                      <TableCell>{t('dashboard.created')}</TableCell>
                      <TableCell>{t('dashboard.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentCases.map((caseItem) => (
                      <TableRow key={caseItem.id}>
                        <TableCell>{caseItem.title}</TableCell>
                        <TableCell>{caseItem.advocate_name || 'Not Assigned'}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(caseItem.status)}
                            color={getStatusColor(caseItem.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={caseItem.priority.toUpperCase()}
                            color={getPriorityColor(caseItem.priority) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(caseItem.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => handleViewDetails(caseItem)}>
                            {t('dashboard.viewDetails')}
                          </Button>
                          <Button size="small" variant="outlined">
                            {t('dashboard.chat')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Floating Action Button for Quick Case Creation */}
      <Fab
        color="primary"
        aria-label={t('dashboard.addCase')}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => router.push('/user/create-case')}
      >
        <AddIcon />
      </Fab>

      {/* Case Details Modal */}
      <CaseDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        caseDetails={selectedCase}
      />
    </Box>
  );
}
