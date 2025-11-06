'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingUpIcon,
  Message as MessageIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useAuth } from '@/components/AuthProvider';
import { apiFetch } from '@/lib/api-client';
import { useLanguage } from '@/components/LanguageProvider';
import { CASE_STATUS_CONFIG, getStatusConfig } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import CaseDetailsModal from '@/components/CaseDetailsModal';

interface Case {
  id: number;
  case_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  case_type: string;
  user_id: number;
  advocate_id?: number;
  user_name?: string;
  advocate_name?: string;
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  pendingCases: number;
}

export default function AdvocateDashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    activeCases: 0,
    completedCases: 0,
    pendingCases: 0,
  });
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [caseDetailsModalOpen, setCaseDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch cases assigned to this advocate
      const response = await apiFetch('/api/cases');
      
      if (response.success) {
        const cases = response.data.cases || response.data;
        
        // Calculate statistics
        const totalCases = cases.length;
        const activeCases = cases.filter((c: any) => 
          ['waiting_for_action', 'neutrals_needs_to_be_assigned', 'consented'].includes(c.status)
        ).length;
        const completedCases = cases.filter((c: any) => 
          ['settled', 'closed_no_consent', 'close_no_settlement', 'withdrawn'].includes(c.status)
        ).length;
        const pendingCases = cases.filter((c: any) => 
          ['hold', 'temporary_non_starter'].includes(c.status)
        ).length;

        setStats({
          totalCases,
          activeCases,
          completedCases,
          pendingCases,
        });

        // Get recent cases (last 5)
        setRecentCases(cases.slice(0, 5));
      }
    } catch (err) {
      console.error('Fetch dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    const config = getStatusConfig(status);
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  const getPriorityChip = (priority: string) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      urgent: 'error',
    } as const;

    return (
      <Chip
        label={priority.charAt(0).toUpperCase() + priority.slice(1)}
        color={colors[priority as keyof typeof colors] || 'default'}
        size="small"
        variant="outlined"
      />
    );
  };

  const handleViewCase = (caseId: number) => {
    const case_ = recentCases.find(c => c.id === caseId);
    if (case_) {
      setSelectedCase(case_);
      setCaseDetailsModalOpen(true);
    }
  };

  const handleCloseCaseDetails = () => {
    setCaseDetailsModalOpen(false);
    setSelectedCase(null);
  };

  const handleChatCase = (caseId: number) => {
    router.push(`/advocate/chat/${caseId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Welcome back, {user?.name || 'Advocate'}! Here&apos;s an overview of your assigned cases and recent activity.
        </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.totalCases}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Cases
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.activeCases}
                  </Typography>
                  <Typography color="text.secondary">
                    Active Cases
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.completedCases}
                  </Typography>
                  <Typography color="text.secondary">
                    Completed Cases
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <PendingIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.pendingCases}
                  </Typography>
                  <Typography color="text.secondary">
                    Pending Cases
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Cases */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Recent Cases
            </Typography>
            <Button
              variant="outlined"
              onClick={() => router.push('/advocate/cases')}
            >
              View All Cases
            </Button>
          </Box>

          {recentCases.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No cases assigned yet
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Case</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentCases.map((case_) => (
                    <TableRow key={case_.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            {case_.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            #{case_.case_number || case_.id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                            <PersonIcon />
                          </Avatar>
                          <Typography variant="body2">
                            {case_.user_name || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(case_.status)}
                      </TableCell>
                      <TableCell>
                        {getPriorityChip(case_.priority)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(case_.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewCase(case_.id)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chat">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleChatCase(case_.id)}
                            >
                              <MessageIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                  onClick={() => router.push('/advocate/cases')}
                  fullWidth
                >
                  View All Cases
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MessageIcon />}
                  onClick={() => router.push('/advocate/chat')}
                  fullWidth
                >
                  Open Chat
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PersonIcon />}
                  onClick={() => router.push('/advocate/profile')}
                  fullWidth
                >
                  Update Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Case Status Breakdown
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.entries(CASE_STATUS_CONFIG).map(([status, config]) => {
                  const count = recentCases.filter(c => c.status === status).length;
                  return (
                    <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{config.icon}</span>
                        <Typography variant="body2">{config.label}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {count}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Case Details Modal */}
      {selectedCase && (
        <CaseDetailsModal
          open={caseDetailsModalOpen}
          onClose={handleCloseCaseDetails}
          caseDetails={selectedCase as any}
        />
      )}
    </Box>
  );
}
