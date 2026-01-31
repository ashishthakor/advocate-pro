import { NextRequest, NextResponse } from 'next/server';
const { Notice, Case, User } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';
import { s3Uploader } from '@/lib/aws-s3';
import { getNextNoticeStage, isValidNoticeFileType, isValidNoticeFileSize } from '@/lib/notice-helpers';
import { logNoticeCreated } from '@/lib/activity-logger';

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Allow admin and advocate to upload notices
    if (!['admin', 'advocate'].includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin or Advocate only.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const caseId = formData.get('case_id');
    const noticeStage = formData.get('notice_stage');
    const trackingId = formData.get('tracking_id');
    const file = formData.get('file') as File | null;

    // Validation
    if (!caseId) {
      return NextResponse.json(
        { success: false, message: 'Case ID is required' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File is required' },
        { status: 400 }
      );
    }

    const caseIdNum = parseInt(caseId as string);
    if (isNaN(caseIdNum)) {
      return NextResponse.json(
        { success: false, message: 'Invalid case ID' },
        { status: 400 }
      );
    }

    // Get case data
    const caseData = await Case.findOne({
      where: { id: caseIdNum },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'address']
        }
      ]
    });

    if (!caseData) {
      return NextResponse.json(
        { success: false, message: 'Case not found' },
        { status: 404 }
      );
    }

    // For advocate role: verify they are assigned to this case
    if (authResult.user.role === 'advocate') {
      if (caseData.advocate_id !== authResult.user.userId) {
        return NextResponse.json(
          { success: false, message: 'Access denied. You are not assigned to this case.' },
          { status: 403 }
        );
      }
    }

    // Validate file
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const mimeType = file.type;

    if (!isValidNoticeFileType(mimeType, fileName)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' },
        { status: 400 }
      );
    }

    if (!isValidNoticeFileSize(file.size)) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 10MB limit.' },
        { status: 400 }
      );
    }

    // Auto-calculate notice_stage if not provided
    let finalNoticeStage = noticeStage ? (noticeStage as string).trim() : '';
    if (!finalNoticeStage) {
      finalNoticeStage = await getNextNoticeStage(caseIdNum);
    }

    // Ensure S3 bucket exists
    const bucketExists = await s3Uploader.ensureBucketExists();
    if (!bucketExists) {
      return NextResponse.json(
        { success: false, message: 'Failed to access S3 bucket' },
        { status: 500 }
      );
    }

    // Generate unique filename
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    const timestamp = Date.now();
    const uniqueFileName = `notice_upload_${timestamp}_${caseIdNum}_${authResult.user.userId}${fileExtension}`;

    // Upload file to S3
    const uploadResult = await s3Uploader.uploadFile({
      file: fileBuffer,
      fileName: uniqueFileName,
      mimeType: mimeType,
      folder: 'notices',
      caseId: caseIdNum,
      userId: caseData.user_id,
    });

    if (!uploadResult.success || !uploadResult.key) {
      return NextResponse.json(
        { success: false, message: uploadResult.error || 'Failed to upload file to S3' },
        { status: 500 }
      );
    }

    // Create notice record
    const notice = await Notice.create({
      case_id: caseIdNum,
      respondent_name: '', // Required field, but not needed for uploaded files
      respondent_address: '', // Required field, but not needed for uploaded files
      respondent_pincode: '', // Required field, but not needed for uploaded files
      subject: null,
      content: '', // Required field, but not needed for uploaded files
      date: null,
      pdf_filename: null, // Not a generated PDF
      uploaded_file_path: uploadResult.key,
      recipient_email: null,
      email_sent: false,
      email_sent_count: 0,
      notice_stage: finalNoticeStage || null,
      tracking_id: trackingId ? (trackingId as string).trim() : null,
      updated_by: authResult.user.userId
    });

    // Fetch created notice with relations
    const createdNotice = await Notice.findOne({
      where: { id: notice.id },
      include: [
        {
          model: Case,
          as: 'case',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone', 'address']
            }
          ]
        }
      ]
    });

    // Log activity
    const currentUser = await User.findByPk(authResult.user.userId, {
      attributes: ['name']
    });
    await logNoticeCreated(
      createdNotice.toJSON ? createdNotice.toJSON() : createdNotice,
      authResult.user.userId,
      currentUser?.name || 'Unknown User'
    );

    return NextResponse.json({
      success: true,
      message: 'Notice uploaded successfully',
      data: createdNotice
    });
  } catch (error: any) {
    console.error('Error uploading notice:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload notice' },
      { status: 500 }
    );
  }
}
