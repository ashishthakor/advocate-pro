import { NextRequest, NextResponse } from 'next/server';
import { s3Uploader, FileValidator } from '@/lib/aws-s3';

// Handle KYC document uploads for advocates
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as 'aadhar' | 'pan' | 'cancelled_cheque';
    const userId = formData.get('userId') as string;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!documentType || !['aadhar', 'pan', 'cancelled_cheque'].includes(documentType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid document type. Must be aadhar, pan, or cancelled_cheque' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const mimeType = file.type;

    // Validate file
    const validation = FileValidator.validateFile(fileBuffer, fileName, mimeType);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    // Upload to S3 with KYC path structure
    const uploadResult = await s3Uploader.uploadFile({
      file: fileBuffer,
      fileName,
      mimeType,
      userId: parseInt(userId),
      documentType,
    });

    if (!uploadResult.success || !uploadResult.key) {
      return NextResponse.json(
        { success: false, message: uploadResult.error || 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      filePath: uploadResult.key,
      message: 'File uploaded successfully',
    });

  } catch (error: any) {
    console.error('KYC upload error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

