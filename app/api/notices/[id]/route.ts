import { NextRequest, NextResponse } from 'next/server';
const { Notice, Case, User } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';
import { generateNoticePDF } from '@/lib/pdf-generator';
import { s3Uploader, parseBucketConfig } from '@/lib/aws-s3';
import AWS from 'aws-sdk';

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

    // Only admin can access notices
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin only.' },
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

    // Only admin can update notices
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin only.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const noticeId = parseInt(id);
    const body = await request.json();
    const { case_id, respondent_name, respondent_address, respondent_pincode, subject, content, date, recipient_email } = body;

    // Validation
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
              attributes: ['id', 'name', 'email', 'phone', 'address']
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

    // Get case with user details for new PDF generation
    const caseData = await Case.findOne({
      where: { id: case_id },
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
    await existingNotice.update({
      case_id,
      respondent_name,
      respondent_address,
      respondent_pincode,
      subject,
      content,
      date: noticeDateForDB,
      pdf_filename: fileName,
      recipient_email: recipient_email || null,
    });

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

    // Only admin can delete notices
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin only.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const noticeId = parseInt(id);

    const notice = await Notice.findOne({ 
      where: { 
        id: noticeId,
        deleted_at: null // Only allow deleting non-deleted notices
      } 
    });
    if (!notice) {
      return NextResponse.json(
        { success: false, message: 'Notice not found' },
        { status: 404 }
      );
    }

    // Soft delete: destroy() with paranoid mode will set deleted_at timestamp
    await notice.destroy();

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

