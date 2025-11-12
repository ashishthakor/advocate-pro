import { NextRequest, NextResponse } from 'next/server';
const { Notice } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';
import { s3Uploader } from '@/lib/aws-s3';
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

    // Only admin can download notices
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
        deleted_at: null // Only allow downloading non-deleted notices
      } 
    });

    if (!notice) {
      return NextResponse.json(
        { success: false, message: 'Notice not found' },
        { status: 404 }
      );
    }

    if (!notice.pdf_filename) {
      return NextResponse.json(
        { success: false, message: 'PDF not found for this notice' },
        { status: 404 }
      );
    }

    // Get PDF from S3
    const prefix = process.env.AWS_S3_NOTICES_PREFIX || 'notices/';
    const s3Key = `${prefix}${notice.pdf_filename}`;
    
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    });

    try {
      const s3Object = await s3.getObject({
        Bucket: process.env.AWS_S3_BUCKET_NAME || 'legal-case-management-files',
        Key: s3Key,
      }).promise();

      const pdfBuffer = Buffer.from(s3Object.Body as any);

      // Return PDF as response
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${notice.pdf_filename}"`,
        },
      });
    } catch (error: any) {
      console.error('Error downloading from S3:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to download PDF from S3' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error downloading notice PDF:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to download PDF' },
      { status: 500 }
    );
  }
}

