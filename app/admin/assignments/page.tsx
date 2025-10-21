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
  Paper,
  Chip,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Pagination,
  InputAdornment,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { apiFetch } from 'lib/api-client';
import { useDebounce, CASE_STATUS_CONFIG, getStatusConfig } from 'lib/utils';

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

interface Advocate {
  id: number;
  name: string;
  email: string;
  specialization?: string;
  experience_years?: number;
  is_approved: boolean;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AssignmentsPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
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
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Dialog states
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedAdvocateId, setSelectedAdvocateId] = useState<number | ''>('');
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  const fetchCases = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder,
      });
      
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await apiFetch(`/api/cases?${params.toString()}`);
      
      if (response.success) {
        setCases(response.data.cases);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch cases');
      }
    } catch (err) {
      setError('Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvocates = async () => {
    try {
      const response = await apiFetch('/api/users?role=advocate&is_approved=true');
      if (response.success) {
        setAdvocates(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch advocates:', err);
    }
  };

  useEffect(() => {
    fetchCases(1);
    fetchAdvocates();
  }, [debouncedSearchTerm, statusFilter, assignmentFilter, sortBy, sortOrder, itemsPerPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    fetchCases(page);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
  };

  const handleAssignmentFilter = (value: string) => {
    setAssignmentFilter(value);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const handleAssignment = async () => {
    if (!selectedCase || !selectedAdvocateId) return;

    try {
      setAssignmentLoading(true);
      
      const response = await apiFetch(`/api/cases/${selectedCase.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          advocate_id: selectedAdvocateId,
        }),
      });

      if (response.success) {
        setAssignmentDialog(false);
        setSelectedCase(null);
        setSelectedAdvocateId('');
        fetchCases(pagination.currentPage); // Refresh current page
      } else {
        setError(response.message || 'Failed to assign advocate');
      }
    } catch (err) {
      setError('Failed to assign advocate');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const openAssignmentDialog = (case_: Case) => {
    setSelectedCase(case_);
    setSelectedAdvocateId(case_.advocate_id || '');
    setAssignmentDialog(true);
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

  const getAssignmentStatus = (case_: Case) => {
    if (case_.advocate_id) {
      return (
        <Chip
          label="Assigned"
          color="success"
          size="small"
          icon={<CheckCircleIcon />}
        />
      );
    } else {
      return (
        <Chip
          label="Unassigned"
          color="warning"
          size="small"
          icon={<CancelIcon />}
        />
      );
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Case Assignments
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            fetchCases(pagination.currentPage);
            fetchAdvocates();
          }}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

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
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {pagination.totalItems}
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
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {cases.filter(c => c.advocate_id).length}
                  </Typography>
                  <Typography color="text.secondary">
                    Assigned Cases
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
                  <CancelIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {cases.filter(c => !c.advocate_id).length}
                  </Typography>
                  <Typography color="text.secondary">
                    Unassigned Cases
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
                  <WorkIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {advocates.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Available Advocates
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => handleStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  {Object.entries(CASE_STATUS_CONFIG).map(([value, config]) => (
                    <MenuItem key={value} value={value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Assignment</InputLabel>
                <Select
                  value={assignmentFilter}
                  label="Assignment"
                  onChange={(e) => handleAssignmentFilter(e.target.value)}
                >
                  <MenuItem value="">All Cases</MenuItem>
                  <MenuItem value="assigned">Assigned</MenuItem>
                  <MenuItem value="unassigned">Unassigned</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Items per page</InputLabel>
                <Select
                  value={itemsPerPage}
                  label="Items per page"
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort('title')}
                  >
                    Case {sortBy === 'title' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Current Advocate</TableCell>
                  <TableCell 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort('status')}
                  >
                    Status {sortBy === 'status' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell>Assignment</TableCell>
                  <TableCell 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort('created_at')}
                  >
                    Created {sortBy === 'created_at' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
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
                ) : cases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No cases found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  cases.map((case_) => (
                    <TableRow key={case_.id}>
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
                          <Box>
                            <Typography variant="body2">
                              {case_.user_name || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {case_.user_name || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {case_.advocate_name ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                              <WorkIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2">
                                {case_.advocate_name}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not assigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusChip(case_.status)}
                      </TableCell>
                      <TableCell>
                        {getAssignmentStatus(case_)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(case_.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Assign/Reassign Advocate">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openAssignmentDialog(case_)}
                          >
                            <AssignmentIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
          
          {/* Pagination Info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} cases
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Page {pagination.currentPage} of {pagination.totalPages}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog
        open={assignmentDialog}
        onClose={() => setAssignmentDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: (theme) => theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle>
          Assign Advocate to Case #{selectedCase?.id}
        </DialogTitle>
        <DialogContent>
          {selectedCase && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedCase.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedCase.description}
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Advocate</InputLabel>
                <Select
                  value={selectedAdvocateId}
                  onChange={(e) => setSelectedAdvocateId(e.target.value as number)}
                  label="Select Advocate"
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: (theme) => theme.palette.background.paper,
                        '& .MuiMenuItem-root': {
                          '&:hover': {
                            bgcolor: (theme) => theme.palette.action.hover,
                          },
                        },
                      },
                    },
                  }}
                >
                  {advocates.map((advocate) => (
                    <MenuItem key={advocate.id} value={advocate.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                          <WorkIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2">
                            {advocate.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {advocate.specialization} • {advocate.experience_years} years experience
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedAdvocateId && (
                <Box sx={{ 
                  p: 2, 
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50', 
                  borderRadius: 1,
                  border: (theme) => `1px solid ${theme.palette.divider}`
                }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Advocate Details:
                  </Typography>
                  {(() => {
                    const advocate = advocates.find(a => a.id === selectedAdvocateId);
                    return advocate ? (
                      <Box>
                        <Typography variant="body2">
                          <strong>Name:</strong> {advocate.name}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Email:</strong> {advocate.email}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Specialization:</strong> {advocate.specialization}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Experience:</strong> {advocate.experience_years} years
                        </Typography>
                      </Box>
                    ) : null;
                  })()}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAssignmentDialog(false)}
            disabled={assignmentLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignment}
            variant="contained"
            disabled={!selectedAdvocateId || assignmentLoading}
            startIcon={assignmentLoading ? <CircularProgress size={16} /> : <AssignmentIcon />}
          >
            {assignmentLoading ? 'Assigning...' : 'Assign Advocate'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
