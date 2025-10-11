import { NextRequest, NextResponse } from 'next/server';
import { s3Uploader } from '@/lib/aws-s3';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const expiresIn = parseInt(searchParams.get('expires') || '3600');

    if (!key) {
      return NextResponse.json(
        { success: false, message: 'File key is required' },
        { status: 400 }
      );
    }

    // Generate presigned URL for download
    const downloadUrl = await s3Uploader.generateDownloadUrl(key, expiresIn);

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl,
        expiresIn,
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
