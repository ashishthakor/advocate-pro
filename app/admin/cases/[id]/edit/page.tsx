'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
  Paper,
  Tooltip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  Image as ImageIcon,
  AttachFile as AttachFileIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { useLanguage } from '@/components/LanguageProvider';
import { calculateFeeWithGst } from '@/lib/fee-calculator';

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

interface EditCaseForm {
  title: string;
  description: string;
  case_type: string;
  status: string;
  priority: string;
  court_name: string;
  judge_name: string;
  next_hearing_date: string;
  fees: string;
  fees_paid: string;
  start_date: string;
  end_date: string;
  user_id: string;
  advocate_id: string;
  tracking_id: string;
  dispute_date: string;
  dispute_amount: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  requester_address: string;
  requester_business_name: string;
  requester_gst_number: string;
  respondent_name: string;
  respondent_phone: string;
  respondent_email: string;
  respondent_address: string;
  respondent_business_name: string;
  respondent_gst_number: string;
  relationship_between_parties: string;
  nature_of_dispute: string;
  brief_description_of_dispute: string;
  occurrence_date: string;
  prior_communication: string;
  prior_communication_other: string;
  sought_monetary_claim: boolean;
  sought_settlement: boolean;
  sought_other: boolean;
  sought_other_text: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface Advocate {
  id: number;
  name: string;
  email: string;
}

interface DocItem {
  id: number;
  file_name: string;
  original_name: string;
  file_size: number;
  mime_type?: string;
  s3_key?: string;
  created_at: string;
}

const emptyForm: EditCaseForm = {
  title: '',
  description: '',
  case_type: 'civil',
  status: 'waiting_for_action',
  priority: 'medium',
  court_name: '',
  judge_name: '',
  next_hearing_date: '',
  fees: '0.00',
  fees_paid: '0.00',
  start_date: '',
  end_date: '',
  user_id: '',
  advocate_id: '',
  tracking_id: '',
  dispute_date: '',
  dispute_amount: '',
  requester_name: '',
  requester_email: '',
  requester_phone: '',
  requester_address: '',
  requester_business_name: '',
  requester_gst_number: '',
  respondent_name: '',
  respondent_phone: '',
  respondent_email: '',
  respondent_address: '',
  respondent_business_name: '',
  respondent_gst_number: '',
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
};

function toDateInputValue(d: string | null | undefined): string {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export default function AdminEditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [id, setId] = useState<string | null>(null);
  const [form, setForm] = useState<EditCaseForm>(emptyForm);
  const [users, setUsers] = useState<User[]>([]);
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loadingCase, setLoadingCase] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dropZoneRef = React.useRef<HTMLDivElement>(null);
  const MAX_FILES = 5;
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string>('');
  const [previewName, setPreviewName] = useState<string>('');

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    const fetchCase = async () => {
      try {
        setLoadingCase(true);
        const res = await apiFetch<{ success: boolean; data: any }>(`/api/cases/${id}`);
        if (res?.success && res.data) {
          const c = res.data;
          setForm({
            title: c.title || '',
            description: c.description || '',
            case_type: c.case_type || 'civil',
            status: c.status || 'waiting_for_action',
            priority: c.priority || 'medium',
            court_name: c.court_name || '',
            judge_name: c.judge_name || '',
            next_hearing_date: toDateInputValue(c.next_hearing_date),
            fees: c.fees != null ? String(c.fees) : '0.00',
            fees_paid: c.fees_paid != null ? String(c.fees_paid) : '0.00',
            start_date: toDateInputValue(c.start_date),
            end_date: toDateInputValue(c.end_date),
            user_id: c.user_id != null ? String(c.user_id) : '',
            advocate_id: c.advocate_id != null ? String(c.advocate_id) : '',
            tracking_id: c.tracking_id || '',
            dispute_date: toDateInputValue(c.dispute_date),
            dispute_amount: c.dispute_amount != null ? String(c.dispute_amount) : '',
            requester_name: c.requester_name || '',
            requester_email: c.requester_email || '',
            requester_phone: c.requester_phone || '',
            requester_address: c.requester_address || '',
            requester_business_name: c.requester_business_name || '',
            requester_gst_number: c.requester_gst_number || '',
            respondent_name: c.respondent_name || '',
            respondent_phone: c.respondent_phone || '',
            respondent_email: c.respondent_email || '',
            respondent_address: c.respondent_address || '',
            respondent_business_name: c.respondent_business_name || '',
            respondent_gst_number: c.respondent_gst_number || '',
            relationship_between_parties: c.relationship_between_parties || '',
            nature_of_dispute: c.nature_of_dispute || '',
            brief_description_of_dispute: c.brief_description_of_dispute || '',
            occurrence_date: toDateInputValue(c.occurrence_date),
            prior_communication: c.prior_communication || '',
            prior_communication_other: c.prior_communication_other || '',
            sought_monetary_claim: Boolean(c.sought_monetary_claim),
            sought_settlement: Boolean(c.sought_settlement),
            sought_other: Boolean(c.sought_other),
            sought_other_text: typeof c.sought_other === 'string' ? c.sought_other : (c.sought_other_text || ''),
          });
        } else {
          setError('Case not found');
        }
      } catch (err) {
        setError('Failed to load case');
      } finally {
        setLoadingCase(false);
      }
    };
    fetchCase();
  }, [id]);

  useEffect(() => {
    fetchUsers();
    fetchAdvocates();
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchDocs = async () => {
      try {
        const res = await apiFetch<{ success: boolean; data: any[] }>(`/api/documents/${id}`);
        if (res?.success && Array.isArray(res.data)) {
          setDocuments(res.data);
        }
      } catch (_) {}
    };
    fetchDocs();
  }, [id]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await apiFetch('/api/users?role=user&limit=1000');
      if (response.success) setUsers(response.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAdvocates = async () => {
    try {
      const response = await apiFetch('/api/users?role=advocate&is_approved=true&limit=1000');
      if (response.success) setAdvocates(response.data || []);
    } catch (err) {
      console.error('Failed to fetch advocates:', err);
    }
  };

  const handleChange = (field: keyof EditCaseForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (field: keyof EditCaseForm) => (e: any) => {
    const value = e.target.value;
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'user_id' && value) {
        const selectedUser = users.find((u) => u.id.toString() === value);
        if (selectedUser) {
          updated.requester_name = selectedUser.name || '';
          updated.requester_email = selectedUser.email || '';
          updated.requester_phone = selectedUser.phone || '';
          updated.requester_address = selectedUser.address || '';
        }
      }
      return updated;
    });
  };

  const isEmail = (v: string) => /.+@.+\..+/.test(v);
  const isRequiredFilled =
    form.title &&
    form.description &&
    form.requester_name &&
    isEmail(form.requester_email) &&
    form.requester_phone &&
    form.requester_address &&
    form.relationship_between_parties &&
    form.nature_of_dispute &&
    form.brief_description_of_dispute &&
    form.sought_other_text.trim() !== '';

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) return <ImageIcon />;
    if (fileType === 'application/pdf') return <PdfIcon />;
    if (fileType?.includes('excel') || fileType?.includes('spreadsheet')) return <ExcelIcon />;
    if (fileType?.includes('word') || fileType?.includes('document')) return <DocIcon />;
    return <AttachFileIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const isPreviewable = (mimeType?: string) => {
    if (!mimeType) return false;
    return mimeType.startsWith('image/') || mimeType === 'application/pdf';
  };

  const handlePreviewDoc = async (doc: DocItem) => {
    if (!doc.s3_key) return;
    try {
      const response = await fetch(`/api/download?key=${encodeURIComponent(doc.s3_key)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (data.success && data.data.downloadUrl) {
        setPreviewUrl(data.data.downloadUrl);
        setPreviewType(doc.mime_type || '');
        setPreviewName(doc.original_name || doc.file_name);
        setPreviewOpen(true);
      }
    } catch (err) {
      console.error('Failed to get preview URL:', err);
    }
  };

  const handleDownloadDoc = async (doc: DocItem) => {
    if (!doc.s3_key) return;
    try {
      const response = await fetch(`/api/download?key=${encodeURIComponent(doc.s3_key)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (data.success && data.data.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.data.downloadUrl;
        link.download = doc.original_name || doc.file_name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Failed to download:', err);
    }
  };

  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/rtf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  const validateAndAddFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];
    let nextError = '';
    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        nextError = nextError || `${file.name} exceeds 10MB`;
        continue;
      }
      if (!allowedTypes.includes(file.type)) {
        nextError = nextError || `${file.name} is not a supported type`;
        continue;
      }
      validFiles.push(file);
    }
    if (files.length + validFiles.length > MAX_FILES) {
      nextError = nextError || `Maximum ${MAX_FILES} files`;
    }
    setFiles((prev) => (prev.length + validFiles.length <= MAX_FILES ? [...prev, ...validFiles] : prev));
    if (nextError) setError(nextError);
  };

  const uploadNewFiles = async () => {
    if (!id || !files.length) return;
    setUploading(true);
    setError('');
    const formData = new FormData();
    files.forEach((f, i) => formData.append(`file-${i}`, f));
    formData.append('caseId', id);
    formData.append('folder', 'cases');
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await response.json();
      if (data?.success && data?.data?.length) {
        setFiles([]);
        const res = await apiFetch<{ success: boolean; data: any[] }>(`/api/documents/${id}`);
        if (res?.success && Array.isArray(res.data)) setDocuments(res.data);
      } else {
        setError(data?.message || 'Upload failed');
      }
    } catch (e) {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError('');
    setSubmitting(true);
    try {
      const payload: any = {
        ...form,
        user_id: form.user_id ? parseInt(form.user_id, 10) : undefined,
        advocate_id: form.advocate_id ? parseInt(form.advocate_id, 10) : null,
        sought_other: form.sought_other_text || null,
        next_hearing_date: form.next_hearing_date || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        occurrence_date: form.occurrence_date || null,
        dispute_date: form.dispute_date || null,
        dispute_amount: form.dispute_amount ? parseFloat(form.dispute_amount) : null,
        fees: parseFloat(form.fees) || 0,
        fees_paid: parseFloat(form.fees_paid) || 0,
      };
      const res = await apiFetch<{ success: boolean; message?: string }>(`/api/cases/${id}`, {
        method: 'PUT',
        json: payload,
      });
      if (res?.success) {
        setSuccessOpen(true);
        setTimeout(() => router.push('/admin/cases'), 600);
      } else {
        setError((res as any)?.message || 'Failed to update case');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update case');
    } finally {
      setSubmitting(false);
    }
  };

  if (id === null || loadingCase) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.back()} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">Edit Case</Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Case Assignment</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>User</InputLabel>
                  <Select
                    value={form.user_id}
                    label="User"
                    onChange={handleSelectChange('user_id')}
                    disabled={loadingUsers}
                  >
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Advocate (Optional)</InputLabel>
                  <Select
                    value={form.advocate_id}
                    label="Advocate (Optional)"
                    onChange={handleSelectChange('advocate_id')}
                  >
                    <MenuItem value="">None</MenuItem>
                    {advocates.map((adv) => (
                      <MenuItem key={adv.id} value={adv.id.toString()}>
                        {adv.name} ({adv.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>{t('createCase.caseInformation')}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label={t('createCase.caseTitle')} fullWidth required value={form.title} onChange={handleChange('title')} />
              </Grid>
              <Grid item xs={12}>
                <TextField label={t('createCase.caseDescription')} fullWidth required multiline rows={3} value={form.description} onChange={handleChange('description')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Tracking ID" fullWidth value={form.tracking_id} onChange={handleChange('tracking_id')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Dispute Date" fullWidth type="date" value={form.dispute_date} onChange={handleChange('dispute_date')} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Dispute Amount (₹)"
                  fullWidth
                  type="number"
                  value={form.dispute_amount}
                  onChange={(e) => {
                    handleChange('dispute_amount')(e);
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v > 0) {
                      const { total } = calculateFeeWithGst(v);
                      setForm((prev) => ({ ...prev, fees: total.toFixed(2) }));
                    }
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Fees (₹)" fullWidth type="number" value={form.fees} onChange={handleChange('fees')} inputProps={{ min: 0, step: 0.01 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Case Type</InputLabel>
                  <Select value={form.case_type} label="Case Type" onChange={handleChange('case_type') as any}>
                    <MenuItem value="civil">Civil</MenuItem>
                    <MenuItem value="criminal">Criminal</MenuItem>
                    <MenuItem value="family">Family</MenuItem>
                    <MenuItem value="corporate">Corporate</MenuItem>
                    <MenuItem value="property">Property</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={form.status} label="Status" onChange={handleChange('status') as any}>
                    <MenuItem value="pending_payment">Pending Payment</MenuItem>
                    <MenuItem value="waiting_for_action">Waiting for Action</MenuItem>
                    <MenuItem value="neutrals_needs_to_be_assigned">Neutrals to be Assigned</MenuItem>
                    <MenuItem value="consented">Consented</MenuItem>
                    <MenuItem value="closed_no_consent">Closed (No Consent)</MenuItem>
                    <MenuItem value="close_no_settlement">Close (No Settlement)</MenuItem>
                    <MenuItem value="temporary_non_starter">Temporary Non-Starter</MenuItem>
                    <MenuItem value="settled">Settled</MenuItem>
                    <MenuItem value="hold">Hold</MenuItem>
                    <MenuItem value="withdrawn">Withdrawn</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select value={form.priority} label="Priority" onChange={handleChange('priority') as any}>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Court Name" fullWidth value={form.court_name} onChange={handleChange('court_name')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Judge Name" fullWidth value={form.judge_name} onChange={handleChange('judge_name')} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Next Hearing Date" fullWidth type="date" value={form.next_hearing_date} onChange={handleChange('next_hearing_date')} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Start Date" fullWidth type="date" value={form.start_date} onChange={handleChange('start_date')} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="End Date" fullWidth type="date" value={form.end_date} onChange={handleChange('end_date')} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>{t('createCase.requestingParty')}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {['requester_name', 'requester_email', 'requester_phone', 'requester_address', 'requester_business_name', 'requester_gst_number'].map((field) => (
                <Grid item xs={12} md={6} key={field}>
                  <TextField
                    label={field.replace('requester_', '').replace(/_/g, ' ')}
                    fullWidth
                    required={['requester_name', 'requester_email', 'requester_phone', 'requester_address'].includes(field)}
                    value={(form as any)[field]}
                    onChange={handleChange(field as keyof EditCaseForm)}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>{t('createCase.oppositeParty')}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {['respondent_name', 'respondent_phone', 'respondent_email', 'respondent_address', 'respondent_business_name', 'respondent_gst_number'].map((field) => (
                <Grid item xs={12} md={6} key={field}>
                  <TextField
                    label={field.replace('respondent_', '').replace(/_/g, ' ')}
                    fullWidth
                    value={(form as any)[field]}
                    onChange={handleChange(field as keyof EditCaseForm)}
                  />
                </Grid>
              ))}
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
                <RadioGroup row value={form.relationship_between_parties} onChange={(e) => setForm((p) => ({ ...p, relationship_between_parties: e.target.value }))}>
                  {['User', 'Vendor', 'Business Partner', 'Employee', 'Employer', 'Family'].map((opt) => (
                    <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
                  ))}
                </RadioGroup>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label={t('createCase.natureOfDispute')} fullWidth required select value={form.nature_of_dispute} onChange={handleChange('nature_of_dispute')}>
                  {NATURE_OF_DISPUTE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Brief description of dispute" fullWidth required multiline minRows={3} value={form.brief_description_of_dispute} onChange={handleChange('brief_description_of_dispute')} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Date of occurrence" fullWidth type="date" value={form.occurrence_date} onChange={handleChange('occurrence_date')} InputLabelProps={{ shrink: true }} />
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
                <InputLabel shrink>Prior communication/attempt to resolve *</InputLabel>
                <RadioGroup row value={form.prior_communication} onChange={(e) => setForm((p) => ({ ...p, prior_communication: e.target.value }))}>
                  {['Yes', 'No', 'Other'].map((opt) => (
                    <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
                  ))}
                </RadioGroup>
                {form.prior_communication === 'Other' && (
                  <TextField sx={{ mt: 1 }} label="Please specify" fullWidth value={form.prior_communication_other} onChange={handleChange('prior_communication_other')} />
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
                  <FormControlLabel control={<Checkbox checked={form.sought_monetary_claim} onChange={(e) => setForm((p) => ({ ...p, sought_monetary_claim: e.target.checked }))} />} label="Monetary claim" />
                  <FormControlLabel control={<Checkbox checked={form.sought_settlement} onChange={(e) => setForm((p) => ({ ...p, sought_settlement: e.target.checked }))} />} label="Settlement" />
                  <FormControlLabel control={<Checkbox checked={form.sought_other} onChange={(e) => setForm((p) => ({ ...p, sought_other: e.target.checked }))} />} label="Other" />
                </FormGroup>
                <TextField sx={{ mt: 2 }} label="Description" fullWidth required multiline rows={3} value={form.sought_other_text} onChange={(e) => setForm((p) => ({ ...p, sought_other_text: e.target.value }))} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Supporting Documents</Typography>
            <Divider sx={{ mb: 2 }} />
            {documents.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>Existing documents ({documents.length})</Typography>
                <Grid container spacing={1}>
                  {documents.map((doc) => (
                    <Grid item xs={12} sm={6} key={doc.id}>
                      <Card variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getFileIcon(doc.mime_type || '')}
                        <Box flex={1} minWidth={0}>
                          <Tooltip title={doc.original_name || doc.file_name}>
                            <Typography variant="body2" noWrap>{doc.original_name || doc.file_name}</Typography>
                          </Tooltip>
                          <Typography variant="caption" color="text.secondary">{formatFileSize(doc.file_size)}</Typography>
                        </Box>
                        {isPreviewable(doc.mime_type) && (
                          <Tooltip title="Preview">
                            <IconButton size="small" onClick={() => handlePreviewDoc(doc)} color="primary">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Download">
                          <IconButton size="small" onClick={() => handleDownloadDoc(doc)} color="default">
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            <Typography variant="subtitle2" gutterBottom>Upload more documents</Typography>
            <Paper
              ref={dropZoneRef}
              variant="outlined"
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (files.length < MAX_FILES) validateAndAddFiles(Array.from(e.dataTransfer.files));
              }}
              onClick={() => files.length < MAX_FILES && fileInputRef.current?.click()}
              sx={{
                p: 3, textAlign: 'center', border: '2px dashed', borderColor: isDragging ? 'primary.main' : 'divider',
                cursor: files.length >= MAX_FILES ? 'not-allowed' : 'pointer', mb: 2,
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx"
                style={{ display: 'none' }}
                onChange={(e) => { const picked = Array.from(e.target.files || []); if (picked.length) validateAndAddFiles(picked); e.target.value = ''; }}
              />
              <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2">{isDragging ? 'Drop here' : 'Click or drag files (max ' + MAX_FILES + ', 10MB each)'}</Typography>
            </Paper>
            {files.length > 0 && (
              <Box>
                {files.map((f, idx) => (
                  <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
                    {getFileIcon(f.type)}
                    <Typography variant="body2" noWrap sx={{ flex: 1 }}>{f.name}</Typography>
                    <Typography variant="caption">{formatFileSize(f.size)}</Typography>
                    <IconButton size="small" onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))} color="error"><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                ))}
                <Button size="small" variant="contained" onClick={uploadNewFiles} disabled={uploading} startIcon={uploading ? <CircularProgress size={16} /> : undefined}>
                  {uploading ? 'Uploading…' : 'Upload ' + files.length + ' file(s)'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2}>
          <Button type="submit" variant="contained" disabled={submitting || !isRequiredFilled} startIcon={submitting ? <CircularProgress size={20} /> : undefined}>
            {submitting ? 'Saving…' : 'Save changes'}
          </Button>
          <Button variant="outlined" onClick={() => router.back()}>Cancel</Button>
        </Stack>
      </Box>

      <Snackbar open={successOpen} autoHideDuration={2000} onClose={() => setSuccessOpen(false)} message="Case updated successfully" />

      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" noWrap sx={{ maxWidth: '80%' }}>{previewName}</Typography>
            <IconButton onClick={() => setPreviewOpen(false)} size="small"><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: 400, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
          {previewUrl && previewType.startsWith('image/') && (
            <Box
              component="img"
              src={previewUrl}
              alt={previewName}
              sx={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
            />
          )}
          {previewUrl && previewType === 'application/pdf' && (
            <iframe
              src={previewUrl}
              title={previewName}
              style={{ width: '100%', height: '70vh', border: 'none' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          {previewUrl && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => {
                const link = document.createElement('a');
                link.href = previewUrl;
                link.download = previewName;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
