import { NextRequest, NextResponse } from 'next/server';
const { Notice, Case, User } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';
import { generateNoticePDF } from '@/lib/pdf-generator';
import { s3Uploader, parseBucketConfig } from '@/lib/aws-s3';
import AWS from 'aws-sdk';
import { logNoticeUpdated, logNoticeDeleted } from '@/lib/activity-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Allow admin, advocate, and user roles
    const allowedRoles = ['admin', 'advocate', 'user'];
    if (!allowedRoles.includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Invalid role.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const noticeId = parseInt(id);

    const notice = await Notice.findOne({
      where: { 
        id: noticeId,
        deleted_at: null // Only get non-deleted notices
      },
      include: [
        {
          model: Case,
          as: 'case',
          required: true,
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

    if (!notice) {
      return NextResponse.json(
        { success: false, message: 'Notice not found' },
        { status: 404 }
      );
    }

    // Role-based access restrictions
    // For user role: only show notices for their own cases
    if (authResult.user.role === 'user') {
      if (notice.case.user_id !== authResult.user.userId) {
        return NextResponse.json(
          { success: false, message: 'Access denied. This notice does not belong to your cases.' },
          { status: 403 }
        );
      }
    }

    // For advocate role: only show notices for cases assigned to them
    if (authResult.user.role === 'advocate') {
      if (notice.case.advocate_id !== authResult.user.userId) {
        return NextResponse.json(
          { success: false, message: 'Access denied. You are not assigned to this case.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: notice
    });
  } catch (error: any) {
    console.error('Error fetching notice:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch notice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Allow admin and advocate to update notices
    if (!['admin', 'advocate'].includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin or Advocate only.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const noticeId = parseInt(id);
    const body = await request.json();
    const { case_id, respondent_name, respondent_address, respondent_pincode, subject, content, date, recipient_email, notice_stage, tracking_id, uploaded_notice_partial_edit } = body;

    // Get existing notice first (needed for partial-edit check)
    const existingNoticeForCheck = await Notice.findOne({
      where: { id: noticeId, deleted_at: null },
    });
    if (!existingNoticeForCheck) {
      return NextResponse.json(
        { success: false, message: 'Notice not found' },
        { status: 404 }
      );
    }

    // For uploaded notices: allow admin and advocate to update only notice_stage and tracking_id
    if (uploaded_notice_partial_edit === true && existingNoticeForCheck.uploaded_file_path) {
      // Advocate: only allow if assigned to this notice's case
      if (authResult.user.role === 'advocate') {
        const noticeWithCase = await Notice.findOne({
          where: { id: noticeId },
          include: [{ model: Case, as: 'case', attributes: ['advocate_id'] }],
        });
        if (!noticeWithCase?.case || noticeWithCase.case.advocate_id !== authResult.user.userId) {
          return NextResponse.json(
            { success: false, message: 'Access denied. You are not assigned to this case.' },
            { status: 403 }
          );
        }
      }
      const updateData: any = { updated_by: authResult.user.userId };
      if (notice_stage !== undefined) {
        updateData.notice_stage = notice_stage && String(notice_stage).trim() ? String(notice_stage).trim() : null;
        if (updateData.notice_stage && !updateData.notice_stage.startsWith('Notice-')) {
          updateData.notice_stage = `Notice-${updateData.notice_stage}`;
        }
      }
      if (tracking_id !== undefined) {
        updateData.tracking_id = tracking_id && String(tracking_id).trim() ? String(tracking_id).trim() : null;
      }
      await existingNoticeForCheck.update(updateData);
      const updated = await Notice.findOne({
        where: { id: noticeId },
        include: [{ model: Case, as: 'case', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'address'] }] }],
      });
      return NextResponse.json({ success: true, message: 'Notice stage and tracking ID updated.', data: updated });
    }

    // Validation for full update
    if (!case_id || !respondent_name || !respondent_address || !respondent_pincode || !subject || !content) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Auto-fill date if empty - convert YYYY-MM-DD to DATE for database
    let noticeDateForDB: string | null = null;
    let noticeDateForPDF: string = '';
    
    if (date && date.trim() !== '') {
      // Date comes in YYYY-MM-DD format from the form
      noticeDateForDB = date.trim();
      // Convert to DD-MM-YYYY for PDF
      const dateObj = new Date(date);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      noticeDateForPDF = `${day}-${month}-${year}`;
    } else {
      // Auto-fill with current date
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      noticeDateForDB = `${year}-${month}-${day}`;
      noticeDateForPDF = `${day}-${month}-${year}`;
    }

    // Get existing notice
    const existingNotice = await Notice.findOne({
      where: { 
        id: noticeId,
        deleted_at: null
      },
      include: [
        {
          model: Case,
          as: 'case',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone', 'address', 'user_type', 'company_name']
            }
          ]
        }
      ]
    });

    if (!existingNotice) {
      return NextResponse.json(
        { success: false, message: 'Notice not found' },
        { status: 404 }
      );
    }

    // For advocate role: verify they are assigned to this case
    if (authResult.user.role === 'advocate') {
      if (existingNotice.case.advocate_id !== authResult.user.userId) {
        return NextResponse.json(
          { success: false, message: 'Access denied. You are not assigned to this case.' },
          { status: 403 }
        );
      }
    }

    // Get case with user details for new PDF generation
    const caseData = await Case.findOne({
      where: { id: case_id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'address', 'user_type', 'company_name']
        }
      ]
    });

    if (!caseData) {
      return NextResponse.json(
        { success: false, message: 'Case not found' },
        { status: 404 }
      );
    }

    // Delete old PDF from S3 if it exists
    if (existingNotice.pdf_filename) {
      try {
        const { bucketName, pathPrefix } = parseBucketConfig();
        const noticesPrefix = `${pathPrefix}notices/`;
        const oldS3Key = `${noticesPrefix}${existingNotice.pdf_filename}`;
        
        const s3 = new AWS.S3({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION || 'us-east-1',
        });

        await s3.deleteObject({
          Bucket: bucketName,
          Key: oldS3Key,
        }).promise();
        console.log(`Deleted old PDF: ${oldS3Key}`);
      } catch (s3Error) {
        console.error('Error deleting old PDF from S3:', s3Error);
        // Continue with update even if deletion fails
      }
    }

    // Generate new PDF
    const pdfBuffer = await generateNoticePDF({
      applicantName: caseData.user.name,
      applicantAddress: caseData.user.address || '',
      applicantEmail: caseData.user.email,
      applicantPhone: caseData.user.phone,
      respondentName: respondent_name,
      respondentAddress: respondent_address,
      respondentPincode: respondent_pincode,
      subject: subject,
      content: content,
      date: noticeDateForPDF,
      caseNumber: caseData.case_number,
      caseTitle: caseData.title,
      applicantCompanyName: caseData.user.user_type === 'corporate' ? caseData.user.company_name : undefined,
    });

    // Upload new PDF to S3 (use same filename or generate new one)
    const fileName = existingNotice.pdf_filename || `notice_${Date.now()}_${case_id}.pdf`;

    const uploadResult = await s3Uploader.uploadFile({
      file: pdfBuffer,
      fileName: fileName,
      mimeType: 'application/pdf',
      folder: 'notices',
      caseId: case_id,
      userId: caseData.user_id,
    });

    if (!uploadResult.success || !uploadResult.key) {
      return NextResponse.json(
        { success: false, message: uploadResult.error || 'Failed to upload PDF to S3' },
        { status: 500 }
      );
    }

    // Update notice record
    const updateData: any = {
      case_id,
      respondent_name,
      respondent_address,
      respondent_pincode,
      subject,
      content,
      date: noticeDateForDB,
      pdf_filename: fileName,
      recipient_email: recipient_email || null,
    };

    // Update notice_stage if provided
    if (notice_stage !== undefined) {
      updateData.notice_stage = notice_stage ? notice_stage.trim() : null;
    }

    // Update tracking_id if provided
    if (tracking_id !== undefined) {
      updateData.tracking_id = tracking_id ? tracking_id.trim() : null;
    }

    // Update updated_by
    updateData.updated_by = authResult.user.userId;

    await existingNotice.update(updateData);

    // Fetch updated notice with relations
    const updatedNotice = await Notice.findOne({
      where: { id: existingNotice.id },
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
    await logNoticeUpdated(
      updatedNotice.toJSON ? updatedNotice.toJSON() : updatedNotice,
      authResult.user.userId,
      currentUser?.name || 'Unknown User'
    );

    return NextResponse.json({
      success: true,
      message: 'Notice updated successfully',
      data: updatedNotice
    });
  } catch (error: any) {
    console.error('Error updating notice:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update notice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Allow admin and advocate to delete notices
    if (!['admin', 'advocate'].includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin or Advocate only.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const noticeId = parseInt(id);

    const notice = await Notice.findOne({ 
      where: { 
        id: noticeId,
        deleted_at: null // Only allow deleting non-deleted notices
      },
      include: [
        {
          model: Case,
          as: 'case',
          required: true
        }
      ]
    });
    if (!notice) {
      return NextResponse.json(
        { success: false, message: 'Notice not found' },
        { status: 404 }
      );
    }

    // For advocate role: verify they are assigned to this case
    if (authResult.user.role === 'advocate') {
      if (notice.case.advocate_id !== authResult.user.userId) {
        return NextResponse.json(
          { success: false, message: 'Access denied. You are not assigned to this case.' },
          { status: 403 }
        );
      }
    }

    // Store notice data for activity logging before deletion
    const noticeData = notice.toJSON ? notice.toJSON() : notice;

    // Update updated_by before soft delete
    await notice.update({
      updated_by: authResult.user.userId
    });

    // Soft delete: destroy() with paranoid mode will set deleted_at timestamp
    await notice.destroy();

    // Log activity
    const currentUser = await User.findByPk(authResult.user.userId, {
      attributes: ['name']
    });
    await logNoticeDeleted(
      noticeData,
      authResult.user.userId,
      currentUser?.name || 'Unknown User'
    );

    return NextResponse.json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting notice:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete notice' },
      { status: 500 }
    );
  }
}

