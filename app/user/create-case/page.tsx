'use client';

import React, { useState } from 'react';
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
  Divider,
  Chip,
  Stack,
  IconButton,
  Snackbar,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  Image as ImageIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { RadioGroup, FormControlLabel, Radio, FormGroup, Checkbox, InputLabel } from '@mui/material';
import { useLanguage } from '@/components/LanguageProvider';

interface CreateCaseForm {
  // Case basic info
  title: string;
  description: string;
  case_type: string;
  priority: string;
  court_name: string;
  judge_name: string;
  next_hearing_date: string;
  fees: string;
  fees_paid: string;
  start_date: string;
  end_date: string;
  
  // Requesting party
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  requester_address: string;

  // Respondent
  respondent_name: string;
  respondent_phone: string;
  respondent_email: string;
  respondent_address: string;

  // Dispute details
  relationship_between_parties: 'Client' | 'Vendor' | 'Business Partner' | 'Employee' | 'Employer' | 'Family' | '';
  nature_of_dispute: 'Commercial & Business Disputes' | 'E-Commerce & Consumer Complaints' | 'Real Estate & Property' | 'Employment & Workplace' | 'Financial & Banking' | 'Government / Public Sector' | 'Cross-Border / International' | 'Family & Civil' | 'Technology & Digital' | '';
  brief_description_of_dispute: string;
  occurrence_date: string; // yyyy-MM-dd

  // Prior communication
  prior_communication: 'Yes' | 'No' | 'Other' | '';
  prior_communication_other: string;

  // Relief sought
  sought_monetary_claim: boolean;
  sought_settlement: boolean;
  sought_other: boolean;
  sought_other_text: string;
}

const NATURE_OF_DISPUTE_OPTIONS = [
  'Commercial & Business Disputes',
  'E-Commerce & Consumer Complaints',
  'Real Estate & Property',
  'Employment & Workplace',
  'Financial & Banking',
  'Government / Public Sector',
  'Cross-Border / International',
  'Family & Civil',
  'Technology & Digital',
] as const;

