'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { fetchCaseNotices, NoticeItem } from '@/store/slices/noticesSlice';
import { RootState } from '@/store/rootReducer';
import NoticeStageBadge from './NoticeStageBadge';

interface NoticesSectionProps {
  caseId: number;
  caseNumber?: string;
  caseTitle?: string;
  expanded: boolean; // Controlled by parent
  onAddNotice?: () => void;
  onEditNotice?: (notice: NoticeItem) => void;
  onDeleteNotice?: (notice: NoticeItem) => void;
  showActions?: boolean;
}

export default function NoticesSection({
  caseId,
  caseNumber,
  caseTitle,
  expanded,
  onAddNotice,
  onEditNotice,
  onDeleteNotice,
  showActions = true,
}: NoticesSectionProps) {
  const dispatch = useDispatch();
  const caseNotices = useSelector((state: RootState) => state.notices.noticesByCase[caseId]);

  // Load notices when expanded
  useEffect(() => {
    if (expanded && !caseNotices) {
      dispatch(fetchCaseNotices(caseId));
    }
  }, [expanded, caseId, caseNotices, dispatch]);

  const notices = caseNotices?.notices || [];
  const loading = caseNotices?.loading || false;
  const error = caseNotices?.error || null;

  const handleDownload = async (notice: NoticeItem) => {
    try {
      const response = await fetch(`/api/notices/${notice.id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = notice.pdf_filename || `notice_${notice.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error downloading notice:', err);
    }
  };

  // Group notices by number for display (first 3 separately, rest grouped)
  const noticesByNumber = notices.reduce((acc: Record<number, NoticeItem[]>, notice: NoticeItem) => {
    const num = notice.notice_number || 1;
    if (!acc[num]) {
      acc[num] = [];
    }
    acc[num].push(notice);
    return acc;
  }, {});

  const noticeCounts = {
    total: notices.length,
    firstThree: {
      1: noticesByNumber[1]?.length || 0,
      2: noticesByNumber[2]?.length || 0,
      3: noticesByNumber[3]?.length || 0,
    },
    others: Object.keys(noticesByNumber).filter(n => parseInt(n) > 3).length
  };

  if (!expanded) {
    return null;
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <DescriptionIcon color="primary" />
        <Typography variant="h6">Notices</Typography>
        {noticeCounts.total > 0 && (
          <Chip
            label={`${noticeCounts.total} Notice${noticeCounts.total !== 1 ? 's' : ''}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
        {noticeCounts.firstThree[1] > 0 && <NoticeStageBadge number={1} />}
        {noticeCounts.firstThree[2] > 0 && <NoticeStageBadge number={2} />}
        {noticeCounts.firstThree[3] > 0 && <NoticeStageBadge number={3} />}
        {noticeCounts.others > 0 && (
          <Chip
            label={`+${noticeCounts.others} more`}
            size="small"
            variant="outlined"
          />
        )}
        {showActions && onAddNotice && (
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddNotice}
            sx={{ ml: 'auto' }}
          >
            Add Notice
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : notices.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No notices found for this case.
          </Typography>
          {showActions && onAddNotice && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onAddNotice}
              sx={{ mt: 2 }}
            >
              Create First Notice
            </Button>
          )}
        </Box>
      ) : (
        <Box>
          {/* Display notices in sequential order */}
          {notices.map((notice) => (
            <Box key={notice.id} sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <NoticeStageBadge number={notice.notice_number || 1} size="small" />
                            <Typography variant="subtitle2" fontWeight="bold">
                              {notice.subject || 'Notice'}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {notice.date ? new Date(notice.date).toLocaleDateString() : 'No date'}
                          </Typography>
                        </Box>
                        {showActions && (
                          <Box>
                            {notice.pdf_filename && (
                              <Tooltip title="Download PDF">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDownload(notice)}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {onEditNotice && (
                              <Tooltip title="Edit Notice">
                                <IconButton
                                  size="small"
                                  onClick={() => onEditNotice(notice)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {onDeleteNotice && (
                              <Tooltip title="Delete Notice">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => onDeleteNotice(notice)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Respondent:</strong> {notice.respondent_name}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {notice.email_sent && (
                          <Chip
                            icon={<EmailIcon />}
                            label="Email Sent"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                        {notice.recipient_email && (
                          <Chip
                            label={notice.recipient_email}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
