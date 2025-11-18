import { NextRequest, NextResponse } from 'next/server';
const { Notice, Case, User } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';
import { sendNoticeEmail } from '@/lib/email-service';

export async function POST(
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

    // Only admin can send notice emails
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin only.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const noticeId = parseInt(id);

    const body = await request.json();
    const { recipient_email } = body;

    if (!recipient_email) {
      return NextResponse.json(
        { success: false, message: 'Recipient email is required' },
        { status: 400 }
      );
    }

    // Get notice with case and user details
    const notice = await Notice.findOne({
      where: { 
        id: noticeId,
        deleted_at: null // Only allow sending emails for non-deleted notices
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

    // Send email with PDF from S3
    const emailResult = await sendNoticeEmail({
      applicantName: notice.case.user.name,
      applicantAddress: notice.case.user.address || '',
      applicantEmail: notice.case.user.email,
      applicantPhone: notice.case.user.phone,
      respondentName: notice.respondent_name,
      respondentAddress: notice.respondent_address,
      respondentPincode: notice.respondent_pincode,
      subject: notice.subject || 'Legal Notice',
      content: notice.content,
      caseNumber: notice.case.case_number,
      caseTitle: notice.case.title,
      recipientEmail: recipient_email,
      recipientName: notice.respondent_name,
    }, notice.pdf_filename || undefined);

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: emailResult.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    // Update notice record - increment email count
    const newEmailCount = (notice.email_sent_count || 0) + 1;
    await notice.update({
      email_sent: true,
      email_sent_at: new Date(),
      recipient_email: recipient_email,
      email_sent_count: newEmailCount
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error: any) {
    console.error('Error sending notice email:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}