export default function CreateCasePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const MAX_FILES = 5;
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  const [form, setForm] = useState<CreateCaseForm>({
    title: '',
    description: '',
    case_type: 'civil',
    priority: 'medium',
    court_name: '',
    judge_name: '',
    next_hearing_date: '',
    fees: '0.00',
    fees_paid: '0.00',
    start_date: '',
    end_date: '',
    requester_name: '',
    requester_email: '',
    requester_phone: '',
    requester_address: '',

    respondent_name: '',
    respondent_phone: '',
    respondent_email: '',
    respondent_address: '',

    relationship_between_parties: '',
    nature_of_dispute: '',
    brief_description_of_dispute: '',
    occurrence_date: '',

    prior_communication: '',
    prior_communication_other: '',

    sought_monetary_claim: false,
    sought_settlement: false,
    sought_other: false,
    sought_other_text: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dropZoneRef = React.useRef<HTMLDivElement>(null);

  const isEmail = (v: string) => /.+@.+\..+/.test(v);
  const isRequiredFilled = (
    form.title &&
    form.description &&
    form.requester_name &&
    isEmail(form.requester_email) &&
    form.requester_phone &&
    form.requester_address &&
    form.relationship_between_parties &&
    form.nature_of_dispute &&
    form.brief_description_of_dispute
  );

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon />;
    if (fileType === 'application/pdf') return <PdfIcon />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <ExcelIcon />;
    if (fileType.includes('word') || fileType.includes('document')) return <DocIcon />;
    return <AttachFileIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const validateAndAddFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];
    let nextError = '';

    for (const file of newFiles) {
      // Check file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        nextError = nextError || `${file.name} exceeds maximum size of 10MB`;
        continue;
      }

      // Check file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/rtf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!allowedTypes.includes(file.type)) {
        nextError = nextError || `${file.name} is not a supported file type`;
        continue;
      }

      validFiles.push(file);
    }

    // Check max files limit
    if (files.length + validFiles.length > MAX_FILES) {
      nextError = nextError || `Maximum ${MAX_FILES} files allowed`;
      if (nextError) setError(nextError);
      return;
    }

    setFiles([...files, ...validFiles]);
    if (nextError) setError(nextError);
  };

  const handleChange = (field: keyof CreateCaseForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const uploadAttachments = async (caseId: number): Promise<Array<{ url: string; name: string; size: number; type: string }>> => {
    if (!files.length) return [];
    const uploaded: Array<{ url: string; name: string; size: number; type: string }> = [];
    
    const formData = new FormData();
    files.forEach((f, index) => {
      formData.append(`file-${index}`, f);
    });
    formData.append('caseId', caseId.toString());
    formData.append('folder', 'cases'); // Use 'cases' folder to trigger case folder structure
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (data?.success && data?.data) {
        // data.data is an array of upload results
        data.data.forEach((result: any) => {
          if (result.success) {
            uploaded.push({ url: result.url, name: result.fileName, size: result.fileSize, type: result.mimeType });
          }
        });
      }
    } catch (e) {
      console.error('Upload error:', e);
    }
    return uploaded;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // First create the case
      const payload: any = {
        ...form,
        sought_other: form.sought_other ? form.sought_other_text : '',
        attachments_json: null, // We'll upload files after case creation
      };
      const res = await apiFetch<{ success: boolean; data: any; message?: string }>(
        '/api/cases',
        { method: 'POST', json: payload }
      );

      if (res && (res as any).success && (res as any).data) {
        const created = (res as any).data;
        if (created.id) {
          // Upload documents after case is created
          if (files.length > 0) {
            await uploadAttachments(created.id);
          }
          setSuccessOpen(true);
          setTimeout(() => router.push(`/user/chat/${created.id}`), 600);
          return;
        }
      }
      setError((res as any).message || t('createCase.failedToCreate'));
    } catch (err: any) {
      setError(err?.message || t('createCase.failedToCreate'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => router.back()} size="small"><ArrowBackIcon /></IconButton>
        <Typography variant="h5">{t('createCase.title')}</Typography>
        <Chip label={t('createCase.disputeResolutionApplication')} color="primary" variant="outlined" sx={{ ml: 1 }} />
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>{t('createCase.caseInformation')}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label={t('createCase.caseTitle')}
                  fullWidth
                  required
                  placeholder="Enter a brief title for your case"
                  value={form.title}
                  onChange={handleChange('title')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('createCase.caseDescription')}
                  fullWidth
                  required
                  multiline
                  rows={3}
                  placeholder="Provide a detailed description of your case"
                  value={form.description}
                  onChange={handleChange('description')}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>{t('createCase.requestingParty')}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {/* Requesting Party */}
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('createCase.fullName')}
                  fullWidth
                  required
                  value={form.requester_name}
                  onChange={handleChange('requester_name')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('createCase.email')}
                  type="email"
                  fullWidth
                  required
                  helperText={form.requester_email && !isEmail(form.requester_email) ? t('contact.emailInvalid') : ' '}
                  error={!!form.requester_email && !isEmail(form.requester_email)}
                  value={form.requester_email}
                  onChange={handleChange('requester_email')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('createCase.mobileNumber')}
                  fullWidth
                  required
                  placeholder="e.g., +1 555 123 4567"
                  value={form.requester_phone}
                  onChange={handleChange('requester_phone')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('createCase.address')}
                  fullWidth
                  required
                  value={form.requester_address}
                  onChange={handleChange('requester_address')}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>{t('createCase.oppositeParty')}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('createCase.fullNameOfOppositeParty')}
                  fullWidth
                  value={form.respondent_name}
                  onChange={handleChange('respondent_name')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('createCase.contactNumberOfRespondent')}
                  fullWidth
                  value={form.respondent_phone}
                  onChange={handleChange('respondent_phone')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('createCase.emailOfRespondent')}
                  type="email"
                  fullWidth
                  value={form.respondent_email}
                  onChange={handleChange('respondent_email')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('createCase.addressOfRespondent')}
                  fullWidth
                  value={form.respondent_address}
                  onChange={handleChange('respondent_address')}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>{t('createCase.disputeDetails')}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InputLabel shrink>{t('createCase.relationshipBetweenParties')} *</InputLabel>
                <RadioGroup
                  row
                  value={form.relationship_between_parties}
                  onChange={(e) => setForm((p) => ({ ...p, relationship_between_parties: e.target.value as any }))}
                >
                  {['Client','Vendor','Business Partner','Employee','Employer','Family'].map((opt) => (
                    <FormControlLabel key={opt} value={opt} control={<Radio required />} label={t(`createCase.${opt.toLowerCase().replace(' ', '')}`)} />
                  ))}
                </RadioGroup>
              </Grid>

              {/* Nature of Dispute */}
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('createCase.natureOfDispute')}
                  fullWidth
                  required
                  select
                  value={form.nature_of_dispute}
                  onChange={handleChange('nature_of_dispute')}
                >
                  {NATURE_OF_DISPUTE_OPTIONS.map((option) => {
                    const key = option.toLowerCase().replace(/[&/]/g, '').replace(/\s+/g, '');
                    return (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>

              {/* Brief description */}
              <Grid item xs={12}>
                <TextField
                  label="Brief description of dispute"
                  fullWidth
                  required
                  multiline
                  minRows={3}
                  value={form.brief_description_of_dispute}
                  onChange={handleChange('brief_description_of_dispute')}
                />
              </Grid>

              {/* Date of occurrence */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Date of occurrence of dispute"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.occurrence_date}
                  onChange={handleChange('occurrence_date')}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Prior Communication</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InputLabel shrink>Any prior communication/attempt to resolve *</InputLabel>
                <RadioGroup
                  row
                  value={form.prior_communication}
                  onChange={(e) => setForm((p) => ({ ...p, prior_communication: e.target.value as any }))}
                >
                  {['Yes','No','Other'].map((opt) => (
                    <FormControlLabel key={opt} value={opt} control={<Radio required />} label={opt} />
                  ))}
                </RadioGroup>
                {form.prior_communication === 'Other' && (
                  <TextField
                    sx={{ mt: 1 }}
                    label="Please specify"
                    fullWidth
                    value={form.prior_communication_other}
                    onChange={handleChange('prior_communication_other')}
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Relief Sought</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InputLabel shrink>What is being sought? *</InputLabel>
                <FormGroup row>
                  <FormControlLabel
                    control={<Checkbox checked={form.sought_monetary_claim} onChange={(e) => setForm((p) => ({ ...p, sought_monetary_claim: e.target.checked }))} />}
                    label="Monetary claim"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.sought_settlement} onChange={(e) => setForm((p) => ({ ...p, sought_settlement: e.target.checked }))} />}
                    label="Settlement"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.sought_other} onChange={(e) => setForm((p) => ({ ...p, sought_other: e.target.checked }))} />}
                    label="Other"
                  />
                </FormGroup>
                {form.sought_other && (
                  <TextField
                    sx={{ mt: 1 }}
                    label="Please specify"
                    fullWidth
                    value={form.sought_other_text}
                    onChange={(e) => setForm((p) => ({ ...p, sought_other_text: e.target.value }))}
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Supporting Documents</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <InputLabel shrink>Supporting Documents (optional)</InputLabel>
                <Paper
                  ref={dropZoneRef}
                  variant="outlined"
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (files.length < MAX_FILES) {
                      setIsDragging(true);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                    if (files.length >= MAX_FILES) return;
                    const droppedFiles = Array.from(e.dataTransfer.files);
                    validateAndAddFiles(droppedFiles);
                  }}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: isDragging ? 'primary.main' : 'primary.light',
                    borderRadius: 2,
                    bgcolor: isDragging ? 'primary.light' : 'action.hover',
                    cursor: files.length >= MAX_FILES ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                    '&:hover': {
                      bgcolor: files.length >= MAX_FILES ? 'action.hover' : 'action.selected',
                      borderColor: files.length >= MAX_FILES ? 'primary.light' : 'primary.main',
                    },
                    mb: 2,
                  }}
                  onClick={() => {
                    if (files.length < MAX_FILES) {
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx"
                    onChange={(e) => {
                      const picked = Array.from(e.target.files || []);
                      if (picked.length) {
                        validateAndAddFiles(picked);
                      }
                    }}
                    style={{ display: 'none' }}
                    disabled={files.length >= MAX_FILES}
                  />
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {isDragging ? 'Drop Files Here' : 'Click to Select Files or Drag & Drop'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Maximum {MAX_FILES} files, {MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB per file
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Supported: Images (JPEG, PNG, GIF, WebP), PDF, DOC, DOCX, TXT, RTF, XLS, XLSX
                  </Typography>
                </Paper>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                {files.length > 0 && (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Selected Files ({files.length}/{MAX_FILES})
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => setFiles([])}
                        startIcon={<CloseIcon />}
                      >
                        Clear All
                      </Button>
                    </Box>
                    <Grid container spacing={2}>
                      {files.map((f, idx) => (
                        <Grid item xs={12} sm={6} key={`${f.name}-${idx}`}>
                          <Card
                            variant="outlined"
                            sx={{
                              p: 2,
                              '&:hover': {
                                boxShadow: 2,
                              },
                            }}
                          >
                            <Box display="flex" alignItems="flex-start" gap={2}>
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: 1,
                                  bgcolor: 'primary.light',
                                  color: 'primary.contrastText',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                {getFileIcon(f.type)}
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Tooltip title={f.name}>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                    noWrap
                                    sx={{ mb: 0.5 }}
                                  >
                                    {f.name}
                                  </Typography>
                                </Tooltip>
                                <Typography variant="caption" color="text.secondary">
                                  {formatFileSize(f.size)}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2}>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !isRequiredFilled}
            startIcon={submitting ? <CircularProgress size={20} /> : undefined}
          >
            {submitting ? t('createCase.submitting') : t('createCase.submit')}
          </Button>
          <Button variant="outlined" onClick={() => router.back()}>{t('createCase.cancel')}</Button>
        </Stack>
      </Box>

      <Snackbar open={successOpen} autoHideDuration={1500} onClose={() => setSuccessOpen(false)}
        message={t('createCase.caseCreatedSuccessfully')} action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={() => setSuccessOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
}


