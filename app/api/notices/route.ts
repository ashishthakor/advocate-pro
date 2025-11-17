import { NextRequest, NextResponse } from 'next/server';
const { Notice, Case, User } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';
import { generateNoticePDF } from '@/lib/pdf-generator';
import { s3Uploader } from '@/lib/aws-s3';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('case_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const whereConditions: any = {
      deleted_at: null // Only get non-deleted notices
    };
    if (caseId) {
      whereConditions.case_id = parseInt(caseId);
    }

    const offset = (page - 1) * limit;

    const { count, rows: notices } = await Notice.findAndCountAll({
      where: whereConditions,
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
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      data: {
        notices,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
          hasNextPage: page * limit < count,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching notices:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch notices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin can create notices
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin only.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { case_id, respondent_name, respondent_address, respondent_pincode, subject, content, recipient_email } = body;

    // Validation
    if (!case_id || !respondent_name || !respondent_address || !respondent_pincode || !subject || !content) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get case with user details
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

    // Generate PDF
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
      caseNumber: caseData.case_number,
      caseTitle: caseData.title,
    });

    // Ensure S3 bucket exists
    const bucketExists = await s3Uploader.ensureBucketExists();
    if (!bucketExists) {
      return NextResponse.json(
        { success: false, message: 'Failed to access S3 bucket' },
        { status: 500 }
      );
    }

    // Upload PDF to S3
    const fileName = `notice_${Date.now()}_${case_id}.pdf`;

    const uploadResult = await s3Uploader.uploadFile({
      file: pdfBuffer,
      fileName: fileName,
      mimeType: 'application/pdf',
      folder: 'notices', // This will use the notices prefix
      caseId: case_id,
      userId: caseData.user_id,
    });

    if (!uploadResult.success || !uploadResult.key) {
      return NextResponse.json(
        { success: false, message: uploadResult.error || 'Failed to upload PDF to S3' },
        { status: 500 }
      );
    }

    // Create notice record (store only filename)
    const notice = await Notice.create({
      case_id,
      respondent_name,
      respondent_address,
      respondent_pincode,
      subject,
      content,
      pdf_filename: fileName,
      recipient_email: recipient_email || null,
      email_sent: false,
      email_sent_count: 0
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

    return NextResponse.json({
      success: true,
      message: 'Notice created successfully',
      data: createdNotice
    });
  } catch (error: any) {
    console.error('Error creating notice:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create notice' },
      { status: 500 }
    );
  }
}

