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
  TextField,
  InputAdornment,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Message as MessageIcon,
  Edit as EditIcon,
  AttachFile as AttachFileIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useDebounce, CASE_STATUS_CONFIG, getStatusConfig } from '@/lib/utils';
import StatusUpdateModal from '@/components/StatusUpdateModal';
import CaseDetailsModal from '@/components/CaseDetailsModal';
import DocumentsModal from '@/components/DocumentsModal';

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
  tracking_id?: string | null;
  court_name?: string;
  judge_name?: string;
  next_hearing_date?: string;
  fees?: number;
  fees_paid?: number;
  start_date?: string;
  end_date?: string;
  requester_name?: string;
  requester_email?: string;
  requester_phone?: string;
  requester_address?: string;
  requester_business_name?: string;
  requester_gst_number?: string;
  respondent_name?: string;
  respondent_email?: string;
  respondent_phone?: string;
  respondent_address?: string;
  respondent_business_name?: string;
  respondent_gst_number?: string;
  relationship_between_parties?: string;
  nature_of_dispute?: string;
  brief_description_of_dispute?: string;
  occurrence_date?: string;
  prior_communication?: string;
  prior_communication_other?: string;
  sought_monetary_claim?: boolean;
  sought_settlement?: boolean;
  sought_other?: string;
  sought_other_text?: string;
  attachments_json?: string;
  user_name?: string;
  user_email?: string;
  advocate_name?: string;
  advocate_email?: string;
  payment_status?: string | null;
  payment_amount?: number | null;
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

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
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
  const [statistics, setStatistics] = useState<{
    total: number;
    waiting_for_action: number;
    neutrals_needs_to_be_assigned: number;
    consented: number;
    hold: number;
    temporary_non_starter: number;
    completed: number;
  } | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [caseTypeFilter, setCaseTypeFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Status update modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [caseDetailsModalOpen, setCaseDetailsModalOpen] = useState(false);
  const [selectedCaseForDetails, setSelectedCaseForDetails] = useState<Case | null>(null);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [selectedCaseForDocuments, setSelectedCaseForDocuments] = useState<Case | null>(null);
  const [caseDocuments, setCaseDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [markingPayment, setMarkingPayment] = useState<number | null>(null);
  const [editFeesModalOpen, setEditFeesModalOpen] = useState(false);
  const [selectedCaseForFees, setSelectedCaseForFees] = useState<Case | null>(null);
  const [customFees, setCustomFees] = useState<string>('');
  const [updatingFees, setUpdatingFees] = useState(false);
  const [markPaymentModalOpen, setMarkPaymentModalOpen] = useState(false);
  const [selectedCaseForPayment, setSelectedCaseForPayment] = useState<Case | null>(null);
  const [transactionId, setTransactionId] = useState('');

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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
      if (priorityFilter) params.append('priority', priorityFilter);
      if (caseTypeFilter) params.append('case_type', caseTypeFilter);
      if (paymentStatusFilter) params.append('payment_status', paymentStatusFilter);

      const response = await apiFetch(`/api/cases?${params.toString()}`);
      
      if (response.success) {
        setCases(response.data.cases);
        setPagination(response.data.pagination);
        if (response.data.statistics) {
          setStatistics(response.data.statistics);
        }
      } else {
        setError(response.message || 'Failed to fetch cases');
      }
    } catch (err) {
      setError('Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases(1);
  }, [debouncedSearchTerm, statusFilter, priorityFilter, caseTypeFilter, paymentStatusFilter, sortBy, sortOrder, itemsPerPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    fetchCases(page);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
  };

  const handlePriorityFilter = (value: string) => {
    setPriorityFilter(value);
  };

  const handleCaseTypeFilter = (value: string) => {
    setCaseTypeFilter(value);
  };

  const handlePaymentStatusFilter = (value: string) => {
    setPaymentStatusFilter(value);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const handleStatusUpdate = (case_: Case) => {
    setSelectedCase(case_);
    setStatusModalOpen(true);
  };

  const handleViewCase = (case_: Case) => {
    setSelectedCaseForDetails(case_);
    setCaseDetailsModalOpen(true);
  };

  const handleCloseCaseDetailsModal = () => {
    setCaseDetailsModalOpen(false);
    setSelectedCaseForDetails(null);
  };

  const handleViewAttachments = async (case_: Case) => {
    setSelectedCaseForDocuments(case_);
    setLoadingDocuments(true);
    setDocumentsModalOpen(true);
    try {
      const data = await apiFetch(`/api/documents/${case_.id}`);
      if (data.success) {
        setCaseDocuments(data.data);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setCaseDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleCloseDocumentsModal = () => {
    setDocumentsModalOpen(false);
    setSelectedCaseForDocuments(null);
    setCaseDocuments([]);
  };

  const handleStatusUpdated = () => {
    fetchCases(pagination.currentPage);
  };

  // Handle edit fees for a case
  const handleEditFees = (case_: Case) => {
    // Prevent editing fees if payment is already completed
    if (case_.payment_status === 'completed') {
      setError('Cannot edit fees for cases with completed payments');
      return;
    }
    
    setSelectedCaseForFees(case_);
    setCustomFees(case_.fees?.toString() || '');
    setEditFeesModalOpen(true);
  };

  // Handle update fees
  const handleUpdateFees = async () => {
    if (!selectedCaseForFees) return;

    // Prevent updating fees if payment is already completed
    if (selectedCaseForFees.payment_status === 'completed') {
      setError('Cannot edit fees for cases with completed payments');
      setEditFeesModalOpen(false);
      return;
    }

    // If empty or 0, use default ₹3000
    let feesValue = parseFloat(customFees);
    if (isNaN(feesValue) || feesValue <= 0) {
      feesValue = 3000; // Default to ₹3000
    }

    setUpdatingFees(true);
    try {
      const res = await apiFetch<{ success: boolean; data: any; message?: string }>(
        `/api/cases/${selectedCaseForFees.id}`,
        {
          method: 'PUT',
          json: {
            fees: feesValue
          }
        }
      );

      if (res && (res as any).success) {
        setEditFeesModalOpen(false);
        setSelectedCaseForFees(null);
        setCustomFees('');
        await fetchCases(pagination.currentPage);
      } else {
        setError((res as any).message || 'Failed to update fees');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update fees');
    } finally {
      setUpdatingFees(false);
    }
  };

  // Handle close edit fees modal
  const handleCloseEditFeesModal = () => {
    setEditFeesModalOpen(false);
    setSelectedCaseForFees(null);
    setCustomFees('');
  };


  // Handle open mark payment modal
  const handleOpenMarkPaymentModal = (case_: Case) => {
    if (!case_ || case_.status !== 'pending_payment') return;
    setSelectedCaseForPayment(case_);
    setMarkPaymentModalOpen(true);
  };

  // Handle close mark payment modal
  const handleCloseMarkPaymentModal = () => {
    setMarkPaymentModalOpen(false);
    setSelectedCaseForPayment(null);
    setTransactionId('');
  };

  // Handle mark payment as paid
  const handleMarkPaymentPaid = async () => {
    if (!selectedCaseForPayment || selectedCaseForPayment.status !== 'pending_payment') return;

    // Use custom fees if set, otherwise default
    const paymentAmount = selectedCaseForPayment.fees && selectedCaseForPayment.fees > 0 ? selectedCaseForPayment.fees : 3000;

    setMarkingPayment(selectedCaseForPayment.id);
    try {
      const res = await apiFetch<{ success: boolean; data: any; message?: string }>(
        '/api/payments/mark-paid',
        {
          method: 'POST',
          json: {
            case_id: selectedCaseForPayment.id,
            amount: paymentAmount,
            transaction_id: transactionId.trim() || undefined,
            notes: 'Manually marked as paid by admin'
          }
        }
      );

      if (res && (res as any).success) {
        setMarkPaymentModalOpen(false);
        setSelectedCaseForPayment(null);
        setTransactionId('');
        await fetchCases(pagination.currentPage);
      } else {
        setError((res as any).message || 'Failed to mark payment as paid');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to mark payment as paid');
    } finally {
      setMarkingPayment(null);
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

  const getPaymentStatusChip = (paymentStatus: string | null | undefined) => {
    if (!paymentStatus) {
      return (
        <Chip
          label="No Payment"
          color="default"
          size="small"
          variant="outlined"
        />
      );
    }

    const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
      completed: { label: 'Paid', color: 'success' },
      pending: { label: 'Pending', color: 'warning' },
      failed: { label: 'Failed', color: 'error' },
      refunded: { label: 'Refunded', color: 'default' }
    };

    const config = statusConfig[paymentStatus] || { label: paymentStatus, color: 'default' as const };

    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        variant={paymentStatus === 'completed' ? 'filled' : 'outlined'}
      />
    );
  };

  return (
    <>
      <Box gap={2} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchCases(pagination.currentPage)}
          disabled={loading}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          component={Link}
          href="/admin/cases/create"
          startIcon={<AddIcon />}
        >
          Create Case
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards - Compact Layout */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3} md={1.71}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {statistics?.total ?? pagination.totalItems}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Total
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3} md={1.71}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h5" component="div" fontWeight="bold" color="info.main">
                  {statistics?.waiting_for_action ?? cases.filter(c => c.status === 'waiting_for_action').length}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Waiting
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3} md={1.71}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h5" component="div" fontWeight="bold" color="warning.main">
                  {statistics?.neutrals_needs_to_be_assigned ?? cases.filter(c => c.status === 'neutrals_needs_to_be_assigned').length}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Needs Assignment
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3} md={1.71}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h5" component="div" fontWeight="bold" color="success.main">
                  {statistics?.consented ?? cases.filter(c => c.status === 'consented').length}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Consented
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3} md={1.71}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h5" component="div" fontWeight="bold" color="success.dark">
                  {statistics?.completed ?? cases.filter(c => ['settled', 'closed_no_consent', 'close_no_settlement', 'withdrawn'].includes(c.status)).length}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Completed
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3} md={1.71}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h5" component="div" fontWeight="bold" color="warning.dark">
                  {statistics?.hold ?? cases.filter(c => c.status === 'hold').length}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  On Hold
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3} md={1.71}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h5" component="div" fontWeight="bold" color="text.secondary">
                  {statistics?.temporary_non_starter ?? cases.filter(c => c.status === 'temporary_non_starter').length}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Non Starter
                </Typography>
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
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  label="Priority"
                  onChange={(e) => handlePriorityFilter(e.target.value)}
                >
                  <MenuItem value="">All Priority</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={paymentStatusFilter}
                  label="Payment Status"
                  onChange={(e) => handlePaymentStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Payments</MenuItem>
                  <MenuItem value="completed">Paid</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
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
                  <TableCell>User</TableCell>
                  <TableCell>Neutral</TableCell>
                  <TableCell 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort('status')}
                  >
                    Status {sortBy === 'status' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort('priority')}
                  >
                    Priority {sortBy === 'priority' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort('created_at')}
                  >
                    Created {sortBy === 'created_at' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : cases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No Cases found
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
                          {case_.tracking_id && (
                            <Typography variant="caption" color="primary" display="block" sx={{ mt: 0.5 }}>
                              Tracking: {case_.tracking_id}
                            </Typography>
                          )}
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
                              User ID: {case_.user_id}
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
                        {getPriorityChip(case_.priority)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(case_.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusChip(case_.payment_status)}
                        {case_.payment_amount && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            ₹{parseFloat(case_.payment_amount.toString()).toFixed(2)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {case_.status === 'pending_payment' && (
                            <Tooltip title="Mark Payment as Paid">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleOpenMarkPaymentModal(case_)}
                                disabled={markingPayment === case_.id}
                              >
                                {markingPayment === case_.id ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <CheckCircleIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewCase(case_)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Attachments">
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={() => handleViewAttachments(case_)}
                            >
                              <AttachFileIcon />
                            </IconButton>
                          </Tooltip>
                          {/* Only show edit fees button if payment is not completed */}
                          {case_.payment_status !== 'completed' && (
                            <Tooltip title="Edit Registration Fees">
                              <IconButton 
                                size="small" 
                                color="warning"
                                onClick={() => handleEditFees(case_)}
                              >
                                <AttachMoneyIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleStatusUpdate(case_)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {case_.status !== 'pending_payment' && (
                            <Tooltip title="Chat">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => router.push(`/admin/chat/${case_.id}`)}
                              >
                                <MessageIcon />
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
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} Cases
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Page {pagination.currentPage} of {pagination.totalPages}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Status Update Modal */}
      {selectedCase && (
        <StatusUpdateModal
          open={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          caseId={selectedCase.id}
          currentStatus={selectedCase.status}
          currentPriority={selectedCase.priority}
          caseTitle={selectedCase.title}
          onStatusUpdated={handleStatusUpdated}
          paymentStatus={selectedCase.payment_status}
          currentTrackingId={selectedCase.tracking_id}
          allowTrackingIdEdit={true}
        />
      )}

      {/* Case Details Modal */}
      {selectedCaseForDetails && (
        <CaseDetailsModal
          open={caseDetailsModalOpen}
          onClose={handleCloseCaseDetailsModal}
          caseDetails={selectedCaseForDetails as any}
        />
      )}

      {/* Documents Modal */}
      {selectedCaseForDocuments && (
        <DocumentsModal
          open={documentsModalOpen}
          onClose={handleCloseDocumentsModal}
          documents={caseDocuments}
          caseId={selectedCaseForDocuments.id}
          loading={loadingDocuments}
        />
      )}

      {/* Edit Fees Modal */}
      <Dialog open={editFeesModalOpen} onClose={handleCloseEditFeesModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Registration Fees
          {selectedCaseForFees && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Case: {selectedCaseForFees.title} (#{selectedCaseForFees.case_number || selectedCaseForFees.id})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Registration Fees (₹)"
              type="number"
              value={customFees}
              onChange={(e) => setCustomFees(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              helperText="Set custom registration fees for this case. Default is ₹3000 if not set."
              inputProps={{
                min: 0,
                step: 0.01
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Default fee: ₹3000. User will see this amount when making payment. Cannot edit fees for cases with completed payments.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditFeesModal} disabled={updatingFees}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateFees} 
            variant="contained" 
            disabled={updatingFees}
            startIcon={updatingFees ? <CircularProgress size={20} /> : null}
          >
            {updatingFees ? 'Updating...' : 'Update Fees'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark Payment as Paid Modal */}
      <Dialog open={markPaymentModalOpen} onClose={handleCloseMarkPaymentModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          Mark Payment as Paid
          {selectedCaseForPayment && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Case: {selectedCaseForPayment.title} (#{selectedCaseForPayment.case_number || selectedCaseForPayment.id})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedCaseForPayment && (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  This action will mark the payment as paid and update the case status to "Waiting For Action".
                </Alert>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Payment Amount:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    ₹{selectedCaseForPayment.fees && selectedCaseForPayment.fees > 0 
                      ? parseFloat(selectedCaseForPayment.fees.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : '3,000.00'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Case Details:
                  </Typography>
                  <Typography variant="body2">
                    <strong>Title:</strong> {selectedCaseForPayment.title}
                  </Typography>
                  <Typography variant="body2">
                    <strong>User:</strong> {selectedCaseForPayment.user_name || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Current Status:</strong> {selectedCaseForPayment.status}
                  </Typography>
                </Box>
                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Transaction ID (Optional)"
                    placeholder="Enter transaction ID or reference number"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    variant="outlined"
                    helperText="Enter the transaction ID or reference number for this payment"
                  />
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMarkPaymentModal} disabled={markingPayment === selectedCaseForPayment?.id}>
            Cancel
          </Button>
          <Button 
            onClick={handleMarkPaymentPaid} 
            variant="contained" 
            color="success"
            disabled={markingPayment === selectedCaseForPayment?.id}
            startIcon={markingPayment === selectedCaseForPayment?.id ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {markingPayment === selectedCaseForPayment?.id ? 'Processing...' : 'Mark as Paid'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
