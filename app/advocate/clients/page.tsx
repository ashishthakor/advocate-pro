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
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
  Message as MessageIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '@/components/AuthProvider';
import { apiFetch } from '@/lib/api-client';
import { useLanguage } from '@/components/LanguageProvider';
import { useRouter } from 'next/navigation';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  cases_count: number;
}

export default function AdvocateClientsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      // Fetch cases assigned to this advocate to get their clients
      const response = await apiFetch('/api/cases');
      
      if (response.success) {
        const cases = response.data.cases || response.data;
        
        // Extract unique clients from assigned cases
        const clientMap = new Map();
        cases.forEach((case_: any) => {
          if (case_.user_id && !clientMap.has(case_.user_id)) {
            clientMap.set(case_.user_id, {
              id: case_.user_id,
              name: case_.user_name || 'Unknown Client',
              email: case_.user_email || '',
              phone: case_.user_phone || '',
              address: case_.user_address || '',
              created_at: case_.created_at,
              cases_count: 1,
            });
          } else if (case_.user_id) {
            const client = clientMap.get(case_.user_id);
            client.cases_count += 1;
          }
        });
        
        setClients(Array.from(clientMap.values()));
      }
    } catch (err) {
      console.error('Fetch clients error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatClient = (clientId: number) => {
    router.push(`/advocate/chat`);
  };

  const handleViewCases = (clientId: number) => {
    router.push(`/advocate/cases`);
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
      {/* Header */}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<AssignmentIcon />}
          onClick={() => router.push('/advocate/cases')}
        >
          View All Cases
        </Button>
        <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={() => fetchClients()}
        disabled={loading}
      >
        {t('cases.refresh')}
      </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search clients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {clients.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Clients
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
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {clients.reduce((sum, client) => sum + client.cases_count, 0)}
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
                  <MessageIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {clients.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Active Chats
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
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {clients.length > 0 ? Math.round(clients.reduce((sum, client) => sum + client.cases_count, 0) / clients.length * 10) / 10 : 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Avg Cases/Client
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Clients Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Client List
          </Typography>

          {filteredClients.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'No clients found matching your search' : 'No clients assigned yet'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Contact Info</TableCell>
                    <TableCell>Cases</TableCell>
                    <TableCell>Member Since</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, width: 40, height: 40 }}>
                            {client.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              {client.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Client ID: {client.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {client.email || 'N/A'}
                            </Typography>
                          </Box>
                          {client.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {client.phone}
                              </Typography>
                            </Box>
                          )}
                          {client.address && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {client.address}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${client.cases_count} case${client.cases_count !== 1 ? 's' : ''}`}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(client.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Cases">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewCases(client.id)}
                            >
                              <AssignmentIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chat">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleChatClient(client.id)}
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
    </Box>
  );
}
