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
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
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
  nature_of_dispute: 'Commercial' | 'Real Estate' | 'Contract breach' | 'Invoice default' | 'Employment' | '';
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

export default function CreateCasePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const MAX_FILES = 5;
  const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
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

  const handleChange = (field: keyof CreateCaseForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const uploadAttachments = async (): Promise<Array<{ url: string; name: string; size: number; type: string }>> => {
    if (!files.length) return [];
    const uploaded: Array<{ url: string; name: string; size: number; type: string }> = [];
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE_BYTES) {
        // skip oversized files for safety
        continue;
      }
      const formData = new FormData();
      formData.append('file', f);
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });
        const data = await response.json();
        if (data?.success && data?.data?.url) {
          uploaded.push({ url: data.data.url, name: f.name, size: f.size, type: f.type });
        }
      } catch (e) {
        // ignore single file failure; continue
      }
    }
    return uploaded;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const attachments = await uploadAttachments();
      const payload: any = {
        ...form,
        sought_other: form.sought_other ? form.sought_other_text : '',
        attachments_json: attachments.length ? JSON.stringify(attachments) : null,
      };
      const res = await apiFetch<{ success: boolean; data: any; message?: string }>(
        '/api/cases',
        { method: 'POST', json: payload }
      );

      if (res && (res as any).success && (res as any).data) {
        const created = (res as any).data;
        if (created.id) {
          setSuccessOpen(true);
          setTimeout(() => router.push(`/user/chat/${created.id}`), 600);
          return;
        }
      }
      setError((res as any).message || 'Failed to create case');
    } catch (err: any) {
      setError(err?.message || 'Failed to create case');
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
                  helperText={form.requester_email && !isEmail(form.requester_email) ? 'Enter a valid email address' : ' '}
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
                  <MenuItem value="Commercial">Commercial</MenuItem>
                  <MenuItem value="Real Estate">Real Estate</MenuItem>
                  <MenuItem value="Contract breach">Contract breach</MenuItem>
                  <MenuItem value="Invoice default">Invoice default</MenuItem>
                  <MenuItem value="Employment">Employment</MenuItem>
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
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt,.rtf"
                  onChange={(e) => {
                    const picked = Array.from(e.target.files || []);
                    if (!picked.length) {
                      setFiles([]);
                      return;
                    }
                    let nextError = '';
                    let selected = picked.slice(0, MAX_FILES);
                    if (picked.length > MAX_FILES) {
                      nextError = `You can upload a maximum of ${MAX_FILES} files.`;
                    }
                    const valid = selected.filter((f) => {
                      const ok = f.size <= MAX_FILE_SIZE_BYTES;
                      if (!ok) {
                        nextError = nextError || 'One or more files exceed the 20MB limit.';
                      }
                      return ok;
                    });
                    setFiles(valid);
                    if (nextError) setError(nextError);
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Max 5 files, up to 20MB each.
                </Typography>
                {files.length > 0 && (
                  <Paper variant="outlined" sx={{ mt: 1, p: 1 }}>
                    <Stack spacing={1}>
                      {files.map((f, idx) => (
                        <Stack key={`${f.name}-${idx}`} direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            {f.name} — {(f.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                          <IconButton size="small" onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
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


