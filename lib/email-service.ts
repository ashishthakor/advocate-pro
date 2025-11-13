import sgMail from '@sendgrid/mail';
import { generateNoticePDF } from './pdf-generator';
import AWS from 'aws-sdk';
import { parseBucketConfig } from './aws-s3';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface NoticeEmailData {
  applicantName: string;
  applicantAddress: string;
  applicantEmail?: string;
  applicantPhone?: string;
  respondentName: string;
  respondentAddress: string;
  respondentPincode: string;
  content: string;
  caseNumber?: string;
  caseTitle?: string;
  recipientEmail: string;
  recipientName?: string;
}

export async function sendNoticeEmail(
  data: NoticeEmailData, 
  pdfFilename?: string
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SENDGRID_API_KEY) {
    return { success: false, error: 'Email service is not configured. SENDGRID_API_KEY is required.' };
  }

  try {
    let pdfBuffer: Buffer;
    
    // If pdfFilename is provided, get PDF from S3, otherwise generate new one
    if (pdfFilename) {
      const { bucketName, pathPrefix } = parseBucketConfig();
      const noticesPrefix = `${pathPrefix}notices/`;
      const s3Key = `${noticesPrefix}${pdfFilename}`;
      
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
      });

      try {
        const s3Object = await s3.getObject({
          Bucket: bucketName,
          Key: s3Key,
        }).promise();
        pdfBuffer = Buffer.from(s3Object.Body as any);
      } catch (s3Error) {
        console.error('Error fetching PDF from S3:', s3Error);
        // Fallback to generating PDF if S3 fetch fails
        pdfBuffer = generateNoticePDF({
          applicantName: data.applicantName,
          applicantAddress: data.applicantAddress,
          applicantEmail: data.applicantEmail,
          applicantPhone: data.applicantPhone,
          respondentName: data.respondentName,
          respondentAddress: data.respondentAddress,
          respondentPincode: data.respondentPincode,
          content: data.content,
          caseNumber: data.caseNumber,
          caseTitle: data.caseTitle,
        });
      }
    } else {
      // Generate PDF
      pdfBuffer = generateNoticePDF({
        applicantName: data.applicantName,
        applicantAddress: data.applicantAddress,
        applicantEmail: data.applicantEmail,
        applicantPhone: data.applicantPhone,
        respondentName: data.respondentName,
        respondentAddress: data.respondentAddress,
        respondentPincode: data.respondentPincode,
        content: data.content,
        caseNumber: data.caseNumber,
        caseTitle: data.caseTitle,
      });
    }

    // Convert buffer to base64 for SendGrid attachment
    const pdfBase64 = pdfBuffer.toString('base64');

    // Email subject
    const subject = `Legal Notice - ${data.caseTitle || 'Case Notice'}${data.caseNumber ? ` (${data.caseNumber})` : ''}`;

    // Email body
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #1976d2;">Legal Notice</h2>
        <p>Dear ${data.recipientName || data.respondentName},</p>
        <p>Please find attached a legal notice regarding the case: <strong>${data.caseTitle || 'Legal Matter'}</strong>${data.caseNumber ? ` (Case No: ${data.caseNumber})` : ''}.</p>
        <p>This notice requires your immediate attention. Please review the attached PDF document carefully.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          <strong>From:</strong> ${data.applicantName}<br>
          ${data.applicantAddress}<br>
          ${data.applicantEmail ? `Email: ${data.applicantEmail}<br>` : ''}
          ${data.applicantPhone ? `Phone: ${data.applicantPhone}` : ''}
        </p>
        <p style="color: #666; font-size: 12px;">
          <strong>To:</strong> ${data.respondentName}<br>
          ${data.respondentAddress}<br>
          PIN: ${data.respondentPincode}
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 11px;">
          This is an automated email. Please do not reply to this email.
        </p>
      </div>
    `;

    // Prepare SendGrid email message
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.SENDGRID_FROM || 'noreply@arbitalk.com';
    const fromName = process.env.SENDGRID_FROM_NAME || 'Arbitalk';

    const msg = {
      to: data.recipientEmail,
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject: subject,
      html: html,
      attachments: [
        {
          content: pdfBase64,
          filename: `Notice_${data.caseNumber || Date.now()}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    };

    // Send email with PDF attachment using SendGrid
    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error: any) {
      console.error('SendGrid email sending error:', error);
      
      // Extract error message from SendGrid response
      let errorMessage = 'Failed to send email';
      if (error.response) {
        const errorBody = error.response.body;
        if (errorBody && errorBody.errors && errorBody.errors.length > 0) {
          errorMessage = errorBody.errors.map((e: any) => e.message).join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  } catch (error: any) {
    console.error('Email service error:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

