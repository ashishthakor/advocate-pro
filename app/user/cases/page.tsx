'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Pagination as MuiPagination,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon, Message as MessageIcon, Visibility as VisibilityIcon, Payment as PaymentIcon } from '@mui/icons-material';
import { useLanguage } from '@/components/LanguageProvider';
import CaseDetailsModal from '@/components/CaseDetailsModal';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { useDebounce, CASE_STATUS_CONFIG, getStatusConfig } from '@/lib/utils';

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
  user_name?: string;
  advocate_name?: string;
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

export default function UserCasesPage() {
  const router = useRouter();
  const { t } = useLanguage();
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
  
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);
  const [paymentError, setPaymentError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [caseTypeFilter, setCaseTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      if (caseTypeFilter) params.append('case_type', caseTypeFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

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

  useEffect(() => {
    fetchCases(1);
  }, [debouncedSearchTerm, statusFilter, caseTypeFilter, priorityFilter, sortBy, sortOrder, itemsPerPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    fetchCases(page);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
  };

  const handleCaseTypeFilter = (value: string) => {
    setCaseTypeFilter(value);
  };

  const handlePriorityFilter = (value: string) => {
    setPriorityFilter(value);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const handleViewDetails = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCase(null);
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

  // Load Razorpay script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle retry payment for pending payment cases
  const handleRetryPayment = async (caseItem: Case) => {
    if (!caseItem || caseItem.status !== 'pending_payment') return;

    setProcessingPayment(caseItem.id);
    setPaymentError('');

    try {
      // Create payment order for existing case
      const paymentRes = await apiFetch<{ success: boolean; data: any; message?: string }>(
        '/api/payments/create-order',
        {
          method: 'POST',
          json: {
            description: 'Case Registration Fee',
            case_id: caseItem.id
            // Amount will be determined by API based on case custom fees or default
          }
        }
      );

      if (!paymentRes || !(paymentRes as any).success || !(paymentRes as any).data) {
        setPaymentError((paymentRes as any)?.message || 'Failed to create payment order');
        setProcessingPayment(null);
        return;
      }

      const paymentOrder = (paymentRes as any).data;

      // Load Razorpay script
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        setPaymentError('Failed to load payment gateway. Please refresh the page.');
        setProcessingPayment(null);
        return;
      }

      // Initialize Razorpay checkout
      const options = {
        key: paymentOrder.key_id,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Arbitalk',
        description: paymentOrder.description,
        order_id: paymentOrder.order_id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyRes = await apiFetch<{ success: boolean; data: any; message?: string }>(
              '/api/payments/verify',
              {
                method: 'POST',
                json: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                }
              }
            );

            if (verifyRes && (verifyRes as any).success && (verifyRes as any).data) {
              const updatedCase = (verifyRes as any).data.case;
              
              if (updatedCase && updatedCase.id) {
                // Refresh cases list and redirect to chat
                await fetchCases(pagination.currentPage);
                router.push(`/user/chat/${updatedCase.id}`);
              } else {
                setPaymentError('Payment successful but case update failed. Please contact support.');
                await fetchCases(pagination.currentPage);
              }
            } else {
              setPaymentError((verifyRes as any)?.message || 'Payment verification failed. Please try again.');
              await fetchCases(pagination.currentPage);
            }
          } catch (err: any) {
            setPaymentError(err?.message || 'Failed to verify payment');
            await fetchCases(pagination.currentPage);
          } finally {
            setProcessingPayment(null);
          }
        },
        prefill: {
          name: paymentOrder.name,
          email: paymentOrder.email,
          contact: paymentOrder.contact,
        },
        theme: {
          color: '#1976d2',
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(null);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', (response: any) => {
        setPaymentError('Payment failed. Please try again.');
        setProcessingPayment(null);
        fetchCases(pagination.currentPage);
      });
      razorpay.open();
    } catch (err: any) {
      setPaymentError(err?.message || 'Failed to process payment');
      setProcessingPayment(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        {/* <Typography variant="h4" component="h1">
          {t('cases.title')}
        </Typography> */}
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          disabled={loading}
          onClick={() => fetchCases(pagination.currentPage)}
        >
          {t('cases.refresh')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      {paymentError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setPaymentError('')}>
          {paymentError}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder={t('cases.search')}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{ 
                  startAdornment: (
                    <InputAdornment position="start"><SearchIcon /></InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('cases.status')}</InputLabel>
                <Select
                  value={statusFilter}
                  label={t('cases.status')}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
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
                <InputLabel>{t('cases.type')}</InputLabel>
                <Select
                  value={caseTypeFilter}
                  label={t('cases.type')}
                  onChange={(e) => handleCaseTypeFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="property">Property</MenuItem>
                  <MenuItem value="criminal">Criminal</MenuItem>
                  <MenuItem value="family">Family</MenuItem>
                  <MenuItem value="civil">Civil</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
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
                    onClick={() => handleSort('case_number')}
                  >
                    {t('cases.caseNumber')} {sortBy === 'case_number' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort('title')}
                  >
                    {t('cases.caseTitle')} {sortBy === 'title' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort('status')}
                  >
                    {t('dashboard.status')} {sortBy === 'status' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort('priority')}
                  >
                    {t('dashboard.priority')} {sortBy === 'priority' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort('created_at')}
                  >
                    {t('cases.created')} {sortBy === 'created_at' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell>{t('cases.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : cases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('cases.noCases')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  cases.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{c.case_number || c.id}</Typography>
                          {c.tracking_id && (
                            <Typography variant="caption" color="primary" display="block" sx={{ mt: 0.5 }}>
                              Tracking: {c.tracking_id}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{c.title}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(c.status)}
                      </TableCell>
                      <TableCell>
                        {getPriorityChip(c.priority)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(c.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {c.status === 'pending_payment' && (
                            <Tooltip title="Complete Payment">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleRetryPayment(c)}
                                disabled={processingPayment === c.id}
                              >
                                {processingPayment === c.id ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <PaymentIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title={t('cases.viewDetails')}>
                            <IconButton size="small" onClick={() => handleViewDetails(c)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          {c.status !== 'pending_payment' && (
                            <Tooltip title={t('cases.chat')}>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => router.push(`/user/chat/${c.id}`)}
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
              <MuiPagination
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

      {/* Case Details Modal */}
      {selectedCase && (
        <CaseDetailsModal
          open={modalOpen}
          onClose={handleCloseModal}
          caseDetails={selectedCase}
        />
      )}
    </Box>
  );
}


