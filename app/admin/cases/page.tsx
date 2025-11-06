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
} from '@mui/icons-material';
import { apiFetch } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useDebounce, CASE_STATUS_CONFIG, getStatusConfig } from '@/lib/utils';
import StatusUpdateModal from '@/components/StatusUpdateModal';
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
  respondent_name?: string;
  respondent_email?: string;
  respondent_phone?: string;
  respondent_address?: string;
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
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [caseTypeFilter, setCaseTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Status update modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [caseDetailsModalOpen, setCaseDetailsModalOpen] = useState(false);
  const [selectedCaseForDetails, setSelectedCaseForDetails] = useState<Case | null>(null);

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

  const handleStatusUpdated = () => {
    fetchCases(pagination.currentPage);
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

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchCases(pagination.currentPage)}
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
                  <FolderIcon />
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
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {cases.filter(c => c.status === 'waiting_for_action').length}
                  </Typography>
                  <Typography color="text.secondary">
                    Waiting For Action
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
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {cases.filter(c => c.status === 'neutrals_needs_to_be_assigned').length}
                  </Typography>
                  <Typography color="text.secondary">
                    Neutrals Needs Assignment
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
                  <MessageIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {cases.filter(c => ['settled', 'closed_no_consent', 'close_no_settlement', 'withdrawn'].includes(c.status)).length}
                  </Typography>
                  <Typography color="text.secondary">
                    Completed Cases
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
                  <TableCell>Advocate</TableCell>
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
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewCase(case_)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Update Status">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleStatusUpdate(case_)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chat">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => router.push(`/admin/chat/${case_.id}`)}
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
    </>
  );
}
