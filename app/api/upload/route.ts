import { NextRequest, NextResponse } from 'next/server';
import { s3Uploader, FileValidator } from '@/lib/aws-s3';
import { verifyTokenFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caseId = formData.get('caseId') as string;
    const folder = formData.get('folder') as string || 'documents';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
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

    // Upload to S3
    const uploadResult = await s3Uploader.uploadFile({
      file: fileBuffer,
      fileName,
      mimeType,
      folder,
      caseId: caseId ? parseInt(caseId) : undefined,
      userId: authResult.user?.userId,
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, message: uploadResult.error || 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: uploadResult.url,
        key: uploadResult.key,
        fileName,
        fileSize: fileBuffer.length,
        mimeType,
        isImage: FileValidator.isImage(mimeType),
        isDocument: FileValidator.isDocument(mimeType),
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { key } = await request.json();

    if (!key) {
      return NextResponse.json(
        { success: false, message: 'File key is required' },
        { status: 400 }
      );
    }

    // Delete from S3
    const deleted = await s3Uploader.deleteFile(key);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
