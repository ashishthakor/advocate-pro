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
import { Search as SearchIcon, Refresh as RefreshIcon, Message as MessageIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
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
                    Case No. {sortBy === 'case_number' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort('title')}
                  >
                    Title {sortBy === 'title' && (sortOrder === 'ASC' ? '↑' : '↓')}
                  </TableCell>
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
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : cases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No cases found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  cases.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>{c.case_number || c.id}</TableCell>
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
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewDetails(c)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chat">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => router.push(`/user/chat/${c.id}`)}
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


