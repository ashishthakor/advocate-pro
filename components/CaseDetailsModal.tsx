'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  Paper,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useLanguage } from '@/components/LanguageProvider';
import { getCapitalizedString, getStatusConfig } from '@/lib/utils';
import DocumentsModal from '@/components/DocumentsModal';

interface CaseDetails {
  id: number;
  case_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  case_type: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  advocate_id?: number;
  tracking_id?: string | null;
  court_name?: string;
  judge_name?: string;
  next_hearing_date?: string | null;
  fees?: number;
  fees_paid?: number;
  start_date?: string | null;
  end_date?: string | null;
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
  occurrence_date?: string | null;
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
  transaction_id?: string | null;
  marked_by_name?: string | null;
}

interface CaseDetailsModalProps {
  open: boolean;
  onClose: () => void;
  caseDetails: CaseDetails | null;
}

export default function CaseDetailsModal({ open, onClose, caseDetails }: CaseDetailsModalProps) {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);

  useEffect(() => {
    if (open && caseDetails?.id) {
      fetchDocuments();
    }
  }, [open, caseDetails?.id]);

  const fetchDocuments = async () => {
    if (!caseDetails?.id) return;
    setLoadingDocuments(true);
    try {
      const response = await fetch(`/api/documents/${caseDetails.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  if (!caseDetails) {
    return null;
  }

  const getStatusColor = (status: string) => {
    const config = getStatusConfig(status);
    return config.color;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      urgent: 'error',
    } as const;
    return colors[priority as keyof typeof colors] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const config = getStatusConfig(status);
    return config.label;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: 3,
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 20px 40px rgba(0,0,0,0.5)'
            : '0 20px 40px rgba(0,0,0,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: '12px 12px 0 0',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #64b5f6, #42a5f5)'
                : 'linear-gradient(45deg, #1976d2, #1565c0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('caseDetails.title')}
          </Typography>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{
              color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#666',
              '&:hover': {
                background: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'rgba(0,0,0,0.04)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent 
        dividers
        sx={{ 
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          p: 3,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={getStatusLabel(caseDetails.status)}
              color={getStatusColor(caseDetails.status) as any}
              size="small"
            />
            <Chip
              label={getCapitalizedString(caseDetails.priority)}
              color={getPriorityColor(caseDetails.priority) as any}
              size="small"
            />
            <Chip
              label={getCapitalizedString(caseDetails.case_type)}
              color="info"
              size="small"
            />
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
              fontWeight: 500,
            }}
          >
            Case Number: {caseDetails.case_number}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
              fontWeight: 500,
            }}
          >
            Created: {new Date(caseDetails.created_at).toLocaleDateString()}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Case Information */}
        <Paper sx={{ 
          p: 3, 
          mb: 3,
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <Typography variant="h6" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: (theme) => theme.palette.mode === 'dark' ? '#64b5f6' : '#1976d2',
            fontWeight: 'bold',
          }}>
            <DescriptionIcon color="primary" />
            {t('caseDetails.caseInformation')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                fontWeight: 500,
                mb: 0.5,
              }}>{t('caseDetails.caseNumber')}</Typography>
              <Typography variant="body1" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#000',
                fontWeight: 600,
              }}>{caseDetails.case_number}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                fontWeight: 500,
                mb: 0.5,
              }}>Tracking ID</Typography>
              <Typography variant="body1" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#000',
                fontWeight: 600,
              }}>{caseDetails.tracking_id || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                fontWeight: 500,
                mb: 0.5,
              }}>{t('caseDetails.title')}</Typography>
              <Typography variant="body1" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#000',
                fontWeight: 600,
              }}>{caseDetails.title}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                fontWeight: 500,
                mb: 0.5,
              }}>{t('caseDetails.description')}</Typography>
              <Typography variant="body1" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                lineHeight: 1.6,
              }}>{caseDetails.description || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                fontWeight: 500,
                mb: 0.5,
              }}>{t('caseDetails.courtName')}</Typography>
              <Typography variant="body1" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
              }}>{caseDetails.court_name || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                fontWeight: 500,
                mb: 0.5,
              }}>{t('caseDetails.judgeName')}</Typography>
              <Typography variant="body1" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
              }}>{caseDetails.judge_name || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                fontWeight: 500,
                mb: 0.5,
              }}>{t('caseDetails.nextHearingDate')}</Typography>
              <Typography variant="body1" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
              }}>
                {caseDetails.next_hearing_date ? new Date(caseDetails.next_hearing_date).toLocaleDateString() : '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                fontWeight: 500,
                mb: 0.5,
              }}>{t('caseDetails.startDate')}</Typography>
              <Typography variant="body1" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
              }}>
                {caseDetails.start_date ? new Date(caseDetails.start_date).toLocaleDateString() : '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                fontWeight: 500,
                mb: 0.5,
              }}>{t('caseDetails.endDate')}</Typography>
              <Typography variant="body1" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
              }}>
                {caseDetails.end_date ? new Date(caseDetails.end_date).toLocaleDateString() : '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                fontWeight: 500,
                mb: 0.5,
              }}>{t('caseDetails.updatedAt')}</Typography>
              <Typography variant="body1" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
              }}>
                {caseDetails.updated_at ? new Date(caseDetails.updated_at).toLocaleDateString() : '-'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Financial Information */}
        <Paper sx={{ 
          p: 3, 
          mb: 3,
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <Typography variant="h6" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: (theme) => theme.palette.mode === 'dark' ? '#4caf50' : '#2e7d32',
            fontWeight: 'bold',
          }}>
            <BusinessIcon color="success" />
            {t('caseDetails.financialInformation')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                fontWeight: 500,
                mb: 0.5,
              }}>{t('caseDetails.totalFees')}</Typography>
               <Typography variant="h6" sx={{ 
                 color: (theme) => theme.palette.mode === 'dark' ? '#4caf50' : '#2e7d32',
                 fontWeight: 'bold',
               }}>₹{caseDetails.fees || 0}</Typography>
             </Grid>
             <Grid item xs={12} sm={6}>
               <Typography variant="body2" sx={{ 
                 color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                 fontWeight: 500,
                 mb: 0.5,
               }}>{t('caseDetails.feesPaid')}</Typography>
               <Typography variant="h6" sx={{ 
                 color: (theme) => theme.palette.mode === 'dark' ? '#64b5f6' : '#1976d2',
                 fontWeight: 'bold',
               }}>₹{caseDetails.fees_paid || 0}</Typography>
             </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>Transaction ID</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}>{caseDetails.transaction_id || "-"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>Marked as Paid By</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                  fontWeight: 600,
                }}>{caseDetails.marked_by_name || "-"}</Typography>
              </Grid>
             {/* <Grid item xs={12} sm={6}>
               <Typography variant="body2" sx={{ 
                 color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                 fontWeight: 500,
                 mb: 0.5,
               }}>{t('caseDetails.outstandingAmount')}</Typography>
               <Typography variant="h6" sx={{ 
                 color: (caseDetails.fees || 0) - (caseDetails.fees_paid || 0) > 0 
                   ? (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f'
                   : (theme) => theme.palette.mode === 'dark' ? '#4caf50' : '#2e7d32',
                 fontWeight: 'bold',
               }}>
                 ₹{(caseDetails.fees || 0) - (caseDetails.fees_paid || 0)}
               </Typography>
            </Grid> */}
          </Grid>
        </Paper>

        {/* Dispute Information */}
        <Paper sx={{ 
          p: 3, 
          mb: 3,
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <Typography variant="h6" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: (theme) => theme.palette.mode === 'dark' ? '#ff9800' : '#f57c00',
            fontWeight: 'bold',
          }}>
            <DescriptionIcon color="warning" />
            {t('caseDetails.disputeInformation')}
          </Typography>
          
          {/* Requesting Party */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ 
              color: (theme) => theme.palette.mode === 'dark' ? '#64b5f6' : '#1976d2',
              fontWeight: 'bold',
              mb: 1,
            }}>
              {t('caseDetails.requestingParty')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.name')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                }}>{caseDetails.requester_name || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.email')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                }}>{caseDetails.requester_email || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.phone')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                }}>{caseDetails.requester_phone || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.address')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                }}>{caseDetails.requester_address || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.businessName')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                }}>{caseDetails.requester_business_name || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.gstNumber')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                }}>{caseDetails.requester_gst_number || '-'}</Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Respondent */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ 
              color: (theme) => theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f',
              fontWeight: 'bold',
              mb: 1,
            }}>
              {t('caseDetails.respondent')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.name')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                }}>{caseDetails.respondent_name || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.email')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                }}>{caseDetails.respondent_email || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.phone')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                }}>{caseDetails.respondent_phone || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.address')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                }}>{caseDetails.respondent_address || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.businessName')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                }}>{caseDetails.respondent_business_name || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.gstNumber')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                }}>{caseDetails.respondent_gst_number || '-'}</Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Dispute Details */}
          <Box>
            <Typography variant="subtitle1" sx={{ 
              color: (theme) => theme.palette.mode === 'dark' ? '#9c27b0' : '#7b1fa2',
              fontWeight: 'bold',
              mb: 1,
            }}>
              {t('caseDetails.disputeDetails')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.relationshipBetweenParties')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                }}>{caseDetails.relationship_between_parties || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.natureOfDispute')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                }}>
                  {caseDetails.nature_of_dispute ? (() => {
                    return caseDetails.nature_of_dispute;
                  })() : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.briefDescription')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                  lineHeight: 1.6,
                }}>{caseDetails.brief_description_of_dispute || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.occurrenceDate')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                }}>
                  {caseDetails.occurrence_date ? new Date(caseDetails.occurrence_date).toLocaleDateString() : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.priorCommunication')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                }}>
                  {caseDetails.prior_communication || '-'}
                  {caseDetails.prior_communication_other && ` - ${caseDetails.prior_communication_other}`}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Relief Sought */}
        <Paper sx={{ 
          p: 3, 
          mb: 3,
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <Typography variant="h6" gutterBottom sx={{ 
            color: (theme) => theme.palette.mode === 'dark' ? '#4caf50' : '#2e7d32',
            fontWeight: 'bold',
          }}>
            {t('caseDetails.reliefSought')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                fontWeight: 500,
                mb: 1,
              }}>{t('caseDetails.monetaryClaim')}</Typography>
              <Chip 
                label={caseDetails.sought_monetary_claim ? t('caseDetails.yes') : t('caseDetails.no')} 
                color={caseDetails.sought_monetary_claim ? "success" : "default"} 
                sx={{ fontWeight: 'bold' }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                fontWeight: 500,
                mb: 1,
              }}>{t('caseDetails.settlement')}</Typography>
              <Chip 
                label={caseDetails.sought_settlement ? t('caseDetails.yes') : t('caseDetails.no')} 
                color={caseDetails.sought_settlement ? "info" : "default"} 
                sx={{ fontWeight: 'bold' }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                fontWeight: 500,
                mb: 1,
              }}>{t('caseDetails.otherRelief')}</Typography>
              <Chip 
                label={caseDetails.sought_other || t('caseDetails.none')} 
                color={caseDetails.sought_other ? "warning" : "default"} 
                sx={{ fontWeight: 'bold' }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                fontWeight: 500,
                mb: 0.5,
              }}>{t('caseDetails.otherReliefDetails')}</Typography>
              <Typography variant="body1" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                lineHeight: 1.6,
              }}>{caseDetails.sought_other_text || '-'}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Case Team */}
        <Paper sx={{ 
          p: 3,
          mb: 3,
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <Typography variant="h6" gutterBottom sx={{ 
            color: (theme) => theme.palette.mode === 'dark' ? '#64b5f6' : '#1976d2',
            fontWeight: 'bold',
          }}>{t('caseDetails.caseTeam')}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                fontWeight: 500,
                mb: 0.5,
              }}>{t('caseDetails.client')}</Typography>
              <Typography variant="body1" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                fontWeight: 600,
              }}>{caseDetails.user_name}</Typography>
              <Typography variant="body2" sx={{ 
                color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
              }}>{caseDetails.user_email}</Typography>
            </Grid>
            {caseDetails.advocate_name ? (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.advocate')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                  fontWeight: 600,
                }}>{caseDetails.advocate_name}</Typography>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                }}>{caseDetails.advocate_email}</Typography>
              </Grid>
            ) : (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                  fontWeight: 500,
                  mb: 0.5,
                }}>{t('caseDetails.advocate')}</Typography>
                <Typography variant="body1" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
                  fontWeight: 600,
                }}>-</Typography>
                <Typography variant="body2" sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
                }}>Not assigned</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Attachments */}
        <Paper sx={{ 
          p: 3,
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ 
              color: (theme) => theme.palette.mode === 'dark' ? '#ff9800' : '#f57c00',
              fontWeight: 'bold',
            }}>
              {t('caseDetails.attachments')}
            </Typography>
            {documents.length > 0 && (
              <Chip
                icon={<AttachFileIcon />}
                label={`${documents.length} Document${documents.length > 1 ? 's' : ''}`}
                onClick={() => setDocumentsModalOpen(true)}
                color="primary"
                variant="outlined"
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                  },
                }}
              />
            )}
          </Box>
          {loadingDocuments ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : documents.length === 0 ? (
            <Typography variant="body1" sx={{ 
              color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
              lineHeight: 1.6,
            }}>
              {t('caseDetails.noAttachments')}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ 
              color: (theme) => theme.palette.mode === 'dark' ? '#b0b0b0' : '#666',
              lineHeight: 1.6,
            }}>
              Click the chip above to view and download all {documents.length} document{documents.length > 1 ? 's' : ''}.
            </Typography>
          )}
        </Paper>
      </DialogContent>
      
      <DialogActions sx={{ 
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: '0 0 12px 12px',
        p: 2,
      }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            fontWeight: 'bold',
            borderRadius: 2,
            px: 3,
            py: 1,
            borderColor: (theme) => theme.palette.mode === 'dark' ? '#666' : '#ccc',
            color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333',
            '&:hover': {
              borderColor: (theme) => theme.palette.mode === 'dark' ? '#999' : '#999',
              background: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(0,0,0,0.04)',
            }
          }}
        >
                {t('caseDetails.close')}
              </Button>
              {/* <Button
                variant="contained"
                color="primary"
                sx={{
                  fontWeight: 'bold',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #64b5f6, #42a5f5)'
                    : 'linear-gradient(45deg, #1976d2, #1565c0)',
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 4px 15px rgba(100, 181, 246, 0.3)'
                    : '0 4px 15px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    background: (theme) => theme.palette.mode === 'dark'
                      ? 'linear-gradient(45deg, #42a5f5, #2196f3)'
                      : 'linear-gradient(45deg, #1565c0, #0d47a1)',
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                      ? '0 6px 20px rgba(100, 181, 246, 0.4)'
                      : '0 6px 20px rgba(25, 118, 210, 0.4)',
                  }
                }}
              >
                {t('caseDetails.chatWithAdvocate')}
        </Button> */}
      </DialogActions>

      {/* Documents Modal */}
      {caseDetails && (
        <DocumentsModal
          open={documentsModalOpen}
          onClose={() => setDocumentsModalOpen(false)}
          documents={documents}
          caseId={caseDetails.id}
          loading={loadingDocuments}
        />
      )}
    </Dialog>
  );
}

