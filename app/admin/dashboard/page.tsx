'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Work as WorkIcon,
  Folder as FolderIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { useAuth } from '@/components/AuthProvider';
import { apiFetch } from '@/lib/api-client';

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  pendingCases: number;
  statusBreakdown: {
    waiting_for_action: number;
    neutrals_needs_to_be_assigned: number;
    consented: number;
    closed_no_consent: number;
    close_no_settlement: number;
    temporary_non_starter: number;
    settled: number;
    hold: number;
    withdrawn: number;
  };
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    activeCases: 0,
    closedCases: 0,
    pendingCases: 0,
    statusBreakdown: {
      waiting_for_action: 0,
      neutrals_needs_to_be_assigned: 0,
      consented: 0,
      closed_no_consent: 0,
      close_no_settlement: 0,
      temporary_non_starter: 0,
      settled: 0,
      hold: 0,
      withdrawn: 0,
    }
  });
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch dashboard data from the dashboard API
      const dashboardResponse = await apiFetch('/api/dashboard');
      
      if (dashboardResponse.success) {
        const data = dashboardResponse.data;
        setStats({
          totalCases: data.totalCases,
          activeCases: data.activeCases,
          closedCases: data.closedCases,
          pendingCases: data.pendingCases,
          statusBreakdown: data.statusBreakdown,
        });
        setRecentCases(data.recentCases || []);
        
        // Use real recent activities from database
        if (data.recentActivities && Array.isArray(data.recentActivities)) {
          const activities = data.recentActivities.map((activity: any) => ({
            id: activity.id.toString(),
            type: activity.type,
            message: activity.message,
            timestamp: new Date(activity.created_at).toLocaleString(),
            status: activity.status as 'success' | 'warning' | 'error' | 'info',
          }));
          setRecentActivity(activities);
        } else {
          setRecentActivity([]);
        }
      } else {
        setError(dashboardResponse.message || 'Failed to load dashboard data');
      }

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return <PeopleIcon />;
      case 'advocate_approval': return <WorkIcon />;
      case 'case_created': return <FolderIcon />;
      case 'case_assigned': return <AssignmentIcon />;
      case 'case_status_changed': return <TrendingUpIcon />;
      case 'document_uploaded': return <AssignmentIcon />;
      case 'system_update': return <ScheduleIcon />;
      default: return <ScheduleIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome back, {user?.name || 'Admin'}! Here&apos;s what&apos;s happening in your system.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <FolderIcon />
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
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
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
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.closedCases}
                  </Typography>
                  <Typography color="text.secondary">
                    Closed Cases
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

      {/* Status Breakdown */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Case Status Breakdown
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={2}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="warning.main">
                    {stats.statusBreakdown.waiting_for_action}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Waiting for Action
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="info.main">
                    {stats.statusBreakdown.neutrals_needs_to_be_assigned}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Needs Assignment
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="success.main">
                    {stats.statusBreakdown.consented}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Consented
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="error.main">
                    {stats.statusBreakdown.closed_no_consent}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Closed No Consent
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="success.main">
                    {stats.statusBreakdown.settled}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Settled
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="default">
                    {stats.statusBreakdown.withdrawn}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Withdrawn
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {recentActivity.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No recent activity to display
              </Typography>
            ) : (
              <List>
                {recentActivity.map((activity) => (
                  <ListItem key={activity.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.message}
                      secondary={activity.timestamp}
                    />
                    <Chip
                      label={activity.status}
                      color={getStatusColor(activity.status) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FolderIcon />}
                href="/admin/cases"
                fullWidth
              >
                View All Cases ({stats.totalCases})
              </Button>
              <Button
                variant="outlined"
                startIcon={<AssignmentIcon />}
                href="/admin/assignments"
                fullWidth
              >
                Assign Cases
              </Button>
              <Button
                variant="outlined"
                startIcon={<PeopleIcon />}
                href="/admin/users"
                fullWidth
              >
                Manage Users
              </Button>
              <Button
                variant="outlined"
                startIcon={<WorkIcon />}
                href="/admin/advocates"
                fullWidth
              >
                Manage Advocates
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
