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
  Chip,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { apiFetch } from '@/lib/api-client'; 

interface Advocate {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  is_approved: boolean;
  specialization?: string;
  experience_years?: number;
  bar_number?: string;
  license_number?: string;
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AdvocatesPage() {
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
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Dialog states
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<{ type: 'approve' | 'decline', advocate: Advocate | null }>({ type: 'approve', advocate: null });

  const fetchAdvocates = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        role: 'advocate', // Only fetch advocates
        sortBy,
        sortOrder,
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('is_approved', statusFilter);

      const response = await apiFetch(`/api/users?${params.toString()}`);
      
      if (response.success) {
        setAdvocates(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to fetch advocates');
      }
    } catch (err) {
      setError('Failed to fetch advocates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvocates(1);
  }, [searchTerm, statusFilter, sortBy, sortOrder, itemsPerPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    fetchAdvocates(page);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };
  const [approvalNotes, setApprovalNotes] = useState('');

  const handleApproval = async (approved: boolean) => {
    if (!selectedAdvocate) return;

    try {
      setApprovalLoading(true);
      
      const response = await apiFetch(`/api/users/${selectedAdvocate.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          is_approved: approved,
        }),
      });

      if (response.success) {
        setApprovalDialog(false);
        setSelectedAdvocate(null);
        setApprovalNotes('');
        fetchAdvocates(pagination.currentPage); // Refresh current page
      } else {
        setError(response.message || 'Failed to update advocate status');
      }
    } catch (err) {
      setError('Failed to update advocate status');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleConfirmationAction = (type: 'approve' | 'decline', advocate: Advocate) => {
    setConfirmationAction({ type, advocate });
    setConfirmationDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmationAction.advocate) return;

    try {
      setApprovalLoading(true);
      
      const response = await apiFetch(`/api/users/${confirmationAction.advocate.id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          is_approved: confirmationAction.type === 'approve'
        }),
      });

      if (response.success) {
        setConfirmationDialog(false);
        setConfirmationAction({ type: 'approve', advocate: null });
        fetchAdvocates(pagination.currentPage);
      } else {
        setError(response.message || 'Failed to update advocate status');
      }
    } catch (err) {
      setError('Failed to update advocate status');
      console.error('Confirmation action error:', err);
    } finally {
      setApprovalLoading(false);
    }
  };

  const openApprovalDialog = (advocate: Advocate) => {
    setSelectedAdvocate(advocate);
    setApprovalDialog(true);
  };

  const getStatusChip = (isApproved: boolean) => {
    return (
      <Chip
        label={isApproved ? 'Approved' : 'Pending'}
        color={isApproved ? 'success' : 'warning'}
        size="small"
      />
    );
  };

  const getSpecializationChip = (specialization: string) => {
    return (
      <Chip
        label={specialization}
        variant="outlined"
        size="small"
        sx={{ mr: 1, mb: 1 }}
      />
    );
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchAdvocates(pagination.currentPage)}
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
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <WorkIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {pagination.totalItems}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Advocates
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {advocates.filter(a => a.is_approved).length}
                  </Typography>
                  <Typography color="text.secondary">
                    Approved
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <CancelIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {advocates.filter(a => !a.is_approved).length}
                  </Typography>
                  <Typography color="text.secondary">
                    Pending
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
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search advocates..."
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
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => handleStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="true">Approved</MenuItem>
                  <MenuItem value="false">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
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

      {/* Advocates Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort('name')}
                  >
                    Advocate {sortBy === 'name' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort('specialization')}
                  >
                    Specialization {sortBy === 'specialization' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort('experience_years')}
                  >
                    Experience {sortBy === 'experience_years' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort('is_approved')}
                  >
                    Status {sortBy === 'is_approved' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : advocates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No advocates found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  advocates.map((advocate) => (
                    <TableRow key={advocate.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2 }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {advocate.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Bar: {advocate.bar_number || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <EmailIcon sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="body2">{advocate.email}</Typography>
                          </Box>
                          {advocate.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                              <Typography variant="body2">{advocate.phone}</Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {advocate.specialization ? getSpecializationChip(advocate.specialization) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {advocate.experience_years ? `${advocate.experience_years} years` : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(advocate.is_approved)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => openApprovalDialog(advocate)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          {!advocate.is_approved && (
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleConfirmationAction('approve', advocate)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {advocate.is_approved && (
                            <Tooltip title="Revoke Approval">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleConfirmationAction('decline', advocate)}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
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
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} advocates
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Page {pagination.currentPage} of {pagination.totalPages}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog
        open={approvalDialog}
        onClose={() => setApprovalDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Advocate Details - {selectedAdvocate?.name}
        </DialogTitle>
        <DialogContent>
          {selectedAdvocate && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Personal Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">{selectedAdvocate.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">{selectedAdvocate.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">{selectedAdvocate.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">{selectedAdvocate.address}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Professional Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Specialization:</strong> {selectedAdvocate.specialization}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Experience:</strong> {selectedAdvocate.experience_years} years
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Bar Number:</strong> {selectedAdvocate.bar_number}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>License Number:</strong> {selectedAdvocate.license_number}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Approval Notes (Optional)"
                    multiline
                    rows={3}
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Add any notes about the approval decision..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setApprovalDialog(false)}
            disabled={approvalLoading}
          >
            Cancel
          </Button>
          {selectedAdvocate?.is_approved ? (
            <Button
              onClick={() => handleApproval(false)}
              color="error"
              variant="contained"
              disabled={approvalLoading}
              startIcon={approvalLoading ? <CircularProgress size={16} /> : <CancelIcon />}
            >
              Decline
            </Button>
          ) : (
            <Button
              onClick={() => handleApproval(true)}
              color="success"
              variant="contained"
              disabled={approvalLoading}
              startIcon={approvalLoading ? <CircularProgress size={16} /> : <CheckCircleIcon />}
            >
              Approve
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationDialog}
        onClose={() => setConfirmationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Action
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to {confirmationAction.type === 'approve' ? 'approve' : 'decline'} advocate <strong>{confirmationAction.advocate?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmationDialog(false)}
            disabled={approvalLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={confirmationAction.type === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={approvalLoading}
            startIcon={approvalLoading ? <CircularProgress size={16} /> : null}
          >
            {confirmationAction.type === 'approve' ? 'Approve' : 'Decline'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
