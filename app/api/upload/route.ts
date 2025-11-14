import { NextRequest, NextResponse } from 'next/server';
import { s3Uploader, FileValidator } from '@/lib/aws-s3';
import { verifyTokenFromRequest } from '@/lib/auth';
import { sequelize } from '@/lib/database';
import { QueryTypes } from 'sequelize';

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
    const caseId = formData.get('caseId') as string || formData.get('caseIdNum') as string;
    const folder = formData.get('folder') as string || 'documents';

    // Handle multiple files
    const files: File[] = [];
    const fileEntries = Array.from(formData.entries()).filter(([key]) => key === 'file' || key.startsWith('file-'));
    
    if (fileEntries.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No files provided' },
        { status: 400 }
      );
    }

    // Check max files limit
    if (fileEntries.length > FileValidator.MAX_FILES) {
      return NextResponse.json(
        { success: false, message: `Maximum ${FileValidator.MAX_FILES} files allowed per upload` },
        { status: 400 }
      );
    }

    // Extract all files
    for (const [, file] of fileEntries) {
      if (file instanceof File) {
        files.push(file);
      }
    }

    const uploadResults = [];

    // Upload each file
    for (const file of files) {
      // Convert file to buffer
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileName = file.name;
      const mimeType = file.type;

      // Validate file
      const validation = FileValidator.validateFile(fileBuffer, fileName, mimeType);
      if (!validation.valid) {
        uploadResults.push({
          success: false,
          fileName,
          error: validation.error,
        });
        continue;
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
        uploadResults.push({
          success: false,
          fileName,
          error: uploadResult.error || 'Upload failed',
        });
        continue;
      }

      // Determine file type category
      let fileTypeCategory = 'other';
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      if (FileValidator.isImage(mimeType)) {
        fileTypeCategory = 'evidence';
      } else if (mimeType === 'application/pdf' || mimeType.includes('document')) {
        fileTypeCategory = 'court_document';
      } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
        fileTypeCategory = 'other';
      }

      // Create document record in database if caseId is provided
      let documentId = null;
      if (caseId) {
        try {
          const [documentResult] = await sequelize.query(`
            INSERT INTO documents (
              case_id, uploaded_by, file_name, original_name, file_path, s3_key, 
              file_type, file_size, mime_type, category, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `, {
            replacements: [
              parseInt(caseId),
              authResult.user?.userId,
              uploadResult.key.split('/').pop() || fileName, // Use S3 key filename
              fileName, // Original filename
              uploadResult.url, // Full URL as file_path
              uploadResult.key, // S3 key
              fileExtension || 'unknown',
              fileBuffer.length,
              mimeType,
              fileTypeCategory
            ],
            type: QueryTypes.INSERT
          });

          documentId = (documentResult as any)[0];
        } catch (dbError) {
          console.error('Error creating document record:', dbError);
          // Continue even if DB insert fails - file is already uploaded to S3
        }
      }

      uploadResults.push({
        success: true,
        fileName,
        url: uploadResult.url,
        key: uploadResult.key,
        fileSize: fileBuffer.length,
        mimeType,
        isImage: FileValidator.isImage(mimeType),
        isDocument: FileValidator.isDocument(mimeType),
        isExcel: FileValidator.isExcel(mimeType),
        documentId, // Include document ID if created
      });
    }

    // Check if all uploads failed
    const successfulUploads = uploadResults.filter(r => r.success);
    if (successfulUploads.length === 0) {
      return NextResponse.json(
        { success: false, message: 'All file uploads failed', errors: uploadResults },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${successfulUploads.length} file(s) uploaded successfully`,
      data: uploadResults,
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
