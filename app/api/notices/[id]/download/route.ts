import { NextRequest, NextResponse } from 'next/server';
const { Notice } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';
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
        deleted_at: null // Only allow downloading non-deleted notices
      },
      include: [
        {
          model: require('@/models/init-models').Case,
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

    // Role-based access restrictions
    // For user role: only allow downloading notices for their own cases
    if (authResult.user.role === 'user') {
      if (notice.case.user_id !== authResult.user.userId) {
        return NextResponse.json(
          { success: false, message: 'Access denied. This notice does not belong to your cases.' },
          { status: 403 }
        );
      }
    }

    // For advocate role: only allow downloading notices for cases assigned to them
    if (authResult.user.role === 'advocate') {
      if (notice.case.advocate_id !== authResult.user.userId) {
        return NextResponse.json(
          { success: false, message: 'Access denied. You are not assigned to this case.' },
          { status: 403 }
        );
      }
    }

    // Determine which file to download (uploaded file takes priority)
    let s3Key: string | null = null;
    let fileName: string | null = null;
    let contentType = 'application/pdf';

    if (notice.uploaded_file_path) {
      // Use uploaded file
      s3Key = notice.uploaded_file_path;
      // Extract filename from path
      const pathParts = s3Key.split('/');
      fileName = pathParts[pathParts.length - 1];
      // Determine content type from file extension
      const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
      if (ext === '.doc' || ext === '.docx') {
        contentType = ext === '.doc' ? 'application/msword' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
    } else if (notice.pdf_filename) {
      // Fallback to generated PDF
      const { bucketName, pathPrefix } = parseBucketConfig();
      const noticesPrefix = `${pathPrefix}notices/`;
      s3Key = `${noticesPrefix}${notice.pdf_filename}`;
      fileName = notice.pdf_filename;
    }

    if (!s3Key || !fileName) {
      return NextResponse.json(
        { success: false, message: 'File not found for this notice' },
        { status: 404 }
      );
    }

    // Get file from S3
    const { bucketName, pathPrefix } = parseBucketConfig();
    
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

      const fileBuffer = Buffer.from(s3Object.Body as any);

      // Return file as response
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
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

