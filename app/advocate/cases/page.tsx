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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Message as MessageIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  AttachFile as AttachFileIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { apiFetch } from '@/lib/api-client';
import { useDebounce, CASE_STATUS_CONFIG, getStatusConfig } from '@/lib/utils';
import CaseDetailsModal from '@/components/CaseDetailsModal';
import DocumentsModal from '@/components/DocumentsModal';
import StatusUpdateModal from '@/components/StatusUpdateModal';

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

export default function AdvocateCasesPage() {
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
  const [caseDetailsModalOpen, setCaseDetailsModalOpen] = useState(false);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [selectedCaseForDocuments, setSelectedCaseForDocuments] = useState<Case | null>(null);
  const [caseDocuments, setCaseDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedCaseForEdit, setSelectedCaseForEdit] = useState<Case | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [caseTypeFilter, setCaseTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

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
  }, [debouncedSearchTerm, statusFilter, priorityFilter, caseTypeFilter, sortBy, sortOrder, itemsPerPage]);

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

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCaseClick = (caseId: number) => {
    router.push(`/advocate/chat/${caseId}`);
  };

  const handleViewDetails = (caseId: number) => {
    const case_ = cases.find(c => c.id === caseId);
    if (case_) {
      setSelectedCase(case_);
      setCaseDetailsModalOpen(true);
    }
  };

  const handleCloseCaseDetails = () => {
    setCaseDetailsModalOpen(false);
    setSelectedCase(null);
  };

  const handleViewAttachments = async (caseId: number) => {
    const case_ = cases.find(c => c.id === caseId);
    if (!case_) return;
    setSelectedCaseForDocuments(case_);
    setLoadingDocuments(true);
    setDocumentsModalOpen(true);
    try {
      const data = await apiFetch(`/api/documents/${caseId}`);
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

  const handleEditCase = (caseId: number) => {
    const case_ = cases.find(c => c.id === caseId);
    if (case_) {
      setSelectedCaseForEdit(case_);
      setStatusModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setStatusModalOpen(false);
    setSelectedCaseForEdit(null);
  };

  const handleCaseUpdated = () => {
    fetchCases(pagination.currentPage);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchCases(pagination.currentPage)}
          disabled={loading}
        >
          {t('cases.refresh')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder={t('cases.searchCases')}
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
                <InputLabel>{t('cases.status')}</InputLabel>
                <Select
                  value={statusFilter}
                  label={t('cases.status')}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                >
                  <MenuItem value="">{t('cases.allStatuses')}</MenuItem>
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
                <InputLabel>{t('cases.priority')}</InputLabel>
                <Select
                  value={priorityFilter}
                  label={t('cases.priority')}
                  onChange={(e) => handlePriorityFilter(e.target.value)}
                >
                  <MenuItem value="">All Priority</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
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
                    Case No. {sortBy === 'case_number' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort('title')}
                  >
                    Title {sortBy === 'title' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell>User</TableCell>
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
                      <Box textAlign="center" py={4}>
                        <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          {searchTerm || statusFilter ? t('cases.noCasesFound') : t('cases.noAssignedCases')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm || statusFilter ? t('cases.tryDifferentSearch') : t('cases.waitForAssignment')}
                        </Typography>
                      </Box>
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
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {c.user_name || 'N/A'}
                            </Typography>
                          </Box>
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
                          {formatDate(c.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small"
                              onClick={() => handleViewDetails(c.id)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Attachments">
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={() => handleViewAttachments(c.id)}
                            >
                              <AttachFileIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEditCase(c.id)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chat">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleCaseClick(c.id)}
                            >
                              <MessageIcon />
                            </IconButton>
                          </Tooltip>
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
          open={caseDetailsModalOpen}
          onClose={handleCloseCaseDetails}
          caseDetails={selectedCase as any}
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

      {/* Edit Case Modal */}
      {selectedCaseForEdit && (
        <StatusUpdateModal
          open={statusModalOpen}
          onClose={handleCloseEditModal}
          caseId={selectedCaseForEdit.id}
          currentStatus={selectedCaseForEdit.status}
          currentPriority={selectedCaseForEdit.priority}
          caseTitle={selectedCaseForEdit.title}
          onStatusUpdated={handleCaseUpdated}
          currentTrackingId={selectedCaseForEdit.tracking_id}
          allowTrackingIdEdit={true}
        />
      )}
    </Box>
  );
}
