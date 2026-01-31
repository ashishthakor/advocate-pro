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
import { useAuth } from '@/components/AuthProvider';
import { calculateFeeWithGst } from '@/lib/fee-calculator';

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
  requester_business_name: string;
  requester_gst_number: string;

  // Respondent
  respondent_name: string;
  respondent_phone: string;
  respondent_email: string;
  respondent_address: string;
  respondent_business_name: string;
  respondent_gst_number: string;

  dispute_date: string;
  dispute_amount: string;
  // Dispute details
  relationship_between_parties: 'User' | 'Vendor' | 'Business Partner' | 'Employee' | 'Employer' | 'Family' | '';
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
  const { user } = useAuth();
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
  const [userProfileLoaded, setUserProfileLoaded] = useState(false);

  // Fetch user profile and prefill requester details
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      if (userProfileLoaded) return; // Only fetch once
      
      try {
        const response = await apiFetch<{ success: boolean; data: any }>('/api/users/profile');
        if (response && response.success && response.data) {
          const profileData = response.data;
          setForm((prev) => ({
            ...prev,
            requester_name: profileData.name || prev.requester_name,
            requester_email: profileData.email || prev.requester_email,
            requester_phone: profileData.phone || prev.requester_phone,
            requester_address: profileData.address || prev.requester_address,
            requester_business_name: profileData.company_name || prev.requester_business_name,
          }));
          setUserProfileLoaded(true);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // If API fails, try to use data from localStorage/auth context
        if (user) {
          setForm((prev) => ({
            ...prev,
            requester_name: user.name || prev.requester_name,
            requester_email: user.email || prev.requester_email,
          }));
        }
      }
    };

    fetchUserProfile();
  }, [userProfileLoaded, user]);

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
    form.brief_description_of_dispute &&
    form.sought_other_text.trim() !== '' // Make description mandatory
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

  const [showPayment, setShowPayment] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [draftCaseId, setDraftCaseId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isRequiredFilled) {
      setError('Please fill all required fields');
      return;
    }

    // Create draft case first
    setSubmitting(true);
    try {
      const payload: any = {
        ...form,
        sought_other: form.sought_other ? form.sought_other_text : form.sought_other_text,
        attachments_json: null, // We'll upload files after payment
      };
      
      // Create draft case (will be in pending_payment status)
      const res = await apiFetch<{ success: boolean; data: any; message?: string }>(
        '/api/cases',
        { method: 'POST', json: payload }
      );

      if (res && (res as any).success && (res as any).data) {
        const created = (res as any).data;
        if (created.id) {
          setDraftCaseId(created.id);
          
          // Upload documents to draft case
          if (files.length > 0) {
            await uploadAttachments(created.id);
          }
          
          // Now create payment order for this draft case
          const paymentRes = await apiFetch<{ success: boolean; data: any; message?: string }>(
            '/api/payments/create-order',
            { 
              method: 'POST', 
              json: {
                description: 'Case Registration Fee', // Using literal here as it's user-facing
                case_id: created.id
                // Amount will be determined by API based on case custom fees or default
              }
            }
          );

          if (paymentRes && (paymentRes as any).success && (paymentRes as any).data) {
            setPaymentOrder((paymentRes as any).data);
            setShowPayment(true);
          } else {
            setError((paymentRes as any).message || 'Failed to create payment order');
          }
        }
      } else {
        setError((res as any).message || t('createCase.failedToCreate'));
      }
    } catch (err: any) {
      setError(err?.message || t('createCase.failedToCreate'));
    } finally {
      setSubmitting(false);
    }
  };

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

  const handlePayment = async () => {
    if (!paymentOrder || !draftCaseId) return;

    setProcessingPayment(true);
    setError('');

    try {
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        setError('Failed to load payment gateway. Please refresh the page.');
        setProcessingPayment(false);
        return;
      }

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
                setSuccessOpen(true);
                setTimeout(() => router.push(`/user/chat/${updatedCase.id}`), 600);
              } else {
                setError('Payment successful but case update failed. Please contact support.');
                // Case remains in pending_payment status, user can retry from cases list
              }
            } else {
              setError((verifyRes as any).message || 'Payment verification failed. Your case is saved and you can retry payment from your cases list.');
              // Case remains in pending_payment status, user can retry
            }
          } catch (err: any) {
            setError(err?.message || 'Failed to verify payment');
          } finally {
            setProcessingPayment(false);
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
            setProcessingPayment(false);
            // Keep payment screen open so user can retry
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err?.message || 'Failed to process payment');
      setProcessingPayment(false);
    }
  };

  if (showPayment && paymentOrder) {
    return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <IconButton onClick={() => setShowPayment(false)} size="small"><ArrowBackIcon /></IconButton>
          <Typography variant="h5">Payment - Case Registration</Typography>
        </Stack>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Complete Your Payment
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Case Registration Fee
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                ₹{paymentOrder.amount ? (paymentOrder.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please complete the payment to proceed with case registration.
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handlePayment}
                disabled={processingPayment}
                startIcon={processingPayment ? <CircularProgress size={20} /> : undefined}
              >
                {processingPayment ? 'Processing...' : `Pay ₹${paymentOrder.amount ? (paymentOrder.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowPayment(false);
                  router.push('/user/cases');
                }}
                disabled={processingPayment}
              >
                Pay Later
              </Button>
            </Stack>
            <Alert severity="info" sx={{ mt: 2 }}>
              Your case has been saved as draft. You can complete the payment later from your cases list.
            </Alert>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('createCase.businessName')}
                  fullWidth
                  value={form.requester_business_name}
                  onChange={handleChange('requester_business_name')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('createCase.gstNumber')}
                  fullWidth
                  value={form.requester_gst_number}
                  onChange={handleChange('requester_gst_number')}
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
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('createCase.businessName')}
                  fullWidth
                  value={form.respondent_business_name}
                  onChange={handleChange('respondent_business_name')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('createCase.gstNumber')}
                  fullWidth
                  value={form.respondent_gst_number}
                  onChange={handleChange('respondent_gst_number')}
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
                  {['User','Vendor','Business Partner','Employee','Employer','Family'].map((opt) => (
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

              {/* Dispute Date & Dispute Amount */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Dispute Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.dispute_date}
                  onChange={handleChange('dispute_date')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Dispute Amount (₹)"
                  type="number"
                  fullWidth
                  placeholder="Amount in dispute (INR)"
                  value={form.dispute_amount}
                  onChange={(e) => {
                    handleChange('dispute_amount')(e);
                    const v = parseFloat((e.target as HTMLInputElement).value);
                    if (!isNaN(v) && v > 0) {
                      const { total } = calculateFeeWithGst(v);
                      setForm((prev) => ({ ...prev, fees: total.toFixed(2) }));
                    }
                  }}
                  // helperText="Fees (incl. 18% GST) auto-calculated from Fees page"
                  inputProps={{ min: 0, step: 0.01 }}
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
                <TextField
                  sx={{ mt: 2 }}
                  label="Description"
                  fullWidth
                  required
                  multiline
                  rows={3}
                  value={form.sought_other_text}
                  onChange={(e) => setForm((p) => ({ ...p, sought_other_text: e.target.value }))}
                  helperText="Please provide a detailed description of the relief being sought"
                  // error={!form.sought_other_text.trim()}
                />
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


